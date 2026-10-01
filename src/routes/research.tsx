import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, ResultPanel, useAITool } from "@/components/ToolShell";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Ask any question or paste an article to get summaries, insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      { property: "og:description", content: "Ask any question or paste an article to get summaries, insights and recommendations." },
    ],
  }),
  component: Page,
});

const EXAMPLES = ["How can a remote team improve async communication?", "Explain the pros and cons of a four-day work week", "What is retrieval-augmented generation?"];

function Page() {
  const [q, setQ] = useState("");
  const ai = useAITool("research");
  return (
    <>
      <PageHeader icon={<Search className="h-5 w-5" />} title="AI Research Assistant" desc="Ask a question, name a topic, or paste an article." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft sm:p-6">
          <label className="text-sm font-semibold">Topic, question or text</label>
          <Textarea rows={12} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What are best practices for running effective one-on-ones?" />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => setQ(e)} className="rounded-full border bg-accent/50 px-3 py-1 text-xs text-accent-foreground hover:bg-accent">
                {e}
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={ai.loading || q.trim().length < 3} onClick={() => ai.run(`Research request:\n"""\n${q}\n"""`, q)}>
            {ai.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Research
          </Button>
        </div>
        <ResultPanel {...ai} filename="research" emptyText="Summary, key insights, explanation and recommendations will appear here." />
      </div>
    </>
  );
}
