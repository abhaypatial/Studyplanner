from fastapi.testclient import TestClient

from app.main import app


def test_generate_plan_endpoint_marks_known_skill_done():
    with TestClient(app) as client:
        response = client.post(
            "/api/onboarding/generate-plan",
            json={
                "chosen_path": "Data Scientist",
                "target_months": 3,
                "skills": [{"name": "Python Basics"}],
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] > 0
    assert body["weekly_hours"] > 0
    python_module = next(item for item in body["schedule"] if item["title"] == "Python Basics")
    assert python_module["status"] == "done"
