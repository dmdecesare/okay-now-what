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
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
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
        className="h-2 overflow-hidden rounded-full bg-surface-strong"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
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
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular-nums">
        {value}
        {trend && <TrendArrow trend={trend} />}
      </p>
      {sub && <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>}
    </div>
  );
}
