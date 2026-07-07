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
  const flight = await check("Find us a cheap flight from Toronto to San Francisco next Friday.");
  assert(flight.route.intent === "flight_search", "flight query did not route to flight_search");
  assert(flight.result.flights?.some((item) => item.airline === "United" && item.price === 211 && item.layovers === 2), "missing $211 United flight");
  assert(flight.result.flights?.some((item) => item.airline === "WestJet" && item.price === 238 && item.layovers === 0), "missing $238 direct WestJet flight");
  assert(flight.result.answer.includes("absolute cheapest is $211 on United"), "flight answer missing absolute cheapest");
  assert(flight.result.answer.includes("best cheap option is the $238 WestJet"), "flight answer missing best cheap option");
  assert(!flight.result.answer.toLowerCase().includes("booked your flight"), "flight answer claims booking");

  const personal = await check("Find that one time I told toyesshh he had a big butt.");
  assert(personal.route.intent === "personal_memory_search", "personal query did not route to personal_memory_search");
  assert(personal.result.evidenceCards[0].text === "toyesshh you have a big butt", "personal quote changed");
  assert(personal.result.evidenceCards[0].metadata.sender === "Michael", "personal sender missing");
  assert(personal.result.evidenceCards[0].metadata.recipient === "toyesshh", "personal recipient missing");
  assert(personal.result.graphTrace.some((edge) => edge.from === "Michael" && edge.type === "SENT_MESSAGE_TO" && edge.to === "toyesshh"), "personal graph trace missing");

  const work = await check("Remind me what my boss told me.");
  assert(work.route.intent === "work_memory_search", "work query did not route to work_memory_search");
  assert(work.result.graphTrace.some((edge) => edge.from === "Andrey" && edge.type === "IS_BOSS_OF" && edge.to === "Michael"), "boss graph trace missing");
  for (const item of ["Help Sofia get set up", "Fix the OAuth callback issue before standup", "Prioritize the AskUserQuestions implementation for the action design chat agent"]) {
    assert(work.result.answer.includes(item), `work answer missing ${item}`);
  }

  const next = await check("What should I do next based on everything you found?");
  assert(next.result.answer.includes("Do the work deadline first"), "next-step answer did not prioritize work");
  assert(next.result.answer.includes("WestJet"), "next-step answer missing flight context");
  assert(next.result.answer.includes("personal Instagram message"), "next-step answer missing personal context");

  console.log("Acceptance checks passed");
}

main();
