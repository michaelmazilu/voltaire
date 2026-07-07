import { CheckCircle2 } from "lucide-react";

export function SourceCard({ name, status }: { name: string; status: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-neutral-800" aria-hidden />
        <div>
          <div className="text-sm font-bold text-ink">{name}</div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">{status}</div>
        </div>
      </div>
    </div>
  );
}
