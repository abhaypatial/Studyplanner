# App Schema Blueprint
App: AI_Study_Planner
Stack: NextJS, Tailwind, ShadcnUI, FastAPI, SQLite

# Design System
Theme: Minimalist, tech-focused
Colors: Primary(Deep Blue/Indigo), Background(Slate-900 dark / Slate-50 light)
Typography: Inter (Sans), JetBrains Mono (Code)
Components: Shadcn (Card, Button, Progress, Dialog, Toast)

# DB_Schema (SQLite)
Users: id, chosen_path, target_months, start_date
Skills: id, user_id, skill_name, is_custom, proficiency_level
Modules: id, title, path_id, priority, is_common_core, est_hours
Prerequisites: module_id, requires_module_id
Progress: user_id, module_id, status (pending/active/done), completion_date

# Core Modules
1. Onboarding: Role -> Skills Checklist -> Timeframe -> Generate Plan
2. Dashboard: Next Deadline | Progress Ring | Resume Study Btn
3. Sandbox: Code Editor (Monaco) -> Runner API -> Output/Error Console
4. Tutor: Context-Aware Chat -> Gemini API -> Socratic Response

# Path Configurations
Dir: /frontend (React/Next)
Dir: /backend (FastAPI/SQL_Runner)
Dir: /scripts (setup-mac.sh, setup-windows.bat)
Dir: /database (seed.sql, schema.sql)

# Strict AI Rules
- No bloated code.
- Functional over flashy.
- Validate local runners securely.
- Ensure dependency scripts are tested.
