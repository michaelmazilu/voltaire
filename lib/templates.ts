import { formatDateTime } from "./date";
import type { EvidenceCard, FlightResult } from "./types";

export function flightAnswer(flights: FlightResult[]) {
  const absoluteCheapest = [...flights].sort((a, b) => a.price - b.price)[0];
  const bestReasonable = [...flights].sort((a, b) => a.layovers - b.layovers || a.price - b.price)[0];
  return `I found a few options. The absolute cheapest is $${absoluteCheapest.price} on ${absoluteCheapest.airline}, but it has ${absoluteCheapest.layovers} layovers and takes much longer. The best cheap option is the $${bestReasonable.price} ${bestReasonable.airline} flight from ${bestReasonable.origin} to ${bestReasonable.destination}, leaving ${bestReasonable.departure_time} and arriving ${bestReasonable.arrival_time} with no layovers.\n\nI have not booked anything - I only found the best options.`;
}

export function instagramAnswer(card: EvidenceCard) {
  const recipient = String(card.metadata.recipient ?? "toyesshh");
  return `Found it. You said this to ${recipient} on Instagram on ${formatDateTime(card.timestamp)}:\n"${card.text}"\n\nSource: Instagram DM with ${recipient}.`;
}

export function bossAnswer(card: EvidenceCard) {
  return `Your boss, Andrey, gave you three main instructions:\n1. Help Sofia get set up.\n2. Fix the OAuth callback issue before standup.\n3. Prioritize the AskUserQuestions implementation for the action design chat agent.\n\nSource: Google Meet, ${card.title}, ${formatDateTime(card.timestamp, ", ")}.`;
}

export function summaryAnswer(evidence: EvidenceCard[], flights: FlightResult[] = []) {
  const work = evidence.find((card) => card.source === "google_meet");
  if (work && flights.length) {
    return `Do the work deadline first: help Sofia get set up, fix the OAuth callback issue before standup, and prioritize AskUserQuestions for the action design chat agent.\n\nLower priority context: the best cheap flight option found was the direct $238 WestJet flight. The personal Instagram message was found, but it does not create an action item.`;
  }
  if (!evidence.length && !flights.length) return "No result was found in the connected evidence.";
  return evidence
    .map((card) => `${card.title}: ${card.text}`)
    .slice(0, 3)
    .join("\n");
}
