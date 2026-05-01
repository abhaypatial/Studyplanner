from app.runners import run_python, run_sql


def test_python_runner_returns_stdout():
    result = run_python("print(2 + 3)")
    assert result["ok"] is True
    assert result["stdout"].strip() == "5"


def test_python_runner_blocks_unsafe_tokens():
    result = run_python("import os\nprint(os.listdir())")
    assert result["ok"] is False
    assert "Blocked" in result["stderr"]


def test_sql_runner_allows_selects():
    result = run_sql("SELECT name, path FROM learners ORDER BY id")
    assert result["ok"] is True
    assert result["rows"][0]["name"] == "Ada"


def test_sql_runner_blocks_mutations():
    result = run_sql("DROP TABLE learners")
    assert result["ok"] is False
