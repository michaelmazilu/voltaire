import { butterbaseSearch } from "./butterbaseSearch";
import type { MemoryItem, Source } from "./types";

export async function butterbaseRagSearch(
  query: string,
  filters: { sources?: Source[] } = {},
): Promise<MemoryItem[]> {
  return butterbaseSearch(query, filters).slice(0, 5);
}
