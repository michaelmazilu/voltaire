import { formatDateTime } from "../lib/date";
import type { EvidenceCard } from "../lib/types";

export function MessageCard({ card }: { card: EvidenceCard }) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4">
      <div className="text-xs text-neutral-400">
        {String(card.metadata.sender ?? card.person)} → {String(card.metadata.recipient ?? "recipient")} · {formatDateTime(card.timestamp)}
      </div>
      <blockquote className="mt-3 border-l-2 border-neutral-300 pl-3 text-sm leading-6 text-ink">"{card.text}"</blockquote>
      <div className="mt-3 text-xs text-neutral-400">Source: connected message data</div>
    </article>
  );
}
