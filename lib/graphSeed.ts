import { getNeo4jDriver, closeNeo4jDriver } from "./neo4j";
import { flightResults } from "./seed";

export async function seedGraph() {
  const driver = getNeo4jDriver();
  if (!driver) return { nodes: 0, relationships: 0, skipped: true };

  const database = process.env.NEO4J_DATABASE;
  const session = driver.session(database ? { database } : undefined);
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MERGE (m:Person {name: "Michael"})
        MERGE (t:Person {name: "toyesshh"})
        MERGE (a:Person {name: "Andrey"})
        MERGE (s:Person {name: "Sofia"})
        MERGE (ig:Source {name: "Instagram"})
        MERGE (gm:Source {name: "Google Meet"})
        MERGE (exa:Source {name: "Exa"})
        MERGE (topic:Topic {name: "Toronto to San Francisco cheap flight"})
        MERGE (a)-[:IS_BOSS_OF]->(m)
        MERGE (m)-[:SENT_MESSAGE_TO]->(t)
        MERGE (m)-[:INTERACTED_WITH]->(ig)
        MERGE (m)-[:INTERACTED_WITH]->(gm)
        MERGE (m)-[:INTERACTED_WITH]->(exa)
        MERGE (msg:Message {id: "ig_001", text: "toyesshh you have a big butt"})
        MERGE (m)-[:AUTHORED]->(msg)
        MERGE (msg)-[:MENTIONS]->(t)
        MERGE (msg)-[:FROM_SOURCE]->(ig)
        MERGE (meet:Meeting {id: "meet_001", title: "Morning Sync"})
        MERGE (a)-[:PARTICIPATED_IN]->(meet)
        MERGE (m)-[:PARTICIPATED_IN]->(meet)
        MERGE (s)-[:PARTICIPATED_IN]->(meet)
        MERGE (a)-[:SAID_IN_MEETING]->(meet)
        MERGE (task1:Task {title: "Help Sofia get set up"})
        MERGE (task2:Task {title: "Fix the OAuth callback issue before standup"})
        MERGE (task3:Task {title: "Prioritize AskUserQuestions"})
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task1)
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task2)
        MERGE (meet)-[:CONTAINS_ACTION_ITEM]->(task3)
        `,
      ),
    );
    for (const flight of flightResults()) {
      await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (topic:Topic {name: "Toronto to San Francisco cheap flight"})
          MERGE (web:WebResult {id: $webId, title: $title})
          MERGE (flight:Flight {id: $id, airline: $airline, price: $price})
          MERGE (flight)-[:FOUND_IN]->(web)
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
