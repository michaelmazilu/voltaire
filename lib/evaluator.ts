import { bossAnswer, flightAnswer, instagramAnswer, summaryAnswer } from "./templates";
import type { EvidenceCard, FlightResult, QueryIntent } from "./types";

export async function evaluateAnswer({
  query,
  intent,
  evidenceCards,
  flights = [],
}: {
  query: string;
  intent: QueryIntent;
  evidenceCards: EvidenceCard[];
  flights?: FlightResult[];
}) {
  const llmAnswer = await llmEvaluate({ query, evidenceCards, flights });
  if (llmAnswer) return llmAnswer;

  if (intent === "flight_search") return flightAnswer(flights);
  if (intent === "personal_memory_search") return instagramAnswer(evidenceCards[0]);
  if (intent === "work_memory_search") return bossAnswer(evidenceCards[0]);
  return summaryAnswer(evidenceCards, flights);
}

async function llmEvaluate({
  query,
  evidenceCards,
  flights,
}: {
  query: string;
  evidenceCards: EvidenceCard[];
  flights: FlightResult[];
}) {
  const openAiKey = process.env.OPENAI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;

  if (!openAiKey && !mistralKey) return "";

  const isMistral = !openAiKey && Boolean(mistralKey);
  const apiKey = isMistral ? mistralKey : openAiKey;
  const endpoint = isMistral
    ? "https://api.mistral.ai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isMistral
    ? (process.env.MISTRAL_MODEL || "mistral-small-latest")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are Voltaire. Answer using only the provided evidence. Cite source, timestamp, and exact quotes when relevant. For flights, do not claim booking. If evidence is weak, say so.",
        },
        {
          role: "user",
          content: JSON.stringify({ query, evidenceCards, flights }),
        },
      ],
    }),
    signal: controller.signal,
  }).catch(() => null);
  clearTimeout(timeout);

  if (!response?.ok) return "";
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
