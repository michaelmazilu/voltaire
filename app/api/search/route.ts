import { NextResponse } from "next/server";
import { insertButterbaseRows } from "../../../lib/butterbase";
import { planQuery } from "../../../lib/planner";
import { hybridSearch } from "../../../lib/retrieval";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string; userId?: string };
  const query = body.query?.trim();
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const route = await planQuery(query);
  const result = await hybridSearch(query, route.intent);
  await insertButterbaseRows("search_logs", [
    {
      id: crypto.randomUUID(),
      user_id: body.userId,
      query,
      intent: route.intent,
      sources_searched: route.sources,
      results_count: result.evidenceCards.length + (result.flights?.length ?? 0),
    },
  ]).catch(() => null);
  return NextResponse.json({
    query,
    intent: route.intent,
    sourcesSearched: route.sources,
    ...result,
  });
}
