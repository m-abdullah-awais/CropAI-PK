"use client";

import * as React from "react";
import { toast } from "sonner";
import { Target, Sprout, Wheat, Activity } from "lucide-react";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardTrend } from "@/components/dashboard/dashboard-trend";
import { getHealth, getMetrics } from "@/lib/api/ml";
import type { HealthResponse, MetricsResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

export default function DashboardPage() {
  const t = useT();

  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = React.useState(true);
  const [healthError, setHealthError] = React.useState(false);

  const [metrics, setMetrics] = React.useState<MetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(true);
  const [metricsError, setMetricsError] = React.useState(false);

  const [greeting, setGreeting] = React.useState<string | null>(null);

  const loadHealth = React.useCallback(() => {
    setHealthLoading(true);
    setHealthError(false);
    getHealth()
      .then(setHealth)
      .catch(() => {
        setHealthError(true);
        toast.error(t.health.offline);
      })
      .finally(() => setHealthLoading(false));
  }, [t.health.offline]);

  const loadMetrics = React.useCallback(() => {
    setMetricsLoading(true);
    setMetricsError(false);
    getMetrics()
      .then(setMetrics)
      .catch(() => setMetricsError(true))
      .finally(() => setMetricsLoading(false));
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHealth();
    loadMetrics();
  }, [loadHealth, loadMetrics]);

  // Time-aware greeting resolved after mount so SSR stays deterministic (no hydration
  // mismatch from the client clock).
  React.useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(
      h < 12
        ? t.dashboard.greetingMorning
        : h < 17
          ? t.dashboard.greetingAfternoon
          : t.dashboard.greetingEvening,
    );
  }, [t]);

  const acc = metrics?.recommendation?.accuracy;
  const top3 = metrics?.recommendation?.top3_accuracy;
  const mae = metrics?.yield?.forecast_mae_t_ha;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting ?? t.dashboard.greetingAfternoon}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      {/* Real-data KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiTile
          label={t.dashboard.kpiAccuracy}
          icon={Target}
          accent="recommend"
          countTo={acc != null ? acc * 100 : null}
          decimals={1}
          suffix="%"
          hint={
            top3 != null
              ? `${t.dashboard.kpiTop3} ${(top3 * 100).toFixed(1)}%`
              : t.dashboard.kpiTop3
          }
          loading={metricsLoading}
          error={metricsError}
          onRetry={loadMetrics}
        />
        <KpiTile
          label={t.dashboard.kpiCrops}
          icon={Sprout}
          accent="accent"
          countTo={health?.n_crops_recommendation ?? null}
          hint={t.dashboard.kpiCropsHint}
          loading={healthLoading}
          error={healthError}
          onRetry={loadHealth}
        />
        <KpiTile
          label={t.dashboard.kpiYieldCrops}
          icon={Wheat}
          accent="yield"
          countTo={health?.n_crops_yield ?? null}
          hint={t.dashboard.kpiYieldCropsHint}
          loading={healthLoading}
          error={healthError}
          onRetry={loadHealth}
        />
        <KpiTile
          label={t.dashboard.kpiForecastMae}
          icon={Activity}
          accent="rotation"
          countTo={mae ?? null}
          decimals={2}
          suffix="t/ha"
          hint={t.dashboard.kpiForecastMaeHint}
          loading={metricsLoading}
          error={metricsError}
          onRetry={loadMetrics}
        />
      </div>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t.dashboard.quickActionsTitle}
        </h2>
        <QuickActions />
      </section>

      {/* Real yield trend */}
      <DashboardTrend />
    </div>
  );
}
