import ReactMarkdown from "react-markdown";
import type { SearchResponse } from "../lib/types";

export function AnswerPanel({ result }: { result: SearchResponse }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5 shadow-glow">
      <div className="mb-3 text-xs uppercase tracking-wide text-neutral-400">{result.intent}</div>
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
    </div>
  );
}
