import type { GraphTraceItem } from "../lib/types";

export function GraphTrace({ trace }: { trace: GraphTraceItem[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <h2 className="text-sm font-bold text-ink">Neo4j graph trace</h2>
      <div className="mt-3 space-y-2">
        {trace.map((item) => (
          <div key={`${item.from}-${item.type}-${item.to}`} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink">{item.from}</span>
            <span className="text-neutral-400">→</span>
            <span className="rounded border border-line bg-neutral-50 px-2 py-1 text-xs text-neutral-700">{item.type}</span>
            <span className="text-neutral-400">→</span>
            <span className="text-ink">{item.to}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
