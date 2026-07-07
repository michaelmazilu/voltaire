import { formatDateTime } from "../lib/date";
import type { EvidenceCard } from "../lib/types";

export function MeetingCard({ card }: { card: EvidenceCard }) {
  return (
    <article className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="text-xs text-slate-400">{card.title} · {card.person} · {formatDateTime(card.timestamp)}</div>
      <p className="mt-3 text-sm leading-6 text-slate-200">{card.text}</p>
      <div className="mt-3 text-xs text-slate-500">Source: Google Meet / meeting notes</div>
    </article>
  );
}
