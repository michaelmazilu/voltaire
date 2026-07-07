import { formatDateTime } from "../lib/date";
import type { EvidenceCard as Evidence } from "../lib/types";

export function EvidenceCard({ card }: { card: Evidence }) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
        <span className="rounded border border-line bg-neutral-50 px-2 py-1 text-neutral-700">{card.source}</span>
        <span>{card.sourceType}</span>
        {card.person ? <span>{card.person}</span> : null}
        {card.timestamp ? <span>{formatDateTime(card.timestamp)}</span> : null}
      </div>
      <h3 className="mt-3 text-sm font-bold text-ink">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{card.text}</p>
    </article>
  );
}
