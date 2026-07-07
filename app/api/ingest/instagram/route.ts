import { NextResponse } from "next/server";
import { insertButterbaseRows } from "../../../../lib/butterbase";
import { upsertMessageGraph } from "../../../../lib/graphIngest";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { messages?: Record<string, unknown>[] };
  const messages = body.messages ?? [];
  const rows = messages.map((message) => ({
    id: message.id ?? crypto.randomUUID(),
    user_id: message.user_id ?? "default",
    source: "instagram",
    source_type: "message",
    title: message.title ?? `Instagram message`,
    author: message.sender ?? message.author,
    participants: [message.sender, message.recipient].filter(Boolean),
    timestamp: message.timestamp,
    text: String(message.text ?? ""),
    metadata: message,
  }));
  const [memory, table] = await Promise.all([
    insertButterbaseRows("memory_items", rows),
    insertButterbaseRows("messages", rows.map(({ source, source_type, title, author, participants, ...row }) => ({ ...row, platform: "instagram" }))),
  ]);
  await upsertMessageGraph(rows);
  return NextResponse.json({ inserted: memory.inserted, messageRows: table.inserted, source: "instagram" });
}
