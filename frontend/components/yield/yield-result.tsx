"use client";

import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Sprout,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { displayName, getCrop } from "@/lib/crops";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { MountReveal } from "@/components/motion/reveal";
import type { YieldResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

export function YieldResult({ data }: { data: YieldResponse }) {
  const { t, tCrop } = useI18n();
  const display = tCrop(data.crop, data.display);

  if (!data.available) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Sprout className="size-6" />
          </span>
          <p className="mt-4 font-medium">
            {t.yield.unavailable} {display}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {data.message}
          </p>
          {data.yield_available_crops && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {data.yield_available_crops.map((c) => (
                <Badge key={c} variant="secondary">
                  {tCrop(c, displayName(c))}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const canRotate = getCrop(data.crop)?.rotationAvailable;
  const tVal = data.yield_t_per_ha ?? 0;
  const tDec = Math.min(3, (String(tVal).split(".")[1] ?? "").length);

  return (
    <MountReveal>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.yield.yieldFor} {display} ({data.year})
            </span>
            <Badge variant={data.is_forecast ? "warning" : "success"}>
              {data.is_forecast ? t.yield.forecast : t.yield.recorded}
            </Badge>
          </div>

          <Tabs defaultValue="tha" className="mt-4">
            <TabsList className="h-8">
              <TabsTrigger value="tha">t/ha</TabsTrigger>
              <TabsTrigger value="kgha">kg/ha</TabsTrigger>
            </TabsList>
            <TabsContent value="tha" className="mt-3">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={tVal}
                  decimals={tDec}
                  className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground"
                />
                <span className="text-lg text-muted-foreground">t/ha</span>
              </div>
            </TabsContent>
            <TabsContent value="kgha" className="mt-3">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={data.yield_kg_per_ha ?? 0}
                  decimals={0}
                  className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground"
                />
                <span className="text-lg text-muted-foreground">kg/ha</span>
              </div>
            </TabsContent>
          </Tabs>

          {data.trend_direction && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-xs">
              {data.trend_direction === "rising" ? (
                <TrendingUp className="size-3.5 text-tool-yield" />
              ) : data.trend_direction === "falling" ? (
                <TrendingDown className="size-3.5 text-destructive" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span className="font-medium">{t.yield.trendLabel}:</span>
              <span className="text-muted-foreground">
                {t.yield[data.trend_direction]}{" "}
                <span className="font-mono tabular-nums">
                  {Math.abs(data.trend_per_year ?? 0)}
                </span>{" "}
                {t.yield.perYear}
              </span>
            </div>
          )}

          {data.extrapolation_warning && (
            <Alert variant="warning" className="mt-4">
              <AlertTriangle />
              <AlertDescription>{data.extrapolation_warning}</AlertDescription>
            </Alert>
          )}

          {canRotate && (
            <div className="mt-5 border-t border-hairline pt-4">
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
