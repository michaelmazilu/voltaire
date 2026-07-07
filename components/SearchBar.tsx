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
    <form onSubmit={submit} className="flex w-full items-center gap-3 rounded-lg border border-line bg-white p-2 shadow-glow">
      <Search className="ml-3 h-5 w-5 text-neutral-500" aria-hidden />
      <input
        className="min-h-12 flex-1 bg-transparent text-base font-bold text-ink outline-none placeholder:text-neutral-400"
        placeholder="Ask Voltaire to find anything…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Ask Voltaire"
      />
      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Searching" : "Search"}
      </button>
    </form>
  );
}
