import type { SuccessCriterion } from "@/lib/schemas";
import { cn } from "@/lib/cn";

const STATUS: Record<SuccessCriterion["status"], { label: string; className: string }> = {
  met: { label: "Met", className: "bg-ok-soft text-ok" },
  on_track: { label: "On track", className: "bg-accent-soft text-accent-ink" },
  behind: { label: "Behind", className: "bg-watch-soft text-watch" },
  not_started: { label: "Not started", className: "bg-surface-strong text-ink-muted" },
};

export function SuccessCriteriaList({ criteria }: { criteria: SuccessCriterion[] }) {
  return (
    <ul className="divide-y divide-border">
      {criteria.map((c) => (
        <li key={c.label} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="font-medium">{c.label}</p>
            <p className="text-sm text-ink-muted">
              Target: {c.target}
              {c.current ? ` · Now: ${c.current}` : ""}
            </p>
          </div>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS[c.status].className)}>
            {STATUS[c.status].label}
          </span>
        </li>
      ))}
    </ul>
  );
}
