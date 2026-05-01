const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function submitPlan(payload: unknown) {
  const response = await fetch(`${API_BASE}/api/onboarding/generate-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to generate plan");
  return response.json();
}

export async function runCode(language: "python" | "sql", code: string) {
  const response = await fetch(`${API_BASE}/api/run/${language}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error("Failed to run code");
  return response.json();
}

export async function getProgress(userId: number) {
  const response = await fetch(`${API_BASE}/api/progress/${userId}`);
  if (!response.ok) throw new Error("Failed to load progress");
  return response.json();
}

export async function updateProgress(payload: { user_id: number; module_id: number; status: "pending" | "active" | "done" }) {
  const response = await fetch(`${API_BASE}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update progress");
  return response.json();
}

export async function resetProgress(userId: number) {
  const response = await fetch(`${API_BASE}/api/progress/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to reset progress");
  return response.json();
}

export async function fetchGeminiModels(apiKey: string) {
  const params = apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : "";
  const response = await fetch(`${API_BASE}/api/gemini/models${params}`);
  if (!response.ok) throw new Error("Failed to fetch Gemini models");
  return response.json();
}

export async function askTutor(payload: { api_key: string; model: string; messages: {role: string, text: string}[]; module_title?: string }) {
  const response = await fetch(`${API_BASE}/api/gemini/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Tutor request failed" }));
    throw new Error(error.detail ?? "Tutor request failed");
  }
  return response.json();
}

export async function updateMaterialProgress(payload: { user_id: number; material_id: number; completed: boolean }) {
  const response = await fetch(`${API_BASE}/api/material-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update material progress");
  return response.json();
}

export async function generateQuiz(payload: { api_key: string; model: string; title: string; summary: string }) {
  const response = await fetch(`${API_BASE}/api/gemini/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to generate quiz");
  return response.json();
}

export async function addXp(payload: { user_id: number; amount: number }) {
  const response = await fetch(`${API_BASE}/api/user/xp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to add XP");
  return response.json();
}
