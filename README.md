# AI/Data Science Study Planner

A local study planner for learning data analysis, data science, machine learning, and AI. It helps you choose a learning path, mark skills you already know, build a timeline, practice Python or SQL, and connect a Gemini API key for tutor features.

This app runs on your own computer. You do not need to deploy it to the internet.

## What You Need First

Install these before running the project:

- **Git**: downloads the project from GitHub.
- **Node.js LTS**: runs the website part of the app.
- **Python 3.13 or newer**: runs the backend and code exercises.

Download links:

- Git: https://git-scm.com/downloads
- Node.js LTS: https://nodejs.org/
- Python: https://www.python.org/downloads/

When installing Python on Windows, check the box that says **Add Python to PATH**.

## Download The App

### Windows

1. Open **Command Prompt** or **PowerShell**.
2. Go to the folder where you want the app:

```bat
cd Downloads
```

3. Download the project:

```bat
git clone https://github.com/abhaypatial/Studyplanner.git
```

4. Open the project folder:

```bat
cd Studyplanner
```

### macOS

1. Open **Terminal**.
2. Go to the folder where you want the app:

```bash
cd ~/Downloads
```

3. Download the project:

```bash
git clone https://github.com/abhaypatial/Studyplanner.git
```

4. Open the project folder:

```bash
cd Studyplanner
```

## First-Time Setup

### Windows Setup

Run:

```bat
scripts\setup-windows.bat
```

This installs the backend and frontend dependencies.

### macOS Setup

Run:

```bash
bash scripts/setup-mac.sh
```

This installs the backend and frontend dependencies. The macOS script uses Homebrew. If you do not have Homebrew yet, install it from https://brew.sh/.

## How To Run The App

You need two terminal windows: one for the backend and one for the website.

### 1. Start The Backend

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

Leave this window open. The backend should run at:

```text
http://localhost:8000
```

### 2. Start The Website

Open a second terminal window.

Windows or macOS:

```bash
cd frontend
npm run dev
```

Leave this window open too. The website should run at:

```text
http://localhost:3000
```

Open that address in your browser.

## How To Use The App

1. Choose your role, such as **Data Analyst**, **Data Scientist**, **ML Engineer**, **AI Engineer**, or **AI Architect**.
2. Check the skills you already know.
3. Pick your target timeline from 1 to 6 months.
4. Click **Generate Plan**.
5. Use the dashboard to see what to study next.
6. Use the sandbox to practice Python or SQL.

## How To Add A Gemini API Key

The Gemini key is optional. The app still runs without it, but tutor features need it.

1. Get a Gemini API key from Google AI Studio:

```text
https://aistudio.google.com/app/apikey
```

2. Start the backend and website.
3. Open the website:

```text
http://localhost:3000
```

4. Click **Tutor Settings**.
5. Paste your Gemini API key into the password field.
6. Click **Fetch Models**.
7. If the key works, you should see available Gemini models.

Keep your API key private. Do not post it on GitHub, Discord, email, or screenshots.

## Common Issues

### `git` is not recognized

Git is not installed, or your terminal cannot find it.

Fix:

1. Install Git from https://git-scm.com/downloads.
2. Close and reopen your terminal.
3. Try the command again.

### `python` is not recognized

Python is not installed, or it was installed without PATH support.

Fix on Windows:

1. Reinstall Python from https://www.python.org/downloads/.
2. During install, check **Add Python to PATH**.
3. Close and reopen PowerShell or Command Prompt.

On macOS, try:

```bash
python3 --version
```

If that works, use `python3` instead of `python`.

### `npm` is not recognized

Node.js is missing.

Fix:

1. Install Node.js LTS from https://nodejs.org/.
2. Close and reopen your terminal.
3. Run:

```bash
npm --version
```

### The website opens, but buttons fail or data does not load

The backend is probably not running.

Fix:

1. Open a terminal.
2. Go to the project folder.
3. Start the backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Then refresh the website.

### Port 3000 is already in use

Another website is already using port 3000.

Fix:

```bash
cd frontend
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

### Port 8000 is already in use

Another backend is already using port 8000.

Fix:

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

Then the frontend must be told to use the new backend address.

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

### Gemini says the API key is invalid

Possible causes:

- The key was copied incorrectly.
- The key was deleted or disabled in Google AI Studio.
- Your Google account does not have access to that model.

Fix:

1. Create a new key in Google AI Studio.
2. Paste it again in **Tutor Settings**.
3. Click **Fetch Models**.

### The setup script fails halfway

This usually means one required tool is missing.

Fix:

1. Confirm Git, Node.js, and Python are installed.
2. Close and reopen your terminal.
3. Run the setup script again.

Check versions:

```bash
git --version
node --version
npm --version
python --version
```

On macOS, use `python3 --version` if `python --version` does not work.

## Project Structure

- `frontend`: the website, built with Next.js and Tailwind CSS.
- `backend`: the local API, built with FastAPI.
- `database`: SQLite schema and starter curriculum.
- `scripts`: setup scripts for Windows and macOS.

## For Developers

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
