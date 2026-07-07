import ReactMarkdown from "react-markdown";
import type { SearchResponse } from "../lib/types";
import { EvidenceCard } from "./EvidenceCard";

export function AnswerPanel({ result }: { result: SearchResponse }) {
  return (
    <div className="rounded-lg border border-[rgba(55,50,47,0.12)] bg-white p-5 shadow-[0_1px_2px_rgba(55,50,47,0.05)]">
      <div className="mb-3 text-xs uppercase tracking-wide text-[#827C77]">{result.intent}</div>
      <div className="text-base leading-7 text-ink">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-[#37322F]">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
            li: ({ children }) => <li className="text-base leading-6">{children}</li>,
            hr: () => <hr className="my-4 border-line" />,
            h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-semibold text-[#37322F]">{children}</h1>,
            h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-semibold text-[#37322F]">{children}</h2>,
            h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-semibold text-[#37322F]">{children}</h3>,
            code: ({ children }) => <code className="rounded bg-[#f5f4f2] px-1.5 py-0.5 font-mono text-sm">{children}</code>,
          }}
        >
          {result.answer}
        </ReactMarkdown>
      </div>
      {result.evidenceCards.length ? (
        <div className="mt-5 border-t border-[rgba(55,50,47,0.08)] pt-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#827C77]">Citations</div>
          <div className="grid gap-3">
            {result.evidenceCards.slice(0, 4).map((card) => (
              <EvidenceCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
