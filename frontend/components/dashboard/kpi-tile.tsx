"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { useT } from "@/lib/i18n/provider";

type Accent = "recommend" | "yield" | "rotation" | "accent";

const ACCENT: Record<Accent, { bar: string; chip: string }> = {
  recommend: { bar: "bg-tool-recommend", chip: "bg-tool-recommend/10 text-tool-recommend" },
  yield: { bar: "bg-tool-yield", chip: "bg-tool-yield/10 text-tool-yield" },
  rotation: { bar: "bg-tool-rotation", chip: "bg-tool-rotation/10 text-tool-rotation" },
  accent: { bar: "bg-accent", chip: "bg-accent/10 text-accent" },
};

// One dashboard stat. Real value only: while `loading` shows a skeleton, and on `error`
// shows a muted "--" with a retry affordance rather than a fabricated number.
export function KpiTile({
  label,
  hint,
  icon: Icon,
  accent = "accent",
  countTo,
  decimals = 0,
  suffix,
  loading = false,
  error = false,
  onRetry,
}: {
  label: string;
  hint?: string;
  icon: LucideIcon;
  accent?: Accent;
  countTo?: number | null;
  decimals?: number;
  suffix?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const t = useT();
  const a = ACCENT[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-card p-5 shadow-e1">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-0.5", a.bar)} />

      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            a.chip,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : error || countTo == null ? (
          <span className="text-muted-foreground">--</span>
        ) : (
          <span>
            <AnimatedNumber value={countTo} decimals={decimals} />
            {suffix && <span className="ms-0.5 text-lg text-muted-foreground">{suffix}</span>}
          </span>
        )}
      </div>

      <div className="mt-1 min-h-4 text-xs text-muted-foreground">
        {loading ? (
          <Skeleton className="h-3 w-24" />
        ) : error ? (
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium text-primary hover:underline"
            >
              {t.common.retry}
            </button>
          )
        ) : (
          hint
        )}
      </div>
    </div>
  );
}
