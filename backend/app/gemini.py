from __future__ import annotations

import httpx


FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]


async def list_models(api_key: str | None) -> list[str]:
    if not api_key:
        return FALLBACK_MODELS

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url)
        response.raise_for_status()
    data = response.json()
    models = [item["name"].replace("models/", "") for item in data.get("models", [])]
    gemini_models = [model for model in models if model.startswith("gemini")]
    return gemini_models or FALLBACK_MODELS


async def chat(api_key: str, model: str, messages: list[dict], module_title: str | None = None) -> str:
    if not api_key.strip():
        raise ValueError("Gemini API key is required.")

    selected_model = model.strip() or FALLBACK_MODELS[0]
    context = f"The learner is currently studying: {module_title}." if module_title else ""
    
    gemini_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "learner" else "model"
        gemini_contents.append({"role": role, "parts": [{"text": msg["text"]}]})

    system_instruction = (
        "You are a Socratic AI/data science tutor. Ask guiding questions, give concise hints, "
        "and avoid dumping a full solution unless the learner explicitly asks. "
        f"{context}"
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{selected_model}:generateContent"
    payload = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": gemini_contents
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(url, headers={"x-goog-api-key": api_key}, json=payload)
        response.raise_for_status()

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return "I did not receive a tutor response. Try asking again with a little more detail."

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if part.get("text")]
    return "\n".join(text_parts).strip() or "I received an empty tutor response. Try again."
