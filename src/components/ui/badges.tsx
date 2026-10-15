import { STAGE_LABELS } from "@/lib/constants";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/health";
import type { Stage } from "@/lib/schemas";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tone === "accent" ? "bg-accent-soft text-accent-ink" : "bg-surface-strong text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  return <Badge tone="accent">{STAGE_LABELS[stage]}</Badge>;
}

const statusStyles: Record<HealthStatus, string> = {
  on_track: "bg-ok-soft text-ok",
  watch: "bg-watch-soft text-watch",
  at_risk: "bg-risk-soft text-risk",
};

const dotStyles: Record<HealthStatus, string> = {
  on_track: "bg-ok",
  watch: "bg-watch",
  at_risk: "bg-risk",
};

export function StatusPill({ status }: { status: HealthStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[status])} aria-hidden />
      {HEALTH_LABELS[status]}
    </span>
  );
}
