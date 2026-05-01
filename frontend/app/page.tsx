"use client";

import { useMemo, useState } from "react";
import { BookOpen, Moon, Play, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { runCode, submitPlan } from "@/lib/api";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const roles = ["Data Analyst", "Data Scientist", "ML Engineer", "AI Engineer", "AI Architect"];
const skills = ["Python Basics", "Git", "SQL Joins", "Linear Algebra", "Statistics"];

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState("Data Scientist");
  const [months, setMonths] = useState(3);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [code, setCode] = useState("print('Ready to study')\n");
  const [language, setLanguage] = useState<"python" | "sql">("python");
  const [output, setOutput] = useState("");

  const progress = useMemo(() => {
    if (!plan?.schedule?.length) return 0;
    const done = plan.schedule.filter((item: any) => item.status === "done").length;
    return Math.round((done / plan.schedule.length) * 100);
  }, [plan]);

  async function generatePlan() {
    const result = await submitPlan({
      chosen_path: role,
      target_months: months,
      skills: selectedSkills.map((name) => ({ name })),
    });
    setPlan(result);
  }

  async function execute() {
    const result = await runCode(language, code);
    setOutput(result.stdout || result.stderr || JSON.stringify(result.rows ?? [], null, 2));
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  {plan ? `${plan.weekly_hours} weekly hours recommended` : "Generate a plan to calculate deadlines."}
                </p>
              </div>
              <Progress value={progress} className="w-40" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(plan?.schedule ?? []).slice(0, 6).map((item: any) => (
                <div key={item.module_id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.title}</p>
                    <span className="text-xs uppercase text-muted-foreground">{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Due {item.due_date} · {item.priority}</p>
                </div>
              ))}
            </div>
          </Card>

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
              <Button variant="ghost" asChild>
                <a href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Tutor Settings
                </a>
              </Button>
            </div>
            <pre className="mt-4 min-h-24 overflow-auto rounded-md bg-muted p-3 font-mono text-sm">{output}</pre>
          </Card>
        </div>
      </section>
    </main>
  );
}
