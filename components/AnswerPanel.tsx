import ReactMarkdown from "react-markdown";
import type { SearchResponse } from "../lib/types";
import { EvidenceCard } from "./EvidenceCard";
import { FlightCard } from "./FlightCard";
import { GraphTrace } from "./GraphTrace";
import { LoadingTrace } from "./LoadingTrace";
import { MeetingCard } from "./MeetingCard";
import { MessageCard } from "./MessageCard";

export function AnswerPanel({ result }: { result: SearchResponse }) {
  const messages = result.evidenceCards.filter((card) => card.sourceType === "message");
  const meetings = result.evidenceCards.filter((card) => card.sourceType === "meeting_note");
  const otherEvidence = result.evidenceCards.filter((card) => !["message", "meeting_note", "flight_result"].includes(card.sourceType));

  return (
    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <div className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-neutral-500">
          Evidence disclosure: demo mode uses fictional seeded data under a demo user. Production mode uses imported or connected source data only.
        </div>
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
        {result.flights?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {result.flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)}
          </div>
        ) : null}
        {messages.map((card) => <MessageCard key={card.id} card={card} />)}
        {meetings.map((card) => <MeetingCard key={card.id} card={card} />)}
        {otherEvidence.map((card) => <EvidenceCard key={card.id} card={card} />)}
      </div>
      <aside className="space-y-5">
        <LoadingTrace trace={result.loadingTrace} />
        <GraphTrace trace={result.graphTrace} />
      </aside>
    </section>
  );
}
