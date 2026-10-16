import { Suspense } from "react";
import { connection } from "next/server";
import { Building2 } from "lucide-react";
import { getBook, getSummaries, type AccountSummary } from "@/db/queries";
import { AtRiskPanel } from "@/components/at-risk-panel";
import { ExpansionPanel } from "@/components/home/expansion-panel";
import { AccountsTable } from "@/components/home/accounts-table";
import { HeroLink, HomeHero, weekSummary, type HeroStat } from "@/components/home/hero";
import { SeatUtilization } from "@/components/home/seat-utilization";
import { PortfolioHealth } from "@/components/home/portfolio-health";
import { ActivityFeed } from "@/components/home/activity-feed";
import { Upcoming } from "@/components/home/upcoming";
import { HeroAskClaude } from "@/components/rep-chat/rep-chat";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { recentActivity, upcoming } from "@/lib/activity";
import { formatNumber, formatUSD } from "@/lib/format";
import { pct } from "@/lib/adoption";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Book />
    </Suspense>
  );
}

async function Book() {
  await connection();
  const [accounts, book] = await Promise.all([getSummaries(), getBook()]);
  const now = new Date();

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="size-5" />}
        title="No accounts yet. Okay, now what?"
        body="Add your first one. Paste your deal notes and Claude builds the plan and the customer's success portal."
        action={<ButtonLink href="/accounts/new">Add account</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <HomeHero
        date={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        summary={weekSummary(accounts)}
        stats={heroStats(accounts)}
        actions={
          <>
            <HeroAskClaude />
            <HeroLink href="/behind-the-build">How this was built</HeroLink>
          </>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AtRiskPanel accounts={accounts} />
        <ExpansionPanel accounts={accounts} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeatUtilization accounts={accounts} />
        </div>
        <PortfolioHealth accounts={accounts} />
      </div>

      <AccountsTable accounts={accounts} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed events={recentActivity(book, 7, now)} />
        </div>
        <Upcoming items={upcoming(book, 6, now)} />
      </div>
    </div>
  );
}

/**
 * Total monthly spend across accounts, oldest first. Only accounts with the full window count, so a
 * newly added account doesn't look like growth.
 */
function bookSpendSeries(accounts: AccountSummary[]): number[] {
  const withData = accounts.filter((a) => a.spendSeries.length >= 2);
  if (withData.length === 0) return [];
  const len = Math.min(...withData.map((a) => a.spendSeries.length));
  return Array.from({ length: len }, (_, i) =>
    withData.reduce((n, a) => n + a.spendSeries[a.spendSeries.length - len + i], 0),
  );
}

function heroStats(accounts: AccountSummary[]): HeroStat[] {
  const seats = accounts.reduce((n, a) => n + a.seats, 0);
  const live = accounts.filter((a) => a.activeSeats != null);
  const activeSeats = live.reduce((n, a) => n + (a.activeSeats ?? 0), 0);
  const liveSeats = live.reduce((n, a) => n + a.seats, 0);
  const activeNow = liveSeats > 0 ? pct(activeSeats, liveSeats) : null;
  const change =
    liveSeats > 0 ? Math.round(live.reduce((n, a) => n + (a.activeChange ?? 0) * a.seats, 0) / liveSeats) : 0;

  const spendNow = accounts.reduce((n, a) => n + (a.monthlySpend ?? 0), 0);
  const spendSeries = bookSpendSeries(accounts);
  const prev = spendSeries.at(-2);
  const last = spendSeries.at(-1);
  const spendChange = prev && last ? Math.round(((last - prev) / prev) * 1000) / 10 : null;

  const renewals = accounts
    .filter((a) => a.renewalInDays != null)
    .sort((a, b) => (a.renewalInDays ?? 0) - (b.renewalInDays ?? 0));
  const ready = accounts.filter((a) => a.expansion.level !== "none").length;

  return [
    {
      label: "Accounts",
      value: accounts.length,
      sub: `${formatNumber(seats)} seats under contract`,
    },
    {
      label: "Active across book",
      value: activeNow != null ? `${activeNow}%` : "-",
      sub: change ? `${change > 0 ? "+" : ""}${change} pts in 30 days` : `${formatNumber(activeSeats)} active seats`,
      tone: change > 0 ? "up" : change < 0 ? "down" : undefined,
    },
    {
      label: "Monthly spend",
      value: formatUSD(spendNow),
      sub: spendChange != null ? `${spendChange > 0 ? "+" : ""}${spendChange}% vs last month` : "This month",
      tone: spendChange != null ? (spendChange >= 0 ? "up" : "down") : undefined,
      spark: spendSeries,
    },
    {
      label: "Growth and renewals",
      value: `${ready} ready to grow`,
      sub: renewals[0] ? `Next renewal in ${renewals[0].renewalInDays} days` : undefined,
    },
  ];
}

function HomeSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-[260px] animate-pulse rounded-2xl bg-sidebar/90" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl border border-border bg-bg" />
        <div className="h-56 animate-pulse rounded-xl border border-border bg-bg" />
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-border bg-bg" />
    </div>
  );
}
