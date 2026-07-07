import { NextResponse } from "next/server";
import { hybridSearch } from "../../../lib/retrieval";
import { routeQuery } from "../../../lib/router";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string; userId?: string };
  const query = body.query?.trim();
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const route = routeQuery(query);
  const result = await hybridSearch(query, route.intent);
  return NextResponse.json({
    query,
    intent: route.intent,
    sourcesSearched: route.sources,
    ...result,
  });
}
