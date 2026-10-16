import { cn } from "@/lib/cn";

/** A compact inline bar with its percentage, for table cells. */
export function MiniBar({
  value,
  tone = "accent",
  className,
}: {
  value: number;
  tone?: "accent" | "risk" | "growth";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-strong" aria-hidden>
        <div
          className={cn("h-full rounded-full", tone === "risk" ? "bg-risk" : tone === "growth" ? "bg-growth" : "bg-chart-1")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-sm font-medium tabular-nums text-ink">{pct}%</span>
    </div>
  );
}
