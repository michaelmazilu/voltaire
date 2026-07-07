import { NextResponse } from "next/server";
import { getTableName, insertButterbaseRows } from "../../../../lib/butterbase";
import { upsertMessageGraph } from "../../../../lib/graphIngest";
import { normalizeInstagramExport } from "../../../../lib/instagram";
import { USER_ID } from "../../../../lib/seed";

export async function POST(request: Request) {
  const { messages, userId } = await readMessages(request);
  const ingestionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const rows = messages.map((message) => ({
    id: String(message.id ?? crypto.randomUUID()),
    user_id: String(message.user_id ?? userId),
    ingestion_id: ingestionId,
    source_item_id: String(message.id ?? ""),
    source: "instagram",
    source_type: "message",
    title: message.title ?? `Instagram message`,
    sender: message.sender,
    recipient: message.recipient,
    author: message.sender ?? message.author,
    participants: [message.sender, message.recipient].filter(Boolean),
    timestamp: message.timestamp,
    text: String(message.text ?? ""),
    created_at: createdAt,
    metadata: message,
  }));
  if (!rows.length) {
    return NextResponse.json({ error: "No Instagram messages found. Upload Instagram message_*.json files or POST { messages }." }, { status: 400 });
  }

  const instagramTable = getTableName(userId, "instagram");
  const [run, memory, table] = await Promise.all([
    insertButterbaseRows("ingestion_runs", [{
      id: ingestionId,
      user_id: userId,
      source: "instagram",
      status: "completed",
      item_count: rows.length,
      started_at: createdAt,
      completed_at: createdAt,
      metadata: JSON.stringify({ table: instagramTable }),
    }]),
    insertButterbaseRows("memory_items", rows),
    insertButterbaseRows(instagramTable, rows.map(({ source, source_type, title, author, participants, ...row }) => ({ ...row, platform: "instagram" }))),
  ]);
  await upsertMessageGraph(rows);
  return NextResponse.json({ ingestionRun: run.inserted, inserted: memory.inserted, messageRows: table.inserted, table: instagramTable, source: "instagram" });
}

async function readMessages(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const userId = String(form.get("userId") || USER_ID);
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    const parsed = await Promise.all(files.map(async (file) => normalizeInstagramExport(JSON.parse(await file.text()))));
    return { userId, messages: parsed.flat() };
  }

  const body = (await request.json().catch(() => ({}))) as { messages?: Record<string, unknown>[]; userId?: string };
  return { userId: body.userId ?? USER_ID, messages: (body.messages ?? []).flatMap(normalizeInstagramExport) };
}
