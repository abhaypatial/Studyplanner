from __future__ import annotations

import httpx


FALLBACK_MODELS = ["gemini-1.5-pro", "gemini-1.5-flash"]


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
