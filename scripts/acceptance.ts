import { hybridSearch } from "../lib/retrieval";
import { routeQuery } from "../lib/router";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function check(query: string) {
  const route = routeQuery(query);
  const result = await hybridSearch(query, route.intent);
  return { route, result };
}

async function main() {
  const casual = await check("hi");
  assert(casual.route.intent === "conversation", "greeting did not route to conversation");
  assert(casual.result.evidenceCards.length === 0, "casual greeting returned evidence");

  const personal = await check("Search my personal messages");
  assert(personal.result.evidenceCards.length === 0, "personal search returned seed evidence");

  const work = await check("Summarize my meeting notes");
  assert(work.result.evidenceCards.length === 0, "meeting search returned seed evidence");

  const flight = await check("Find my cheapest flight options");
  assert((flight.result.flights ?? []).length === 0, "flight search returned seed flights");

  console.log("No-seed checks passed");
}

main();
