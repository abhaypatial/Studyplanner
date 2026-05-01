from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .db import connect, initialize_database, rows_to_dicts
from .gemini import list_models
from .runners import run_python, run_sql
from .scheduler import build_schedule, selected_paths


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="AI Study Planner API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
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
        modules_for_plan = rows_to_dicts(module_rows)

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

    return {"user_id": user_id, "weekly_hours": schedule[0].weekly_hours if schedule else 0, "schedule": schedule}


@app.get("/api/progress/{user_id}")
def get_progress(user_id: int) -> list[dict]:
    initialize_database()
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT p.*, m.title, m.priority, m.est_hours
            FROM progress p
            JOIN modules m ON m.id = p.module_id
            WHERE p.user_id = ?
            ORDER BY p.due_date, m.id
            """,
            (user_id,),
        ).fetchall()
    return rows_to_dicts(rows)


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
