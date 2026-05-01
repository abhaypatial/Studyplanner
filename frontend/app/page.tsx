"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, MessageCircle, Moon, Play, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { askTutor, getProgress, resetProgress, runCode, submitPlan, updateProgress } from "@/lib/api";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const roles = ["Data Analyst", "Data Scientist", "ML Engineer", "AI Engineer", "AI Architect"];
const skills = ["Python Basics", "Git", "SQL Joins", "Linear Algebra", "Statistics"];

type Material = {
  id: number;
  title: string;
  material_type: string;
  url: string;
};

type PlanItem = {
  module_id: number;
  title: string;
  status: "pending" | "active" | "done";
  due_date: string;
  weekly_hours: number;
  priority: string;
  est_hours?: number;
  summary?: string;
  materials?: Material[];
};

type Plan = {
  user_id: number;
  weekly_hours: number;
  schedule: PlanItem[];
};

type ChatMessage = {
  role: "learner" | "tutor";
  text: string;
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState("Data Scientist");
  const [months, setMonths] = useState(3);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [code, setCode] = useState("print('Ready to study')\n");
  const [language, setLanguage] = useState<"python" | "sql">("python");
  const [output, setOutput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const studyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem("gemini_api_key") ?? "");
    setModel(localStorage.getItem("gemini_model") ?? "gemini-2.5-flash");
  }, []);

  const progress = useMemo(() => {
    if (!plan?.schedule.length) return 0;
    const done = plan.schedule.filter((item) => item.status === "done").length;
    return Math.round((done / plan.schedule.length) * 100);
  }, [plan]);

  const activeModule = useMemo(() => {
    if (!plan?.schedule.length) return null;
    return (
      plan.schedule.find((item) => item.module_id === selectedModuleId) ??
      plan.schedule.find((item) => item.status !== "done") ??
      plan.schedule[0]
    );
  }, [plan, selectedModuleId]);

  async function generatePlan() {
    const result = await submitPlan({
      chosen_path: role,
      target_months: months,
      skills: selectedSkills.map((name) => ({ name })),
    });
    setPlan(result);
    const nextModule = result.schedule.find((item: PlanItem) => item.status !== "done") ?? result.schedule[0];
    setSelectedModuleId(nextModule?.module_id ?? null);
    setChatMessages([]);
  }

  async function markDone(moduleId: number) {
    if (!plan) return;
    await updateProgress({ user_id: plan.user_id, module_id: moduleId, status: "done" });
    const progressRows = await getProgress(plan.user_id);
    setPlan({ ...plan, schedule: progressRows });
    const nextModule = progressRows.find((item: PlanItem) => item.status !== "done") ?? progressRows[0];
    setSelectedModuleId(nextModule?.module_id ?? moduleId);
  }

  async function resetCurrentPlan() {
    if (!plan) return;
    await resetProgress(plan.user_id);
    setPlan(null);
    setSelectedModuleId(null);
    setChatMessages([]);
  }

  function resumeStudy() {
    const nextModule = plan?.schedule.find((item) => item.status !== "done") ?? plan?.schedule[0];
    if (nextModule) setSelectedModuleId(nextModule.module_id);
    studyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function execute() {
    const result = await runCode(language, code);
    setOutput(result.stdout || result.stderr || JSON.stringify(result.rows ?? [], null, 2));
  }

  async function sendTutorMessage() {
    const message = chatInput.trim();
    if (!message) return;
    setChatError("");
    setChatInput("");
    const newMessages: ChatMessage[] = [...chatMessages, { role: "learner", text: message }];
    setChatMessages(newMessages);

    if (!apiKey) {
      setChatError("Add your Gemini API key in Tutor Settings first.");
      return;
    }

    setChatMessages((current) => [...current, { role: "tutor", text: "..." }]);

    try {
      const result = await askTutor({
        api_key: apiKey,
        model,
        messages: newMessages,
        module_title: activeModule?.title,
      });
      setChatMessages((current) => {
        const withoutTyping = current.slice(0, -1);
        return [...withoutTyping, { role: "tutor", text: result.reply }];
      });
    } catch (error) {
      setChatMessages((current) => current.slice(0, -1));
      setChatError(error instanceof Error ? error.message : "Tutor request failed.");
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-background/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">AI Study Planner</h1>
              <p className="text-sm text-muted-foreground">Plan, practice, and track locally.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Onboarding</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium">Role</label>
            <select className="w-full rounded-md border bg-background p-2" value={role} onChange={(event) => setRole(event.target.value)}>
              {roles.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="block text-sm font-medium">Target timeframe: {months} months</label>
            <input className="w-full" type="range" min="1" max="6" value={months} onChange={(event) => setMonths(Number(event.target.value))} />

            <div>
              <p className="mb-2 text-sm font-medium">Skills inventory</p>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <label key={skill} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={(event) =>
                        setSelectedSkills((current) =>
                          event.target.checked ? [...current, skill] : current.filter((item) => item !== skill),
                        )
                      }
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={generatePlan}>Generate Plan</Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  {plan ? `${plan.weekly_hours} weekly hours recommended` : "Generate a plan to calculate deadlines."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="w-40" />
                <Button variant="outline" onClick={resumeStudy} disabled={!plan}>Resume Study</Button>
                <Button variant="ghost" onClick={resetCurrentPlan} disabled={!plan}>Reset</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(plan?.schedule ?? []).map((item) => (
                <div key={item.module_id} className="rounded-md border p-3">
                  <button className="w-full text-left" onClick={() => setSelectedModuleId(item.module_id)}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{item.title}</p>
                      <span className="text-xs uppercase text-muted-foreground">{item.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Due {item.due_date} - {item.priority}</p>
                  </button>
                  <Button
                    className="mt-3 w-full"
                    variant={item.status === "done" ? "outline" : "default"}
                    size="sm"
                    onClick={() => markDone(item.module_id)}
                    disabled={item.status === "done"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {item.status === "done" ? "Completed" : "Mark as Done"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div ref={studyRef} className="grid gap-5 xl:grid-cols-[1fr_380px]">
            <Card className="p-5">
              <h2 className="text-base font-semibold">Study Materials</h2>
              {activeModule ? (
                <div className="mt-3">
                  <p className="font-medium">{activeModule.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeModule.summary || `${activeModule.est_hours ?? 0} estimated hours`}</p>
                  <div className="mt-4 space-y-2">
                    {(activeModule.materials ?? []).map((material) => (
                      <a
                        key={material.id}
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted"
                      >
                        <span>
                          <span className="font-medium">{material.title}</span>
                          <span className="ml-2 text-muted-foreground">{material.material_type}</span>
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Generate a plan to see study links.</p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Tutor Chat</h2>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </Button>
              </div>
              <div className="mt-3 h-56 space-y-3 overflow-auto rounded-md border p-3">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ask for a hint about the selected module.</p>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className="text-sm">
                      <p className="font-medium">{message.role === "learner" ? "You" : "Tutor"}</p>
                      <p className="whitespace-pre-wrap text-muted-foreground">{message.text}</p>
                    </div>
                  ))
                )}
              </div>
              {chatError ? <p className="mt-2 text-sm text-red-500">{chatError}</p> : null}
              <div className="mt-3 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border bg-background p-2 text-sm"
                  placeholder="Ask for a hint..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendTutorMessage();
                  }}
                />
                <Button onClick={sendTutorMessage} size="icon" aria-label="Send tutor message">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Sandbox</h2>
              <div className="flex gap-2">
                <Button variant={language === "python" ? "default" : "outline"} size="sm" onClick={() => setLanguage("python")}>Python</Button>
                <Button variant={language === "sql" ? "default" : "outline"} size="sm" onClick={() => setLanguage("sql")}>SQL</Button>
              </div>
            </div>
            <CodeEditor language={language} value={code} onChange={setCode} />
            <div className="mt-3 flex items-center justify-between gap-3">
              <Button onClick={execute}>
                <Play className="mr-2 h-4 w-4" />
                Run
              </Button>
            </div>
            <pre className="mt-4 min-h-24 overflow-auto rounded-md bg-muted p-3 font-mono text-sm">{output}</pre>
          </Card>
        </div>
      </section>
    </main>
  );
}
