import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { listAccountSummaries, listCustomerLinks, type AccountSummary } from "@/db/queries";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { StageBadge, StatusPill } from "@/components/ui/badges";
import { ProgressBar, TrendArrow } from "@/components/ui/metrics";
import { formatNumber } from "@/lib/format";

export default function HomePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-display font-semibold">Book of business</h1>
        <p className="mt-1 text-ink-muted">Every account you own after the deal closes, in one place.</p>
      </div>
      <Suspense fallback={<AccountGridSkeleton />}>
        <AccountGrid />
      </Suspense>
    </>
  );
}

async function AccountGrid() {
  await connection();
  const [accounts, links] = await Promise.all([listAccountSummaries(), listCustomerLinks()]);
  const tokenBySlug = new Map(links.map((l) => [l.slug, l.token]));

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((a) => (
        <AccountCard key={a.id} account={a} token={tokenBySlug.get(a.slug)} />
      ))}
    </div>
  );
}

function AccountCard({ account: a, token }: { account: AccountSummary; token?: string }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{a.name}</h2>
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
        {token && (
          <Link href={`/c/${token}`} className="font-medium text-accent hover:text-accent-hover">
            Customer view
          </Link>
        )}
      </div>
    </Card>
  );
}

function AccountGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-surface" />
      ))}
    </div>
  );
}
