import { formatDateTime } from "./date";
import type { EvidenceCard, FlightResult } from "./types";

export function flightAnswer(flights: FlightResult[]) {
  const absoluteCheapest = [...flights].sort((a, b) => a.price - b.price)[0];
  const bestReasonable = [...flights].sort((a, b) => a.layovers - b.layovers || a.price - b.price)[0];
  if (!absoluteCheapest || !bestReasonable) return "No flight result was found in the connected evidence.";
  return `I found a few options. The absolute cheapest is $${absoluteCheapest.price} on ${absoluteCheapest.airline}, but it has ${absoluteCheapest.layovers} layovers and takes much longer. The best cheap option is the $${bestReasonable.price} ${bestReasonable.airline} flight from ${bestReasonable.origin} to ${bestReasonable.destination}, leaving ${bestReasonable.departure_time} and arriving ${bestReasonable.arrival_time} with no layovers.\n\nI have not booked anything - I only found the best options.`;
}

export function instagramAnswer(card: EvidenceCard) {
  if (!card) return "No matching Instagram message was found in the connected evidence.";
  const recipient = String(card.metadata.recipient ?? "recipient");
  return `Found it. You said this to ${recipient} on Instagram on ${formatDateTime(card.timestamp)}:\n"${card.text}"\n\nSource: Instagram DM with ${recipient}.`;
}

export function bossAnswer(card: EvidenceCard) {
  if (!card) return "No meeting instruction was found in the connected evidence.";
  const actionItems = extractActionItems(card.text);
  const speaker = card.person ?? String(card.metadata.speaker ?? "The speaker");
  return `Your boss, ${speaker}, gave you three main instructions:\n${actionItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\nSource: Google Meet, ${card.title}, ${formatDateTime(card.timestamp, ", ")}.`;
}

export function summaryAnswer(evidence: EvidenceCard[], flights: FlightResult[] = []) {
  const work = evidence.find((card) => card.source === "google_meet");
  if (work && flights.length) {
    const actionItems = extractActionItems(work.text);
    const bestFlight = [...flights].sort((a, b) => a.layovers - b.layovers || a.price - b.price)[0];
    const message = evidence.find((card) => card.source === "instagram");
    const workList = actionItems.map((item) => item.replace(/\.$/, "").toLowerCase()).join(", ");
    return `Do the work deadline first: ${workList}.\n\nLower priority context: the best cheap flight option found was the direct $${bestFlight.price} ${bestFlight.airline} flight. ${message ? "The personal Instagram message was found, but it does not create an action item." : "No personal action item was found."}`;
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
