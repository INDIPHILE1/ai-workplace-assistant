import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, ResultPanel, useAITool } from "@/components/ToolShell";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI" },
      { name: "description", content: "Turn raw meeting notes into summaries, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI" },
      { property: "og:description", content: "Turn raw meeting notes into summaries, decisions, action items and deadlines." },
    ],
  }),
  component: Page,
});

function Page() {
  const [notes, setNotes] = useState("");
  const ai = useAITool("meeting");

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > 1_000_000) return toast.error("File is too large (max 1MB).");
    const r = new FileReader();
    r.onload = () => {
      setNotes(String(r.result));
      toast.success(`Loaded ${f.name}`);
    };
    r.onerror = () => toast.error("Could not read that file.");
    r.readAsText(f);
  };

  return (
    <>
      <PageHeader icon={<NotebookPen className="h-5 w-5" />} title="Meeting Notes Summarizer" desc="Paste or upload notes to extract summary, decisions, action items and deadlines." />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Meeting notes</label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> Upload .txt / .md
              <input type="file" accept=".txt,.md,.csv,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={16} placeholder="Paste your meeting notes or transcript here…" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{notes.length.toLocaleString()} characters</span>
            {notes && <button onClick={() => setNotes("")} className="hover:text-foreground">Clear</button>}
          </div>
          <Button
            className="w-full"
            disabled={ai.loading || notes.trim().length < 20}
            onClick={() => ai.run(`Meeting notes:\n"""\n${notes}\n"""`, "Meeting summary")}
          >
            {ai.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Summarize notes
          </Button>
          {notes.trim().length > 0 && notes.trim().length < 20 && <p className="text-xs text-muted-foreground">Add a bit more detail (20+ characters).</p>}
        </div>
        <ResultPanel {...ai} filename="meeting-summary" emptyText="Your summary, key points, decisions, action items and deadlines will appear here." />
      </div>
    </>
  );
}
