import { cn } from "@/lib/utils";

// Accessible horizontal bar with a visible numeric percentage (not color-only).
export function ConfidenceBar({
  value,
  emphasis = false,
}: {
  value: number; // 0..1
  emphasis?: boolean;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            emphasis ? "bg-primary" : "bg-primary/60",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
