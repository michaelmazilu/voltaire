"use client";

import { ArrowRight, Database, Network, Search } from "lucide-react";
import { useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import { SearchBar } from "../components/SearchBar";
import { VoltaireMark } from "../components/VoltaireMark";
import type { SearchResponse } from "../lib/types";

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
    <main className="min-h-screen bg-[#F7F5F3] text-[#37322F]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1060px] flex-col border-x border-[rgba(55,50,47,0.12)] shadow-[1px_0_0_white,-1px_0_0_white]">
        <header className="absolute left-0 top-0 z-20 flex h-[84px] w-full items-center justify-center px-6">
          <div className="absolute left-0 top-[42px] h-px w-full border-t border-[rgba(55,50,47,0.12)] shadow-[0_1px_0_white]" />
          <nav className="relative z-10 flex h-12 w-full max-w-[760px] items-center justify-between rounded-full bg-[#F7F5F3] px-4 py-2 shadow-[0_0_0_2px_white]">
            <a href="/" className="flex items-center gap-2">
              <VoltaireMark className="h-6 w-6 text-[#37322F]" />
              <span className="font-serif text-xl italic leading-none text-[#2F3037]">Voltaire</span>
            </a>
            <div className="hidden items-center gap-5 text-[13px] font-medium text-[rgba(49,45,43,0.78)] sm:flex">
              <a href="#product">Product</a>
              <a href="#sources">Sources</a>
              <a href="#search">Search</a>
            </div>
            <a
              href="/setup"
              className="rounded-full bg-[#37322F] px-4 py-2 text-[13px] font-medium leading-none text-white shadow-[0_1px_2px_rgba(55,50,47,0.12)] transition hover:bg-[#2A2520]"
            >
              Connect
            </a>
          </nav>
        </header>

        <section className="relative flex flex-col items-center overflow-hidden border-b border-[rgba(55,50,47,0.08)] px-4 pb-12 pt-[164px]">
          <div className="pointer-events-none absolute left-1/2 top-[310px] h-[520px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,rgba(55,50,47,0.10),transparent_60%)] opacity-70" />
          <div className="relative z-10 flex max-w-[940px] flex-col items-center gap-6 text-center">
            <div className="rounded-full border border-[rgba(55,50,47,0.12)] bg-white px-[14px] py-[6px] text-xs font-medium text-[#37322F] shadow-[0_0_0_4px_rgba(55,50,47,0.05)]">
              Universal AI search for your digital life
            </div>
            <h1 className="max-w-[790px] font-serif text-[42px] font-normal leading-[1.05] tracking-[-0.02em] text-[#37322F] sm:text-[68px] lg:text-[84px]">
              Find anything you have interacted with.
            </h1>
            <p className="max-w-[600px] text-base font-medium leading-7 text-[rgba(55,50,47,0.78)] sm:text-lg">
              Voltaire plans the right tools, retrieves evidence from connected sources, traverses relationships, and returns cited answers without bundled seed data.
            </p>
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="/setup"
                className="flex h-12 items-center gap-2 rounded-full bg-[#37322F] px-9 text-sm font-medium text-white shadow-[0_0_0_2.5px_rgba(255,255,255,0.08)_inset] transition hover:bg-[#2A2520]"
              >
                Configure data <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#search"
                className="flex h-12 items-center rounded-full border border-[rgba(55,50,47,0.15)] bg-white px-9 text-sm font-medium text-[#37322F] transition hover:bg-[#F0EEEC]"
              >
                Start search
              </a>
            </div>
          </div>

          <div id="product" className="relative z-10 mt-16 w-full max-w-[960px] rounded-[9px] bg-[#37322F] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            <div className="rounded-[7px] border border-white/10 bg-gradient-to-br from-[#37322F] via-[#48433F] to-[#2F2A27] p-5 text-white">
              <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <aside className="rounded-md border border-white/10 bg-white/8 p-4">
                  <div className="mb-4 text-xs uppercase tracking-wide text-white/50">Tool plan</div>
                  {[
                    ["Planner", "choose intent"],
                    ["Butterbase", "structured + RAG"],
                    ["Neo4j", "relationship trace"],
                    ["Evaluator", "answer with citations"],
                  ].map(([name, detail]) => (
                    <div key={name} className="mb-3 flex items-center justify-between rounded-md bg-white/8 px-3 py-2 text-sm">
                      <span>{name}</span>
                      <span className="text-white/45">{detail}</span>
                    </div>
                  ))}
                </aside>
                <div className="rounded-md border border-white/10 bg-[#F7F5F3] p-4 text-[#37322F]">
                  <div className="mb-4 flex items-center justify-between border-b border-[#e0dedb] pb-3">
                    <div>
                      <div className="text-sm font-semibold">Answer workspace</div>
                      <div className="text-xs font-medium text-[#827C77]">No evidence appears until a real source returns it.</div>
                    </div>
                    <div className="rounded-full bg-[#37322F] px-3 py-1 text-xs text-white">live pipeline</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      [Search, "Ask", "Natural language query"],
                      [Database, "Retrieve", "Butterbase + RAG"],
                      [Network, "Prove", "Neo4j graph trace"],
                    ].map(([Icon, title, detail]) => (
                      <div key={String(title)} className="rounded-md border border-[#e0dedb] bg-white p-4">
                        <Icon className="mb-8 h-5 w-5 text-[#37322F]" />
                        <div className="text-sm font-semibold">{String(title)}</div>
                        <div className="mt-1 text-xs font-medium text-[#827C77]">{String(detail)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="search" className="border-b border-[#e0dedb] px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-[960px]">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#827C77]">Search</div>
                <h2 className="mt-2 font-serif text-4xl font-normal text-[#37322F]">Ask Voltaire</h2>
              </div>
              <a href="/setup" className="text-sm font-semibold text-[#37322F] underline underline-offset-4">
                Configure data
              </a>
            </div>

            <SearchBar onSearch={runSearch} loading={loading} />

            <div className="mt-8">
              {loading ? (
                <div className="rounded-lg border border-[#d8d8d2] bg-white p-6 text-sm font-medium text-[#605A57] shadow-glow">
                  Searching connected sources...
                </div>
              ) : result ? (
                <AnswerPanel result={result} />
              ) : null}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
