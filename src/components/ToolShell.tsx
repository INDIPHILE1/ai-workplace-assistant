import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { runAI } from "@/lib/ai.functions";
import { addHistory, getSettings, type Tool } from "@/lib/storage";
import { EditableResult } from "./EditableResult";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({ title, desc, icon }: { title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">{icon}</div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function useAITool(tool: Tool) {
  const call = useServerFn(runAI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const run = async (input: string, histTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await call({ data: { tool, input, detail: getSettings().detail } });
      if (r.error) {
        setError(r.error);
        toast.error(r.error);
      } else if (r.result) {
        const parsed = JSON.parse(r.result) as Record<string, unknown>;
        setResult(parsed);
        addHistory(tool, String(parsed.title ?? histTitle).slice(0, 80));
        toast.success("Results generated");
      }
    } catch {
      const m = "Network error. Check your connection and try again.";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, result, setResult, run };
}

export function ResultPanel({
  loading,
  error,
  result,
  setResult,
  filename,
  emptyText,
}: {
  loading: boolean;
  error: string | null;
  result: Record<string, unknown> | null;
  setResult: (r: Record<string, unknown>) => void;
  filename: string;
  emptyText: string;
}) {
  if (loading)
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Loader2 className="h-4 w-4 animate-spin" /> AI is analyzing your input…
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {result ? (
        <div className="rounded-2xl border bg-card p-4 shadow-soft sm:p-6">
          <EditableResult data={result} onChange={setResult} filename={filename} />
        </div>
      ) : (
        !error && (
          <div className="grid place-items-center rounded-2xl border border-dashed bg-card/60 p-10 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-primary" />
            <p className="max-w-xs text-sm text-muted-foreground">{emptyText}</p>
          </div>
        )
      )}
    </div>
  );
}
