"use client";

import { ArrowRight, Plus, Send } from "lucide-react";
import { useState } from "react";
import { FloralCorner, FloralDivider } from "../components/FloralAccents";
import { VoltaireMark } from "../components/VoltaireMark";

export default function Home() {
  const [query, setQuery] = useState("");

  function openChat() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    window.location.href = `/chat?q=${encodeURIComponent(trimmedQuery)}`;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F3] text-[#37322F]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1060px] flex-col border-x border-[rgba(55,50,47,0.12)] shadow-[1px_0_0_white,-1px_0_0_white]">
        <FloralCorner className="-left-10 top-24 z-0 hidden scale-[1.15] opacity-90 sm:block" />
        <FloralCorner className="right-6 top-[390px] z-0 hidden scale-[0.72] rotate-[16deg] opacity-75 lg:block" />
        <FloralCorner className="left-[70%] top-28 z-0 hidden scale-[0.46] rotate-[-20deg] opacity-65 md:block" />
        <header className="absolute left-0 top-0 z-20 flex h-[84px] w-full items-center justify-center px-6">
          <div className="absolute left-0 top-[42px] h-px w-full border-t border-[rgba(55,50,47,0.12)] shadow-[0_1px_0_white]" />
          <nav className="relative z-10 flex h-12 w-full max-w-[760px] items-center justify-between rounded-full bg-[#F7F5F3] px-4 py-2 shadow-[0_0_0_2px_white]">
            <a href="/" className="flex items-center gap-2">
              <VoltaireMark className="h-6 w-6 text-[#37322F]" />
              <span className="font-serif text-xl italic leading-none text-[#2F3037]">Voltaire</span>
            </a>
            <a
              href="/chat"
              className="rounded-full bg-[#37322F] px-4 py-2 text-[13px] font-medium leading-none text-white shadow-[0_1px_2px_rgba(55,50,47,0.12)] transition hover:bg-[#2A2520]"
            >
              Try it
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
            <FloralDivider />
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="/chat"
                className="flex h-12 items-center gap-2 rounded-full bg-[#37322F] px-9 text-sm font-medium text-white shadow-[0_0_0_2.5px_rgba(255,255,255,0.08)_inset] transition hover:bg-[#2A2520]"
              >
                Ask Voltaire <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/setup"
                className="flex h-12 items-center rounded-full border border-[rgba(55,50,47,0.15)] bg-white px-9 text-sm font-medium text-[#37322F] transition hover:bg-[#F0EEEC]"
              >
                Integration
              </a>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              openChat();
            }}
            className="relative mx-auto max-w-[760px]"
          >
            <div
              className="relative z-10 flex min-h-16 items-end gap-3 rounded-[30px] bg-white p-2 shadow-[0_0_0_1px_rgba(55,50,47,0.12),0_18px_60px_rgba(55,50,47,0.12)] focus-within:shadow-[0_0_0_1px_rgba(55,50,47,0.28),0_18px_60px_rgba(55,50,47,0.12)]"
            >
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
                    openChat();
                  }
                }}
                aria-label="Ask Voltaire"
                rows={1}
              />
              <button
                type="submit"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#37322F] text-white transition hover:bg-[#2A2520] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!query.trim()}
                aria-label="Open chat"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </section>

      </div>
    </main>
  );
}
