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
  (12, 'AI Systems Architecture', 'ai_architect', 'high', 0, 18, 'System design for AI products, governance, cost, reliability, and scaling.'),
  (13, 'Capstone Project & Portfolio', 'foundations', 'high', 1, 20, 'Build an end-to-end ML/Data application, deploy to the cloud, and write a portfolio case study.');

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
  (12, 11),
  (13, 8);

INSERT OR IGNORE INTO materials (module_id, title, material_type, url) VALUES
  (1, 'Python for Everybody (English)', 'free_book', 'https://www.py4e.com/book'),
  (1, 'Kaggle Python Course (Fun Interactive)', 'interactive', 'https://www.kaggle.com/learn/python'),
  (1, 'CodeWithHarry 100 Days of Code (Hindi)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg'),
  
  (2, 'Learn Git Branching (Fun Interactive)', 'interactive', 'https://learngitbranching.js.org/'),
  (2, 'CodeWithHarry Git & GitHub (Hindi)', 'video', 'https://www.youtube.com/watch?v=gwWKnnCMQ5c'),
  
  (3, 'SQLBolt (Fun Interactive)', 'interactive', 'https://sqlbolt.com/'),
  (3, 'Select Star SQL (Interactive)', 'interactive', 'https://selectstarsql.com/'),
  (3, 'Krish Naik SQL Playlist (Hindi)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLZoTAELRMXVPhVsq3qLeWS5csXxdRzaB3'),
  
  (4, '3Blue1Brown Essence of Linear Algebra (English)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab'),
  
  (5, 'StatQuest Statistics Fundamentals (English)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9'),
  (5, 'Krish Naik Statistics in ML (Hindi)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLZoTAELRMXVN5QNaIWEA1xFXfD50gIfL2'),
  
  (6, 'Data Visualization Curriculum (English)', 'free_book', 'https://uwdata.github.io/visualization-curriculum/'),
  
  (7, 'Kaggle Pandas Course (Interactive)', 'interactive', 'https://www.kaggle.com/learn/pandas'),
  
  (8, 'fast.ai Practical Deep Learning (English)', 'course', 'https://course.fast.ai/'),
  (8, 'CampusX 100 Days of ML (Hindi)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcU0Fvg'),
  
  (10, 'Andrej Karpathy Neural Networks: Zero to Hero (English)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ'),
  (10, 'Krish Naik Deep Learning Playlist (Hindi)', 'video_playlist', 'https://www.youtube.com/playlist?list=PLZoTAELRMXVPGU70ZGsckrMdr0FteeRUi'),
  
  (11, 'Hugging Face NLP Course (English)', 'course', 'https://huggingface.co/learn/nlp-course/chapter1/1'),
  
  (12, 'Google Machine Learning Crash Course (English)', 'course', 'https://developers.google.com/machine-learning/crash-course'),
  
  (13, 'Hugging Face Spaces (Deployment Hosting)', 'deployment', 'https://huggingface.co/spaces'),
  (13, 'Streamlit Python Dashboards', 'deployment', 'https://streamlit.io/');

INSERT OR IGNORE INTO modules (id, title, path_id, priority, is_common_core, est_hours, summary) VALUES
  (14, 'Calculus & Optimization', 'foundations', 'high', 1, 15, 'Derivatives, integrals, gradients, and optimization techniques.'),
  (15, 'Data Structures & Algorithms', 'foundations', 'high', 1, 20, 'Arrays, linked lists, trees, graphs, and algorithmic complexity.'),
  (16, 'Database Management Systems', 'foundations', 'high', 1, 12, 'Normalization, transactions, indexing, and advanced SQL.'),
  (17, 'GATE Practice & Test Series', 'foundations', 'high', 1, 15, 'Previous year questions, mock tests, and time management.'),
  (18, 'Revision & Notebooks', 'foundations', 'high', 1, 10, 'Formula notebook, mistake notebook, and PYQ notebook.');

