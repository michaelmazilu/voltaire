import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ inserted: 0, source: "instagram", status: "no_ingest_source_configured" });
}
