"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { ResultEmpty } from "@/components/common/result-empty";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YieldForm } from "@/components/yield/yield-form";
import { YieldResult } from "@/components/yield/yield-result";
import { YieldTrendChart } from "@/components/yield/yield-trend-chart";
import { getYieldHistory, predictYield } from "@/lib/api/ml";
import type { YieldForm as FormValues } from "@/lib/schemas/yield";
import type { YieldHistoryResponse, YieldResponse } from "@/lib/types";

function YieldInner() {
  const initialCrop = useSearchParams().get("crop") ?? undefined;
  const [result, setResult] = React.useState<YieldResponse | null>(null);
  const [history, setHistory] = React.useState<YieldHistoryResponse | null>(
    null,
  );
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
      toast.error(e instanceof Error ? e.message : "Yield prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  const predictedPoint =
    result?.available && result.year && result.yield_t_per_ha
      ? { year: result.year, value: result.yield_t_per_ha }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        icon={LineChart}
        title="Yield Prediction"
        description="Estimate expected yield for major Pakistani crops, with the historical trend from FAO data (measured through 2024)."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <CardContent className="p-6">
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
            <>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </>
          ) : result ? (
            <>
              <YieldResult data={result} />
              {history?.available && history.series.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <p className="mb-3 text-sm font-medium">
                      Historical yield — {history.display}
                    </p>
                    <YieldTrendChart
                      series={history.series}
                      predicted={predictedPoint}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <ResultEmpty
              icon={LineChart}
              title="Your yield estimate will appear here"
              description="Pick a crop, year, and climate, then click “Predict yield”."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function YieldPage() {
  return (
    <Suspense>
      <YieldInner />
    </Suspense>
  );
}
