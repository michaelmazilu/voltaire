type LlmMessage = {
  role: "system" | "user";
  content: string;
};

const rocketridePipeline = {
  name: "voltaire-answer-synthesis",
  description: "Answer using only retrieved Voltaire evidence.",
  version: 1,
  components: [
    { id: "chat_input", provider: "webhook", config: {} },
    {
      id: "ai_chat",
      provider: "ai_chat",
      config: {
        model: "${ROCKETRIDE_MODEL}",
        temperature: 0,
      },
      input: [{ lane: "text", from: "chat_input" }],
    },
  ],
  source: "chat_input",
};

export async function rocketrideCompleteText(messages: LlmMessage[], expectJson = false) {
  const auth = process.env.ROCKETRIDE_APIKEY ?? process.env.ROCKETRIDE_AUTH;
  if (!auth) return "";

  let client: any;
  let token: string | undefined;
  try {
    const importRocketRide = new Function("return import('rocketride')");
    const { RocketRideClient, Question, Answer } = await importRocketRide();
    client = new RocketRideClient({
      auth,
      uri: process.env.ROCKETRIDE_URI ?? "https://api.rocketride.ai",
      env: {
        ROCKETRIDE_MODEL: process.env.ROCKETRIDE_MODEL ?? "openai/gpt-4o-mini",
      },
      requestTimeout: 12000,
    });

    await client.connect(12000);
    const started = await client.use({ pipeline: rocketridePipeline, ttl: 120 });
    token = started.token;

    const question = new Question({ expectJson });
    for (const message of messages) {
      if (message.role === "system") question.addInstruction("System", message.content);
      else question.addQuestion(message.content);
    }

    const result = await client.chat({ token, question });
    const text = extractRocketRideText(result);
    return expectJson && text ? JSON.stringify(Answer.parseJson(text)) : text;
  } catch {
    return "";
  } finally {
    try {
      if (token) await client?.terminate(token);
      await client?.disconnect();
    } catch {}
  }
}

function extractRocketRideText(result: any) {
  return String(
    result?.data?.answer ??
      result?.answer ??
      result?.body?.answer ??
      result?.body?.text ??
      result?.text ??
      result?.answers?.[0] ??
      "",
  ).trim();
}
