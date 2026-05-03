"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchGeminiModels } from "@/lib/api";
import { Info } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
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
    setTimeout(() => {
      router.push("/");
    }, 1000);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <Card className="p-6 shadow-xl border-t-4 border-t-primary bg-background/50 backdrop-blur animate-fade-in">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Gemini Tutor Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Configure your Google Gemini API key to power the AI Tutor. Your key is stored locally in your browser and never on our servers.</p>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">API Key</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadModels} variant="outline" className="transition-all hover:scale-105 active:scale-95">Fetch Models</Button>
            <Button onClick={saveSettings} className="transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">Save & Return</Button>
          </div>
        </div>

        {models.length > 0 && (
          <div className="mt-8 space-y-3 animate-fade-up">
            <h2 className="text-lg font-semibold border-b pb-2">Available Models</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 p-3 rounded-md text-sm flex gap-2 items-start">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Model Selection Guide:</strong>
                <br/>• <strong>Flash Models</strong> (e.g., gemini-2.5-flash): Best for standard tutoring, faster, and have much higher free-tier rate limits (15 RPM).
                <br/>• <strong>Pro Models</strong> (e.g., gemini-1.5-pro): Better for complex reasoning but have very strict rate limits (2 RPM). Choose Flash to avoid rate limit errors!
              </p>
            </div>

            <div className="grid gap-2 mt-4">
              {models.map((model) => (
                <label 
                  key={model} 
                  className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-all ${selectedModel === model ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/50'}`}
                >
                  <input
                    type="radio"
                    name="model"
                    className="w-4 h-4 text-primary"
                    checked={selectedModel === model}
                    onChange={() => setSelectedModel(model)}
                  />
                  <span className="font-mono text-sm">{model}</span>
                  {model.includes("flash") && (
                    <span className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
        
        {saved && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm text-center animate-fade-in border border-green-200 dark:border-green-800">
            Settings saved successfully! Redirecting to dashboard...
          </div>
        )}
      </Card>
    </main>
  );
}
