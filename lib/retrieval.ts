import { butterbaseSearch } from "./butterbaseSearch";
import { butterbaseRagSearch } from "./butterbaseRag";
import { resolveRelativeDate } from "./date";
import { evaluateAnswer } from "./evaluator";
import { exaSearch } from "./exa";
import { graphSearch } from "./graphSearch";
import { compactText, toEvidenceCard } from "./normalize";
import { flightResults, meetingMemoryItems, instagramMemoryItems } from "./seed";
import type { EvidenceCard, FlightResult, QueryIntent, SearchResponse, Source } from "./types";

function loadingTrace(intent: QueryIntent) {
  if (intent === "conversation") {
    return [
      "Understanding message...",
      "No retrieval needed...",
      "Responding without evidence cards...",
    ];
  }
  if (intent === "flight_search") {
    return [
      "Understanding query...",
      "Routing to web/flight search...",
      "Checking connected flight tools...",
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
      "Checking graph relationships...",
      "Checking exact phrase matches...",
      "Building evidence card...",
    ];
  }
  if (intent === "work_memory_search") {
    return [
      "Understanding query...",
      "Routing to meeting memory...",
      "Checking graph relationships...",
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
  const q = compactText(query);
  const routeMatches = flightResults().filter((flight) => {
    const origin = compactText(flight.origin);
    const destination = compactText(flight.destination);
    return q.includes(origin) || q.includes(destination);
  });
  const candidates = routeMatches.length ? routeMatches : flightResults();
  const exactDate = candidates.filter((flight) => flight.date === wantedDate);
  return (exactDate.length ? exactDate : candidates).sort(
    (a, b) => a.layovers - b.layovers || a.price - b.price,
  );
}

async function personalEvidence(query: string): Promise<EvidenceCard[]> {
  const structured = await butterbaseSearch(query, { sources: ["instagram"] });
  const rag = await butterbaseRagSearch(query, { sources: ["instagram"] });
  return dedupe([...structured, ...rag].map((item) => toEvidenceCard(item)));
}

async function workEvidence(query: string): Promise<EvidenceCard[]> {
  const structured = await butterbaseSearch(query, { sources: ["google_meet"] });
  const rag = await butterbaseRagSearch(query, { sources: ["google_meet"] });
  return dedupe([...structured, ...rag].map((item) => toEvidenceCard(item)));
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

  if (intent === "conversation") {
    return {
      answer: "Hi. Ask me what to find, and I will choose the right connected data source before retrieving evidence.",
      evidenceCards: [],
      flights: [],
      graphTrace: [],
      loadingTrace: trace,
    };
  }

  if (intent === "flight_search") {
    const flights = flightFallbackSearch(query);
    const exa = await exaSearch(query);
    const evidenceCards = [...flightEvidence(flights), ...exa];
    return {
      answer: await evaluateAnswer({ query, intent, evidenceCards, flights }),
      evidenceCards,
      flights,
      graphTrace,
      loadingTrace: trace,
    };
  }

  if (intent === "personal_memory_search") {
    const evidenceCards = dedupe(await personalEvidence(query));
    return {
      answer: await evaluateAnswer({ query, intent, evidenceCards }),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  if (intent === "work_memory_search") {
    const evidenceCards = dedupe(await workEvidence(query));
    return {
      answer: await evaluateAnswer({ query, intent, evidenceCards }),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  const filters: { sources?: Source[] } = {};
  const structured = (await butterbaseSearch(query, filters)).map(toEvidenceCard);
  const rag = (await butterbaseRagSearch(query, filters)).map(toEvidenceCard);
  const wantsFlights = /\bflight|ticket|fly|airport|travel|cheap|next\b/i.test(query);
  const flights = wantsFlights ? flightFallbackSearch(query) : [];
  const broadQuery = /\beverything\b|\bfound\b|\bnext\b/i.test(query);
  const evidenceCards = dedupe([
    ...structured,
    ...rag,
    ...(await workEvidence(query)),
    ...(await personalEvidence(query)),
    ...(broadQuery ? (await workEvidence(query)) : []),
    ...(broadQuery ? (await personalEvidence(query)) : []),
  ]);
  return {
    answer: await evaluateAnswer({ query, intent, evidenceCards, flights }),
    evidenceCards: [...evidenceCards, ...flightEvidence(flights)],
    flights,
    graphTrace,
    loadingTrace: trace,
  };
}
