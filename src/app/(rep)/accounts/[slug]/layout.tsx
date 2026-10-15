import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAccountDetail } from "@/db/queries";
import { AccountTabNav } from "@/components/account/tab-nav";
import { ShareButton } from "@/components/account/share-button";
import { LiveRefresh } from "@/components/live-refresh";
import { StageBadge, StatusPill } from "@/components/ui/badges";
import { daysBetween, todayISO } from "@/lib/dates";
import { formatNumber } from "@/lib/format";

export default function AccountLayout({ children, params }: LayoutProps<"/accounts/[slug]">) {
  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <span aria-hidden>&larr;</span> Book of business
      </Link>
      <Suspense fallback={<HeaderSkeleton />}>
        <AccountHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function AccountHeader({ params }: { params: LayoutProps<"/accounts/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  const d = await getAccountDetail(slug);
  // Unknown slug: the page itself renders the not-found message.
  if (!d) return null;

  const { account: a } = d;
  const renewalIn = a.renewalDate ? daysBetween(todayISO(), a.renewalDate) : null;

  return (
    <header className="space-y-5">
      {/* Picks up customer check-offs and visits without a manual reload. */}
      <LiveRefresh />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-display font-semibold">{a.name}</h1>
            <StatusPill status={d.health.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
            <span>{a.industry}</span>
            {a.employees && (
              <>
                <span aria-hidden>·</span>
                <span>{formatNumber(a.employees)} employees</span>
              </>
            )}
            <span aria-hidden>·</span>
            <StageBadge stage={a.stage} />
            <span>
              Day {d.stageDay}
              {a.pilotLengthDays ? ` of ${a.pilotLengthDays}` : ""}
            </span>
            <span aria-hidden>·</span>
            <span>{formatNumber(a.seats)} seats</span>
            {renewalIn != null && (
              <>
                <span aria-hidden>·</span>
                <span>Renews in {renewalIn} days</span>
              </>
            )}
          </div>
        </div>
        <ShareButton token={a.customerToken} />
      </div>
      <AccountTabNav slug={a.slug} questionCount={d.questions.length} />
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-10 w-80 max-w-full animate-pulse rounded bg-surface" />
      <div className="h-5 w-96 max-w-full animate-pulse rounded bg-surface" />
      <div className="h-10 animate-pulse rounded bg-surface" />
    </div>
  );
}
