from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .db import connect, initialize_database, rows_to_dicts
from .gemini import chat, list_models
from .runners import run_python, run_sql
from .scheduler import build_schedule, selected_paths


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="AI Study Planner API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SkillInput(BaseModel):
    name: str
    is_custom: bool = False
    proficiency_level: str = "comfortable"


class OnboardingRequest(BaseModel):
    chosen_path: str
    target_months: int = Field(ge=1, le=6)
    skills: list[SkillInput] = []


class RunnerRequest(BaseModel):
    code: str = Field(min_length=1, max_length=10000)


class ProgressRequest(BaseModel):
    user_id: int
    module_id: int
    status: str = Field(pattern="^(pending|active|done)$")


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(learner|tutor)$")
    text: str = Field(min_length=1, max_length=4000)


class TutorRequest(BaseModel):
    api_key: str
    model: str = "gemini-2.5-flash"
    messages: list[ChatMessage] = Field(min_length=1)
    module_title: str | None = None


class MaterialProgressRequest(BaseModel):
    user_id: int
    material_id: int
    completed: bool


class AddXpRequest(BaseModel):
    user_id: int
    amount: int


class QuizRequest(BaseModel):
    api_key: str
    model: str = "gemini-2.5-flash"
    title: str
    summary: str


def attach_materials(conn, modules: list[dict], user_id: int | None = None) -> list[dict]:
    if not modules:
        return modules
    module_ids = [module["id"] if "id" in module else module["module_id"] for module in modules]
    placeholders = ",".join("?" for _ in module_ids)
    rows = conn.execute(
        f"SELECT * FROM materials WHERE module_id IN ({placeholders}) ORDER BY id",
        module_ids,
    ).fetchall()
    
    completed_mats = set()
    if user_id is not None:
        mat_rows = conn.execute("SELECT material_id FROM material_progress WHERE user_id = ?", (user_id,)).fetchall()
        completed_mats = {r["material_id"] for r in mat_rows}
        
    materials_by_module: dict[int, list[dict]] = {}
    for row in rows_to_dicts(rows):
        row_dict = dict(row)
        row_dict["is_completed"] = row_dict["id"] in completed_mats
        materials_by_module.setdefault(row_dict["module_id"], []).append(row_dict)
    for module in modules:
        module_id = module["id"] if "id" in module else module["module_id"]
        module["materials"] = materials_by_module.get(module_id, [])
    return modules


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/modules")
def modules(path: str | None = None) -> list[dict]:
    initialize_database()
    with connect() as conn:
        if path:
            rows = conn.execute(
                "SELECT * FROM modules WHERE path_id IN ('foundations', ?) ORDER BY id",
                (path,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM modules ORDER BY id").fetchall()
    return rows_to_dicts(rows)


@app.post("/api/onboarding/generate-plan")
def generate_plan(payload: OnboardingRequest) -> dict:
    initialize_database()
    paths = selected_paths(payload.chosen_path)
    placeholders = ",".join("?" for _ in paths)
    with connect() as conn:
        module_rows = conn.execute(
            f"SELECT * FROM modules WHERE path_id IN ({placeholders}) ORDER BY id",
            paths,
        ).fetchall()
        modules_for_plan = attach_materials(conn, rows_to_dicts(module_rows))

        cursor = conn.execute(
            "INSERT INTO users (chosen_path, target_months, start_date) VALUES (?, ?, ?)",
            (payload.chosen_path, payload.target_months, date.today().isoformat()),
        )
        user_id = cursor.lastrowid

        for skill in payload.skills:
            conn.execute(
                "INSERT INTO skills (user_id, skill_name, is_custom, proficiency_level) VALUES (?, ?, ?, ?)",
                (user_id, skill.name, int(skill.is_custom), skill.proficiency_level),
            )

        schedule = build_schedule(
            modules_for_plan,
            payload.target_months,
            [skill.name for skill in payload.skills],
            date.today(),
        )
        for item in schedule:
            conn.execute(
                """
                INSERT INTO progress (user_id, module_id, status, completion_date, due_date, weekly_hours)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    item.module_id,
                    item.status,
                    date.today().isoformat() if item.status == "done" else None,
                    item.due_date,
                    item.weekly_hours,
                ),
            )

    schedule_by_id = {item.module_id: item for item in schedule}
    response_schedule = []
    for module in modules_for_plan:
        item = schedule_by_id[module["id"]]
        response_schedule.append(
            {
                "module_id": item.module_id,
                "title": item.title,
                "status": item.status,
                "due_date": item.due_date,
                "weekly_hours": item.weekly_hours,
                "priority": item.priority,
                "est_hours": module["est_hours"],
                "summary": module["summary"],
                "materials": module["materials"],
            }
        )

    return {"user_id": user_id, "weekly_hours": schedule[0].weekly_hours if schedule else 0, "schedule": response_schedule, "xp": 0, "streak_days": 0}


@app.get("/api/progress/{user_id}")
def get_progress(user_id: int) -> dict:
    initialize_database()
    with connect() as conn:
        user = conn.execute("SELECT xp, streak_days FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(404, "User not found")
        rows = conn.execute(
            """
            SELECT p.*, m.title, m.priority, m.est_hours, m.summary
            FROM progress p
            JOIN modules m ON m.id = p.module_id
            WHERE p.user_id = ?
            ORDER BY p.due_date, m.id
            """,
            (user_id,),
        ).fetchall()
        progress_rows = rows_to_dicts(rows)
        return {
            "xp": user["xp"],
            "streak_days": user["streak_days"],
            "schedule": attach_materials(conn, progress_rows, user_id)
        }


@app.post("/api/progress")
def update_progress(payload: ProgressRequest) -> dict:
    completion_date = date.today().isoformat() if payload.status == "done" else None
    with connect() as conn:
        result = conn.execute(
            "UPDATE progress SET status = ?, completion_date = ? WHERE user_id = ? AND module_id = ?",
            (payload.status, completion_date, payload.user_id, payload.module_id),
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Progress record not found.")
            
        if payload.status == "done":
            user = conn.execute("SELECT last_active_date, streak_days FROM users WHERE id = ?", (payload.user_id,)).fetchone()
            if user:
                streak_days = user["streak_days"]
                today = date.today().isoformat()
                if user["last_active_date"]:
                    last_active = date.fromisoformat(user["last_active_date"])
                    delta = (date.today() - last_active).days
                    if delta == 1:
                        streak_days += 1
                    elif delta > 1:
                        streak_days = 1
                else:
                    streak_days = 1
                conn.execute(
                    "UPDATE users SET xp = xp + 50, streak_days = ?, last_active_date = ? WHERE id = ?",
                    (streak_days, today, payload.user_id)
                )

    return {"ok": True}


@app.delete("/api/progress/{user_id}")
def reset_progress(user_id: int) -> dict:
    with connect() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return {"ok": True}


@app.post("/api/material-progress")
def update_material_progress(payload: MaterialProgressRequest) -> dict:
    with connect() as conn:
        if payload.completed:
            conn.execute("INSERT OR IGNORE INTO material_progress (user_id, material_id) VALUES (?, ?)", (payload.user_id, payload.material_id))
        else:
            conn.execute("DELETE FROM material_progress WHERE user_id = ? AND material_id = ?", (payload.user_id, payload.material_id))
    return {"ok": True}


@app.post("/api/user/xp")
def add_xp(payload: AddXpRequest) -> dict:
    with connect() as conn:
        conn.execute("UPDATE users SET xp = xp + ? WHERE id = ?", (payload.amount, payload.user_id))
    return {"ok": True}


@app.post("/api/run/python")
def execute_python(payload: RunnerRequest) -> dict:
    return run_python(payload.code)


@app.post("/api/run/sql")
def execute_sql(payload: RunnerRequest) -> dict:
    return run_sql(payload.code)


@app.get("/api/gemini/models")
async def gemini_models(api_key: str | None = None) -> dict:
    return {"models": await list_models(api_key)}


@app.post("/api/gemini/chat")
async def gemini_chat(payload: TutorRequest) -> dict:
    try:
        messages_dicts = [{"role": m.role, "text": m.text} for m in payload.messages]
        reply = await chat(payload.api_key, payload.model, messages_dicts, payload.module_title)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=400, detail=f"Gemini request failed: {exc.response.text}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"reply": reply}


@app.post("/api/gemini/quiz")
async def get_quiz(payload: QuizRequest) -> dict:
    from .gemini import generate_quiz
    try:
        quiz = await generate_quiz(payload.api_key, payload.model, payload.title, payload.summary)
        return quiz
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
