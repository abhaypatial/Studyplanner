"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchGeminiModels } from "@/lib/api";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<string[]>([]);

  async function loadModels() {
    const result = await fetchGeminiModels(apiKey);
    setModels(result.models);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <Card className="p-5">
        <h1 className="text-xl font-semibold">Gemini Tutor Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store the key locally in your browser session and fetch available Gemini models.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-md border bg-background p-2"
            type="password"
            placeholder="Google Gemini API key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <Button onClick={loadModels}>Fetch Models</Button>
        </div>
        <div className="mt-5 space-y-2">
          {models.map((model) => (
            <div key={model} className="rounded-md border p-3 font-mono text-sm">{model}</div>
          ))}
        </div>
      </Card>
    </main>
  );
}
