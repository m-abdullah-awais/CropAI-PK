import Link from "next/link";
import { AlertTriangle, Info, Sprout, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/units";
import type { YieldResponse } from "@/lib/types";

export function YieldResult({ data }: { data: YieldResponse }) {
  if (!data.available) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Sprout className="size-6" />
          </span>
          <p className="mt-4 font-medium">
            Yield not available for {data.display}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {data.message}
          </p>
          {data.yield_available_crops && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {data.yield_available_crops.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="size-4 text-primary" />
          Predicted yield for {data.display} ({data.year})
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">
            {data.yield_t_per_ha}
          </span>
          <span className="text-lg text-muted-foreground">t/ha</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ≈ {formatNumber(data.yield_kg_per_ha ?? 0)} kg/ha
        </p>

        <div className="mt-4 space-y-2">
          {data.extrapolation_warning && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              {data.extrapolation_warning}
            </p>
          )}
          {data.pesticides_defaulted && (
            <p className="flex items-start gap-2 rounded-lg bg-secondary/60 p-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Pesticide input defaulted to the national average for {data.year} (
              {formatNumber(data.pesticides_tonnes ?? 0)} tonnes).
            </p>
          )}
        </div>

        <Link
          href={`/rotation?crop=${data.crop}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4",
          )}
        >
          Plan rotation for {data.display}
        </Link>
      </CardContent>
    </Card>
  );
}
