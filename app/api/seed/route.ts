import { NextResponse } from "next/server";
import { seedGraph } from "../../../lib/graphSeed";
import { seedCounts } from "../../../lib/seed";
import { callMcpTool } from "../../../lib/butterbase";
import flights from "../../../data/flight_fallbacks.json";
import instagramMessages from "../../../data/instagram_messages.json";
import meetingNotes from "../../../data/meeting_notes.json";

export async function GET() {
  return POST();
}

export async function POST() {
  const appId = process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "Butterbase App ID is not configured" }, { status: 500 });
  }

  try {
    console.log("Applying Butterbase schema...");
    // 1. Create tables
    await callMcpTool("manage_schema", {
      app_id: appId,
      action: "apply",
      schema: {
        tables: {
          instagram_messages: {
            columns: {
              id: { type: "text", primaryKey: true },
              conversation_id: { type: "text" },
              sender: { type: "text" },
              recipient: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" }
            }
          },
          meeting_notes: {
            columns: {
              id: { type: "text", primaryKey: true },
              meeting_title: { type: "text" },
              participants: { type: "text[]" },
              speaker: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" }
            }
          },
          flight_fallbacks: {
            columns: {
              id: { type: "text", primaryKey: true },
              airline: { type: "text" },
              origin: { type: "text" },
              destination: { type: "text" },
              date: { type: "text" },
              price: { type: "integer" },
              departure_time: { type: "text" },
              arrival_time: { type: "text" },
              layovers: { type: "integer" },
              url: { type: "text" }
            }
          }
        }
      }
    });

    console.log("Seeding Butterbase tables...");
    // 2. Insert data into tables
    if (instagramMessages.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: "instagram_messages",
        rows: instagramMessages
      });
    }

    if (meetingNotes.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: "meeting_notes",
        rows: meetingNotes
      });
    }

    if (flights.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: "flight_fallbacks",
        rows: flights
      });
    }

    console.log("Setting up Butterbase RAG memories collection...");
    // 3. Create RAG collection
    await callMcpTool("manage_rag_content", {
      app_id: appId,
      action: "create_collection",
      name: "memories",
      description: "Voltaire memory items RAG collection"
    }).catch(() => null);

    console.log("Ingesting RAG documents...");
    // 4. Ingest documents into memories RAG collection
    for (const msg of instagramMessages) {
      await callMcpTool("manage_rag_content", {
        app_id: appId,
        collection: "memories",
        action: "ingest_document",
        text: `From: ${msg.sender}, To: ${msg.recipient}. Message: ${msg.text}`,
        metadata: { source: "instagram", id: msg.id }
      }).catch((e) => console.error("RAG ingest failed for msg:", msg.id, e.message));
    }

    for (const note of meetingNotes) {
      await callMcpTool("manage_rag_content", {
        app_id: appId,
        collection: "memories",
        action: "ingest_document",
        text: `In meeting "${note.meeting_title}", speaker ${note.speaker} said: ${note.text}`,
        metadata: { source: "google_meet", id: note.id }
      }).catch((e) => console.error("RAG ingest failed for note:", note.id, e.message));
    }

  } catch (error: any) {
    console.error("Butterbase seeding failed:", error);
    return NextResponse.json({ error: "Butterbase seeding failed: " + error.message }, { status: 500 });
  }

  console.log("Seeding Neo4j graph...");
  const graph = await seedGraph();

  return NextResponse.json({
    ...seedCounts(),
    graphNodes: graph.skipped ? seedCounts().graphNodes : graph.nodes,
    graphRelationships: graph.skipped ? seedCounts().graphRelationships : graph.relationships,
    butterbase: "seeded",
    neo4j: graph.skipped ? "not-configured" : "seeded",
  });
}
