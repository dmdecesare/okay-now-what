import { HeartPulse } from "lucide-react";
import type { AccountSummary } from "@/db/queries";
import { CardHeader } from "@/components/ui/card";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/health";
import { EXPANSION_LABELS, type ExpansionLevel } from "@/lib/expansion";
import { cn } from "@/lib/cn";

const HEALTH_ORDER: HealthStatus[] = ["on_track", "watch", "at_risk"];
const HEALTH_BG: Record<HealthStatus, string> = { on_track: "bg-ok", watch: "bg-watch", at_risk: "bg-risk" };
const GROWTH_ORDER: ExpansionLevel[] = ["strong", "emerging", "none"];
const GROWTH_BG: Record<ExpansionLevel, string> = { strong: "bg-growth", emerging: "bg-growth/45", none: "bg-surface-strong" };

function Segmented<K extends string>({
  order,
  counts,
  colors,
  labels,
  total,
  title,
}: {
  order: K[];
  counts: Record<K, number>;
  colors: Record<K, string>;
  labels: Record<K, string>;
  total: number;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-faint">{title}</p>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${title}: ${order.map((k) => `${counts[k]} ${labels[k]}`).join(", ")}`}>
        {order
          .filter((k) => counts[k] > 0)
          .map((k) => (
            <div key={k} className={cn("h-full first:rounded-l-full last:rounded-r-full", colors[k])} style={{ width: `${(counts[k] / total) * 100}%` }} />
          ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {order.map((k) => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-muted">
              <span className={cn("size-2 rounded-full", colors[k])} aria-hidden />
              {labels[k]}
            </span>
            <span className="font-semibold tabular-nums">{counts[k]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** How the book splits by health and by growth signal. */
export function PortfolioHealth({ accounts }: { accounts: AccountSummary[] }) {
  const health = Object.fromEntries(HEALTH_ORDER.map((k) => [k, accounts.filter((a) => a.health.status === k).length])) as Record<HealthStatus, number>;
  const growth = Object.fromEntries(GROWTH_ORDER.map((k) => [k, accounts.filter((a) => a.expansion.level === k).length])) as Record<ExpansionLevel, number>;
  const onTrackPct = accounts.length ? Math.round((health.on_track / accounts.length) * 100) : 0;

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader icon={<HeartPulse className="size-4" />} title="Portfolio health" description={`${onTrackPct}% of accounts on track`} />
      <div className="space-y-6 px-5 py-5">
        <Segmented title="Health" order={HEALTH_ORDER} counts={health} colors={HEALTH_BG} labels={HEALTH_LABELS} total={accounts.length} />
        <Segmented title="Growth" order={GROWTH_ORDER} counts={growth} colors={GROWTH_BG} labels={EXPANSION_LABELS} total={accounts.length} />
      </div>
    </section>
  );
}
