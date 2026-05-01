"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchGeminiModels } from "@/lib/api";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [models, setModels] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem("gemini_api_key") ?? "");
    setSelectedModel(localStorage.getItem("gemini_model") ?? "gemini-2.5-flash");
  }, []);

  async function loadModels() {
    const result = await fetchGeminiModels(apiKey);
    setModels(result.models);
    if (result.models.length > 0 && !result.models.includes(selectedModel)) {
      setSelectedModel(result.models[0]);
    }
  }

  function saveSettings() {
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("gemini_model", selectedModel);
    setSaved(true);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <Card className="p-5">
        <h1 className="text-xl font-semibold">Gemini Tutor Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store the key in this browser and choose the model used by Tutor Chat.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-md border bg-background p-2"
            type="password"
            placeholder="Google Gemini API key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadModels}>Fetch Models</Button>
            <Button variant="outline" onClick={saveSettings}>Save Settings</Button>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {models.map((model) => (
            <label key={model} className="flex items-center gap-2 rounded-md border p-3 font-mono text-sm">
              <input
                type="radio"
                name="model"
                checked={selectedModel === model}
                onChange={() => setSelectedModel(model)}
              />
              {model}
            </label>
          ))}
        </div>
        {saved ? <p className="mt-4 text-sm text-muted-foreground">Saved. Return to the planner and use Tutor Chat.</p> : null}
      </Card>
    </main>
  );
}
