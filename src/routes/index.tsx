import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, NotebookPen, Search, Clock } from "lucide-react";
import { getHistory, getSettings, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Summarize meetings, plan your tasks and research any topic with AI." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Summarize meetings, plan your tasks and research any topic with AI." },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/meeting-notes", title: "Meeting Notes", desc: "Summaries, decisions, action items & deadlines from raw notes.", icon: NotebookPen, key: "meeting" },
  { to: "/task-planner", title: "Task Planner", desc: "Prioritized daily or weekly schedules that fit your time.", icon: CalendarClock, key: "planner" },
  { to: "/research", title: "Research Assistant", desc: "Insights, explanations and recommendations on any topic.", icon: Search, key: "research" },
] as const;

function Dashboard() {
  const [hist, setHist] = useState<HistoryItem[]>([]);
  const [name, setName] = useState("");
  useEffect(() => {
    setHist(getHistory());
    setName(getSettings().name);
  }, []);
  const count = (k: string) => hist.filter((h) => h.tool === k).length;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl bg-hero p-6 text-primary-foreground shadow-soft sm:p-8">
        <p className="text-sm opacity-80">Welcome{name ? `, ${name}` : ""}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Your AI workplace assistant</h1>
        <p className="mt-2 max-w-lg opacity-85">Turn notes into actions, tasks into a plan, and questions into answers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground">{count(t.key)} runs</span>
            </div>
            <h2 className="mt-4 font-semibold">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="mb-4 font-semibold">Recent activity</h2>
        {hist.length === 0 ? (
          <div className="grid place-items-center py-8 text-center">
            <Clock className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity yet. Pick a tool above to get started.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {hist.slice(0, 8).map((h) => {
              const t = TOOLS.find((x) => x.key === h.tool)!;
              return (
                <li key={h.id} className="flex items-center gap-3 py-3">
                  <t.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm">{h.title}</span>
                  <span className="text-xs text-muted-foreground">{new Date(h.at).toLocaleDateString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
