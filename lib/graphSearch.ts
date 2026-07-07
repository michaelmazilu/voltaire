import { getNeo4jDriver } from "./neo4j";
import type { GraphTraceItem, QueryIntent } from "./types";

export async function graphSearch(query: string, intent: QueryIntent): Promise<GraphTraceItem[]> {
  const driver = getNeo4jDriver();
  if (!driver) return [];

  const database = process.env.NEO4J_DATABASE;
  const session = driver.session(database ? { database } : undefined);

  try {
    let cypher = "";
    let params: Record<string, any> = {};

    if (intent === "personal_memory_search") {
      cypher = `
        MATCH (p1:Person {name: "Michael"})-[r1:SENT_MESSAGE_TO]->(p2:Person)
        MATCH (p1)-[r2:AUTHORED]->(m:Message)-[r3:MENTIONS]->(p2)
        RETURN p1.name AS from, type(r1) AS type, p2.name AS to
        UNION
        MATCH (p1:Person {name: "Michael"})-[r2:AUTHORED]->(m:Message)
        RETURN p1.name AS from, type(r2) AS type, "Instagram Message" AS to
        UNION
        MATCH (m:Message)-[r3:MENTIONS]->(p2:Person)
        RETURN "Message" AS from, type(r3) AS type, p2.name AS to
      `;
    } else if (intent === "work_memory_search") {
      cypher = `
        MATCH (boss)-[r1:IS_BOSS_OF]->(me:Person {name: "Michael"})
        MATCH (boss)-[r2:SAID_IN_MEETING]->(meet:Meeting)
        MATCH (meet)-[r3:CONTAINS_ACTION_ITEM]->(task:Task)
        RETURN boss.name AS from, type(r1) AS type, me.name AS to
        UNION
        MATCH (boss)-[r2:SAID_IN_MEETING]->(meet:Meeting)
        RETURN boss.name AS from, type(r2) AS type, meet.title AS to
        UNION
        MATCH (meet:Meeting)-[r3:CONTAINS_ACTION_ITEM]->(task:Task)
        RETURN meet.title AS from, type(r3) AS type, task.title AS to
      `;
    } else if (intent === "flight_search") {
      cypher = `
        MATCH (f:Flight)-[r1:FOUND_IN]->(w:WebResult)-[r2:SEARCH_RESULT_FOR]->(t:Topic)
        RETURN "Flight" AS from, type(r1) AS type, "Web Result" AS to
        UNION
        MATCH (f:Flight)-[r1:FOUND_IN]->(w:WebResult)-[r2:SEARCH_RESULT_FOR]->(t:Topic)
        RETURN "Web Result" AS from, type(r2) AS type, t.name AS to
      `;
    } else {
      cypher = `
        MATCH (p:Person {name: "Michael"})-[r:INTERACTED_WITH]->(s:Source)
        RETURN p.name AS from, type(r) AS type, s.name AS to
      `;
    }

    const res = await session.run(cypher, params);
    return res.records.map((rec) => ({
      from: rec.get("from") as string,
      type: rec.get("type") as any,
      to: rec.get("to") as string,
    }));
  } catch (error) {
    console.error("Neo4j graphSearch failed:", error);
    return [];
  } finally {
    await session.close();
  }
}
