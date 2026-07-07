"use client";

import { useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import { SearchBar } from "../components/SearchBar";
import { SourceCard } from "../components/SourceCard";
import type { SearchResponse } from "../lib/types";

const examples = [
  "Find us a cheap flight from Toronto to San Francisco next Friday",
  "Find that one time I told toyesshh he had a big butt",
  "Remind me what my boss told me",
  "What should I do next based on everything you found?",
];

const sources = [
  ["Instagram", "connected"],
  ["Google Meet", "connected"],
  ["Exa web", "connected"],
  ["Butterbase", "active"],
  ["Neo4j graph", "active"],
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
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded bg-white/8 px-3 py-1 text-xs uppercase tracking-wide text-teal-200">Universal memory search</div>
            <h1 className="text-5xl font-semibold tracking-normal text-white sm:text-7xl">Voltaire</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">AI agents that find anything you have interacted with.</p>
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
                className="rounded-md border border-line bg-white/6 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-teal-300/60 hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-lg border border-line bg-panel/70 p-6 text-slate-300">Searching across Butterbase, Neo4j, source data, and optional web context...</div>
          ) : result ? (
            <AnswerPanel result={result} />
          ) : (
            <div className="grid gap-4 rounded-lg border border-line bg-panel/55 p-5 text-sm text-slate-300 md:grid-cols-3">
              <div>Ask about personal messages and Voltaire returns exact quotes with sender, recipient, and timestamp.</div>
              <div>Ask about work context and Voltaire resolves people through Neo4j before citing meeting notes.</div>
              <div>Ask about flights and Voltaire ranks seeded options without pretending to book anything.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
