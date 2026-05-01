# AI/Data Science Study Planner

**A beginner-friendly local app for planning and practicing AI, data science, machine learning, Python, and SQL.**

This project runs on your own computer. You do not need to publish anything online, rent a server, or understand deployment to use it.

## What This App Does

- Builds a study plan for roles like Data Analyst, Data Scientist, ML Engineer, AI Engineer, and AI Architect.
- Lets you mark skills you already know so the plan skips beginner work.
- Creates a timeline based on your target completion window.
- Gives you a local Python and SQL practice sandbox.
- Lets you add a Google Gemini API key for tutor features.
- Stores app data locally with SQLite.

## Project Links

- GitHub repo: https://github.com/abhaypatial/Studyplanner
- Gemini API key page: https://aistudio.google.com/app/apikey

## Before You Start

You need three free tools installed:

| Tool | Why You Need It | Download |
| --- | --- | --- |
| Git | Downloads the project from GitHub | https://git-scm.com/downloads |
| Node.js LTS | Runs the website | https://nodejs.org/ |
| Python 3.13 or newer | Runs the backend and practice runner | https://www.python.org/downloads/ |

Important Windows note: when installing Python, check **Add Python to PATH**.

## Download The App

### Windows

Open **PowerShell** or **Command Prompt**, then run:

```bat
cd Downloads
git clone https://github.com/abhaypatial/Studyplanner.git
cd Studyplanner
```

### macOS

Open **Terminal**, then run:

```bash
cd ~/Downloads
git clone https://github.com/abhaypatial/Studyplanner.git
cd Studyplanner
```

## First-Time Setup

Run this only once after downloading the app.

### Windows

```bat
scripts\setup-windows.bat
```

### macOS

```bash
bash scripts/setup-mac.sh
```

The setup script installs the project dependencies. On macOS, it expects Homebrew. If you do not have Homebrew, install it from https://brew.sh/ and run the setup again.

## How To Run The App

You need **two terminal windows**:

- Terminal 1: backend
- Terminal 2: website

### Terminal 1: Start The Backend

Windows:

```bat
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

macOS:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Keep this terminal open.

Backend address:

```text
http://localhost:8000
```

### Terminal 2: Start The Website

Open a second terminal in the project folder, then run:

```bash
cd frontend
npm run dev
```

Keep this terminal open too.

Website address:

```text
http://localhost:3000
```

Open `http://localhost:3000` in your browser.

## How To Use The App

1. Choose your goal role.
2. Check the skills you already know.
3. Pick a timeline from 1 to 6 months.
4. Click **Generate Plan**.
5. Follow the dashboard.
6. Use the sandbox to practice Python or SQL.

## How To Add A Gemini API Key

The Gemini API key is optional. The app can run without it, but tutor features need it.

1. Go to Google AI Studio:

```text
https://aistudio.google.com/app/apikey
```

2. Create or copy your API key.
3. Start the backend and website.
4. Open:

```text
http://localhost:3000
```

5. Click **Tutor Settings**.
6. Paste your key into the password field.
7. Click **Fetch Models**.

If the key works, you will see Gemini models listed.

Keep your API key private. Do not upload it to GitHub or share it in screenshots.

## PATH Problems And Fixes

PATH is the list of places your computer checks when you type commands like `git`, `python`, `node`, or `npm`.

If you see errors like these, it usually means the tool is not installed or its PATH is not set:

- `'git' is not recognized`
- `'python' is not recognized`
- `'node' is not recognized`
- `'npm' is not recognized`
- `command not found: git`
- `command not found: python`
- `command not found: npm`

### Check What Is Working

Run these commands:

```bash
git --version
node --version
npm --version
python --version
```

On macOS, also try:

```bash
python3 --version
```

If a command prints a version number, that tool is working.

### Windows PATH Fix For Git

1. Install Git from https://git-scm.com/downloads.
2. During setup, keep the option that allows Git from the command line.
3. Close PowerShell or Command Prompt.
4. Open a new PowerShell or Command Prompt.
5. Run:

