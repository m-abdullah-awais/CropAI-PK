import Link from "next/link";
import { ArrowRight, LineChart, RefreshCw, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfidenceBar } from "@/components/common/confidence-bar";
import { cn } from "@/lib/utils";
import type { RecommendResponse } from "@/lib/types";

const CONF_VARIANT = {
  high: "success",
  medium: "warning",
  low: "secondary",
} as const;

export function RecommendResults({ data }: { data: RecommendResponse }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Top {data.recommendations.length} crops for your soil &amp; climate:
      </p>
      {data.recommendations.map((r, i) => (
        <Card
          key={r.crop}
          className={cn(
            "animate-fade-in-up overflow-hidden",
            i === 0 && "border-primary/40 ring-1 ring-primary/20",
          )}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {i === 0 && <Trophy className="size-5 text-accent" />}
                <span className="text-lg font-semibold">{r.display}</span>
                <Badge variant={CONF_VARIANT[r.confidence]}>
                  {r.confidence} confidence
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">#{i + 1}</span>
            </div>

            <div className="mt-3">
              <ConfidenceBar value={r.probability} emphasis={i === 0} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/rotation?crop=${r.crop}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <RefreshCw /> Plan rotation
              </Link>
              {r.yield_available ? (
                <Link
                  href={`/yield?crop=${r.crop}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  <LineChart /> Predict yield
                </Link>
              ) : (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  Yield data not available for this crop
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Link
        href="/rotation"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        Explore all rotation plans <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
