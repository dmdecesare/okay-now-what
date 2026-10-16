"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, TooltipCard } from "./chart-tooltip";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usdShort = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000).toLocaleString("en-US")}k` : `$${n}`);

/** Estimated value vs. what they paid, per month. Two series, so it carries a legend. */
export function ValueVsCostChart({ data }: { data: { label: string; value: number; cost: number }[] }) {
  return (
    <div>
      <div className="mb-2 flex gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: CHART.primary }} aria-hidden /> Estimated value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: CHART.secondary }} aria-hidden /> What you paid
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" tick={CHART.tick} tickLine={false} axisLine={{ stroke: CHART.grid }} />
            <YAxis tickFormatter={usdShort} tick={CHART.tick} tickLine={false} axisLine={false} width={52} />
            <Tooltip
              cursor={{ fill: "var(--surface)" }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as { label: string; value: number; cost: number } | undefined;
                if (!active || !p) return null;
                return (
                  <TooltipCard
                    title={p.label}
                    rows={[
                      { label: "Estimated value", value: usd(p.value), color: CHART.primary },
                      { label: "What you paid", value: usd(p.cost), color: CHART.secondary },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="value" fill={CHART.primary} radius={[4, 4, 0, 0]} stroke={CHART.surface} strokeWidth={2} isAnimationActive={false} />
            <Bar dataKey="cost" fill={CHART.secondary} radius={[4, 4, 0, 0]} stroke={CHART.surface} strokeWidth={2} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Hours handed back to developers each month, over time. Single series. */
export function HoursChart({ data }: { data: { label: string; hours: number; activePct: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="label" tick={CHART.tick} tickLine={false} axisLine={{ stroke: CHART.grid }} minTickGap={24} />
          <YAxis tickFormatter={(v) => Number(v).toLocaleString("en-US")} tick={CHART.tick} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as { label: string; hours: number; activePct: number } | undefined;
              if (!active || !p) return null;
              return (
                <TooltipCard
                  title={p.label}
                  rows={[
                    { label: "Hours back a month", value: p.hours.toLocaleString("en-US"), color: CHART.primary },
                    { label: "Seats active", value: `${p.activePct}%` },
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="hours" stroke={CHART.primary} strokeWidth={2} fill={CHART.primary} fillOpacity={0.12} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
