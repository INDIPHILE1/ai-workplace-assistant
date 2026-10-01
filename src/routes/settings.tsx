import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as Cog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ToolShell";
import { clearHistory, getSettings, saveSettings, type Settings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workplace AI" },
      { name: "description", content: "Personalize your AI workplace assistant." },
      { property: "og:title", content: "Settings — Workplace AI" },
      { property: "og:description", content: "Personalize your AI workplace assistant." },
    ],
  }),
  component: Page,
});

function Page() {
  const [s, setS] = useState<Settings>({ name: "", detail: "detailed" });
  useEffect(() => setS(getSettings()), []);
  return (
    <>
      <PageHeader icon={<Cog className="h-5 w-5" />} title="Settings" desc="Preferences are saved in this browser only." />
      <div className="max-w-xl space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Your name</label>
          <Input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} placeholder="Used for your dashboard greeting" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">AI response detail</label>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {(["concise", "detailed"] as const).map((d) => (
              <button key={d} onClick={() => setS({ ...s, detail: d })} className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize ${s.detail === d ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { saveSettings(s); toast.success("Settings saved"); }}>Save settings</Button>
          <Button variant="outline" onClick={() => { clearHistory(); toast.success("Activity history cleared"); }}>Clear activity history</Button>
        </div>
      </div>
    </>
  );
}
