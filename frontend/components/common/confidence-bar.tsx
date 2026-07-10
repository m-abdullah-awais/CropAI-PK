"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Tone = "high" | "medium" | "low";

const FILL: Record<Tone, string> = {
  high: "bg-tool-recommend",
  medium: "bg-amber-500",
  low: "bg-muted-foreground",
};

// Accessible horizontal bar with a visible numeric percentage (not color-only).
// The fill grows in on mount; reduced motion (via MotionConfig) jumps to final.
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
        <motion.div
          className={cn("h-full rounded-full", FILL[tone], !emphasis && "opacity-70")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-10 text-right font-mono text-sm font-semibold tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
