import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ inserted: 0, source: "google_meet", status: "no_ingest_source_configured" });
}
