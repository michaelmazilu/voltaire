import { routeQuery } from "./router";
import type { ToolPlan } from "./types";
import { completeText } from "./llm";

export async function planQuery(query: string): Promise<ToolPlan> {
  const llmPlan = await llmPlanQuery(query);
  if (llmPlan) return llmPlan;
  const route = routeQuery(query);
  return {
    ...route,
    needsRetrieval: route.intent !== "conversation",
  };
}

async function llmPlanQuery(query: string): Promise<ToolPlan | null> {
  const content = await completeText(
    [
      {
        role: "system",
        content:
          "Return JSON only: {\"intent\":\"conversation|flight_search|personal_memory_search|work_memory_search|web_search|cross_source_search\",\"sources\":string[],\"methods\":string[],\"needsRetrieval\":boolean}. Choose tools conservatively. Greetings do not need retrieval.",
      },
      { role: "user", content: query },
    ],
    true,
  );
  if (!content) return null;
  let parsed: Partial<ToolPlan> | null = null;
  try {
    parsed = JSON.parse(content) as Partial<ToolPlan> | null;
  } catch {
    return null;
  }
  if (!parsed?.intent || !Array.isArray(parsed.sources) || !Array.isArray(parsed.methods)) return null;
  return {
    intent: parsed.intent,
    sources: parsed.sources,
    methods: parsed.methods,
    needsRetrieval: Boolean(parsed.needsRetrieval),
  } as ToolPlan;
}
