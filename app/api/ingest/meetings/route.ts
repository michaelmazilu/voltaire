import { NextResponse } from "next/server";
import { meetingMemoryItems } from "../../../../lib/seed";

export async function POST() {
  return NextResponse.json({ inserted: meetingMemoryItems().length, source: "google_meet" });
}
