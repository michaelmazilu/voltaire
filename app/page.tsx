"use client";

import { ArrowRight, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import { VoltaireMark } from "../components/VoltaireMark";
import type { SearchResponse } from "../lib/types";

type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      result: SearchResponse;
    };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSearch(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || loading) return;

    const messageId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      {
        id: messageId,
        role: "user",
        content: trimmedQuery,
      },
    ]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
      });
      const result = (await response.json()) as SearchResponse;
      setMessages((current) => [
        ...current,
        {
          id: `${messageId}-answer`,
          role: "assistant",
          result,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${messageId}-error`,
          role: "assistant",
          result: {
            query: trimmedQuery,
            intent: "conversation",
            answer: "I could not reach the search pipeline. Check the connected services and try again.",
            evidenceCards: [],
            graphTrace: [],
            loadingTrace: ["Search request failed"],
            sourcesSearched: [],
          },
        },
      ]);
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
              <a href="#chat">Try it</a>
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
            <h1 className="max-w-[790px] font-serif text-[42px] font-normal leading-[1.05] text-[#37322F] sm:text-[68px] lg:text-[84px]">
              Find anything you have interacted with.
            </h1>
            <p className="max-w-[600px] text-base font-medium leading-7 text-[rgba(55,50,47,0.78)] sm:text-lg">
              Voltaire plans the right tools, retrieves evidence from connected sources, traverses relationships, and returns cited answers without bundled seed data.
            </p>
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#chat"
                className="flex h-12 items-center gap-2 rounded-full bg-[#37322F] px-9 text-sm font-medium text-white shadow-[0_0_0_2.5px_rgba(255,255,255,0.08)_inset] transition hover:bg-[#2A2520]"
              >
                Ask Voltaire <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/setup"
                className="flex h-12 items-center rounded-full border border-[rgba(55,50,47,0.15)] bg-white px-9 text-sm font-medium text-[#37322F] transition hover:bg-[#F0EEEC]"
              >
                Configure sources
              </a>
            </div>
          </div>
        </section>

        <section id="chat" className="px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-[960px]">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-serif text-4xl font-normal text-[#37322F]">Ask Voltaire</h2>
                <p className="mt-2 max-w-[620px] text-sm font-medium leading-6 text-[#6F6964]">
                  Talk to the agent in a running thread. Voltaire plans tools, searches connected sources, and replies with evidence.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#d8d8d2] bg-white shadow-glow">
              <div className="flex min-h-[520px] flex-col">
                <div className="flex items-center justify-between border-b border-[#e6e2de] bg-[#FBFAF8] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#37322F] text-white">
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#37322F]">Voltaire Agent</div>
                      <div className="text-xs font-medium text-[#827C77]">
                        {loading ? "Thinking through sources..." : "Ready for your next question"}
                      </div>
                    </div>
                  </div>
                  <a
                    href="/setup"
                    className="rounded-md border border-[#d8d3ce] px-3 py-2 text-xs font-semibold text-[#37322F] transition hover:bg-[#F0EEEC]"
                  >
                    Sources
                  </a>
                </div>

                <div className="flex-1 space-y-5 bg-[#F7F5F3] px-4 py-5 sm:px-6">
                  {messages.length === 0 ? (
                    <div className="mx-auto flex min-h-[330px] max-w-[640px] flex-col items-center justify-center text-center">
                      <VoltaireMark className="mb-5 h-10 w-10 text-[#37322F]" />
                      <h3 className="font-serif text-3xl font-normal text-[#37322F]">What do you want to find?</h3>
                      <div className="mt-6 grid w-full gap-3 text-left sm:grid-cols-3">
                        {[
                          "What did I say about Q3 hiring?",
                          "Find my latest meeting notes with action items.",
                          "What flights should I look at for next week?",
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => runSearch(prompt)}
                            className="rounded-md border border-[#ded9d4] bg-white p-3 text-left text-sm font-medium leading-5 text-[#605A57] transition hover:border-[#BEB7B0] hover:text-[#37322F]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) =>
                      message.role === "user" ? (
                        <div key={message.id} className="flex justify-end">
                          <div className="max-w-[78%] rounded-lg bg-[#37322F] px-4 py-3 text-sm font-medium leading-6 text-white">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div key={message.id} className="max-w-[86%]">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#827C77]">
                            <VoltaireMark className="h-4 w-4 text-[#37322F]" />
                            Voltaire
                          </div>
                          <AnswerPanel result={message.result} />
                        </div>
                      ),
                    )
                  )}

                  {loading ? (
                    <div className="max-w-[86%] rounded-lg border border-[#d8d8d2] bg-white p-4 text-sm font-medium text-[#605A57] shadow-glow">
                      Planning tools, checking connected sources, and evaluating evidence...
                    </div>
                  ) : null}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    runSearch(query);
                  }}
                  className="border-t border-[#e6e2de] bg-white p-3"
                >
                  <div className="flex items-end gap-3 rounded-lg border border-[#d8d3ce] bg-[#FBFAF8] p-2 focus-within:border-[#37322F]">
                    <textarea
                      className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-base font-medium leading-6 text-[#37322F] outline-none placeholder:text-[#9B948E]"
                      placeholder="Message Voltaire..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          runSearch(query);
                        }
                      }}
                      aria-label="Message Voltaire"
                      rows={1}
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#37322F] text-white transition hover:bg-[#2A2520] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading || !query.trim()}
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
