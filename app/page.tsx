"use client";

import { useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import { SearchBar } from "../components/SearchBar";
import { SourceCard } from "../components/SourceCard";
import type { SearchResponse } from "../lib/types";

const examples = [
  "Find my cheapest flight options",
  "Search my personal messages",
  "Summarize what my manager asked me to do",
  "What should I do next based on my sources?",
];

const sources = [
  ["Instagram", "not connected"],
  ["Google Meet", "not connected"],
  ["Exa web", "optional"],
  ["Butterbase", "local adapter"],
  ["Neo4j graph", "not seeded"],
];

export default function Home() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(query: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 border-b border-line py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded border border-line bg-white px-3 py-1 text-xs uppercase tracking-wide text-neutral-500">Universal memory search</div>
            <h1 className="text-5xl font-bold tracking-normal text-ink sm:text-7xl">Voltaire</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-500">AI agents that find anything you have interacted with.</p>
            <div className="mt-5 max-w-2xl rounded-lg border border-line bg-white p-4 text-sm leading-6 text-neutral-500">
              No seed data is bundled. Voltaire only returns evidence from connected tools or real data sources you add.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {sources.map(([name, status]) => <SourceCard key={name} name={name} status={status} />)}
          </div>
        </section>

        <section className="space-y-4">
          <SearchBar onSearch={runSearch} loading={loading} />
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => runSearch(example)}
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-neutral-600 transition hover:border-neutral-900 hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-lg border border-line bg-panel p-6 text-neutral-500 shadow-glow">Planning tools, checking connected sources, and evaluating evidence...</div>
          ) : result ? (
            <AnswerPanel result={result} />
          ) : (
            <div className="grid gap-4 rounded-lg border border-line bg-panel p-5 text-sm text-neutral-500 shadow-glow md:grid-cols-3">
              <div>Personal messages require a connected message source.</div>
              <div>Meeting notes require an imported or connected transcript source.</div>
              <div>Flight results require a live tool or ingested travel data.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
