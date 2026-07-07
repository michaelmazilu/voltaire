import { callMcpTool } from "./butterbase";
import type { MemoryItem, Source } from "./types";

export async function butterbaseRagSearch(
  query: string,
  filters: { sources?: Source[] } = {},
): Promise<MemoryItem[]> {
  const appId = process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID;
  if (!appId) return [];

  try {
    const res = await callMcpTool("rag_query", {
      app_id: appId,
      collection: "memories",
      query: query,
      top_k: 20
    });

    const chunks = Array.isArray(res?.chunks) ? res.chunks : [];
    const mapped = chunks.map((chunk: any, index: number) => ({
      id: `rag_${index}`,
      userId: "michael",
      source: (chunk.metadata?.source || "fallback") as Source,
      sourceType: "meeting_note",
      title: "RAG Context Match",
      text: chunk.content,
      metadata: chunk.metadata || {},
    }));

    return mapped.filter((item) => !filters.sources || filters.sources.includes(item.source));
  } catch (error) {
    console.error("Butterbase RAG search failed:", error);
    return [];
  }
}
