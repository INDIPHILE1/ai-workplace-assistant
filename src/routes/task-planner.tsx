import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, ResultPanel, useAITool } from "@/components/ToolShell";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      { name: "description", content: "Prioritize tasks and generate a personalized daily or weekly schedule." },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      { property: "og:description", content: "Prioritize tasks and generate a personalized daily or weekly schedule." },
    ],
  }),
  component: Page,
});

type T = { name: string; priority: string; deadline: string; estimate: string };
const blank = (): T => ({ name: "", priority: "Medium", deadline: "", estimate: "" });
const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

function Page() {
  const [tasks, setTasks] = useState<T[]>([blank()]);
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [time, setTime] = useState("9:00 to 17:00, Monday–Friday");
  const [extra, setExtra] = useState("");
  const ai = useAITool("planner");
  const valid = tasks.filter((t) => t.name.trim());
  const upd = (i: number, p: Partial<T>) => setTasks(tasks.map((t, j) => (j === i ? { ...t, ...p } : t)));

  const generate = () => {
    const list = valid
      .map((t, i) => `${i + 1}. ${t.name} | priority: ${t.priority} | deadline: ${t.deadline || "none"} | estimate: ${t.estimate || "unknown"}`)
      .join("\n");
    ai.run(`Plan type: ${mode}\nAvailable time: ${time}\nTasks:\n${list}\nAdditional context: ${extra || "none"}`, `${mode} plan`);
  };

  return (
    <>
      <PageHeader icon={<CalendarClock className="h-5 w-5" />} title="AI Task Planner" desc="Add your tasks and let AI prioritize and schedule them." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-6">
          <div className="inline-flex rounded-lg bg-muted p-1">
            {(["daily", "weekly"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize ${mode === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={i} className="space-y-2 rounded-xl bg-muted/60 p-3">
                <div className="flex gap-2">
                  <Input className="bg-card" placeholder="Task name" value={t.name} onChange={(e) => upd(i, { name: e.target.value })} />
                  <Button variant="ghost" size="icon" disabled={tasks.length === 1} onClick={() => setTasks(tasks.filter((_, j) => j !== i))} aria-label="Remove task">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select className={sel} value={t.priority} onChange={(e) => upd(i, { priority: e.target.value })}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                  <Input className="bg-card" type="date" value={t.deadline} onChange={(e) => upd(i, { deadline: e.target.value })} />
                  <Input className="bg-card" placeholder="Est. e.g. 2h" value={t.estimate} onChange={(e) => upd(i, { estimate: e.target.value })} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setTasks([...tasks, blank()])}>
              <Plus className="h-4 w-4" /> Add task
            </Button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Available time</label>
            <Input value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Notes (optional)</label>
            <Textarea rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. meetings at 11am, I focus best in the morning" />
          </div>
          <Button className="w-full" disabled={ai.loading || !valid.length || !time.trim()} onClick={generate}>
            {ai.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate {mode} schedule
          </Button>
        </div>
        <ResultPanel {...ai} filename={`${mode}-schedule`} emptyText="Your prioritized tasks and editable schedule will appear here." />
      </div>
    </>
  );
}
