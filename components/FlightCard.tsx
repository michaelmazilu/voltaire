import { Plane } from "lucide-react";
import type { FlightResult } from "../lib/types";

export function FlightCard({ flight }: { flight: FlightResult }) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Plane className="h-5 w-5 text-neutral-700" aria-hidden />
          <div>
            <h3 className="text-sm font-bold text-ink">{flight.airline}</h3>
            <p className="text-xs text-neutral-400">{flight.origin} → {flight.destination}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-ink">${flight.price}</div>
          <div className="text-xs text-neutral-400">{flight.layovers === 0 ? "direct" : `${flight.layovers} layovers`}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-neutral-400">Date</div>
          <div className="text-neutral-700">{flight.date}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Depart</div>
          <div className="text-neutral-700">{flight.departure_time}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Arrive</div>
          <div className="text-neutral-700">{flight.arrival_time}</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-neutral-400">Source: connected flight data</div>
    </article>
  );
}
