import ReactMarkdown from "react-markdown";
import { FileText, Globe, Instagram, Plane, Video } from "lucide-react";
import type { SearchResponse } from "../lib/types";

function sourceMeta(source: SearchResponse["evidenceCards"][number]["source"]) {
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

export function AnswerPanel({ result }: { result: SearchResponse }) {
  const groupedSources = result.evidenceCards.reduce<
    Array<{
      source: SearchResponse["evidenceCards"][number]["source"];
      count: number;
    }>
  >((groups, card) => {
    const existing = groups.find((group) => group.source === card.source);
    if (existing) {
      existing.count += 1;
      return groups;
    }
    groups.push({ source: card.source, count: 1 });
    return groups;
  }, []);
  const answer = normalizeAnswerMarkdown(result.answer);

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
          {answer}
        </ReactMarkdown>
      </div>
      {result.evidenceCards.length ? (
        <div className="mt-5 border-t border-[rgba(55,50,47,0.08)] pt-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#827C77]">Citations</div>
          <div className="flex flex-wrap gap-2">
            {groupedSources.map(({ source, count }) => {
              const sourceInfo = sourceMeta(source);
              const Icon = sourceInfo.Icon;
              return (
                <div
                  key={source}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(55,50,47,0.12)] bg-[#F7F5F3] px-3 py-1.5 text-sm font-medium text-[#37322F]"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{sourceInfo.label}</span>
                  <span className="text-xs text-[#827C77]">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeAnswerMarkdown(value: string) {
  const boldSpans = [...value.matchAll(/\*\*([\s\S]+?)\*\*/g)].map((match) => match[1].trim());
  if (!boldSpans.length) return value;

  const totalBoldCharacters = boldSpans.reduce((sum, span) => sum + span.length, 0);
  const tooMuchBold =
    boldSpans.length > 3 ||
    totalBoldCharacters / Math.max(value.length, 1) > 0.45 ||
    boldSpans.some((span) => span.length > 28 || span.split(/\s+/).length > 4 || /[.!?]\s*$/.test(span));

  if (tooMuchBold) {
    return value.replace(/\*\*([\s\S]+?)\*\*/g, "$1");
  }

  return value.replace(/\*\*([\s\S]+?)\*\*/g, (_, boldText: string) => {
    const text = boldText.trim();
    return isShortEmphasis(text) ? `**${text}**` : text;
  });
}

function isShortEmphasis(text: string) {
  return text.length <= 28 && text.split(/\s+/).length <= 4 && !/[.!?]\s*$/.test(text);
}
