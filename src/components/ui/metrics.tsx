import { cn } from "@/lib/cn";

export type Trend = "up" | "down" | "flat" | "none";

const trendStyles: Record<Exclude<Trend, "none">, { label: string; className: string; path: string }> = {
  up: { label: "Trending up", className: "text-ok", path: "M3 11 L8 5 L13 11" },
  down: { label: "Trending down", className: "text-risk", path: "M3 5 L8 11 L13 5" },
  flat: { label: "Flat", className: "text-ink-faint", path: "M3 8 L13 8" },
};

export function TrendArrow({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === "none") return <span className="text-ink-faint">-</span>;
  const t = trendStyles[trend];
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("inline-block size-4", t.className, className)}
      role="img"
      aria-label={t.label}
    >
      <path d={t.path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
  tone = "accent",
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  tone?: "accent" | "risk" | "growth";
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          {label && <span className="text-ink-muted">{label}</span>}
          {showValue && <span className="font-semibold tabular-nums">{pct}%</span>}
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-strong"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "risk" ? "bg-risk" : tone === "growth" ? "bg-growth" : "bg-chart-1",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: Trend;
}) {
  return (
    <div>
      <p className="text-micro font-medium uppercase text-ink-faint">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-kpi font-semibold tabular-nums">
        {value}
        {trend && <TrendArrow trend={trend} />}
      </p>
      {sub && <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>}
    </div>
  );
}

/** A KPI card: label, big number, a change chip, and an optional sparkline. */
export function KpiTile({
  label,
  value,
  change,
  sub,
  chart,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  /** Short change text with its direction, for example { text: "+6 pts", tone: "up" }. */
  change?: { text: string; tone: "up" | "down" | "neutral" };
  sub?: React.ReactNode;
  chart?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-bg p-4 shadow-card", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-kpi font-semibold tabular-nums">{value}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center rounded px-1 py-px font-medium tabular-nums",
                  change.tone === "up" && "bg-ok-soft text-ok",
                  change.tone === "down" && "bg-risk-soft text-risk",
                  change.tone === "neutral" && "bg-surface-strong text-ink-muted",
                )}
              >
                {change.text}
              </span>
            )}
            {sub && <span className="text-ink-faint">{sub}</span>}
          </div>
        </div>
        {chart && <div className="shrink-0">{chart}</div>}
      </div>
    </div>
  );
}
