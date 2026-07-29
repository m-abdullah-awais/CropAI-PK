"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/common/page-shell";
import { PageHeader } from "@/components/common/page-header";
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
import { YieldSensitivityChart } from "@/components/yield/yield-sensitivity-chart";
import { YieldTrendChart } from "@/components/yield/yield-trend-chart";
import { estimateYield, getYieldHistory } from "@/lib/api/ml";
import type { YieldEstimateForm } from "@/lib/schemas/yield";
import type { YieldEstimateResponse, YieldHistoryResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

const SOIL_KEYS = ["N", "P", "K", "ph", "temperature", "humidity", "rainfall"] as const;

function YieldSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-52 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function YieldInner() {
  const { t, tCrop } = useI18n();
  const sp = useSearchParams();
  const initialCrop = sp.get("crop") ?? undefined;
  const initialSoil = React.useMemo(() => {
    const out: Partial<Record<(typeof SOIL_KEYS)[number], number>> = {};
    let any = false;
    for (const k of SOIL_KEYS) {
      const v = sp.get(k);
      if (v != null && v !== "" && !Number.isNaN(Number(v))) {
        out[k] = Number(v);
        any = true;
      }
    }
    return any ? out : undefined;
  }, [sp]);

  const [estimate, setEstimate] = React.useState<YieldEstimateResponse | null>(null);
  const [history, setHistory] = React.useState<YieldHistoryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const lastCrop = React.useRef<string | null>(null);
  const reqId = React.useRef(0);

  const handleEstimate = React.useCallback(
    async (values: YieldEstimateForm) => {
      const id = ++reqId.current;
      setLoading(true);
      const cropChanged = lastCrop.current !== values.crop;
      lastCrop.current = values.crop;
      try {
        const [est, hist] = await Promise.all([
          estimateYield(values),
          cropChanged ? getYieldHistory(values.crop) : Promise.resolve(null),
        ]);
        if (id !== reqId.current) return;
        setEstimate(est);
        if (cropChanged) setHistory(hist);
      } catch (e) {
        if (id === reqId.current) {
          toast.error(e instanceof Error ? e.message : t.common.error);
        }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [t.common.error],
  );

  const mostLimitingNutrient =
    estimate?.most_limiting && ["N", "P", "K"].includes(estimate.most_limiting)
      ? estimate.most_limiting
      : undefined;

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
                initialSoil={initialSoil}
                onEstimate={handleEstimate}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {!estimate ? (
            <YieldSkeleton />
          ) : (
            <>
              <YieldResult data={estimate} loading={loading} />

              {estimate.available &&
                estimate.sensitivities &&
                estimate.sensitivities.length > 0 && (
                  <Card>
                    <CardContent className="p-5 sm:p-6">
                      <YieldSensitivityChart
                        sensitivities={estimate.sensitivities}
                        initialFeature={mostLimitingNutrient}
                      />
                    </CardContent>
                  </Card>
                )}

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
                      predicted={null}
                      lastRealYear={null}
                    />
                  </CardContent>
                </Card>
              )}
            </>
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
