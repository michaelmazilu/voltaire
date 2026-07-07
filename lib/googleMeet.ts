export function normalizeGoogleMeetingInput(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input.flatMap(normalizeGoogleMeetingInput);
  if (!input || typeof input !== "object") return [];

  const item = input as Record<string, any>;
  if (typeof item.text === "string") return [item];

  const title = item.summary ?? item.meeting_title ?? item.title ?? "Google Meet";
  const participants = [
    ...(item.attendees ?? []).map((attendee: any) => attendee.displayName ?? attendee.email).filter(Boolean),
    ...(item.participants ?? []),
  ];
  const transcript = item.transcript ?? item.description ?? item.notes;
  if (!transcript) return [];

  return [{
    id: item.id ?? crypto.randomUUID(),
    platform: "google_meet",
    meeting_title: title,
    participants: [...new Set(participants.map(String))],
    speaker: item.speaker ?? item.organizer?.displayName ?? item.organizer?.email ?? "Google Meet",
    timestamp: item.start?.dateTime ?? item.timestamp,
    text: String(transcript),
    calendar_event_id: item.id,
    meet_url: item.hangoutLink ?? item.conferenceData?.entryPoints?.find((entry: any) => entry.entryPointType === "video")?.uri,
  }];
}
