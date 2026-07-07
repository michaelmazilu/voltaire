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
  const ans = flight.result.answer.toLowerCase();
  assert(ans.includes("211") && ans.includes("united"), "flight answer missing absolute cheapest");
  assert(ans.includes("238") && ans.includes("westjet"), "flight answer missing best cheap option");
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
  const workAns = work.result.answer;
  for (const item of ["Sofia", "OAuth", "AskUserQuestions"]) {
    assert(workAns.includes(item), `work answer missing ${item}`);
  }

  const next = await check("What should I do next based on everything you found?");
  const nextAns = next.result.answer.toLowerCase();
  assert(nextAns.includes("work") || nextAns.includes("deadline") || nextAns.includes("priorit") || nextAns.includes("first"), "next-step answer did not prioritize work");
  assert(nextAns.includes("westjet") || nextAns.includes("flight"), "next-step answer missing flight context");
  assert(nextAns.includes("instagram") || nextAns.includes("message"), "next-step answer missing personal context");

  console.log("Acceptance checks passed");
}

main();
