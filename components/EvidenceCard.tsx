import { FileText, Globe, Instagram, Plane, Video } from "lucide-react";
import { formatDateTime } from "../lib/date";
import type { EvidenceCard as Evidence } from "../lib/types";

function sourceMeta(source: Evidence["source"]) {
  switch (source) {
    case "instagram":
      return { label: "Instagram", Icon: Instagram };
    case "google_meet":
      return { label: "Google Meet", Icon: Video };
    case "exa":
      return { label: "Exa", Icon: Globe };
    case "manual":
      return { label: "Manual", Icon: FileText };
    case "fallback":
    default:
      return { label: "Flight", Icon: Plane };
  }
}

export function EvidenceCard({ card }: { card: Evidence }) {
  const source = sourceMeta(card.source);
  return (
    <article className="rounded-lg border border-[rgba(55,50,47,0.12)] bg-white p-4 shadow-[0_1px_2px_rgba(55,50,47,0.05)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#827C77]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(55,50,47,0.12)] bg-[#F7F5F3] px-2.5 py-1 text-[#37322F]">
          <source.Icon className="h-3.5 w-3.5" aria-hidden />
          {source.label}
        </span>
        <span className="uppercase tracking-wide">{card.sourceType.replaceAll("_", " ")}</span>
        {card.person ? <span>{card.person}</span> : null}
        {card.timestamp ? <span>{formatDateTime(card.timestamp)}</span> : null}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#37322F]">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#605A57]">{card.text}</p>
    </article>
  );
}
