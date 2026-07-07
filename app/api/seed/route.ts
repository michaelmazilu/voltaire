import { NextResponse } from "next/server";
import { seedGraph } from "../../../lib/graphSeed";
import { seedCounts } from "../../../lib/seed";

export async function GET() {
  return POST();
}

export async function POST() {
  const graph = await seedGraph();
  return NextResponse.json({
    ...seedCounts(),
    graphNodes: graph.skipped ? seedCounts().graphNodes : graph.nodes,
    graphRelationships: graph.skipped ? seedCounts().graphRelationships : graph.relationships,
    butterbase: "adapter-ready",
    neo4j: graph.skipped ? "not-configured" : "seeded",
  });
}
