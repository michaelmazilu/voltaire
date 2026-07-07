import { formatDateTime } from "../lib/date";
import type { EvidenceCard as Evidence } from "../lib/types";

export function EvidenceCard({ card }: { card: Evidence }) {
  return (
    <article className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="rounded bg-white/8 px-2 py-1 text-teal-200">{card.source}</span>
        <span>{card.sourceType}</span>
        {card.person ? <span>{card.person}</span> : null}
        {card.timestamp ? <span>{formatDateTime(card.timestamp)}</span> : null}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{card.text}</p>
    </article>
  );
}
