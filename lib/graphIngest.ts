import { getNeo4jDriver } from "./neo4j";

export async function upsertMessageGraph(rows: Record<string, unknown>[]) {
  const driver = getNeo4jDriver();
  if (!driver || !rows.length) return;
  const session = driver.session();
  try {
    await session.executeWrite((tx: any) =>
      tx.run(
        `
        UNWIND $rows AS row
        MERGE (m:Message {id: row.id})
        SET m.text = row.text, m.timestamp = row.timestamp, m.ingestion_id = row.ingestion_id, m.source_item_id = row.source_item_id
        MERGE (source:Source {name: "Instagram"})
        MERGE (m)-[:FROM_SOURCE]->(source)
        WITH row, m, source
        FOREACH (_ IN CASE WHEN row.sender IS NULL THEN [] ELSE [1] END |
          MERGE (sender:Person {name: row.sender})
          MERGE (sender)-[:AUTHORED]->(m)
          MERGE (sender)-[:INTERACTED_WITH]->(source)
        )
        FOREACH (_ IN CASE WHEN row.recipient IS NULL THEN [] ELSE [1] END |
          MERGE (recipient:Person {name: row.recipient})
          MERGE (m)-[:MENTIONS]->(recipient)
        )
        WITH row
        MATCH (sender:Person {name: row.sender}), (recipient:Person {name: row.recipient})
        MERGE (sender)-[:SENT_MESSAGE_TO]->(recipient)
        `,
        { rows },
      ),
    );
  } catch {
  } finally {
    await session.close();
    await driver.close();
  }
}

export async function upsertMeetingGraph(rows: Record<string, unknown>[]) {
  const driver = getNeo4jDriver();
  if (!driver || !rows.length) return;
  const session = driver.session();
  try {
    await session.executeWrite((tx: any) =>
      tx.run(
        `
        UNWIND $rows AS row
        MERGE (meeting:Meeting {id: row.id})
        SET meeting.title = row.title, meeting.timestamp = row.timestamp, meeting.ingestion_id = row.ingestion_id, meeting.source_item_id = row.source_item_id
        MERGE (source:Source {name: "Google Meet"})
        MERGE (meeting)-[:FROM_SOURCE]->(source)
        WITH row, meeting, source
        FOREACH (_ IN CASE WHEN row.author IS NULL THEN [] ELSE [1] END |
          MERGE (speaker:Person {name: row.author})
          MERGE (speaker)-[:SAID_IN_MEETING]->(meeting)
        )
        WITH row, meeting, source
        UNWIND coalesce(row.participants, []) AS participant
        MERGE (person:Person {name: participant})
        MERGE (person)-[:PARTICIPATED_IN]->(meeting)
        MERGE (person)-[:INTERACTED_WITH]->(source)
        `,
        { rows },
      ),
    );
  } catch {
  } finally {
    await session.close();
    await driver.close();
  }
}
