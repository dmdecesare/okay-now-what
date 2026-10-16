import { Activity } from "lucide-react";
import { CardBody, CardHeader } from "@/components/ui/card";
import { PULSE_LABELS, PULSE_WINDOW_DAYS, type PulseSummary } from "@/lib/pulse";

/** The developer pulse for one account: average, spread, and what's blocking people. */
export function PulseSummaryCard({ pulse }: { pulse: PulseSummary }) {
  const max = Math.max(1, ...pulse.distribution);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<Activity className="size-4" />}
        title="Developer pulse"
        description={`Anonymous weekly check-ins from the portal, last ${PULSE_WINDOW_DAYS} days.`}
      />
      <CardBody>
        {pulse.count === 0 ? (
          <p className="text-sm text-ink-muted">No answers yet. The pulse card is on the customer&apos;s portal home.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
            <div>
              <p className="text-kpi font-semibold tabular-nums">
                {pulse.average}
                <span className="text-sm font-medium text-ink-muted"> / 5</span>
              </p>
              <p className="text-xs text-ink-faint">{pulse.count} answers</p>
              <ul className="mt-3 space-y-1">
                {[5, 4, 3, 2, 1].map((n) => (
                  <li key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 tabular-nums text-ink-muted">{n}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong" aria-hidden>
                      <span
                        className={`block h-full rounded-full ${n <= 2 ? "bg-risk" : "bg-chart-1"}`}
                        style={{ width: `${(pulse.distribution[n - 1] / max) * 100}%` }}
                      />
                    </span>
                    <span className="w-5 text-right tabular-nums text-ink-faint">{pulse.distribution[n - 1]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-ink-faint">5 = {PULSE_LABELS[5].toLowerCase()}</p>
            </div>
            <div>
              <p className="text-micro font-medium uppercase text-ink-faint">What&apos;s blocking developers</p>
              {pulse.blockers.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">No blockers mentioned.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {pulse.blockers.map((b, i) => (
                    <li key={i} className="rounded-lg bg-surface px-3 py-2 text-sm">
                      &ldquo;{b.text}&rdquo;
                      <span className="ml-1.5 text-xs text-ink-faint">{b.daysAgo === 0 ? "today" : `${b.daysAgo}d ago`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </section>
  );
}
