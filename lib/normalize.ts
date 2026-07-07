import type { EvidenceCard, MemoryItem } from "./types";

export function toEvidenceCard(item: MemoryItem): EvidenceCard {
  return {
    id: item.id,
    source: item.source,
    sourceType: item.sourceType,
    title: item.title ?? item.source,
    text: item.text,
    timestamp: item.timestamp,
    person: item.author,
    url: item.url,
    metadata: item.metadata,
  };
}

export function compactText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
