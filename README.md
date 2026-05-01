# AI/Data Science Study Planner

Locally hosted study planner and execution environment for AI and data science paths.

## Structure

- `frontend`: Next.js, Tailwind, Shadcn-style local components
- `backend`: FastAPI API, scheduling engine, Python and SQL runners
- `database`: SQLite schema and seed curriculum
- `scripts`: platform setup scripts

## Quick Start

Windows:

```bat
scripts\setup-windows.bat
```

macOS:

```bash
bash scripts/setup-mac.sh
```

Manual backend run:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Manual frontend run:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000` by default.
