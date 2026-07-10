"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/common/page-shell";
import { PageHeader } from "@/components/common/page-header";
import { ResultEmpty } from "@/components/common/result-empty";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YieldForm } from "@/components/yield/yield-form";
import { YieldResult } from "@/components/yield/yield-result";
import { YieldTrendChart } from "@/components/yield/yield-trend-chart";
import { getYieldHistory, predictYield } from "@/lib/api/ml";
import type { YieldForm as FormValues } from "@/lib/schemas/yield";
import type { YieldHistoryResponse, YieldResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

function YieldSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-14 w-44" />
          <Skeleton className="h-7 w-56" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function YieldInner() {
  const { t, tCrop } = useI18n();
  const initialCrop = useSearchParams().get("crop") ?? undefined;
  const [result, setResult] = React.useState<YieldResponse | null>(null);
  const [history, setHistory] = React.useState<YieldHistoryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(values: FormValues) {
    setLoading(true);
    setResult(null);
    setHistory(null);
    try {
      const [pred, hist] = await Promise.all([
        predictYield(values),
        getYieldHistory(values.crop),
      ]);
      setResult(pred);
      setHistory(hist);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  const predictedPoint =
    result?.available && result.year && result.yield_t_per_ha
      ? { year: result.year, value: result.yield_t_per_ha }
      : null;

  return (
    <PageShell>
      <PageHeader
        accent="yield"
        icon={LineChart}
        title={t.yield.title}
        description={t.yield.desc}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-5 sm:p-6">
              <YieldForm
                initialCrop={initialCrop}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {loading ? (
            <YieldSkeleton />
          ) : result ? (
            <>
              <YieldResult data={result} />
              {history?.available && history.series.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.yield.history}</CardTitle>
                    <CardDescription>
                      {tCrop(history.crop, history.display)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <YieldTrendChart
                      series={history.series}
                      predicted={predictedPoint}
                      lastRealYear={result.last_real_year}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <ResultEmpty
              accent="yield"
              icon={LineChart}
              title={t.yield.empty}
              description={t.yield.emptyDesc}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function YieldPage() {
  return (
    <Suspense>
      <YieldInner />
    </Suspense>
  );
}
