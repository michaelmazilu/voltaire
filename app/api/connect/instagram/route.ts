import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    source: "instagram",
    status: "manual_export_required",
    message: "Instagram connection is staged. Use Instagram's official data export, then import message_*.json files below.",
    nextStep: "/setup",
  });
}
