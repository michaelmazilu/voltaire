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
          <p className="whitespace-pre-line text-base leading-7 text-ink">{result.answer}</p>
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
