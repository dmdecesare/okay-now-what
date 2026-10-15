import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { InsightCard } from "@/components/account/insight-card";
import { refreshInsightAction } from "@/app/actions/ai";

import { NoUsageNote } from "@/components/account/no-usage-note";
import { AdoptionChart } from "@/components/charts/adoption-chart";
import { baselineSnapshot, biggestDrop, pct, sortSnapshots, teamPeaks, teamTrends } from "@/lib/adoption";
import { daysBetween } from "@/lib/dates";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { loadAccount } from "../load";

export default function AdoptionPage({ params }: PageProps<"/accounts/[slug]/adoption">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Adoption params={params} />
    </Suspense>
  );
}

async function Adoption({ params }: { params: PageProps<"/accounts/[slug]/adoption">["params"] }) {
  const { account, usage, insights } = await loadAccount(params);
  if (usage.length === 0) return <NoUsageNote title="No usage data yet" />;

  const sorted = sortSnapshots(usage);
  const latest = sorted.at(-1)!;
  const base = baselineSnapshot(sorted);
  const nowPct = pct(latest.activeSeats, account.seats);
  const basePct = base ? pct(base.activeSeats, account.seats) : null;
  const change = basePct == null ? null : nowPct - basePct;
  const sinceDays = base ? daysBetween(base.date, latest.date) : null;

  const trends = teamTrends(sorted).sort((a, b) => b.seats - a.seats);
  const peaks = teamPeaks(sorted);
  const drop = biggestDrop(trends);
  const nba = insights.next_best_action;

  const series = sorted.map((u) => ({
    date: u.date,
    label: formatDate(u.date),
    pct: pct(u.activeSeats, account.seats),
    active: u.activeSeats,
  }));

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Stat label="Active seats" value={formatNumber(latest.activeSeats)} sub={`of ${formatNumber(account.seats)} purchased`} />
        <Stat label="% active" value={`${nowPct}%`} />
        <Stat
          label={sinceDays ? `Change, last ${sinceDays} days` : "Change"}
          value={change == null ? "-" : `${change > 0 ? "+" : ""}${change} pts`}
          trend={change == null ? undefined : change > 0 ? "up" : change < 0 ? "down" : "flat"}
        />
        <Stat label="Last updated" value={formatDate(latest.date)} sub="Demo data" />
      </Card>

      <InsightCard
        title="Next best action"
        source={nba?.source}
        generatedAt={nba?.generatedAt}
        refresh={refreshInsightAction.bind(null, account.slug, "next_best_action")}
      >
        {!nba ? (
          <p className="text-sm text-ink-muted">Ask Claude for the one to three things that would move adoption most this week.</p>
        ) : (
          <ol className="space-y-3">
            {nba.content.actions.map((a, i) => (
              <li key={a.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-ink-muted">{a.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </InsightCard>

      <Card>
        <h2 className="font-semibold">Seats active over time</h2>
        <p className="mb-4 text-sm text-ink-muted">Share of {formatNumber(account.seats)} purchased seats active each week.</p>
        <AdoptionChart data={series} seats={account.seats} />
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-muted hover:text-ink">View as table</summary>
          <table className="mt-2 w-full max-w-sm text-left tabular-nums">
            <thead className="text-ink-faint">
              <tr>
                <th className="py-1 font-medium">Date</th>
                <th className="py-1 font-medium">Active</th>
                <th className="py-1 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.date} className="border-t border-border">
                  <td className="py-1">{p.label}</td>
                  <td className="py-1">{formatNumber(p.active)}</td>
                  <td className="py-1">{p.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Usage by team</h2>
          {drop && (
            <p className="text-sm text-risk">
              Biggest drop: {drop.team}, down {Math.abs(drop.change!)} points
            </p>
          )}
        </div>
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[520px] text-left text-sm tabular-nums">
            <thead className="text-ink-faint">
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Team</th>
                <th className="py-2 pr-4 font-medium">Active</th>
                <th className="w-40 py-2 pr-4 font-medium">% active</th>
                <th className="py-2 pr-4 font-medium">Peak</th>
                <th className="py-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((t) => {
                const isDrop = drop?.team === t.team;
                return (
                  <tr key={t.team} className={cn("border-b border-border last:border-0", isDrop && "bg-risk-soft/50")}>
                    <td className="py-2.5 pr-4 font-medium">{t.team}</td>
                    <td className="py-2.5 pr-4 text-ink-muted">
                      {t.active} of {t.seats}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-strong">
                          <div
                            className={cn("h-full rounded-full", isDrop ? "bg-risk" : "bg-accent")}
                            style={{ width: `${t.pct}%` }}
                          />
                        </div>
                        {t.pct}%
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">{peaks.get(t.team) ?? t.pct}%</td>
                    <td className={cn("py-2.5 font-medium", (t.change ?? 0) <= -10 ? "text-risk" : (t.change ?? 0) > 0 ? "text-ok" : "text-ink-muted")}>
                      {t.change == null ? "-" : `${t.change > 0 ? "+" : ""}${t.change} pts`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sinceDays && (
          <p className="mt-3 text-xs text-ink-faint">Change compares today with {sinceDays} days ago.</p>
        )}
      </Card>
    </div>
  );
}
