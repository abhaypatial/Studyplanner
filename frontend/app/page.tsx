"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, MessageCircle, Moon, Play, Settings, Sun, Flame, Star, Trophy, Database, Sword, Calendar, Sparkles, Zap, Volume2 } from "lucide-react";
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
  const [studentName, setStudentName] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [certificate, setCertificate] = useState<{ name: string; moduleTitle: string; date: string } | null>(null);
  const [quizState, setQuizState] = useState({
    modalOpen: false,
    loading: false,
    error: "",
    data: null as any,
    module: null as PlanItem | null,
    currentQuestion: 0,
    score: 0,
  });
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const studyRef = useRef<HTMLDivElement>(null);

  // Rotating motivational message logic
  useEffect(() => {
    if (!plan) return;
    
    const generateMessage = () => {
      const name = studentName.trim() || "friend";
      const subject = selectedModuleId ? plan.schedule.find(m => m.module_id === selectedModuleId)?.title : role;
      const prog = !plan.schedule.length ? 0 : (() => {
        let t = 0, c = 0;
        plan.schedule.forEach(m => {
          t++; if (m.status === "done") c++;
          if (m.materials) { t += m.materials.length; c += m.materials.filter(x => x.is_completed).length; }
        });
        return Math.round((c / t) * 100);
      })();
      
      const messages = [
        `Hey ${name}, you're crushing ${subject}! Keep it up or I'll tell your mom.`,
        `Did you know? Every time ${name} studies ${subject}, a bug gets fixed somewhere.`,
        `${name}, you are currently 100% more productive than a potato. Great job!`,
        `Wow ${name}, learning ${subject}? Your brain is getting huge. I can almost see it from here.`,
        `Don't stop now ${name}! ${subject} isn't going to learn itself, sadly.`,
        `${prog}% done? ${name}, you're a machine! Beep boop.`,
        `Take a sip of water, ${name}. Dehydrated developers write spaghetti code.`,
        `Look at ${name} mastering ${subject}! Watch out Silicon Valley!`,
        `I asked the AI who's the best at ${subject}. It said ${name}. (I might have biased it).`
      ];
      
      setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
    };

    generateMessage();
    const interval = setInterval(generateMessage, 5 * 60 * 1000); // every 5 mins
    return () => clearInterval(interval);
  }, [plan, studentName, selectedModuleId, role]);

  useEffect(() => {
    setApiKey(localStorage.getItem("gemini_api_key") ?? "");
    setModel(localStorage.getItem("gemini_model") ?? "gemini-2.5-flash");
    setStudentName(localStorage.getItem("studentName") ?? "");
    setMounted(true);
  }, []);

  const progress = useMemo(() => {
    if (!plan?.schedule.length) return 0;
    
    let totalItems = 0;
    let completedItems = 0;

    plan.schedule.forEach((module) => {
      totalItems += 1;
      if (module.status === "done") completedItems += 1;

      if (module.materials) {
        totalItems += module.materials.length;
        completedItems += module.materials.filter((m) => m.is_completed).length;
      }
    });

    return Math.round((completedItems / totalItems) * 100);
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
      alert("Failed to perform action.");
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
      alert("Failed to perform action.");
    }
  }

  async function toggleMaterial(material: any, completed: boolean) {
    if (!plan) return;
    try {
      await updateMaterialProgress({ user_id: plan.user_id, material_id: material.id, title: material.title, completed });
      const progressResult = await getProgress(plan.user_id);
      setPlan({ ...plan, schedule: progressResult.schedule });
    } catch (error) {
      alert("Failed to connect to the backend.");
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
         
         const today = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
         const finalName = studentName.trim() || window.prompt("Please enter your name for the certificate:", "") || "Outstanding Student";
         if (finalName !== studentName.trim()) {
           setStudentName(finalName);
           localStorage.setItem("studentName", finalName);
         }
         
         setCertificate({
           name: finalName,
           moduleTitle: quizState.module!.title,
           date: today,
         });
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
      alert("Failed to execute. Check your network or API keys.");
    }
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support text-to-speech.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full border-white/10 hover:bg-white/10 transition-colors">
              <a href="/settings" aria-label="Settings">
                <Settings className="h-4 w-4 text-slate-800 dark:text-slate-200" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-800" />)}
              {!mounted && <div className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr] relative z-10">
        <div className="space-y-6">
        <Card className="p-6 glass-effect animate-fade-up shadow-lg border-white/10 [animation-delay:100ms] opacity-0 hover:shadow-primary/10 transition-shadow">
          <h2 className="text-base font-semibold">Onboarding</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-white/10 bg-background p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter your name for certificates"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  localStorage.setItem("studentName", e.target.value);
                }}
              />
            </div>
            
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

        {plan && motivationalMessage && (
          <Card className="p-4 bg-gradient-to-r from-primary/20 to-blue-500/20 glass-effect border-primary/30 animate-fade-in shadow-lg shadow-primary/5 flex items-start gap-3">
            <div className="flex-shrink-0 animate-bounce">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">Tutor Bot says:</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{motivationalMessage}</p>
            </div>
          </Card>
        )}
        </div>

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
                    <button className="w-full text-left focus:outline-none" onClick={() => setSelectedModuleId(selectedModuleId === item.module_id ? null : item.module_id)}>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5" /> {item.materials?.length ?? 0} study resources
                      </p>
                    </button>
                    {selectedModuleId === item.module_id && (
                      <div className="mt-4 border-t border-white/10 pt-4 animate-fade-in">
                        <p className="text-sm text-muted-foreground mb-3">{item.summary || `${item.est_hours ?? 0} estimated hours`}</p>
                        <div className="space-y-2">
                          {(item.materials ?? []).map((material) => (
                            <div key={material.id} className="flex items-center justify-between rounded-md border border-white/5 bg-black/20 p-2 text-sm hover:bg-white/5 transition-colors">
                              <label className="flex flex-1 cursor-pointer items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={material.is_completed ?? false} 
                                  onChange={(e) => toggleMaterial(material, e.target.checked)}
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
                    )}
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

          <div ref={studyRef} className="flex flex-col gap-6">
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

      {/* Certificate Modal */}
      {certificate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="certificate-modal relative w-full max-w-3xl rounded-xl border border-yellow-500/30 bg-gradient-to-br from-slate-900 to-black p-1 shadow-[0_0_50px_rgba(234,179,8,0.2)] print:shadow-none print:border-none print:bg-black">
            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-500/40 bg-slate-950/80 p-12 text-center text-white overflow-hidden print:border-yellow-500 print:bg-black">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
              
              <div className="mb-4 rounded-full bg-yellow-500/20 p-4 animate-pulse-glow">
                <Trophy className="h-12 w-12 text-yellow-400" />
              </div>
              
              <h2 className="font-serif text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                CERTIFICATE OF COMPLETION
              </h2>
              <p className="mt-4 text-lg text-slate-300 uppercase tracking-widest text-sm">
                This is proudly presented to
              </p>
              
              <h3 className="mt-6 font-serif text-5xl font-bold italic text-white animate-fade-up">
                {certificate.name}
              </h3>
              
              <p className="mt-6 max-w-lg text-slate-300">
                For successfully completing the module and demonstrating exceptional understanding of:
              </p>
              <h4 className="mt-3 text-2xl font-semibold text-yellow-400">
                {certificate.moduleTitle}
              </h4>
              
              <div className="mt-12 flex w-full max-w-lg items-end justify-between border-t border-white/20 pt-6">
                <div className="text-center">
                  <p className="text-xl font-medium text-slate-300">{certificate.date}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Date Completed</p>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl italic text-slate-200" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    Gemini Labs
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Lead Instructor</p>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/10 bg-black/50 backdrop-blur-md"
                  onClick={() => window.print()}
                >
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/10 bg-black/50 backdrop-blur-md"
                  onClick={() => setCertificate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tutor Chat */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isChatOpen && (
          <Card className="mb-4 w-80 p-4 glass-effect shadow-2xl border-white/10 animate-fade-up bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-yellow-400" /> AI Tutor Chat</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10 text-slate-300" onClick={() => setIsChatOpen(false)}>
                &times;
              </Button>
            </div>
            <div className="h-64 space-y-3 overflow-auto rounded-md border border-white/10 bg-black/40 p-3">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground">Ask for a hint about the selected module.</p>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className="text-sm group relative">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-primary">{message.role === "learner" ? "You" : "Tutor"}</p>
                      {message.role === "tutor" && message.text !== "..." && (
                        <button 
                          onClick={() => speakText(message.text)} 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
                          title="Read aloud"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed">{message.text}</p>
                  </div>
                ))
              )}
            </div>
            {chatError && <p className="mt-2 text-xs text-red-500">{chatError}</p>}
            <div className="mt-3 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/50 p-2 text-xs text-white focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ask for a hint..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendTutorMessage();
                }}
              />
              <Button onClick={sendTutorMessage} size="icon" className="h-8 w-8 rounded-md" aria-label="Send tutor message">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
        
        <Button 
          className="h-14 w-14 rounded-full shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-blue-500 hover:scale-105 transition-transform flex items-center justify-center border border-white/20"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    </main>
  );
}
