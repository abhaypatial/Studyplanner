INSERT OR IGNORE INTO modules (id, title, path_id, priority, is_common_core, est_hours, summary) VALUES
  (1, 'Python Basics', 'foundations', 'high', 1, 8, 'Syntax, control flow, functions, data structures, and scripts.'),
  (2, 'Git and Reproducible Workflows', 'foundations', 'medium', 1, 4, 'Version control, branches, commits, notebooks, and environments.'),
  (3, 'SQL Joins and Aggregations', 'foundations', 'high', 1, 7, 'Relational querying, joins, grouping, filtering, and window functions.'),
  (4, 'Linear Algebra for ML', 'foundations', 'high', 1, 10, 'Vectors, matrices, projections, eigen intuition, and model geometry.'),
  (5, 'Probability and Statistics', 'foundations', 'high', 1, 12, 'Distributions, inference, uncertainty, and experiment design.'),
  (6, 'Data Visualization', 'data_analyst', 'medium', 0, 8, 'Charts, dashboards, visual encodings, and communication.'),
  (7, 'Exploratory Data Analysis', 'data_analyst', 'high', 0, 10, 'Cleaning, summaries, feature inspection, and anomaly detection.'),
  (8, 'Classical Machine Learning', 'data_scientist', 'high', 0, 16, 'Regression, trees, validation, metrics, and model selection.'),
  (9, 'Feature Engineering and Pipelines', 'ml_engineer', 'high', 0, 14, 'Reusable preprocessing, leakage control, and production data flows.'),
  (10, 'Deep Learning Foundations', 'ai_engineer', 'high', 0, 18, 'Neural networks, training loops, embeddings, and architectures.'),
  (11, 'LLM Applications and Evaluation', 'ai_engineer', 'high', 0, 14, 'Prompting, RAG, evaluation, safety, and deployment patterns.'),
  (12, 'AI Systems Architecture', 'ai_architect', 'high', 0, 18, 'System design for AI products, governance, cost, reliability, and scaling.');

INSERT OR IGNORE INTO prerequisites (module_id, requires_module_id) VALUES
  (3, 1),
  (4, 1),
  (5, 4),
  (6, 3),
  (7, 3),
  (8, 5),
  (9, 8),
  (10, 4),
  (10, 5),
  (11, 10),
  (12, 8),
  (12, 11);

INSERT OR IGNORE INTO materials (module_id, title, material_type, url) VALUES
  (1, 'Python for Everybody', 'free_book', 'https://www.py4e.com/book'),
  (1, 'Automate the Boring Stuff with Python', 'free_book', 'https://automatetheboringstuff.com/'),
  (2, 'MIT Missing Semester: Version Control', 'video', 'https://missing.csail.mit.edu/2020/version-control/'),
  (3, 'Mode SQL Tutorial', 'interactive', 'https://mode.com/sql-tutorial/'),
  (3, 'SQLBolt', 'interactive', 'https://sqlbolt.com/'),
  (4, 'MIT OCW Linear Algebra', 'video', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'),
  (5, 'StatQuest Statistics Fundamentals', 'video', 'https://www.youtube.com/@statquest'),
  (6, 'Data Visualization Curriculum', 'free_book', 'https://uwdata.github.io/visualization-curriculum/'),
  (8, 'fast.ai Practical Deep Learning', 'course', 'https://course.fast.ai/'),
  (10, 'Deep Learning Book', 'free_book', 'https://www.deeplearningbook.org/'),
  (11, 'Hugging Face NLP Course', 'course', 'https://huggingface.co/learn/nlp-course/chapter1/1'),
  (12, 'Google Machine Learning Crash Course', 'course', 'https://developers.google.com/machine-learning/crash-course');
