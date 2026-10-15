import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { listAccountSummaries, type AccountSummary } from "@/db/queries";
import { AtRiskPanel } from "@/components/at-risk-panel";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { StageBadge, StatusPill } from "@/components/ui/badges";
import { ProgressBar, Stat, TrendArrow } from "@/components/ui/metrics";
import { formatNumber, formatUSD } from "@/lib/format";
import { pct } from "@/lib/adoption";

export default function HomePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-display font-semibold">Book of business</h1>
        <p className="mt-1 text-ink-muted">Every account you own after the deal closes, in one place.</p>
      </div>
      <Suspense fallback={<HomeSkeleton />}>
        <Book />
      </Suspense>
    </>
  );
}

async function Book() {
  await connection();
  const accounts = await listAccountSummaries();

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts yet. Okay, now what?"
        body="Add your first one. Paste your deal notes and we'll build the plan and the customer's onboarding app."
        action={<ButtonLink href="/accounts/new">Add account</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <AtAGlance accounts={accounts} />
      <AtRiskPanel accounts={accounts} />
      <section aria-labelledby="accounts-heading">
        <h2 id="accounts-heading" className="sr-only">
          Accounts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AtAGlance({ accounts }: { accounts: AccountSummary[] }) {
  const seats = accounts.reduce((n, a) => n + a.seats, 0);
  const live = accounts.filter((a) => a.activeSeats != null);
  const activeSeats = live.reduce((n, a) => n + (a.activeSeats ?? 0), 0);
  const liveSeats = live.reduce((n, a) => n + a.seats, 0);
  const spend = accounts.reduce((n, a) => n + (a.monthlySpend ?? 0), 0);

  return (
    <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4">
      <Stat label="Accounts" value={accounts.length} />
      <Stat label="Seats" value={formatNumber(seats)} />
      <Stat
        label="Active across book"
        value={liveSeats > 0 ? `${pct(activeSeats, liveSeats)}%` : "-"}
        sub={`${formatNumber(activeSeats)} active seats`}
      />
      <Stat label="Monthly spend" value={formatUSD(spend)} sub="This month" />
    </Card>
  );
}

function AccountCard({ account: a }: { account: AccountSummary }) {
  return (
    <Link
      href={`/accounts/${a.slug}`}
      className="group block rounded-xl focus-visible:outline-offset-4"
    >
      <Card className="flex h-full flex-col gap-4 transition-colors group-hover:border-border-strong group-hover:bg-surface/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold group-hover:text-accent">{a.name}</h3>
            <p className="text-sm text-ink-muted">{a.industry}</p>
          </div>
          <StatusPill status={a.health.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <StageBadge stage={a.stage} />
          <span>Day {a.stageDay}</span>
          <span aria-hidden>·</span>
          <span>{formatNumber(a.seats)} seats</span>
        </div>

        {a.activePct != null ? (
          <ProgressBar value={a.activePct} label={`${formatNumber(a.activeSeats ?? 0)} active seats`} />
        ) : (
          <p className="text-sm text-ink-faint">No usage data yet</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-ink-muted">
            Spend <TrendArrow trend={a.spendTrend} />
          </span>
          <span className="tabular-nums text-ink-muted">
            {a.monthlySpend != null ? `${formatUSD(a.monthlySpend)}/mo` : "-"}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8" aria-busy>
      <div className="h-24 animate-pulse rounded-xl bg-surface" />
      <div className="h-32 animate-pulse rounded-xl bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
