import type { GraphTraceItem, QueryIntent } from "./types";

export async function graphSearch(_query: string, intent: QueryIntent): Promise<GraphTraceItem[]> {
  if (intent === "personal_memory_search") {
    return [
      { from: "Michael", type: "SENT_MESSAGE_TO", to: "toyesshh" },
      { from: "Michael", type: "AUTHORED", to: "Instagram Message" },
      { from: "Message", type: "MENTIONS", to: "toyesshh" },
    ];
  }
  if (intent === "work_memory_search") {
    return [
      { from: "Andrey", type: "IS_BOSS_OF", to: "Michael" },
      { from: "Andrey", type: "SAID_IN_MEETING", to: "Morning Sync" },
      { from: "Morning Sync", type: "CONTAINS_ACTION_ITEM", to: "OAuth callback issue" },
    ];
  }
  if (intent === "flight_search") {
    return [
      { from: "Flight", type: "FOUND_IN", to: "Web Result" },
      { from: "Web Result", type: "SEARCH_RESULT_FOR", to: "Toronto to San Francisco cheap flight" },
    ];
  }
  return [
    { from: "Michael", type: "INTERACTED_WITH", to: "Instagram" },
    { from: "Michael", type: "INTERACTED_WITH", to: "Google Meet" },
    { from: "Michael", type: "INTERACTED_WITH", to: "Exa" },
  ];
}
