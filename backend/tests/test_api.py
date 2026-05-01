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
    assert python_module["materials"]


def test_progress_endpoint_returns_materials_after_update():
    with TestClient(app) as client:
        plan_response = client.post(
            "/api/onboarding/generate-plan",
            json={
                "chosen_path": "Data Analyst",
                "target_months": 2,
                "skills": [],
            },
        )
        body = plan_response.json()
        module_id = body["schedule"][0]["module_id"]

        update_response = client.post(
            "/api/progress",
            json={"user_id": body["user_id"], "module_id": module_id, "status": "done"},
        )
        progress_response = client.get(f"/api/progress/{body['user_id']}")

    assert update_response.status_code == 200
    assert progress_response.status_code == 200
    first_module = progress_response.json()[0]
    assert first_module["status"] == "done"
    assert "materials" in first_module
