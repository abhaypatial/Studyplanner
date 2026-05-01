"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, MessageCircle, Moon, Play, Settings, Sun, Flame, Star, Trophy, Database, Sword, Calendar, Sparkles, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { askTutor, getProgress, resetProgress, runCode, submitPlan, updateProgress, updateMaterialProgress, generateQuiz, addXp } from "@/lib/api";
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
  is_completed?: boolean;
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
  xp: number;
  streak_days: number;
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
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [quizState, setQuizState] = useState({
    modalOpen: false,
    loading: false,
    error: "",
    data: null as any,
    module: null as PlanItem | null,
    currentQuestion: 0,
    score: 0,
  });
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

  const badges = useMemo(() => {
    if (!plan) return [];
    const earned = [];
    if (plan.streak_days >= 3) earned.push({ name: "3-Day Streak", icon: Flame });
    if (plan.streak_days >= 7) earned.push({ name: "7-Day Streak", icon: Flame });
    if (plan.xp >= 50) earned.push({ name: "Novice", icon: Star });
    if (plan.xp >= 250) earned.push({ name: "Scholar", icon: Trophy });
    
    const doneModules = plan.schedule.filter((i) => i.status === "done").length;
    if (doneModules >= 1) earned.push({ name: "First Blood", icon: Sword });
    if (doneModules >= 5) earned.push({ name: "Data Master", icon: Database });
    return earned;
  }, [plan]);

  async function generatePlan() {
    try {
      const result = await submitPlan({
        chosen_path: role,
        target_months: months,
        skills: selectedSkills.map((name) => ({ name })),
      });
      setPlan(result);
      const nextModule = result.schedule.find((item: PlanItem) => item.status !== "done") ?? result.schedule[0];
      setSelectedModuleId(nextModule?.module_id ?? null);
      setChatMessages([]);
    } catch (error) {
      alert("Failed to connect to the backend. Please ensure the Python server is running on port 8000 (see README).");
    }
  }

  async function markDone(moduleId: number) {
    if (!plan) return;
    try {
      await updateProgress({ user_id: plan.user_id, module_id: moduleId, status: "done" });
      const progressResult = await getProgress(plan.user_id);
      setPlan({ ...plan, schedule: progressResult.schedule, xp: progressResult.xp, streak_days: progressResult.streak_days });
      const nextModule = progressResult.schedule.find((item: PlanItem) => item.status !== "done") ?? progressResult.schedule[0];
      setSelectedModuleId(nextModule?.module_id ?? moduleId);
      
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    } catch (error) {
      alert("Failed to connect to the backend. Please ensure the Python server is running on port 8000.");
    }
  }

  async function resetCurrentPlan() {
    if (!plan) return;
    try {
      await resetProgress(plan.user_id);
      setPlan(null);
      setSelectedModuleId(null);
      setChatMessages([]);
    } catch (error) {
      alert("Failed to connect to the backend. Please ensure the Python server is running on port 8000.");
    }
  }

  async function toggleMaterial(materialId: number, completed: boolean) {
    if (!plan) return;
    try {
      await updateMaterialProgress({ user_id: plan.user_id, material_id: materialId, completed });
      const progressResult = await getProgress(plan.user_id);
      setPlan({ ...plan, schedule: progressResult.schedule });
    } catch (error) {
      alert("Failed to connect to the backend. Please ensure the Python server is running on port 8000.");
    }
  }

  async function startQuiz(item: PlanItem) {
    if (!apiKey) {
      alert("Please add your Gemini API key in Settings to generate a quiz.");
      return;
    }
    setQuizState({ modalOpen: true, loading: true, error: "", data: null, module: item, currentQuestion: 0, score: 0 });
    try {
      const data = await generateQuiz({
        api_key: apiKey,
        model,
        title: item.title,
        summary: item.summary || item.title,
      });
      setQuizState((prev) => ({ ...prev, loading: false, data }));
    } catch (e: any) {
      setQuizState((prev) => ({ ...prev, loading: false, error: e.message || "Failed to generate quiz." }));
    }
  }

  function handleQuizAnswer(answer: string) {
    const q = quizState.data.questions[quizState.currentQuestion];
    const isCorrect = answer === q.answer;
    const newScore = quizState.score + (isCorrect ? 1 : 0);
    
    if (quizState.currentQuestion < quizState.data.questions.length - 1) {
      setQuizState({ ...quizState, currentQuestion: quizState.currentQuestion + 1, score: newScore });
    } else {
      if (newScore === quizState.data.questions.length) {
         markDone(quizState.module!.module_id);
         setQuizState({ ...quizState, modalOpen: false });
      } else {
         setQuizState({ ...quizState, error: "You didn't score 100%. Please review the material and try again!", currentQuestion: 0, score: 0 });
      }
    }
  }

  function resumeStudy() {
    const nextModule = plan?.schedule.find((item) => item.status !== "done") ?? plan?.schedule[0];
    if (nextModule) setSelectedModuleId(nextModule.module_id);
    studyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function execute() {
    try {
      const result = await runCode(language, code);
      const out = result.stdout || result.stderr || JSON.stringify(result.rows ?? [], null, 2);
      setOutput(out);
      
      if (plan && language === "python" && out.includes("Data Science Rules!")) {
        await addXp({ user_id: plan.user_id, amount: 10 });
        const progressResult = await getProgress(plan.user_id);
        setPlan({ ...plan, xp: progressResult.xp, streak_days: progressResult.streak_days });
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    } catch (error) {
      alert("Failed to connect to the backend. Please ensure the Python server is running on port 8000.");
    }
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
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
      
      <header className="sticky top-0 z-50 glass-effect border-b border-white/10 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gradient animate-fade-in">AI Study Planner</h1>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider animate-slide-in-right">Premium Edition</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-800" />}
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr] relative z-10">
        <Card className="p-6 glass-effect animate-fade-up shadow-lg border-white/10 [animation-delay:100ms] opacity-0 hover:shadow-primary/10 transition-shadow">
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

        <div className="space-y-6">
          <Card className="p-6 glass-effect shadow-lg animate-fade-up [animation-delay:200ms] opacity-0 border-white/10 hover:shadow-primary/10 transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  {plan ? `${plan.weekly_hours} weekly hours recommended` : "Generate a plan to calculate deadlines."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {plan && (
                  <div className="mr-2 flex items-center gap-3 font-medium">
                    <div className="flex items-center gap-1 text-orange-500"><Flame className="h-4 w-4" /> {plan.streak_days} Day Streak</div>
                    <div className="flex items-center gap-1 text-yellow-500"><Star className="h-4 w-4" /> {plan.xp} XP</div>
                  </div>
                )}
                <Progress value={progress} className="w-40" />
                <Button variant="outline" onClick={resumeStudy} disabled={!plan}>Resume Study</Button>
                <Button variant="ghost" onClick={resetCurrentPlan} disabled={!plan}>Reset</Button>
              </div>
            </div>
            {badges.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {badges.map(b => (
                  <div key={b.name} className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs font-medium border shadow-sm transition-transform hover:scale-105">
                    <b.icon className="h-3.5 w-3.5 text-primary" /> {b.name}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(plan?.schedule ?? []).map((item) => (
                <div key={item.module_id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Due {item.due_date}</span>
                      <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-secondary-foreground border shadow-sm">{item.priority}</span>
                    </div>
                    <button className="w-full text-left focus:outline-none" onClick={() => setSelectedModuleId(item.module_id)}>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5" /> {item.materials?.length ?? 0} study resources
                      </p>
                    </button>
                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={item.status === "done" ? 100 : item.status === "active" ? 50 : 0} className="h-2.5 rounded-full" />
                      </div>
                      <Button
                        variant={item.status === "done" ? "secondary" : "default"}
                        size="sm"
                        className={item.status === "done" ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" : "bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 shadow-md font-semibold text-white"}
                        onClick={() => startQuiz(item)}
                        disabled={item.status === "done"}
                      >
                        {item.status === "done" ? <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Done</> : <><Zap className="mr-1.5 h-4 w-4" /> Start Quiz</>}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div ref={studyRef} className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <Card className="p-6 glass-effect animate-fade-up shadow-lg border-white/10 [animation-delay:300ms] opacity-0 hover:shadow-primary/10 transition-shadow">
              <h2 className="text-base font-semibold">Study Materials</h2>
              {activeModule ? (
                <div className="mt-3">
                  <p className="font-medium">{activeModule.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeModule.summary || `${activeModule.est_hours ?? 0} estimated hours`}</p>
                  <div className="mt-4 space-y-2">
                    {(activeModule.materials ?? []).map((material) => (
                      <div key={material.id} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted">
                        <label className="flex flex-1 cursor-pointer items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={material.is_completed ?? false} 
                            onChange={(e) => toggleMaterial(material.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary"
                          />
                          <span>
                            <span className={material.is_completed ? "line-through text-muted-foreground font-medium" : "font-medium"}>{material.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{material.material_type}</span>
                          </span>
                        </label>
                        <a href={material.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Generate a plan to see study links.</p>
              )}
            </Card>

            <Card className="p-6 glass-effect animate-fade-up shadow-lg border-white/10 [animation-delay:400ms] opacity-0 hover:shadow-primary/10 transition-shadow">
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

          <Card className="p-6 glass-effect animate-fade-up shadow-lg border-white/10 [animation-delay:500ms] opacity-0 hover:shadow-primary/10 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Sandbox</h2>
                <p className="text-xs text-muted-foreground mt-1">Hint: Print "Data Science Rules!" in Python for extra XP!</p>
              </div>
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

      {showLevelUp && (
        <div className="fixed bottom-10 right-10 z-50 flex animate-bounce items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-4 text-white shadow-2xl border border-white/20">
          <Trophy className="h-6 w-6 text-yellow-300" />
          <span className="font-bold text-lg tracking-wide">Module Completed! +50 XP</span>
        </div>
      )}

      {quizState.modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <Card className="w-full max-w-md p-6 glass-effect shadow-2xl border-white/10">
            <h2 className="text-lg font-bold">Module Quiz</h2>
            {quizState.loading ? (
              <div className="mt-4 animate-pulse space-y-3">
                 <div className="h-4 w-3/4 rounded bg-muted"></div>
                 <div className="h-10 w-full rounded bg-muted"></div>
                 <div className="h-10 w-full rounded bg-muted"></div>
              </div>
            ) : quizState.error ? (
              <div className="mt-4 text-sm text-red-500">
                <p>{quizState.error}</p>
                <Button className="mt-4 w-full" onClick={() => setQuizState({ ...quizState, modalOpen: false })}>Close</Button>
              </div>
            ) : quizState.data?.questions ? (
              <div className="mt-4">
                <p className="font-medium text-sm">Question {quizState.currentQuestion + 1} of {quizState.data.questions.length}</p>
                <p className="mt-2 text-sm">{quizState.data.questions[quizState.currentQuestion].q}</p>
                <div className="mt-4 space-y-2">
                  {quizState.data.questions[quizState.currentQuestion].options.map((opt: string) => (
                    <Button key={opt} variant="outline" className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => handleQuizAnswer(opt)}>
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            {!quizState.loading && !quizState.error && !quizState.data && (
              <Button className="mt-4 w-full" onClick={() => setQuizState({ ...quizState, modalOpen: false })}>Close</Button>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}
