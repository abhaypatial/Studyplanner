@echo off
setlocal

set ROOT_DIR=%~dp0..

where python >nul 2>nul
if errorlevel 1 (
  echo Python is required. Install Python 3.13+ and rerun this script.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required. Install Node.js LTS and rerun this script.
  exit /b 1
)

cd /d "%ROOT_DIR%\backend"
python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m pytest
if errorlevel 1 exit /b 1

cd /d "%ROOT_DIR%\frontend"
npm install
npm test -- --watch=false
if errorlevel 1 exit /b 1

echo Setup complete.
echo Start backend: cd backend ^&^& .venv\Scripts\activate ^&^& uvicorn app.main:app --reload --port 8000
echo Start frontend: cd frontend ^&^& npm run dev
