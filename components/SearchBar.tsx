"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

export function SearchBar({
  onSearch,
  loading,
}: {
  onSearch: (query: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-3 rounded-lg border border-line bg-white/7 p-2 shadow-glow backdrop-blur">
      <Search className="ml-3 h-5 w-5 text-teal-200" aria-hidden />
      <input
        className="min-h-12 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
        placeholder="Ask Voltaire to find anything…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Ask Voltaire"
      />
      <button
        className="rounded-md bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Searching" : "Search"}
      </button>
    </form>
  );
}
