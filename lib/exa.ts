import type { EvidenceCard } from "./types";

type ExaResult = {
  title?: string;
  url?: string;
  highlights?: string[];
  text?: string;
};

export async function exaSearch(query: string): Promise<EvidenceCard[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults: 3,
      contents: { highlights: true },
    }),
  }).catch(() => null);
  clearTimeout(timeout);
  if (!response?.ok) return [];
  const data = (await response.json()) as { results?: ExaResult[] };
  return (data.results ?? []).map((result, index) => ({
    id: `exa_${index}`,
    source: "exa",
    sourceType: "web_result",
    title: result.title ?? "Exa result",
    text: result.highlights?.join("\n...\n") ?? result.text ?? result.url ?? "",
    url: result.url,
    metadata: { supplementary: true },
  }));
}
