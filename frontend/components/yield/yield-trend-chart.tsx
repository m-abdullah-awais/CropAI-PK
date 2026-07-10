"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YieldHistoryPoint } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const TEAL = "var(--color-tool-yield)";

export function YieldTrendChart({
  series,
  predicted,
  lastRealYear,
}: {
  series: YieldHistoryPoint[];
  predicted?: { year: number; value: number } | null;
  lastRealYear?: number | null;
}) {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  const lastReal =
    lastRealYear ?? (series.length ? series[series.length - 1].year : undefined);
  const isForecast =
    !!predicted && lastReal != null && predicted.year > lastReal;

  const rows: { year: number; real: number | null; forecast: number | null }[] =
    series.map((p) => ({
      year: p.year,
      real: p.yield_t_per_ha,
      // Bridge the dashed forecast segment to the last recorded point.
      forecast: isForecast && p.year === lastReal ? p.yield_t_per_ha : null,
    }));
  if (isForecast && predicted) {
    rows.push({ year: predicted.year, real: null, forecast: predicted.value });
  }

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 48, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="yieldReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.32} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yieldForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.12} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              width={48}
              label={{
                value: "t/ha",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "var(--muted-foreground)" },
              }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(value: unknown, name: unknown) => [
                `${value} t/ha`,
                name === "forecast" ? t.yield.forecast : t.yield.recorded,
              ]}
            />
            <Area
              type="monotone"
              dataKey="real"
              stroke={TEAL}
              strokeWidth={2}
              fill="url(#yieldReal)"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={!reduced}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke={TEAL}
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#yieldForecast)"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={!reduced}
            />
            {isForecast && predicted && (
              <ReferenceDot
                x={predicted.year}
                y={predicted.value}
                r={5}
                fill={TEAL}
                stroke="var(--background)"
                strokeWidth={2}
                label={{
                  value: `${predicted.year}: ${predicted.value} t/ha`,
                  position: "top",
                  style: { fontSize: 11, fontWeight: 600, fill: TEAL },
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: TEAL }} />
          {t.yield.recorded}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0 w-4 border-t-2 border-dashed"
            style={{ borderColor: TEAL }}
          />
          {t.yield.forecast}
        </span>
      </div>
    </div>
  );
}
