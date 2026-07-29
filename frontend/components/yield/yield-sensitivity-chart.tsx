"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { YieldFactorName, YieldSensitivity } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const TEAL = "var(--color-tool-yield)";

function yieldAt(points: YieldSensitivity["points"], x: number): number {
  if (!points.length) return 0;
  if (x <= points[0].value) return points[0].yield_t_per_ha;
  const last = points[points.length - 1];
  if (x >= last.value) return last.yield_t_per_ha;
  for (let i = 1; i < points.length; i++) {
    if (points[i].value >= x) {
      const a = points[i - 1];
      const b = points[i];
      const f = b.value === a.value ? 0 : (x - a.value) / (b.value - a.value);
      return a.yield_t_per_ha + f * (b.yield_t_per_ha - a.yield_t_per_ha);
    }
  }
  return last.yield_t_per_ha;
}

export function YieldSensitivityChart({
  sensitivities,
  initialFeature,
}: {
  sensitivities: YieldSensitivity[];
  initialFeature?: YieldFactorName | null;
}) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const features = sensitivities.map((s) => s.feature);
  const [feature, setFeature] = React.useState<YieldFactorName>(
    initialFeature && features.includes(initialFeature)
      ? initialFeature
      : features[0],
  );

  const active =
    sensitivities.find((s) => s.feature === feature) ?? sensitivities[0];
  if (!active) return null;

  const rows = active.points.map((p) => ({ value: p.value, yield: p.yield_t_per_ha }));
  const currentY = yieldAt(active.points, active.current);
  const label = t.recommend.fields[active.feature];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{t.yield.whatIf}</p>
        <Tabs value={feature} onValueChange={(v) => setFeature(v as YieldFactorName)}>
          <TabsList className="h-8">
            {sensitivities.map((s) => (
              <TabsTrigger key={s.feature} value={s.feature}>
                {s.feature}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 16, bottom: 16, left: -6 }}>
            <defs>
              <linearGradient id="yieldSens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="value"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              label={{
                value: label,
                position: "insideBottom",
                offset: -8,
                style: { fontSize: 11, fill: "var(--muted-foreground)" },
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              width={44}
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
              formatter={(v: unknown) => [`${v} t/ha`, t.yield.estimatedShort]}
              labelFormatter={(v) => `${label}: ${v}`}
            />
            <ReferenceLine
              x={active.optimum}
              stroke={TEAL}
              strokeDasharray="4 4"
              label={{
                value: t.yield.optimum,
                position: "top",
                style: { fontSize: 10, fill: TEAL },
              }}
            />
            <Area
              type="monotone"
              dataKey="yield"
              stroke={TEAL}
              strokeWidth={2}
              fill="url(#yieldSens)"
              dot={false}
              isAnimationActive={!reduced}
            />
            <ReferenceDot
              x={active.current}
              y={currentY}
              r={5}
              fill={TEAL}
              stroke="var(--background)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground">
        {t.yield.current}: <span className="font-mono tabular-nums">{active.current}</span>
        {"  ·  "}
        {t.yield.optimum}: <span className="font-mono tabular-nums">{active.optimum}</span>
      </p>
    </div>
  );
}
