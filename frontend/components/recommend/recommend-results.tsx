"use client";

import Link from "next/link";
import { ArrowRight, LineChart, RefreshCw, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfidenceBar } from "@/components/common/confidence-bar";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { RecommendResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

const CONF_VARIANT = {
  high: "success",
  medium: "warning",
  low: "secondary",
} as const;

export function RecommendResults({ data }: { data: RecommendResponse }) {
  const { t, tCrop } = useI18n();
  return (
    <Stagger className="space-y-4">
      <StaggerItem>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t.recommend.topCrops}
        </p>
      </StaggerItem>
      {data.recommendations.map((r, i) => {
        const best = i === 0;
        return (
          <StaggerItem key={r.crop}>
            <Card
              className={cn(
                "overflow-hidden",
                best &&
                  "border-tool-recommend/40 shadow-e2 ring-1 ring-tool-recommend/20",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums",
                      best
                        ? "bg-tool-recommend text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold">
                        {tCrop(r.crop, r.display)}
                      </span>
                      <Badge variant={CONF_VARIANT[r.confidence]}>
                        {t.recommend.confidence[r.confidence]}
                      </Badge>
                    </div>
                    {best && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-tool-recommend">
                        <Trophy className="size-3.5" /> {t.recommend.bestMatch}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <ConfidenceBar
                    value={r.probability}
                    tone={r.confidence}
                    emphasis={best}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/rotation?crop=${r.crop}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <RefreshCw /> {t.recommend.planRotation}
                  </Link>
                  {r.yield_available ? (
                    <Link
                      href={`/yield?crop=${r.crop}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
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
          className="inline-flex items-center gap-1 text-sm font-medium text-tool-recommend"
        >
          {t.recommend.exploreRotation}{" "}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </StaggerItem>
    </Stagger>
  );
}
