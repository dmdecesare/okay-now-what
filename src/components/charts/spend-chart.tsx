"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, TooltipCard } from "./chart-tooltip";

export type SpendPoint = { label: string; seat: number; premium: number; total: number };

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K` : `$${n}`;

const axes = (
  <>
    <CartesianGrid vertical={false} stroke={CHART.grid} />
    <XAxis dataKey="label" tick={CHART.tick} tickLine={false} axisLine={{ stroke: CHART.grid }} />
    <YAxis tickFormatter={compact} tickCount={4} tick={CHART.tick} tickLine={false} axisLine={false} width={56} />
  </>
);

/** Monthly total, stacked: seats (bottom) and premium requests (top). */
export function SpendTotalChart({ data }: { data: SpendPoint[] }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-sm text-ink-muted" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: CHART.primary }} /> Seats
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: CHART.secondary }} /> Premium requests
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
            {axes}
            <Tooltip
              cursor={{ fill: "var(--surface)" }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as SpendPoint | undefined;
                if (!active || !p) return null;
                return (
                  <TooltipCard
                    title={p.label}
                    rows={[
                      { label: "Seats", value: usd(p.seat), color: CHART.primary },
                      { label: "Premium requests", value: usd(p.premium), color: CHART.secondary },
                      { label: "Total", value: usd(p.total) },
                    ]}
                  />
                );
              }}
            />
            {/* The surface-colored stroke is the 2px gap between stacked segments. */}
            <Bar dataKey="seat" stackId="s" fill={CHART.primary} stroke={CHART.surface} strokeWidth={2} maxBarSize={24} isAnimationActive={false} />
            <Bar
              dataKey="premium"
              stackId="s"
              fill={CHART.secondary}
              stroke={CHART.surface}
              strokeWidth={2}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            >
              <LabelList dataKey="total" position="top" formatter={(v) => compact(Number(v))} fontSize={12} fill="var(--ink-muted)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Premium request spend alone, on its own scale, so changes are visible. */
export function PremiumSpendChart({ data }: { data: SpendPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
          {axes}
          <Tooltip
            cursor={{ fill: "var(--surface)" }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as SpendPoint | undefined;
              if (!active || !p) return null;
              return <TooltipCard title={p.label} rows={[{ label: "Premium requests", value: usd(p.premium), color: CHART.secondary }]} />;
            }}
          />
          <Bar dataKey="premium" fill={CHART.secondary} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
            <LabelList dataKey="premium" position="top" formatter={(v) => usd(Number(v))} fontSize={12} fill="var(--ink-muted)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
