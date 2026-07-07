import { getNeo4jDriver, closeNeo4jDriver } from "./neo4j";
import { DEMO_USER_NAME, flightResults } from "./seed";

export async function seedGraph() {
  const driver = getNeo4jDriver();
  if (!driver) return { nodes: 0, relationships: 0, skipped: true };

  const database = process.env.NEO4J_DATABASE;
  const session = driver.session(database ? { database } : undefined);
  try {
    for (const constraint of [
      "CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE",
      "CREATE CONSTRAINT message_id IF NOT EXISTS FOR (m:Message) REQUIRE m.id IS UNIQUE",
      "CREATE CONSTRAINT meeting_id IF NOT EXISTS FOR (m:Meeting) REQUIRE m.id IS UNIQUE",
      "CREATE CONSTRAINT task_title IF NOT EXISTS FOR (t:Task) REQUIRE t.title IS UNIQUE",
      "CREATE CONSTRAINT source_name IF NOT EXISTS FOR (s:Source) REQUIRE s.name IS UNIQUE",
      "CREATE CONSTRAINT topic_name IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE",
      "CREATE CONSTRAINT flight_id IF NOT EXISTS FOR (f:Flight) REQUIRE f.id IS UNIQUE",
      "CREATE CONSTRAINT web_result_id IF NOT EXISTS FOR (w:WebResult) REQUIRE w.id IS UNIQUE",
      "CREATE CONSTRAINT ingestion_run_id IF NOT EXISTS FOR (r:IngestionRun) REQUIRE r.id IS UNIQUE",
    ]) {
      await session.executeWrite((tx: any) => tx.run(constraint));
    }
    await session.executeWrite((tx: any) =>
      tx.run(
        `
        MERGE (run:IngestionRun {id: "ing_demo_seed"})
        SET run.source = "demo_seed", run.status = "completed"
        MERGE (m:Person {name: $userName})
        MERGE (t:Person {name: "toyesshh"})
        MERGE (a:Person {name: "Priya Shah"})
        MERGE (s:Person {name: "Nina Patel"})
        MERGE (ig:Source {name: "Instagram"})
        MERGE (gm:Source {name: "Google Meet"})
        MERGE (exa:Source {name: "Exa"})
        MERGE (topic:Topic {name: "Toronto to San Francisco cheap flight"})
        MERGE (a)-[:IS_BOSS_OF]->(m)
        MERGE (m)-[:SENT_MESSAGE_TO]->(t)
        MERGE (m)-[:INTERACTED_WITH]->(ig)
        MERGE (m)-[:INTERACTED_WITH]->(gm)
        MERGE (m)-[:INTERACTED_WITH]->(exa)
        MERGE (msg:Message {id: "ig_001"})
        SET msg.text = "hey toyesshh what time are you free this week?", msg.ingestion_id = "ing_demo_seed"
        MERGE (m)-[:AUTHORED]->(msg)
        MERGE (msg)-[:MENTIONS]->(t)
        MERGE (msg)-[:FROM_SOURCE]->(ig)
        MERGE (msg)-[:FOUND_IN]->(run)
        MERGE (meet:Meeting {id: "meet_001"})
        SET meet.title = "Morning Launch Review", meet.ingestion_id = "ing_demo_seed"
        MERGE (a)-[:PARTICIPATED_IN]->(meet)
        MERGE (m)-[:PARTICIPATED_IN]->(meet)
        MERGE (s)-[:PARTICIPATED_IN]->(meet)
        MERGE (a)-[:SAID_IN_MEETING]->(meet)
        MERGE (task1:Task {title: "Help Nina get set up"})
        MERGE (task2:Task {title: "Fix the OAuth callback issue before standup"})
        MERGE (task3:Task {title: "Prioritize AskUserQuestions"})
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task1)
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task2)
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task3)
        MERGE (meet)-[:FOUND_IN]->(run)
        `,
        { userName: DEMO_USER_NAME },
      ),
    );
    for (const flight of flightResults()) {
      await session.executeWrite((tx: any) =>
        tx.run(
          `
          MATCH (topic:Topic {name: "Toronto to San Francisco cheap flight"})
          MATCH (run:IngestionRun {id: "ing_demo_seed"})
          MERGE (web:WebResult {id: $webId, title: $title})
          MERGE (flight:Flight {id: $id})
          SET flight.airline = $airline, flight.price = $price, flight.ingestion_id = "ing_demo_seed"
          MERGE (flight)-[:FOUND_IN]->(web)
          MERGE (flight)-[:FOUND_IN]->(run)
          MERGE (web)-[:SEARCH_RESULT_FOR]->(topic)
          `,
          {
            id: flight.id,
            webId: `${flight.id}_web`,
            title: `${flight.airline} Toronto to San Francisco`,
            airline: flight.airline,
            price: flight.price,
          },
        ),
      );
    }
    return { nodes: 15, relationships: 18, skipped: false };
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}
