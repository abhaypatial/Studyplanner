#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required. Install it from https://brew.sh/ and rerun this script."
  exit 1
fi

brew list node >/dev/null 2>&1 || brew install node
brew list python@3.13 >/dev/null 2>&1 || brew install python@3.13

cd "$ROOT_DIR/backend"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m pytest

cd "$ROOT_DIR/frontend"
npm install
npm test -- --watch=false

echo "Setup complete. Start backend with: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "Start frontend with: cd frontend && npm run dev"
