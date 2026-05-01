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

export async function fetchGeminiModels(apiKey: string) {
  const params = apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : "";
  const response = await fetch(`${API_BASE}/api/gemini/models${params}`);
  if (!response.ok) throw new Error("Failed to fetch Gemini models");
  return response.json();
}
