"use client";

import Link from "next/link";
import { Info, RefreshCw, Sprout } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/units";
import { getCrop } from "@/lib/crops";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { MountReveal } from "@/components/motion/reveal";
import type { YieldEstimateResponse, YieldFactor } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

export function YieldResult({
  data,
  loading = false,
}: {
  data: YieldEstimateResponse;
  loading?: boolean;
}) {
  const { t, tCrop } = useI18n();
  const display = tCrop(data.crop, data.display);

  if (!data.available) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Sprout className="size-6" />
          </span>
          <p className="mt-4 font-medium">{display}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t.yield.nutrientUnavailable}
          </p>
        </CardContent>
      </Card>
    );
  }

  const estT = data.estimated_t_per_ha ?? 0;
  const estDec = Math.min(3, (String(estT).split(".")[1] ?? "").length);
  const attainable = data.attainable_t_per_ha ?? 0;
  const matchPct = Math.round((data.overall_adequacy ?? 0) * 100);
  const factors = data.factors ?? [];
  const limiting = factors.find((f) => f.limiting);
  const goodMatch = (data.overall_adequacy ?? 0) >= 0.9;
  const canRotate = getCrop(data.crop)?.rotationAvailable;

  return (
    <MountReveal>
      <Card className={cn(loading && "opacity-70 transition-opacity")}>
        <span aria-hidden className="block h-1 bg-tool-yield" />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.yield.estimatedFor} {display}
            </span>
            <Badge variant="info">{t.yield.estimateBadge}</Badge>
          </div>

          <Tabs defaultValue="tha" className="mt-4">
            <TabsList className="h-8">
              <TabsTrigger value="tha">t/ha</TabsTrigger>
              <TabsTrigger value="kgha">kg/ha</TabsTrigger>
            </TabsList>
            <TabsContent value="tha" className="mt-3">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={estT}
                  decimals={estDec}
                  className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground"
                />
                <span className="text-lg text-muted-foreground">t/ha</span>
              </div>
            </TabsContent>
            <TabsContent value="kgha" className="mt-3">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={data.estimated_kg_per_ha ?? 0}
                  decimals={0}
                  className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground"
                />
                <span className="text-lg text-muted-foreground">kg/ha</span>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t.yield.attainable}:{" "}
              <span className="font-mono tabular-nums text-foreground">
                {formatNumber(attainable, 2)}
              </span>{" "}
              t/ha
            </span>
            <span>
              {t.yield.soilMatch}:{" "}
              <span className="font-mono tabular-nums text-foreground">{matchPct}%</span>
            </span>
          </div>

          {/* Most-limiting guidance */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-tool-yield/25 bg-tool-yield/6 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-tool-yield" />
            <p>
              {goodMatch || !limiting ? (
                t.yield.goodMatch
              ) : (
                <>
                  <span className="font-medium">
                    {t.recommend.fields[limiting.name]}
                  </span>{" "}
                  {limiting.status === "low"
                    ? t.yield.limitLow
                    : t.yield.limitHigh}
                </>
              )}
            </p>
          </div>

          {/* Per-factor adequacy */}
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.yield.factorsTitle}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {factors.map((f) => (
                <FactorRow key={f.name} factor={f} label={t.recommend.fields[f.name]} />
              ))}
            </div>
          </div>

          <p className="mt-5 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" /> {t.yield.estimateDisclaimer}
          </p>

          {canRotate && (
            <div className="mt-4 border-t border-hairline pt-4">
              <Link
                href={`/rotation?crop=${data.crop}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <RefreshCw /> {t.yield.planRotation} {display}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </MountReveal>
  );
}

function FactorRow({ factor, label }: { factor: YieldFactor; label: string }) {
  const { t } = useI18n();
  const pct = Math.round(factor.adequacy * 100);
  const status = t.yield.status[factor.status];
  const isIdeal = factor.status === "ideal";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="truncate">{label}</span>
        <span
          className={cn(
            "shrink-0 text-xs font-medium",
            isIdeal ? "text-tool-yield" : "text-warning",
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", isIdeal ? "bg-tool-yield" : "bg-warning")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
