import type { GraphTraceItem } from "../lib/types";

export function GraphTrace({ trace }: { trace: GraphTraceItem[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <h2 className="text-sm font-semibold text-white">Neo4j graph trace</h2>
      <div className="mt-3 space-y-2">
        {trace.map((item) => (
          <div key={`${item.from}-${item.type}-${item.to}`} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-white">{item.from}</span>
            <span className="text-slate-500">→</span>
            <span className="rounded bg-teal-300/12 px-2 py-1 text-xs text-teal-200">{item.type}</span>
            <span className="text-slate-500">→</span>
            <span className="text-white">{item.to}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
