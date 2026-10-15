"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, TooltipCard } from "./chart-tooltip";

export type AdoptionPoint = { date: string; label: string; pct: number; active: number };

/** % of purchased seats active over time. Single series, so the title names it (no legend). */
export function AdoptionChart({ data, seats }: { data: AdoptionPoint[]; seats: number }) {
  const peakIdx = data.reduce((best, d, i) => (d.pct > data[best].pct ? i : best), 0);
  const lastIdx = data.length - 1;
  // Label only the latest point and the peak (if it's a different point).
  const labeled = new Set([lastIdx, ...(peakIdx !== lastIdx && data[peakIdx].pct > data[lastIdx].pct ? [peakIdx] : [])]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 24, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis
            dataKey="label"
            tick={CHART.tick}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={CHART.tick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as AdoptionPoint | undefined;
              if (!active || !p) return null;
              return (
                <TooltipCard
                  title={p.label}
                  rows={[
                    { label: "Active", value: `${p.pct}%`, color: CHART.primary },
                    { label: "Seats", value: `${p.active} of ${seats}` },
                  ]}
                />
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke={CHART.primary}
            strokeWidth={2}
            fill={CHART.primary}
            fillOpacity={0.1}
            dot={(props) => {
              const { cx, cy, index } = props as { cx: number; cy: number; index: number };
              if (!labeled.has(index)) return <g key={index} />;
              return (
                <circle key={index} cx={cx} cy={cy} r={4.5} fill={CHART.primary} stroke={CHART.surface} strokeWidth={2} />
              );
            }}
            activeDot={{ r: 5, fill: CHART.primary, stroke: CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="pct"
              content={(props) => {
                const { x, y, index, value } = props as { x: number; y: number; index: number; value: number };
                if (!labeled.has(index)) return null;
                const text = index === lastIdx ? `${value}% now` : `Peak ${value}%`;
                return (
                  <text
                    key={index}
                    x={x}
                    y={y - 12}
                    textAnchor={index === lastIdx ? "end" : "middle"}
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--ink)"
                  >
                    {text}
                  </text>
                );
              }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
