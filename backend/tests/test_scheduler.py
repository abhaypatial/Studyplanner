from datetime import date

from app.scheduler import build_schedule, completed_titles_from_skills


def test_known_skills_complete_beginner_modules():
    assert completed_titles_from_skills(["Python Basics", "SQL Joins"]) == {
        "Python Basics",
        "SQL Joins and Aggregations",
    }


def test_schedule_deducts_completed_hours():
    modules = [
        {"id": 1, "title": "Python Basics", "priority": "high", "est_hours": 8},
        {"id": 2, "title": "SQL Joins and Aggregations", "priority": "high", "est_hours": 7},
    ]
    schedule = build_schedule(modules, 1, ["Python Basics"], date(2026, 1, 1))

    assert schedule[0].status == "done"
    assert schedule[1].status == "pending"
    assert schedule[1].weekly_hours < 4