INSERT OR IGNORE INTO materials (module_id, title, material_type, url) VALUES
  (4, 'Gilbert Strang MIT OCW', 'course', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'),
  (4, 'Khan Academy Linear Algebra', 'interactive', 'https://www.khanacademy.org/math/linear-algebra'),
  (4, 'Schaums Outline of Linear Algebra', 'book', 'https://www.mhprofessional.com/schaums'),
  (4, 'Linear Algebra Done Right', 'book', 'https://linear.axler.net/'),
  (4, 'GO Classes Linear Algebra', 'video', 'https://www.goclasses.in/'),
  (4, 'GateWallah Linear Algebra', 'video', 'https://physicswallah.live/'),
  
  (14, 'Professor Leonard Calculus', 'video_playlist', 'https://www.youtube.com/user/professorleonard57'),
  (14, 'Khan Academy Calculus', 'interactive', 'https://www.khanacademy.org/math/calculus-1'),
  (14, 'MIT Single Variable Calculus', 'course', 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/'),
  (14, 'GO Classes Calculus', 'video', 'https://www.goclasses.in/'),
  (14, 'Unacademy GATE DA Calculus', 'video', 'https://unacademy.com/'),

  (5, 'StatQuest Probability', 'video_playlist', 'https://www.youtube.com/c/joshstarmer'),
  (5, 'Khan Academy Statistics', 'interactive', 'https://www.khanacademy.org/math/statistics-probability'),
  (5, 'Introduction to Probability', 'book', 'https://v8doc.sas.com/sashtml/stat/chap1.htm'),
  (5, 'Think Stats', 'free_book', 'https://greenteapress.com/wp/think-stats-2e/'),
  (5, 'GO Classes Probability', 'video', 'https://www.goclasses.in/'),
  (5, 'GateWallah Statistics', 'video', 'https://physicswallah.live/'),

  (1, 'Corey Schafer Python', 'video_playlist', 'https://www.youtube.com/c/Coreyms'),
  (1, 'Python Crash Course', 'book', 'https://ehmatthes.github.io/pcc/'),
  (1, 'HackerRank Python', 'interactive', 'https://www.hackerrank.com/domains/python'),
  (1, 'LeetCode Python', 'interactive', 'https://leetcode.com/'),

  (7, 'NumPy Official Documentation', 'free_book', 'https://numpy.org/doc/'),
  (7, 'FreeCodeCamp NumPy', 'video', 'https://www.youtube.com/watch?v=QUT1VHiLmmI'),
  (7, 'Corey Schafer Pandas Playlist', 'video_playlist', 'https://www.youtube.com/watch?v=ZyhVh-qRZPA&list=PL-osiE80TeTsWmV9i9c58mdDZAsk5642h'),

  (15, 'Abdul Bari Algorithms', 'video_playlist', 'https://www.youtube.com/channel/UCZCFT11CWBi3MHNlGf019nw'),
  (15, 'CS50 Harvard University', 'course', 'https://cs50.harvard.edu/x/'),
  (15, 'LeetCode', 'interactive', 'https://leetcode.com/'),
  (15, 'HackerRank', 'interactive', 'https://www.hackerrank.com/'),
  (15, 'CLRS Introduction to Algorithms', 'book', 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/'),

  (16, 'Gate Smashers DBMS', 'video_playlist', 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y'),
  (16, 'SQLBolt', 'interactive', 'https://sqlbolt.com/'),
  (16, 'LeetCode SQL', 'interactive', 'https://leetcode.com/studyplan/top-sql-50/'),

  (8, 'StatQuest ML', 'video_playlist', 'https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuEAq44JND6q'),
  (8, 'Andrew Ng ML Course', 'course', 'https://www.coursera.org/specializations/machine-learning-introduction'),
  (8, 'Hands-On Machine Learning', 'book', 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/'),
  (8, 'ISLR', 'free_book', 'https://www.statlearning.com/'),

  (10, 'Neso Academy AI', 'video_playlist', 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjgVgPO4X9b9B_DkP5A-H-v'),
  (10, 'Gate Smashers AI', 'video_playlist', 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiHGhOHV-nwb0HR5US5GFKFI'),

  (17, 'GATE Overflow', 'interactive', 'https://gateoverflow.in/'),
  (17, 'GO Classes Mock Tests', 'interactive', 'https://www.goclasses.in/'),
  (17, 'MadeEasy', 'interactive', 'https://www.madeeasy.in/'),
  (17, 'Testbook', 'interactive', 'https://testbook.com/gate-preparation');
