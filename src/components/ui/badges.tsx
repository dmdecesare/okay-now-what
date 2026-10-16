import { STAGE_LABELS } from "@/lib/constants";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/health";
import { EXPANSION_LABELS, type ExpansionLevel } from "@/lib/expansion";
import type { Stage } from "@/lib/schemas";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "ok" | "watch" | "risk" | "growth";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-surface-strong text-ink-muted ring-border",
  accent: "bg-accent-soft text-accent-ink ring-accent/15",
  ok: "bg-ok-soft text-ok ring-ok/15",
  watch: "bg-watch-soft text-watch ring-watch/15",
  risk: "bg-risk-soft text-risk ring-risk/15",
  growth: "bg-growth-soft text-growth ring-growth/15",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  return <Badge tone="neutral">{STAGE_LABELS[stage]}</Badge>;
}

const statusTone: Record<HealthStatus, Tone> = { on_track: "ok", watch: "watch", at_risk: "risk" };

const dotStyles: Record<HealthStatus, string> = {
  on_track: "bg-ok",
  watch: "bg-watch",
  at_risk: "bg-risk",
};

const darkDotStyles: Record<HealthStatus, string> = {
  on_track: "bg-ok-on-dark",
  watch: "bg-watch-on-dark",
  at_risk: "bg-risk-on-dark",
};

export function StatusPill({ status, className }: { status: HealthStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[statusTone[status]],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[status])} aria-hidden />
      {HEALTH_LABELS[status]}
    </span>
  );
}

/** A small health dot. Carries its label for screen readers, since color alone never carries meaning. */
export function HealthDot({ status, onDark, className }: { status: HealthStatus; onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", (onDark ? darkDotStyles : dotStyles)[status], className)}
      role="img"
      aria-label={HEALTH_LABELS[status]}
      title={HEALTH_LABELS[status]}
    />
  );
}

export function ExpansionPill({ level, className }: { level: ExpansionLevel; className?: string }) {
  if (level === "none") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles.growth,
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
        <path d="M2 8.5 5 5.5l2 2L10 4.5M7.5 4.5H10V7" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {EXPANSION_LABELS[level]}
    </span>
  );
}
