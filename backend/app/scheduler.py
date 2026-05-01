from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


ROLE_PATHS = {
    "Data Analyst": ["foundations", "data_analyst"],
    "Data Scientist": ["foundations", "data_analyst", "data_scientist"],
    "ML Engineer": ["foundations", "data_scientist", "ml_engineer"],
    "AI Engineer": ["foundations", "data_scientist", "ai_engineer"],
    "AI Architect": ["foundations", "data_scientist", "ai_engineer", "ai_architect"],
}

SKILL_TO_MODULE = {
    "Python Basics": "Python Basics",
    "Git": "Git and Reproducible Workflows",
    "SQL Joins": "SQL Joins and Aggregations",
    "Linear Algebra": "Linear Algebra for ML",
    "Statistics": "Probability and Statistics",
}


@dataclass(frozen=True)
class ScheduledModule:
    module_id: int
    title: str
    status: str
    due_date: str
    weekly_hours: float
    priority: str


def selected_paths(role: str) -> list[str]:
    return ROLE_PATHS.get(role, ROLE_PATHS["Data Scientist"])


def completed_titles_from_skills(skills: list[str]) -> set[str]:
    completed: set[str] = set()
    for skill in skills:
        normalized = skill.strip().lower()
        for known, title in SKILL_TO_MODULE.items():
            if normalized == known.lower():
                completed.add(title)
    return completed


def build_schedule(
    modules: list[dict],
    target_months: int,
    known_skills: list[str],
    start: date | None = None,
) -> list[ScheduledModule]:
    start = start or date.today()
    target_days = max(28, target_months * 30)
    completed_titles = completed_titles_from_skills(known_skills)
    remaining_hours = sum(m["est_hours"] for m in modules if m["title"] not in completed_titles)
    weekly_hours = round(max(1.0, remaining_hours / max(1, target_days / 7)), 1)

    schedule: list[ScheduledModule] = []
    elapsed = 0.0
    for module in modules:
        done = module["title"] in completed_titles
        if not done:
            elapsed += module["est_hours"]
        due_offset = 0 if done else round((elapsed / max(weekly_hours, 1)) * 7)
        schedule.append(
            ScheduledModule(
                module_id=module["id"],
                title=module["title"],
                status="done" if done else "pending",
                due_date=(start + timedelta(days=due_offset)).isoformat(),
                weekly_hours=weekly_hours,
                priority=module["priority"],
            )
        )
    return schedule
