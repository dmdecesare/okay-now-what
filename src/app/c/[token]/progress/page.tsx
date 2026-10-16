import { Suspense } from "react";
import { LineChart } from "lucide-react";
import { PortalHeader } from "@/components/customer/portal-header";
import { Card, EmptyState } from "@/components/ui/card";
import { Stat } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SuccessCriteriaList } from "@/components/account/success-criteria";
import { AdoptionChart } from "@/components/charts/adoption-chart";
import { pct, sortSnapshots } from "@/lib/adoption";
import { formatDate, formatNumber } from "@/lib/format";
import { loadCustomer } from "../data";

export default function ProgressPage({ params }: PageProps<"/c/[token]/progress">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Progress params={params} />
    </Suspense>
  );
}

async function Progress({ params }: { params: PageProps<"/c/[token]/progress">["params"] }) {
  const c = await loadCustomer(params);
  const usage = sortSnapshots(c.usage);
  const latest = usage.at(-1);

  return (
    <div className="space-y-6">
      <PortalHeader
        icon={<LineChart />}
        title="Progress"
        description="How Copilot use is growing across your teams. A good place to spot your next champions."
      />
      {c.profile.successCriteria.length > 0 && (
        <Card>
          <h2 className="font-semibold">Pilot success criteria</h2>
          <p className="mb-4 mt-1 text-sm text-ink-muted">Where you are against each goal for the pilot.</p>
          <SuccessCriteriaList criteria={c.profile.successCriteria} />
        </Card>
      )}

      {!latest ? (
        <EmptyState
          title="Your numbers will show up here"
          body="Once your team starts using Copilot, you'll see active seats and team progress here."
        />
      ) : (
        <>
          <Card className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Stat label="Developers using Copilot" value={formatNumber(latest.activeSeats)} sub={`of ${formatNumber(c.seats)} seats`} />
            <Stat label="Share of seats active" value={`${pct(latest.activeSeats, c.seats)}%`} />
            <Stat label="As of" value={formatDate(latest.date)} />
          </Card>

          <Card>
            <h2 className="font-semibold">Active seats over time</h2>
            <p className="mb-4 mt-1 text-sm text-ink-muted">Share of your {formatNumber(c.seats)} seats in use each week.</p>
            <AdoptionChart
              data={usage.map((u) => ({
                date: u.date,
                label: formatDate(u.date),
                pct: pct(u.activeSeats, c.seats),
                active: u.activeSeats,
              }))}
              seats={c.seats}
            />
          </Card>

          <Card>
            <h2 className="font-semibold">Teams</h2>
            <p className="mb-4 mt-1 text-sm text-ink-muted">Most active teams first. A good place to find your next champions.</p>
            <ul className="space-y-3">
              {[...latest.teams]
                .sort((a, b) => pct(b.active, b.seats) - pct(a.active, a.seats))
                .map((t) => (
                  <li key={t.team}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{t.team}</span>
                      <span className="text-sm tabular-nums text-ink-muted">
                        {t.active} of {t.seats} · {pct(t.active, t.seats)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-strong">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct(t.active, t.seats)}%` }} />
                    </div>
                  </li>
                ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
