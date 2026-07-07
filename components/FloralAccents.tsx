import { Flower2 } from "lucide-react";

export function FloralCorner({
  className = "",
  mirrored = false,
}: {
  className?: string;
  mirrored?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${mirrored ? "scale-x-[-1]" : ""} ${className}`}
      aria-hidden
    >
      <div className="relative h-48 w-48">
        <div className="absolute left-8 top-5 h-24 w-24 rounded-full bg-[#F2BFD8]/24 blur-2xl" />
        <div className="absolute left-20 top-16 h-28 w-28 rounded-full bg-[#D6C6F5]/22 blur-2xl" />
        <Flower2 className="absolute left-8 top-2 h-24 w-24 rotate-[-12deg] fill-[#F2BFD8]/28 text-[#B97898]/50" strokeWidth={1.15} />
        <Flower2 className="absolute left-1 top-20 h-14 w-14 rotate-[-34deg] fill-[#E9B7EF]/24 text-[#A77BB7]/40" strokeWidth={1.15} />
        <Flower2 className="absolute left-24 top-24 h-16 w-16 rotate-[18deg] fill-[#D6C6F5]/30 text-[#8F78BE]/48" strokeWidth={1.15} />
      </div>
    </div>
  );
}

export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-[#B97898]/48 ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#B97898]/28" />
      <Flower2 className="h-6 w-6 fill-[#F2BFD8]/28" strokeWidth={1.25} />
      <Flower2 className="h-5 w-5 fill-[#D6C6F5]/30 text-[#8F78BE]/48" strokeWidth={1.25} />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#8F78BE]/28" />
    </div>
  );
}
