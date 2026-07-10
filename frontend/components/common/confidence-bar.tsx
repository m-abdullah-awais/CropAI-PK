import { cn } from "@/lib/utils";

type Tone = "high" | "medium" | "low";

const FILL: Record<Tone, string> = {
  high: "bg-tool-recommend",
  medium: "bg-amber-500",
  low: "bg-muted-foreground",
};

// Accessible horizontal bar with a visible numeric percentage (not color-only).
export function ConfidenceBar({
  value,
  tone = "high",
  emphasis = false,
}: {
  value: number; // 0..1
  tone?: Tone;
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
            "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
            FILL[tone],
            !emphasis && "opacity-70",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-sm font-semibold tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
