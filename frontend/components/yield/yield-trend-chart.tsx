"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YieldHistoryPoint } from "@/lib/types";

export function YieldTrendChart({
  series,
  predicted,
}: {
  series: YieldHistoryPoint[];
  predicted?: { year: number; value: number } | null;
}) {
  const data = series.map((p) => ({ year: p.year, value: p.yield_t_per_ha }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
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
            formatter={(value: unknown) => [`${value} t/ha`, "Yield"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {predicted && (
            <ReferenceDot
              x={predicted.year}
              y={predicted.value}
              r={5}
              fill="var(--color-chart-2)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
