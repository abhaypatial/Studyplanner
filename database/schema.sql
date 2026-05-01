PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chosen_path TEXT NOT NULL,
  target_months INTEGER NOT NULL CHECK (target_months BETWEEN 1 AND 6),
  start_date TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  proficiency_level TEXT NOT NULL DEFAULT 'comfortable',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  path_id TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  is_common_core INTEGER NOT NULL DEFAULT 0,
  est_hours INTEGER NOT NULL CHECK (est_hours > 0),
  summary TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS prerequisites (
  module_id INTEGER NOT NULL,
  requires_module_id INTEGER NOT NULL,
  PRIMARY KEY (module_id, requires_module_id),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (requires_module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'done')),
  completion_date TEXT,
  due_date TEXT,
  weekly_hours REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  material_type TEXT NOT NULL,
  url TEXT NOT NULL,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_modules_path ON modules(path_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
