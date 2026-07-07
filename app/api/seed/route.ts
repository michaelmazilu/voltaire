import { NextResponse } from "next/server";
import { seedCounts } from "../../../lib/seed";

export async function GET() {
  return POST();
}

export async function POST() {
  return NextResponse.json({
    ...seedCounts(),
    status: "no_seed_data_bundled",
  });
}
