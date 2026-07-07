"use client";

import { Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export function ChatInterface({ initialQuery = "" }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const submittedInitialQuery = useRef(false);

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

  useEffect(() => {
    if (!initialQuery.trim() || submittedInitialQuery.current) return;
    submittedInitialQuery.current = true;
    void runSearch(initialQuery);
  }, [initialQuery]);

  return (
    <div className="flex h-full flex-col bg-[#F7F5F3] text-[#37322F]">
      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-24 sm:px-8">
        <div className="mx-auto w-full max-w-[760px]">
          {messages.length === 0 ? (
            <div className="flex min-h-[calc(100vh-330px)] flex-col items-center justify-center text-center">
              <h1 className="font-serif text-[34px] font-normal leading-tight text-[#37322F]">What’s on the agenda today?</h1>
              <div className="mt-8 grid w-full max-w-[680px] gap-3 text-left sm:grid-cols-3">
                {[
                  "What did I say about Q3 hiring?",
                  "Find my latest meeting notes with action items.",
                  "What flights should I look at for next week?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => runSearch(prompt)}
                    className="rounded-2xl border border-[rgba(55,50,47,0.14)] bg-white p-4 text-left text-sm font-medium leading-5 text-[#605A57] shadow-[0_1px_2px_rgba(55,50,47,0.04)] transition hover:border-[rgba(55,50,47,0.28)] hover:text-[#37322F]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[78%] rounded-3xl bg-[#37322F] px-5 py-3 text-sm font-medium leading-6 text-white">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="max-w-[92%]">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-[#827C77]">
                      <VoltaireMark className="h-4 w-4 text-[#37322F]" />
                      Voltaire
                    </div>
                    <div>
                      <AnswerPanel result={message.result} />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {loading ? (
            <div className="mt-7 max-w-[92%] rounded-3xl border border-[rgba(55,50,47,0.12)] bg-white p-4 text-sm font-medium text-[#605A57] shadow-glow">
              Planning tools, checking connected sources, and evaluating evidence...
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(query);
        }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#F7F5F3] via-[#F7F5F3] to-transparent px-4 pb-5 pt-10 md:left-[312px]"
      >
        <div className="mx-auto w-full max-w-[920px]">
          <div className="flex min-h-16 items-end gap-3 rounded-[30px] bg-white p-2 shadow-[0_0_0_1px_rgba(55,50,47,0.12),0_18px_60px_rgba(55,50,47,0.12)] focus-within:shadow-[0_0_0_1px_rgba(55,50,47,0.28),0_18px_60px_rgba(55,50,47,0.12)]">
            <button
              type="button"
              className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#605A57] transition hover:bg-[#F0EEEC]"
              aria-label="Attach source"
            >
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <textarea
              className="max-h-36 min-h-12 flex-1 resize-none bg-transparent py-3 text-base font-medium leading-6 text-[#37322F] outline-none placeholder:text-[#9B948E]"
              placeholder="Ask anything"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  runSearch(query);
                }
              }}
              aria-label="Ask Voltaire"
              rows={1}
            />
            <button
              type="submit"
              className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#37322F] text-white transition hover:bg-[#2A2520] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={loading || !query.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
