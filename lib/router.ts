import type { RouteResult } from "./types";

export function routeQuery(query: string): RouteResult {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|yo|sup|thanks|thank you)[!.?\s]*$/.test(q)) {
    return {
      intent: "conversation",
      sources: [],
      methods: ["llm_planner"],
    };
  }
  if (
    q.includes("flight") ||
    q.includes("cheap") ||
    q.includes("ticket") ||
    q.includes("fly") ||
    q.includes("airport") ||
    q.includes("travel")
  ) {
    return {
      intent: "flight_search",
      sources: ["flight_tool", "exa", "neo4j"],
      methods: ["butterbase", "graph", "exa_optional"],
    };
  }
  if (
    q.includes("instagram") ||
    q.includes("dm") ||
    q.includes("i told") ||
    q.includes("message") ||
    q.includes("chat")
  ) {
    return {
      intent: "personal_memory_search",
      sources: ["instagram", "neo4j"],
      methods: ["keyword", "butterbase", "graph"],
    };
  }
  if (
    q.includes("boss") ||
    q.includes("manager") ||
    q.includes("work") ||
    q.includes("task") ||
    q.includes("told me") ||
    q.includes("meeting") ||
    q.includes("remind me") ||
    q.includes("standup") ||
    q.includes("action item")
  ) {
    return {
      intent: "work_memory_search",
      sources: ["google_meet", "neo4j"],
      methods: ["butterbase", "keyword", "graph"],
    };
  }
  return {
    intent: "cross_source_search",
    sources: ["instagram", "google_meet", "flight_tool", "exa", "neo4j"],
    methods: ["butterbase", "keyword", "graph", "exa_optional"],
  };
}
