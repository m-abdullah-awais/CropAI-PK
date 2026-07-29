"use client";

import Link from "next/link";
import { ArrowRight, LineChart, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfidenceBar } from "@/components/common/confidence-bar";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { RecommendResponse } from "@/lib/types";
import type { SoilValues } from "@/components/recommend/recommend-form";
import { useI18n } from "@/lib/i18n/provider";

const CONF_VARIANT = {
  high: "success",
  medium: "warning",
  low: "secondary",
} as const;

export function RecommendResults({
  data,
  soil,
}: {
  data: RecommendResponse;
  soil?: SoilValues | null;
}) {
  const { t, tCrop } = useI18n();
  // Carry the soil the farmer entered into the yield tool, so "Predict yield"
  // estimates for their actual field, not defaults.
  const yieldHref = (crop: string) => {
    const params = new URLSearchParams({ crop });
    if (soil) {
      for (const [k, v] of Object.entries(soil)) params.set(k, String(v));
    }
    return `/yield?${params.toString()}`;
  };
  return (
    <Stagger className="space-y-4">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t.recommend.topCrops}
          </p>
          <span className="text-xs text-muted-foreground">
            {data.recommendations.length}
          </span>
        </div>
      </StaggerItem>

      {data.recommendations.map((r, i) => {
        const best = i === 0;
        return (
          <StaggerItem key={r.crop}>
            <Card
              className={cn(
                best && "border-tool-recommend/30 bg-tool-recommend/3",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <span className="w-4 shrink-0 text-center font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-base font-semibold">
                          {tCrop(r.crop, r.display)}
                        </span>
                        {best && (
                          <span className="shrink-0 rounded-full bg-tool-recommend/10 px-2 py-0.5 text-[11px] font-medium text-tool-recommend">
                            {t.recommend.bestMatch}
                          </span>
                        )}
                      </div>
                      <Badge variant={CONF_VARIANT[r.confidence]} className="shrink-0">
                        {t.recommend.confidence[r.confidence]}
                      </Badge>
                    </div>
                    <div className="mt-2.5">
                      <ConfidenceBar
                        value={r.probability}
                        tone={r.confidence}
                        emphasis={best}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 ps-8">
                  <Link
                    href={`/rotation?crop=${r.crop}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <RefreshCw /> {t.recommend.planRotation}
                  </Link>
                  {r.yield_available ? (
                    <Link
                      href={yieldHref(r.crop)}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      <LineChart /> {t.recommend.predictYield}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center text-xs text-muted-foreground">
                      {t.recommend.noYield}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        );
      })}

      <StaggerItem>
        <Link
          href="/rotation"
          className="inline-flex items-center gap-1 text-sm font-medium text-tool-recommend hover:underline"
        >
          {t.recommend.exploreRotation}{" "}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </StaggerItem>
    </Stagger>
  );
}
