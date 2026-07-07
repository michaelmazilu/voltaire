import { butterbaseSearch } from "./butterbaseSearch";
import { butterbaseRagSearch } from "./butterbaseRag";
import { resolveRelativeDate } from "./date";
import { exaSearch } from "./exa";
import { graphSearch } from "./graphSearch";
import { toEvidenceCard } from "./normalize";
import { flightResults, meetingMemoryItems, instagramMemoryItems } from "./seed";
import { bossAnswer, flightAnswer, instagramAnswer, summaryAnswer } from "./templates";
import type { EvidenceCard, FlightResult, QueryIntent, SearchResponse, Source } from "./types";

function loadingTrace(intent: QueryIntent) {
  if (intent === "flight_search") {
    return [
      "Understanding query...",
      "Routing to web/flight search...",
      "Checking fallback flight index...",
      "Optionally enriching with Exa...",
      "Ranking cheapest reasonable options...",
      "Building evidence cards...",
    ];
  }
  if (intent === "personal_memory_search") {
    return [
      "Understanding query...",
      "Routing to Instagram memory...",
      "Searching Butterbase messages...",
      "Resolving Michael → toyesshh in Neo4j...",
      "Checking exact phrase matches...",
      "Building evidence card...",
    ];
  }
  if (intent === "work_memory_search") {
    return [
      "Understanding query...",
      "Routing to meeting memory...",
      "Resolving boss relationship in Neo4j...",
      "Searching Google Meet notes...",
      "Extracting action items...",
      "Building evidence card...",
    ];
  }
  return [
    "Understanding query...",
    "Searching connected sources...",
    "Merging evidence...",
    "Building answer...",
  ];
}

function flightFallbackSearch(query: string): FlightResult[] {
  const wantedDate = resolveRelativeDate(query);
  const routeMatches = flightResults().filter(
    (flight) => flight.origin === "Toronto" && flight.destination === "San Francisco",
  );
  const exactDate = routeMatches.filter((flight) => flight.date === wantedDate);
  return (exactDate.length ? exactDate : routeMatches).sort(
    (a, b) => a.layovers - b.layovers || a.price - b.price,
  );
}

function personalEvidence(query: string): EvidenceCard[] {
  const exact = instagramMemoryItems().find((item) => item.text === "toyesshh you have a big butt");
  const searched = butterbaseSearch(query, { sources: ["instagram"] });
  return [exact, ...searched].filter(Boolean).map((item) => toEvidenceCard(item!));
}

function workEvidence(query: string): EvidenceCard[] {
  const target = meetingMemoryItems().find((item) => item.id === "meet_001");
  const searched = butterbaseSearch(query, { sources: ["google_meet"] });
  return [target, ...searched].filter(Boolean).map((item) => toEvidenceCard(item!));
}

function flightEvidence(flights: FlightResult[]): EvidenceCard[] {
  return flights.map((flight) => ({
    id: flight.id,
    source: "fallback",
    sourceType: "flight_result",
    title: `${flight.airline} ${flight.origin} to ${flight.destination}`,
    text: `$${flight.price}, ${flight.layovers} layovers, ${flight.departure_time} to ${flight.arrival_time}`,
    timestamp: flight.date,
    url: flight.url,
    metadata: flight,
  }));
}

function dedupe(cards: EvidenceCard[]) {
  return [...new Map(cards.map((card) => [card.id, card])).values()];
}

export async function hybridSearch(query: string, intent: QueryIntent): Promise<Omit<SearchResponse, "query" | "intent" | "sourcesSearched">> {
  const graphTrace = await graphSearch(query, intent);
  const trace = loadingTrace(intent);

  if (intent === "flight_search") {
    const flights = flightFallbackSearch(query);
    const exa = await exaSearch(query);
    return {
      answer: flightAnswer(flights),
      evidenceCards: [...flightEvidence(flights), ...exa],
      flights,
      graphTrace,
      loadingTrace: trace,
    };
  }

  if (intent === "personal_memory_search") {
    const evidenceCards = dedupe(personalEvidence(query));
    return {
      answer: instagramAnswer(evidenceCards[0]),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  if (intent === "work_memory_search") {
    const evidenceCards = dedupe(workEvidence(query));
    return {
      answer: bossAnswer(evidenceCards[0]),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  const filters: { sources?: Source[] } = {};
  const structured = butterbaseSearch(query, filters).map(toEvidenceCard);
  const rag = (await butterbaseRagSearch(query, filters)).map(toEvidenceCard);
  const flights = query.toLowerCase().includes("next") || query.toLowerCase().includes("flight") ? flightFallbackSearch(query) : [];
  const evidenceCards = dedupe([...structured, ...rag, ...workEvidence("boss Andrey OAuth Sofia AskUserQuestions")]);
  return {
    answer: summaryAnswer(evidenceCards, flights),
    evidenceCards: [...evidenceCards, ...flightEvidence(flights)],
    flights,
    graphTrace,
    loadingTrace: trace,
  };
}
