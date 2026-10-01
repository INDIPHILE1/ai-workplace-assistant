import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>AI-generated content may contain errors. Always review and verify important information before using it.</span>
    </div>
  );
}
