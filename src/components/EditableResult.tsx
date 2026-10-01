import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Val = unknown;
const label = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function toMarkdown(data: Record<string, Val>): string {
  const out: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === "title") {
      out.unshift(`# ${v}\n`);
      continue;
    }
    out.push(`## ${label(k)}`);
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) {
      if (!v.length) out.push("_None_");
      v.forEach((it) =>
        out.push(
          typeof it === "string"
            ? `- ${it}`
            : `- ${Object.entries(it as Record<string, string>)
                .map(([a, b]) => `**${label(a)}:** ${b}`)
                .join(" · ")}`,
        ),
      );
    }
    out.push("");
  }
  return out.join("\n");
}

export function EditableResult({
  data,
  onChange,
  filename,
}: {
  data: Record<string, Val>;
  onChange: (d: Record<string, Val>) => void;
  filename: string;
}) {
  const set = (k: string, v: Val) => onChange({ ...data, [k]: v });

  const copy = async () => {
    await navigator.clipboard.writeText(toMarkdown(data));
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([toMarkdown(data)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Download started");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Everything below is editable.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </div>
      {Object.entries(data).map(([k, v]) => (
        <section key={k} className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{label(k)}</h3>
          {typeof v === "string" ? (
            k === "title" ? (
              <Input value={v} onChange={(e) => set(k, e.target.value)} className="font-semibold" />
            ) : (
              <Textarea value={v} onChange={(e) => set(k, e.target.value)} rows={Math.min(12, Math.max(3, Math.ceil(v.length / 90)))} />
            )
          ) : Array.isArray(v) ? (
            <ListEditor items={v} onChange={(n) => set(k, n)} />
          ) : null}
        </section>
      ))}
    </div>
  );
}

function ListEditor({ items, onChange }: { items: Val[]; onChange: (v: Val[]) => void }) {
  const isObj = items.length > 0 && typeof items[0] === "object";
  const keys = isObj ? Object.keys(items[0] as object) : [];
  const update = (i: number, v: Val) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, isObj ? Object.fromEntries(keys.map((k) => [k, ""])) : ""]);

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing found.</p>}
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {isObj ? (
            <div className="grid flex-1 gap-2 rounded-lg bg-muted/60 p-2 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
              {keys.map((k) => (
                <label key={k} className="text-[11px] font-medium text-muted-foreground">
                  {label(k)}
                  <Input
                    className="mt-1 bg-card"
                    value={String((it as Record<string, string>)[k] ?? "")}
                    onChange={(e) => update(i, { ...(it as object), [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          ) : (
            <Input value={String(it)} onChange={(e) => update(i, e.target.value)} />
          )}
          <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {(items.length > 0 || true) && (
        <Button variant="ghost" size="sm" onClick={add} className="text-primary">
          <Plus className="h-4 w-4" /> Add item
        </Button>
      )}
    </div>
  );
}
