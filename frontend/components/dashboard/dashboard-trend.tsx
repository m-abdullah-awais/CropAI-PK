"use client";

import * as React from "react";
import { LineChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { YieldTrendChart } from "@/components/yield/yield-trend-chart";
import { getYieldHistory } from "@/lib/api/ml";
import type { YieldHistoryResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

// Real FAO yield history for one representative crop, shown on the dashboard as an
// at-a-glance trend. No forecast is drawn here, so nothing is projected/fabricated.
export function DashboardTrend({ crop = "wheat" }: { crop?: string }) {
  const { t, tCrop } = useI18n();
  const [data, setData] = React.useState<YieldHistoryResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    getYieldHistory(crop)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [crop]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const hasSeries = !!data?.available && data.series.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{t.dashboard.trendTitle}</CardTitle>
          <CardDescription>
            {hasSeries
              ? `${tCrop(data!.crop, data!.display)} - ${t.dashboard.trendSubtitle}`
              : t.dashboard.trendSubtitle}
          </CardDescription>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-tool-yield/10 text-tool-yield">
          <LineChart className="size-4.5" />
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <p>{t.common.error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              {t.common.retry}
            </Button>
          </div>
        ) : hasSeries ? (
          <YieldTrendChart series={data!.series} predicted={null} />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            {t.yield.empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
