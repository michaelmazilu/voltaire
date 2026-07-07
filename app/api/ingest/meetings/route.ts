import { NextResponse } from "next/server";
import { insertButterbaseRows } from "../../../../lib/butterbase";
import { upsertMeetingGraph } from "../../../../lib/graphIngest";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { meetings?: Record<string, unknown>[] };
  const meetings = body.meetings ?? [];
  const rows = meetings.map((meeting) => ({
    id: meeting.id ?? crypto.randomUUID(),
    user_id: meeting.user_id ?? "default",
    source: "google_meet",
    source_type: "meeting_note",
    title: meeting.title ?? meeting.meeting_title ?? "Meeting note",
    author: meeting.speaker ?? meeting.author,
    participants: meeting.participants,
    timestamp: meeting.timestamp,
    text: String(meeting.text ?? ""),
    metadata: meeting,
  }));
  const [memory, table] = await Promise.all([
    insertButterbaseRows("memory_items", rows),
    insertButterbaseRows(
      "meetings",
      rows.map(({ source, source_type, text, author, ...row }) => ({ ...row, platform: "google_meet" })),
    ),
  ]);
  await upsertMeetingGraph(rows);
  return NextResponse.json({ inserted: memory.inserted, meetingRows: table.inserted, source: "google_meet" });
}
