type LlmMessage = {
  role: "system" | "user";
  content: string;
};

export async function completeText(messages: LlmMessage[], json = false) {
  if (process.env.OPENAI_API_KEY) return openai(messages, json);
  if (process.env.ANTHROPIC_API_KEY) return anthropic(messages);
  if (process.env.GEMINI_API_KEY) return gemini(messages);
  return "";
}

async function openai(messages: LlmMessage[], json: boolean) {
  const response = await boundedFetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });
  if (!response?.ok) return "";
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function anthropic(messages: LlmMessage[]) {
  const [system, ...rest] = messages;
  const response = await boundedFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
      max_tokens: 1200,
      temperature: 0,
      system: system?.role === "system" ? system.content : undefined,
      messages: rest.map((message) => ({ role: "user", content: message.content })),
    }),
  });
  if (!response?.ok) return "";
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text?.trim() ?? "";
}

async function gemini(messages: LlmMessage[]) {
  const response = await boundedFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-1.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        generationConfig: { temperature: 0 },
        contents: [{ role: "user", parts: [{ text: messages.map((message) => `${message.role}: ${message.content}`).join("\n\n") }] }],
      }),
    },
  );
  if (!response?.ok) return "";
  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function boundedFetch(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const response = await fetch(url, { ...init, signal: controller.signal }).catch(() => null);
  clearTimeout(timeout);
  return response;
}
