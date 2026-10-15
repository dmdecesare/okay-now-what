"use client";

/** Shared tooltip card. Text uses ink tokens; the swatch carries series identity. */
export function TooltipCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; color?: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-bg px-3 py-2 text-sm shadow-sm">
      <p className="mb-1 font-semibold">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2 text-ink-muted">
          {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden />}
          <span>{r.label}</span>
          <span className="ml-auto pl-4 font-medium tabular-nums text-ink">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

export const CHART = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  surface: "var(--bg)",
  tick: { fill: "var(--chart-axis)", fontSize: 12 },
} as const;
