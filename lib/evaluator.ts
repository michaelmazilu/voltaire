import { completeText } from "./llm";
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

  // Static templates fallback if no keys are configured
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
  return completeText([
    {
      role: "system",
      content:
        "You are Voltaire. Answer using only the provided evidence. Cite source, timestamp, and exact quotes when relevant. For flights, do not claim booking. If evidence is weak, say so.",
    },
    {
      role: "user",
      content: JSON.stringify({ query, evidenceCards, flights }),
    },
  ]);
}
