import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const str = { type: "string" };
const strArr = { type: "array", items: str };
const obj = (props: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  properties: props,
  required: Object.keys(props),
});

const SCHEMAS = {
  meeting: obj({
    title: str,
    summary: str,
    key_points: strArr,
    decisions: strArr,
    action_items: { type: "array", items: obj({ task: str, owner: str, due: str }) },
    deadlines: { type: "array", items: obj({ item: str, date: str }) },
  }),
  planner: obj({
    overview: str,
    prioritized_tasks: {
      type: "array",
      items: obj({ task: str, priority: { type: "string", enum: ["High", "Medium", "Low"] }, reason: str }),
    },
    schedule: { type: "array", items: obj({ day: str, time: str, task: str, duration: str, notes: str }) },
    tips: strArr,
  }),
  research: obj({
    title: str,
    summary: str,
    key_insights: strArr,
    explanation: str,
    recommendations: strArr,
    follow_up_questions: strArr,
  }),
} as const;

const SYSTEM: Record<keyof typeof SCHEMAS, string> = {
  meeting:
    "You are an expert executive assistant. Analyze ONLY the meeting notes provided by the user. Produce a faithful, specific summary. Extract concrete key points, decisions actually made, action items (with owner and due date if mentioned; otherwise 'Unassigned' / 'Not specified'), and any deadlines. Never invent facts that are not in the notes. If a section has nothing, return an empty array.",
  planner:
    "You are a productivity coach and scheduler. Using ONLY the user's tasks, priorities, deadlines and available time, prioritize tasks using urgency (deadline proximity), importance (stated priority) and effort. Build a realistic schedule that fits within the available time, includes short breaks, and places high-priority/near-deadline work first and in peak focus slots. Use the requested plan type (daily or weekly) for the 'day' field. Reference the user's real task names.",
  research:
    "You are a rigorous research analyst. Respond directly to the user's specific topic, question, or pasted text. Give an accurate summary, specific key insights, a clear explanation suitable for a professional, and actionable recommendations. Be concrete and tailored to the input; avoid generic filler. If uncertain, say so explicitly.",
};

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        tool: z.enum(["meeting", "planner", "research"]),
        input: z.string().min(3).max(60000),
        detail: z.enum(["concise", "detailed"]).default("detailed"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured." } as const;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: `${SYSTEM[data.tool]}\nDetail level: ${data.detail}. Today's date: ${new Date().toISOString().slice(0, 10)}.`,
        input: [{ role: "user", content: data.input }],
        text: { format: { type: "json_schema", name: data.tool, strict: true, schema: SCHEMAS[data.tool] } },
      }),
    });

    if (!res.ok || !res.body) {
      const msg =
        res.status === 429
          ? "Too many requests right now. Please wait a moment and try again."
          : res.status === 402
            ? "AI credits are exhausted. Please add credits to continue."
            : `AI request failed (${res.status}). Please try again.`;
      return { error: msg } as const;
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let refused = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          else if (ev.type === "response.refusal.delta") refused += ev.delta;
          else if (ev.type === "error" || ev.type === "response.failed")
            return { error: "The AI could not complete this request. Please try again." } as const;
        } catch {
          /* partial */
        }
      }
    }
    if (refused) return { error: "The AI declined this request." } as const;
    try {
      return { result: JSON.parse(text) as Record<string, unknown> } as const;
    } catch {
      return { error: "The AI returned an unexpected response. Please try again." } as const;
    }
  });
