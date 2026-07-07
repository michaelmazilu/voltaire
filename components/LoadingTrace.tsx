import { Check } from "lucide-react";

export function LoadingTrace({ trace }: { trace: string[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <h2 className="text-sm font-semibold text-white">Loading trace</h2>
      <div className="mt-3 space-y-2">
        {trace.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="h-4 w-4 text-teal-300" aria-hidden />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
