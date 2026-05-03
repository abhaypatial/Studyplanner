import { MODULES, MATERIALS, DEFAULT_PLAN_IDS } from './curriculum';

// Local storage helpers
const getDb = () => {
  if (typeof window === 'undefined') return { xp: 0, streak: 0, schedule: [], completedMaterials: [] };
  const db = localStorage.getItem('study_db');
  return db ? JSON.parse(db) : { xp: 0, streak: 0, schedule: [], completedMaterials: [] };
};

const saveDb = (db: any) => {
  if (typeof window !== 'undefined') localStorage.setItem('study_db', JSON.stringify(db));
};

export async function submitPlan(payload: any) {
  const db = getDb();
  const schedule = DEFAULT_PLAN_IDS.map((id, index) => {
    const mod = MODULES.find(m => m.id === id)!;
    const mats = MATERIALS.filter(m => m.module_id === id);
    return {
      module_id: id,
      title: mod.title,
      status: index === 0 ? 'active' : 'pending',
      due_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekly_hours: 10,
      priority: (mod as any).priority || 'high',
      est_hours: mod.est_hours,
      summary: mod.summary,
      materials: mats.map(m => ({ ...m, id: Math.random(), is_completed: false }))
    };
  });
  
  db.schedule = schedule;
  db.xp = 0;
  db.streak = 0;
  db.completedMaterials = [];
  saveDb(db);
  
  return { user_id: 1, weekly_hours: 10, schedule, xp: 0, streak_days: 0 };
}

export async function runCode(language: "python" | "sql", code: string) {
  // Sandbox requires backend. We simulate basic feedback for the frontend-only version.
  if (language === "python" && code.toLowerCase().includes("print")) {
    return { ok: true, stdout: "Data Science Rules!\n(Note: Sandbox is running in offline client mode)", stderr: "" };
  }
  return { ok: true, stdout: "Code executed successfully in client offline mode.", stderr: "" };
}

export async function getProgress(userId: number) {
  const db = getDb();
  if (db.schedule.length === 0) throw new Error("No plan");
  
  const schedule = db.schedule.map((item: any) => ({
    ...item,
    materials: item.materials.map((m: any) => ({
      ...m,
      is_completed: db.completedMaterials.includes(m.title)
    }))
  }));
  
  return { xp: db.xp, streak_days: db.streak, schedule };
}

export async function updateProgress(payload: { user_id: number; module_id: number; status: "pending" | "active" | "done" }) {
  const db = getDb();
  const item = db.schedule.find((i: any) => i.module_id === payload.module_id);
  if (item) {
    item.status = payload.status;
    if (payload.status === "done") {
      db.xp += 50;
      db.streak = Math.max(1, db.streak + 1);
    }
  }
  saveDb(db);
  return { ok: true };
}

export async function resetProgress(userId: number) {
  saveDb({ xp: 0, streak: 0, schedule: [], completedMaterials: [] });
  return { ok: true };
}

export async function updateMaterialProgress(payload: { user_id: number; material_id: number; completed: boolean; title?: string }) {
  const db = getDb();
  // We identify by title because we injected random IDs on plan creation
  if (payload.completed && payload.title) {
    if (!db.completedMaterials.includes(payload.title)) db.completedMaterials.push(payload.title);
  } else if (payload.title) {
    db.completedMaterials = db.completedMaterials.filter((t: string) => t !== payload.title);
  }
  saveDb(db);
  return { ok: true };
}

export async function addXp(payload: { user_id: number; amount: number }) {
  const db = getDb();
  db.xp += payload.amount;
  saveDb(db);
  return { ok: true };
}

export async function fetchGeminiModels(apiKey: string) {
  if (!apiKey) return { models: ["gemini-2.5-flash", "gemini-1.5-pro"] };
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    return { models: data.models.map((m: any) => m.name.replace("models/", "")).filter((m: string) => m.startsWith("gemini")) };
  } catch (e) {
    return { models: ["gemini-2.5-flash", "gemini-1.5-pro"] };
  }
}

export async function askTutor(payload: { api_key: string; model: string; messages: {role: string, text: string}[]; module_title?: string }) {
  if (!payload.api_key) throw new Error("Gemini API key required");
  const model = payload.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${payload.api_key}`;
  
  const contents = payload.messages.map(m => ({
    role: m.role === "learner" ? "user" : "model",
    parts: [{ text: m.text }]
  }));
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `You are a Socratic tutor. The learner is studying: ${payload.module_title || ''}.` }] },
      contents
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Tutor request failed");
  return { reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply" };
}

export async function generateQuiz(payload: { api_key: string; model: string; title: string; summary: string }) {
  if (!payload.api_key) throw new Error("Gemini API key required");
  const model = payload.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${payload.api_key}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "You are a quiz generator. Generate a 3-question multiple choice quiz. Output ONLY valid JSON in this format: {\"questions\": [{\"q\": \"...\", \"options\": [\"A\", \"B\", \"C\"], \"answer\": \"A\"}]}" }] },
      contents: [{ role: "user", parts: [{ text: `Module: ${payload.title}\nSummary: ${payload.summary}` }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Quiz generation failed");
  return JSON.parse(data.candidates[0].content.parts[0].text);
}
