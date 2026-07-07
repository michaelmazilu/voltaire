export function normalizeInstagramExport(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input.flatMap(normalizeInstagramExport);
  if (!input || typeof input !== "object") return [];

  const data = input as Record<string, any>;
  if (typeof data.text === "string") return [data];

  const participants = Array.isArray(data.participants) ? data.participants.map((item) => item?.name).filter(Boolean) : [];
  if (!Array.isArray(data.messages)) return [];

  return data.messages
    .filter((message: any) => typeof message?.content === "string")
    .map((message: any) => {
      const sender = String(message.sender_name ?? "");
      const recipient = participants.find((name) => name !== sender) ?? String(data.title ?? "");
      return {
        id: message.id ?? `ig_${message.timestamp_ms ?? crypto.randomUUID()}`,
        conversation_id: data.thread_path ?? data.title ?? recipient,
        sender,
        recipient,
        timestamp: typeof message.timestamp_ms === "number" ? new Date(message.timestamp_ms).toISOString() : message.timestamp,
        text: message.content,
      };
    });
}
