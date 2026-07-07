"use client";

import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { AnswerPanel } from "./AnswerPanel";
import { VoltaireMark } from "./VoltaireMark";
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

export function ChatInterface({ fullHeight = false }: { fullHeight?: boolean }) {
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
    <div className="overflow-hidden rounded-lg border border-[#d8d8d2] bg-white shadow-glow">
      <div className={`flex flex-col ${fullHeight ? "h-[calc(100vh-112px)] min-h-[620px]" : "min-h-[520px]"}`}>
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
            Integration
          </a>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-[#F7F5F3] px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-[330px] max-w-[640px] flex-col items-center justify-center text-center">
              <VoltaireMark className="mb-5 h-10 w-10 text-[#37322F]" />
              <h1 className="font-serif text-3xl font-normal text-[#37322F]">What do you want to find?</h1>
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
  );
}
