export type Tool = "meeting" | "planner" | "research";
export type Settings = { name: string; detail: "concise" | "detailed" };
export type HistoryItem = { id: string; tool: Tool; title: string; at: number };

const S = "awpa-settings";
const H = "awpa-history";

export function getSettings(): Settings {
  try {
    return { name: "", detail: "detailed", ...JSON.parse(localStorage.getItem(S) || "{}") };
  } catch {
    return { name: "", detail: "detailed" };
  }
}
export function saveSettings(s: Settings) {
  localStorage.setItem(S, JSON.stringify(s));
}
export function getHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(H) || "[]");
  } catch {
    return [];
  }
}
export function addHistory(tool: Tool, title: string) {
  const list = [{ id: String(Date.now()), tool, title, at: Date.now() }, ...getHistory()].slice(0, 20);
  localStorage.setItem(H, JSON.stringify(list));
}
export function clearHistory() {
  localStorage.removeItem(H);
}
