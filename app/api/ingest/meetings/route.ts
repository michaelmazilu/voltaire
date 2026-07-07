import { NextResponse } from "next/server";
import { getTableName, insertButterbaseRows } from "../../../../lib/butterbase";
import { normalizeGoogleMeetingInput } from "../../../../lib/googleMeet";
import { upsertMeetingGraph } from "../../../../lib/graphIngest";
import { USER_ID } from "../../../../lib/seed";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { meetings?: Record<string, unknown>[]; calendarEvents?: Record<string, unknown>[]; userId?: string };
  const userId = body.userId ?? USER_ID;
  const meetings = [...(body.meetings ?? []), ...(body.calendarEvents ?? [])].flatMap(normalizeGoogleMeetingInput);
  const ingestionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const rows = meetings.map((meeting) => ({
    id: meeting.id ?? crypto.randomUUID(),
    user_id: meeting.user_id ?? userId,
    ingestion_id: ingestionId,
    source_item_id: String(meeting.id ?? meeting.calendar_event_id ?? ""),
    source: "google_meet",
    source_type: "meeting_note",
    title: meeting.title ?? meeting.meeting_title ?? "Meeting note",
    author: meeting.speaker ?? meeting.author,
    participants: meeting.participants,
    timestamp: meeting.timestamp,
    text: String(meeting.text ?? ""),
    url: meeting.meet_url,
    created_at: createdAt,
    metadata: meeting,
  }));
  if (!rows.length) {
    return NextResponse.json({ error: "No meeting data found. POST { meetings } or { calendarEvents } with transcript text." }, { status: 400 });
  }

  const googleMeetTable = getTableName(userId, "google_meet");
  const [run, memory, table] = await Promise.all([
    insertButterbaseRows("ingestion_runs", [{
      id: ingestionId,
      user_id: userId,
      source: "google_meet",
      status: "completed",
      item_count: rows.length,
      started_at: createdAt,
      completed_at: createdAt,
      metadata: JSON.stringify({ table: googleMeetTable }),
    }]),
    insertButterbaseRows("memory_items", rows),
    insertButterbaseRows(
      googleMeetTable,
      rows.map(({ source, source_type, text, author, ...row }) => ({ ...row, platform: "google_meet" })),
    ),
  ]);
  await upsertMeetingGraph(rows);
  return NextResponse.json({ ingestionRun: run.inserted, inserted: memory.inserted, meetingRows: table.inserted, table: googleMeetTable, source: "google_meet" });
}
