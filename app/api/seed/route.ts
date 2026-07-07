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
  const seedRunId = "ing_demo_seed";
  const seededAt = "2026-07-07T12:00:00Z";
  const demoTables = [
    instagramTable,
    googleMeetTable,
    "flight_results",
    "ingestion_runs",
    "source_connections",
    "search_logs",
    "people",
    "tasks",
    "memory_items",
    "flight_fallbacks",
    "instagram_messages",
    "meeting_notes",
    "michael_instagram",
    "michael_google_meet"
  ];
  const seedRows = async (table: string, rows: Record<string, any>[], chunkSize = 5) => {
    for (let i = 0; i < rows.length; i += chunkSize) {
      await callMcpTool("seed_database", {
        app_id: appId,
        table,
        rows: rows.slice(i, i + chunkSize)
      });
    }
  };

  try {
    await callMcpTool("manage_schema", {
      app_id: appId,
      action: "apply",
      schema: {
        tables: {},
        _drop: demoTables
      }
    }).catch(() => null);

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
              user_id: { type: "text" },
              ingestion_id: { type: "text" },
              source_item_id: { type: "text" },
              conversation_id: { type: "text" },
              sender: { type: "text" },
              recipient: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" },
              metadata: { type: "text" },
              created_at: { type: "timestamptz" }
            }
          },
          [googleMeetTable]: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              ingestion_id: { type: "text" },
              source_item_id: { type: "text" },
              meeting_title: { type: "text" },
              participants: { type: "text[]" },
              speaker: { type: "text" },
              timestamp: { type: "timestamptz" },
              text: { type: "text" },
              meet_url: { type: "text" },
              calendar_event_id: { type: "text" },
              metadata: { type: "text" },
              created_at: { type: "timestamptz" }
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
          ingestion_runs: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              source: { type: "text" },
              status: { type: "text" },
              item_count: { type: "integer" },
              started_at: { type: "timestamptz" },
              completed_at: { type: "timestamptz" },
              metadata: { type: "text" }
            }
          },
          source_connections: {
            columns: {
              id: { type: "text", primaryKey: true },
              user_id: { type: "text" },
              ingestion_id: { type: "text" },
              source_item_id: { type: "text" },
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
              ingestion_id: { type: "text" },
              source_item_id: { type: "text" },
              source: { type: "text" },
              source_type: { type: "text" },
              title: { type: "text" },
              text: { type: "text" },
              author: { type: "text" },
              participants: { type: "text[]" },
              timestamp: { type: "timestamptz" },
              url: { type: "text" },
              metadata: { type: "text" },
              created_at: { type: "timestamptz" }
            }
          }
        },
        _drop: demoTables
      }
    });

    console.log("Seeding Butterbase tables...");
    await seedRows(
      "ingestion_runs",
      [
        {
          id: seedRunId,
          user_id: USER_ID,
          source: "demo_seed",
          status: "completed",
          item_count: instagramMessages.length + meetingNotes.length + flights.length,
          started_at: seededAt,
          completed_at: seededAt,
          metadata: JSON.stringify({ mode: "demo", tables: [instagramTable, googleMeetTable, "flight_results"] })
        }
      ],
      1
    );

    // 2. Insert data into tables
    if (instagramMessages.length > 0) {
      await seedRows(
        instagramTable,
        instagramMessages.map((message) => ({
          ...message,
          user_id: USER_ID,
          ingestion_id: seedRunId,
          source_item_id: message.id,
          metadata: JSON.stringify({ mode: "demo", platform: "instagram" }),
          created_at: seededAt
        }))
      );
    }

    if (meetingNotes.length > 0) {
      await seedRows(
        googleMeetTable,
        meetingNotes.map((meeting) => ({
          ...meeting,
          user_id: USER_ID,
          ingestion_id: seedRunId,
          source_item_id: meeting.id,
          calendar_event_id: meeting.id,
          metadata: JSON.stringify({ mode: "demo", platform: "google_meet" }),
          created_at: seededAt
        }))
      );
    }

    if (flights.length > 0) {
      await seedRows("flight_results", flights);
    }

    await seedRows("memory_items", [
        ...instagramMessages.map((message) => ({
          id: message.id,
          user_id: USER_ID,
          ingestion_id: seedRunId,
          source_item_id: message.id,
          source: "instagram",
          source_type: "message",
          title: `Instagram DM with ${message.recipient}`,
          text: message.text,
          author: message.sender,
          participants: [message.sender, message.recipient],
          timestamp: message.timestamp,
          metadata: JSON.stringify({ mode: "demo", platform: "instagram", conversation_id: message.conversation_id }),
          created_at: seededAt
        })),
        ...meetingNotes.map((meeting) => ({
          id: meeting.id,
          user_id: USER_ID,
          ingestion_id: seedRunId,
          source_item_id: meeting.id,
          source: "google_meet",
          source_type: "meeting_note",
          title: meeting.meeting_title,
          text: meeting.text,
          author: meeting.speaker,
          participants: meeting.participants,
          timestamp: meeting.timestamp,
          metadata: JSON.stringify({ mode: "demo", platform: "google_meet" }),
          created_at: seededAt
        })),
        ...flights.map((flight) => ({
          id: flight.id,
          user_id: USER_ID,
          ingestion_id: seedRunId,
          source_item_id: flight.id,
          source: "fallback",
          source_type: "flight_result",
          title: `${flight.airline} ${flight.origin} to ${flight.destination}`,
          text: `$${flight.price}, ${flight.layovers} layovers, ${flight.departure_time} to ${flight.arrival_time}`,
          timestamp: flight.date,
          url: flight.url,
          metadata: JSON.stringify({ mode: "demo", ...flight }),
          created_at: seededAt
        }))
      ]);

    console.log("Seeding additional source_connections, people, and tasks tables...");
    await seedRows("source_connections", [
        { id: "sc_demo_001", user_id: USER_ID, source: "instagram", status: "demo_connected", last_synced_at: "2026-07-07T12:00:00Z", metadata: "{\"mode\":\"demo\"}" },
        { id: "sc_demo_002", user_id: USER_ID, source: "google_meet", status: "demo_connected", last_synced_at: "2026-07-07T12:00:00Z", metadata: "{\"mode\":\"demo\"}" },
        { id: "sc_demo_003", user_id: USER_ID, source: "exa", status: "demo_connected", last_synced_at: "2026-07-07T12:00:00Z", metadata: "{\"mode\":\"supplementary\"}" }
      ]);

    await seedRows("people", [
        { id: "p_demo_001", name: "Alex Rivera", relationship: "demo_user" },
        { id: "p_demo_002", name: "Priya Shah", relationship: "boss" },
        { id: "p_demo_003", name: "toyesshh", relationship: "instagram_contact" },
        { id: "p_demo_004", name: "Nina Patel", relationship: "teammate" }
      ]);

    await seedRows("tasks", [
        { id: "t_demo_001", title: "Help Nina get set up", status: "pending" },
        { id: "t_demo_002", title: "Fix the OAuth callback issue before standup", status: "pending" },
        { id: "t_demo_003", title: "Prioritize AskUserQuestions", status: "pending" }
      ]);

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
