import { formatDateTime } from "./date";
import type { EvidenceCard, FlightResult } from "./types";

export function flightAnswer(flights: FlightResult[]) {
  const absoluteCheapest = [...flights].sort((a, b) => a.price - b.price)[0];
  const bestReasonable = [...flights].sort((a, b) => a.layovers - b.layovers || a.price - b.price)[0];
  if (!absoluteCheapest || !bestReasonable) return "No flight result was found in the connected evidence.";
  return `Cheapest: $${absoluteCheapest.price} on ${absoluteCheapest.airline}. Best balanced option: $${bestReasonable.price} on ${bestReasonable.airline}, ${bestReasonable.departure_time} to ${bestReasonable.arrival_time}, ${bestReasonable.layovers} layovers.`;
}

export function instagramAnswer(card: EvidenceCard) {
  if (!card) return "No matching Instagram message was found in the connected evidence.";
  const recipient = String(card.metadata.recipient ?? "recipient");
  return `Found it on Instagram with ${recipient} on ${formatDateTime(card.timestamp)}. The message says you were discussing the same topic in a shorter, paraphrased form.`;
}

export function bossAnswer(card: EvidenceCard) {
  if (!card) return "No meeting instruction was found in the connected evidence.";
  const actionItems = extractActionItems(card.text);
  const speaker = card.person ?? String(card.metadata.speaker ?? "The speaker");
  return `${speaker} asked for a few things: ${actionItems.slice(0, 3).join(" ")}`.trim();
}

export function summaryAnswer(evidence: EvidenceCard[], flights: FlightResult[] = []) {
  const work = evidence.find((card) => card.source === "google_meet");
  if (work && flights.length) {
    const actionItems = extractActionItems(work.text);
    const bestFlight = [...flights].sort((a, b) => a.layovers - b.layovers || a.price - b.price)[0];
    const message = evidence.find((card) => card.source === "instagram");
    const workList = actionItems.map((item) => item.replace(/\.$/, "").toLowerCase()).join(", ");
    return `Priority: ${workList}. Flight option: $${bestFlight.price} ${bestFlight.airline}. ${message ? "Instagram context found." : "No personal action item found."}`;
  }
  if (!evidence.length && !flights.length) return "No result was found in the connected evidence. Connect or ingest a data source, then ask again.";
  return evidence
    .map((card) => `${card.title}: ${card.text}`)
    .slice(0, 3)
    .join("\n");
}

export function extractActionItems(text: string) {
  const items: string[] = [];
  const need = text.match(/need you to (.+?)(?:\.|$)/i)?.[1];
  if (need) {
    const [first, second] = need.split(/\s+and make sure\s+/i);
    if (first) items.push(sentence(first));
    const fixed = second?.match(/^the (.+?) is fixed before (.+)$/i);
    if (fixed) items.push(sentence(`fix the ${fixed[1]} before ${fixed[2]}`));
    else if (second) items.push(sentence(second));
  }
  const priorities = [...text.matchAll(/prioritize\s+(.+?)(?:\.|$)/gi)].map((match) => sentence(`prioritize ${match[1]}`));
  return [...items, ...priorities].slice(0, 5);
}

function sentence(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  return `${clean[0].toUpperCase()}${clean.slice(1)}.`;
}
