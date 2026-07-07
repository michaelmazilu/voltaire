import { callMcpTool } from "./butterbase";
import { compactText } from "./normalize";
import type { MemoryItem, Source } from "./types";

export async function butterbaseSearch(query: string, filters: { sources?: Source[] } = {}): Promise<MemoryItem[]> {
  const appId = process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID;
  if (!appId) return [];

  const results: MemoryItem[] = [];
  const terms = compactText(query).split(" ").filter((term) => term.length > 2);

  try {
    // 1. Fetch Instagram messages
    if (!filters.sources || filters.sources.includes("instagram")) {
      const data = await callMcpTool("select_rows", {
        app_id: appId,
        table: "instagram_messages",
        limit: 100
      }).catch(() => []);

      const messages = (Array.isArray(data) ? data : []).map((message: any) => ({
        id: message.id,
        userId: "michael",
        source: "instagram" as Source,
        sourceType: "message" as any,
        title: `Instagram DM with ${message.recipient}`,
        text: message.text,
        author: message.sender,
        participants: [message.sender, message.recipient],
        timestamp: message.timestamp,
        metadata: message,
      }));
      results.push(...messages);
    }

    // 2. Fetch Meeting notes
    if (!filters.sources || filters.sources.includes("google_meet")) {
      const data = await callMcpTool("select_rows", {
        app_id: appId,
        table: "meeting_notes",
        limit: 100
      }).catch(() => []);

      const meetings = (Array.isArray(data) ? data : []).map((note: any) => ({
        id: note.id,
        userId: "michael",
        source: "google_meet" as Source,
        sourceType: "meeting_note" as any,
        title: note.meeting_title,
        text: note.text,
        author: note.speaker,
        participants: note.participants,
        timestamp: note.timestamp,
        metadata: note,
      }));
      results.push(...meetings);
    }
  } catch (error) {
    console.error("Butterbase search failed, falling back to empty:", error);
    return [];
  }

  // Rank and filter by keyword matching score
  return results
    .map((item) => ({
      item,
      score: terms.reduce((score, term) => score + (compactText(item.text).includes(term) ? 1 : 0), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