```bat
git --version
```

If it still fails, restart your computer.

### Windows PATH Fix For Python

Best fix:

1. Download Python from https://www.python.org/downloads/.
2. Run the installer again.
3. Check **Add Python to PATH**.
4. Click **Install Now** or **Modify**.
5. Close and reopen your terminal.
6. Run:

```bat
python --version
```

If `python` still does not work, try:

```bat
py --version
```

If `py` works but `python` does not, Python is installed but not on PATH. Re-run the installer and choose **Add Python to PATH**.

### Windows PATH Fix For Node.js And npm

1. Install Node.js LTS from https://nodejs.org/.
2. Keep the default install options.
3. Close and reopen your terminal.
4. Run:

```bat
node --version
npm --version
```

If it still fails, restart your computer.

### macOS PATH Fix For Git

Try:

```bash
git --version
```

If macOS asks you to install command line developer tools, accept it.

You can also install Git with Homebrew:

```bash
brew install git
```

### macOS PATH Fix For Python

macOS often uses `python3` instead of `python`.

Try:

```bash
python3 --version
```

If that works, use `python3` when creating environments:

```bash
python3 -m venv .venv
```

If Python is missing, install it with Homebrew:

```bash
brew install python
```

### macOS PATH Fix For Node.js And npm

Install Node.js with Homebrew:

```bash
brew install node
```

Then check:

```bash
node --version
npm --version
```

If `brew` is not found, install Homebrew from https://brew.sh/.

## Common Issues

| Problem | What It Usually Means | Fix |
| --- | --- | --- |
| `git is not recognized` | Git is missing or PATH is broken | Install Git, reopen terminal, check `git --version` |
| `python is not recognized` | Python is missing or PATH is broken | Reinstall Python and check **Add Python to PATH** |
| `npm is not recognized` | Node.js is missing or PATH is broken | Install Node.js LTS, reopen terminal |
| Website opens but buttons fail | Backend is not running | Start the backend on port `8000` |
| Port `3000` is busy | Another website is using it | Run frontend on port `3001` |
| Port `8000` is busy | Another backend is using it | Run backend on port `8001` |
| Gemini key fails | Key is wrong, disabled, or copied badly | Create a new key in Google AI Studio |
| Setup script fails halfway | One required tool is missing | Check Git, Node.js, npm, and Python versions |

### Website Opens, But Data Does Not Load

The backend is probably not running.

Fix:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Then refresh the website.

### Port 3000 Is Already In Use

Run the frontend on another port:

```bash
cd frontend
npm run dev -- -p 3001
```

Open:

```text
http://localhost:3001
```

### Port 8000 Is Already In Use

Run the backend on another port:

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

Then tell the frontend to use the new backend address.

Command Prompt:

```bat
cd frontend
set NEXT_PUBLIC_API_BASE=http://localhost:8001
npm run dev
```

PowerShell:

```powershell
cd frontend
$env:NEXT_PUBLIC_API_BASE="http://localhost:8001"
npm run dev
```

macOS:

```bash
cd frontend
NEXT_PUBLIC_API_BASE=http://localhost:8001 npm run dev
```

## Folder Guide

```text
Studyplanner/
  backend/    Local API, planner logic, Python runner, SQL runner
  database/   SQLite schema and starter curriculum data
  frontend/   Website interface
  scripts/    Setup scripts for Windows and macOS
```

## Developer Commands

Backend tests:

```bash
cd backend
python -m pytest
```

Frontend tests:

```bash
cd frontend
npm test -- --watch=false
```

## Quick Mental Model

Think of the app as two pieces:

| Piece | What It Does | Address |
| --- | --- | --- |
| Backend | Saves plans, runs Python/SQL, talks to Gemini | `http://localhost:8000` |
| Frontend | The website you click around in | `http://localhost:3000` |

Both pieces must be running at the same time.
