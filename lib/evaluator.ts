import "./patch-process";
import { RocketRideClient, Question, Answer } from "rocketride";
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
  // Try RocketRide Cloud first if configured
  if (process.env.ROCKETRIDE_APIKEY) {
    const rrAnswer = await evaluateWithRocketRide({ query, evidenceCards, flights });
    if (rrAnswer) return rrAnswer;
  }

  // Fallback to direct LLM completion (Mistral / OpenAI)
  const llmAnswer = await llmEvaluate({ query, evidenceCards, flights });
  if (llmAnswer) return llmAnswer;

  // Static templates fallback if no keys are configured
  if (intent === "flight_search") return flightAnswer(flights);
  if (intent === "personal_memory_search") return instagramAnswer(evidenceCards[0]);
  if (intent === "work_memory_search") return bossAnswer(evidenceCards[0]);
  return summaryAnswer(evidenceCards, flights);
}

async function evaluateWithRocketRide({
  query,
  evidenceCards,
  flights,
}: {
  query: string;
  evidenceCards: EvidenceCard[];
  flights: FlightResult[];
}) {
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  const uri = process.env.ROCKETRIDE_URI || "wss://api.rocketride.ai";

  if (!apiKey) return "";

  const client = new RocketRideClient({
    auth: apiKey,
    uri,
  });

  try {
    console.log("Connecting to RocketRide Cloud...");
    await client.connect();

    // Define the pipeline config for the Answer Synthesis
    const pipelineConfig = {
      name: "voltaire-synthesis",
      description: "Voltaire Answer Synthesis Pipeline",
      version: 1,
      components: [
        {
          id: "chat_input",
          provider: "webhook",
          config: {},
        },
        {
          id: "ai_chat",
          provider: "ai_chat",
          config: {
            model: "openai/gpt-4o-mini",
            temperature: 0,
          },
          input: [
            {
              lane: "text",
              from: "chat_input",
            },
          ],
        },
      ],
      source: "chat_input",
    };

    console.log("Starting RocketRide synthesis pipeline...");
    const { token } = await client.use({ pipeline: pipelineConfig });

    console.log("Sending chat prompt to RocketRide...");
    const question = new Question({ expectJson: false });
    question.addInstruction(
      "System",
      "You are Voltaire. Answer using only the provided evidence. Cite source, timestamp, and exact quotes when relevant. For flights, do not claim booking. If evidence is weak, say so."
    );
    question.addQuestion(JSON.stringify({ query, evidenceCards, flights }));

    const response = await client.chat({ token, question });
    const answerText = response?.data?.answer ?? response?.answers?.[0] ?? "";

    await client.terminate(token);
    await client.disconnect();

    console.log("RocketRide synthesis completed successfully.");
    return answerText.trim();
  } catch (error) {
    console.error("RocketRide Cloud evaluation failed, falling back:", error);
    try {
      await client.disconnect();
    } catch {}
    return "";
  }
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
