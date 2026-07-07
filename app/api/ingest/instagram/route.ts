import { NextResponse } from "next/server";
import { instagramMemoryItems } from "../../../../lib/seed";

export async function POST() {
  return NextResponse.json({ inserted: instagramMemoryItems().length, source: "instagram" });
}
