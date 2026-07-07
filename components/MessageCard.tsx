import { formatDateTime } from "../lib/date";
import type { EvidenceCard } from "../lib/types";

export function MessageCard({ card }: { card: EvidenceCard }) {
  return (
    <article className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="text-xs text-slate-400">
        {String(card.metadata.sender ?? card.person)} → {String(card.metadata.recipient ?? "recipient")} · {formatDateTime(card.timestamp)}
      </div>
      <blockquote className="mt-3 border-l-2 border-teal-300 pl-3 text-sm leading-6 text-white">"{card.text}"</blockquote>
      <div className="mt-3 text-xs text-slate-500">Source: Instagram DM</div>
    </article>
  );
}
