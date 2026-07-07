import { allMemoryItems } from "./seed";
import { compactText } from "./normalize";
import type { MemoryItem, Source } from "./types";

export function butterbaseSearch(query: string, filters: { sources?: Source[] } = {}): MemoryItem[] {
  const terms = compactText(query).split(" ").filter((term) => term.length > 2);
  return allMemoryItems()
    .filter((item) => !filters.sources || filters.sources.includes(item.source))
    .map((item) => ({
      item,
      score: terms.reduce((score, term) => score + (compactText(item.text).includes(term) ? 1 : 0), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
