from __future__ import annotations

import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path


BLOCKED_PYTHON_TOKENS = (
    "import os",
    "import subprocess",
    "from os",
    "from subprocess",
    "__import__",
    "open(",
    "exec(",
    "eval(",
    "socket",
    "shutil",
)

BLOCKED_SQL_TOKENS = (
    "insert ",
    "update ",
    "delete ",
    "drop ",
    "alter ",
    "attach ",
    "detach ",
    "pragma ",
    "vacuum ",
)


def run_python(code: str, timeout_seconds: int = 5) -> dict:
    lowered = code.lower()
    if any(token in lowered for token in BLOCKED_PYTHON_TOKENS):
        return {"ok": False, "stdout": "", "stderr": "Blocked unsafe Python operation."}

    with tempfile.TemporaryDirectory() as tmp:
        file_path = Path(tmp) / "exercise.py"
        file_path.write_text(code, encoding="utf-8")
        try:
            result = subprocess.run(
                [sys.executable, str(file_path)],
                cwd=tmp,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired:
            return {"ok": False, "stdout": "", "stderr": "Execution timed out."}

    return {
        "ok": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def run_sql(query: str) -> dict:
    normalized = query.strip().lower()
    if not normalized.startswith(("select", "with")):
        return {"ok": False, "columns": [], "rows": [], "stderr": "Only SELECT and WITH queries are allowed."}
    if any(token in normalized for token in BLOCKED_SQL_TOKENS):
        return {"ok": False, "columns": [], "rows": [], "stderr": "Blocked unsafe SQL operation."}

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE learners (id INTEGER PRIMARY KEY, name TEXT, path TEXT);
        CREATE TABLE study_logs (learner_id INTEGER, module TEXT, minutes INTEGER);
        INSERT INTO learners VALUES (1, 'Ada', 'AI Engineer'), (2, 'Grace', 'Data Scientist');
        INSERT INTO study_logs VALUES (1, 'Python Basics', 90), (1, 'SQL Joins', 60), (2, 'Statistics', 120);
        """
    )
    try:
        cursor = conn.execute(query)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description or []]
    except sqlite3.Error as exc:
        return {"ok": False, "columns": [], "rows": [], "stderr": str(exc)}
    finally:
        conn.close()

    return {"ok": True, "columns": columns, "rows": [dict(row) for row in rows], "stderr": ""}
