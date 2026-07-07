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

function personalEvidence(query: string): EvidenceCard[] {
  const q = compactText(query);
  const terms = new Set(q.split(" ").filter((term) => term.length > 2));
  return instagramMemoryItems()
    .map((item) => {
      const text = compactText(`${item.text} ${item.participants?.join(" ") ?? ""}`);
      const score = [...terms].reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.item.timestamp ?? "") - Date.parse(a.item.timestamp ?? ""))
    .map(({ item }) => toEvidenceCard(item));
}

function workEvidence(query: string): EvidenceCard[] {
  const q = compactText(query);
  const terms = new Set(q.split(" ").filter((term) => term.length > 2));
  return meetingMemoryItems()
    .map((item) => {
      const text = compactText(`${item.text} ${item.title} ${item.author} ${item.participants?.join(" ") ?? ""}`);
      const termScore = [...terms].reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      const actionScore = /need you|make sure|prioritize|blocked|action/i.test(item.text) ? 3 : 0;
      return { item, score: termScore + actionScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.item.timestamp ?? "") - Date.parse(a.item.timestamp ?? ""))
    .map(({ item }) => toEvidenceCard(item));
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
    const evidenceCards = dedupe(personalEvidence(query));
    return {
      answer: await evaluateAnswer({ query, intent, evidenceCards }),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  if (intent === "work_memory_search") {
    const evidenceCards = dedupe(workEvidence(query));
    return {
      answer: await evaluateAnswer({ query, intent, evidenceCards }),
      evidenceCards,
      graphTrace,
      loadingTrace: trace,
    };
  }

  const filters: { sources?: Source[] } = {};
  const structured = butterbaseSearch(query, filters).map(toEvidenceCard);
  const rag = (await butterbaseRagSearch(query, filters)).map(toEvidenceCard);
  const wantsFlights = /\bflight|ticket|fly|airport|travel|cheap\b/i.test(query);
  const flights = wantsFlights ? flightFallbackSearch(query) : [];
  const broadQuery = /\beverything\b|\bfound\b|\bnext\b/i.test(query);
  const evidenceCards = dedupe([
    ...structured,
    ...rag,
    ...workEvidence(query),
    ...personalEvidence(query),
    ...(broadQuery ? workEvidence(query) : []),
    ...(broadQuery ? personalEvidence(query) : []),
  ]);
  return {
    answer: await evaluateAnswer({ query, intent, evidenceCards, flights }),
    evidenceCards: [...evidenceCards, ...flightEvidence(flights)],
    flights,
    graphTrace,
    loadingTrace: trace,
  };
}
