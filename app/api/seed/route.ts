import { NextResponse } from "next/server";
import { seedGraph } from "../../../lib/graphSeed";
import { seedCounts, USER_ID } from "../../../lib/seed";
import { callMcpTool, getTableName } from "../../../lib/butterbase";
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

  const instagramTable = getTableName(USER_ID, "instagram");
  const googleMeetTable = getTableName(USER_ID, "google_meet");

  try {
    console.log(`Applying Butterbase schema for tables: ${instagramTable}, ${googleMeetTable}...`);
    // 1. Create tables
    await callMcpTool("manage_schema", {
      app_id: appId,
      action: "apply",
      schema: {
        tables: {
          [instagramTable]: {
            columns: {
              id: { type: "text", primaryKey: true },
              conversation_id: { type: "text" },
              sender: { type: "text" },
              recipient: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" }
            }
          },
          [googleMeetTable]: {
            columns: {
              id: { type: "text", primaryKey: true },
              meeting_title: { type: "text" },
              participants: { type: "text[]" },
              speaker: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" }
            }
          },
          flight_results: {
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
          },
          source_connections: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              source: { type: "text" },
              status: { type: "text" },
              last_synced_at: { type: "timestamptz" },
              metadata: { type: "text" }
            }
          },
          search_logs: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              query: { type: "text" },
              intent: { type: "text" },
              sources_searched: { type: "text[]" },
              results_count: { type: "integer" },
              created_at: { type: "timestamptz" }
            }
          },
          people: {
            columns: {
              id: { type: "text", primaryKey: true },
              name: { type: "text" },
              relationship: { type: "text" }
            }
          },
          tasks: {
            columns: {
              id: { type: "text", primaryKey: true },
              title: { type: "text" },
              status: { type: "text" }
            }
          },
          memory_items: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              source: { type: "text" },
              source_type: { type: "text" },
              title: { type: "text" },
              text: { type: "text" },
              author: { type: "text" },
              participants: { type: "text[]" },
              timestamp: { type: "timestamptz" },
              url: { type: "text" },
              metadata: { type: "text" }
            }
          }
        },
        _drop: ["flight_fallbacks", "instagram_messages", "meeting_notes"]
      }
    });

    console.log("Seeding Butterbase tables...");
    // 2. Insert data into tables
    if (instagramMessages.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: instagramTable,
        rows: instagramMessages
      });
    }

    if (meetingNotes.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: googleMeetTable,
        rows: meetingNotes
      });
    }

    if (flights.length > 0) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table: "flight_results",
        rows: flights
      });
    }

    console.log("Seeding additional source_connections, people, and tasks tables...");
    await callMcpTool("seed_database", {
      app_id: appId,
      table: "source_connections",
      rows: [
        { id: "sc_001", user_id: USER_ID, source: "instagram", status: "connected", last_synced_at: "2026-07-07T12:00:00Z", metadata: "{}" },
        { id: "sc_002", user_id: USER_ID, source: "google_meet", status: "connected", last_synced_at: "2026-07-07T12:00:00Z", metadata: "{}" }
      ]
    });

    await callMcpTool("seed_database", {
      app_id: appId,
      table: "people",
      rows: [
        { id: "p_001", name: "Andrey", relationship: "boss" },
        { id: "p_002", name: "toyesshh", relationship: "instagram_contact" },
        { id: "p_003", name: "Sofia", relationship: "teammate" }
      ]
    });

    await callMcpTool("seed_database", {
      app_id: appId,
      table: "tasks",
      rows: [
        { id: "t_001", title: "Help Sofia get set up", status: "pending" },
        { id: "t_002", title: "Fix the OAuth callback issue before standup", status: "pending" },
        { id: "t_003", title: "Prioritize AskUserQuestions", status: "pending" }
      ]
    });

    console.log("Setting up Butterbase RAG memories collection...");
    // 3. Delete old collection first to prevent duplicate entries
    await callMcpTool("manage_rag_content", {
      app_id: appId,
      action: "delete_collection",
      name: "memories"
    }).catch(() => null);

    // Create RAG collection
    await callMcpTool("manage_rag_content", {
      app_id: appId,
      action: "create_collection",
      name: "memories",
      description: "Voltaire memory items RAG collection"
    });

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
