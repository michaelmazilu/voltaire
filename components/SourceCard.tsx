import { CheckCircle2 } from "lucide-react";

export function SourceCard({ name, status }: { name: string; status: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-teal-300" aria-hidden />
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{status}</div>
        </div>
      </div>
    </div>
  );
}
