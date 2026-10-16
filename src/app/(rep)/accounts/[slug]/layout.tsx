import { Suspense } from "react";
import { connection } from "next/server";
import { getAccountDetail, summarize } from "@/db/queries";
import { FileText } from "lucide-react";
import { AccountTabNav } from "@/components/account/tab-nav";
import { ButtonLink } from "@/components/ui/button";
import { ShareButton } from "@/components/account/share-button";
import { LiveRefresh } from "@/components/live-refresh";
import { AccountLogo } from "@/components/logos/account-logo";
import { ExpansionPill, StatusPill } from "@/components/ui/badges";
import { KeyFacts } from "@/components/ui/key-facts";
import { JourneyStepper } from "@/components/account/journey-stepper";
import { brandColor } from "@/lib/logos";
import { daysBetween } from "@/lib/dates";
import { formatNumber, formatUSD } from "@/lib/format";

export default function AccountLayout({ children, params }: LayoutProps<"/accounts/[slug]">) {
  return (
    <div className="space-y-6">
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
  const s = summarize(d);
  const lastVisit = a.championLastVisitAt ? daysBetween(a.championLastVisitAt, new Date()) : null;
  const spendChange =
    s.spendSeries.length >= 2
      ? Math.round(((s.spendSeries.at(-1)! - s.spendSeries.at(-2)!) / s.spendSeries.at(-2)!) * 1000) / 10
      : null;

  const brand = brandColor(a.name, a.slug);

  return (
    <header className="space-y-5">
      {/* Picks up customer check-offs and visits without a manual reload. */}
      <LiveRefresh />
      <section className="overflow-hidden rounded-2xl border border-border bg-bg shadow-card">
        <div
          className="relative h-20 sm:h-24"
          style={{
            background: `radial-gradient(70% 140% at 0% 0%, ${brand}55, transparent 70%), radial-gradient(60% 120% at 100% 0%, ${brand}26, transparent 70%), linear-gradient(180deg, ${brand}14, transparent)`,
          }}
          aria-hidden
        >
          <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgb(15_26_31/0.12)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-4 sm:-mt-10">
            <AccountLogo name={a.name} slug={a.slug} size={72} className="rounded-2xl ring-4 ring-bg" />
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <ButtonLink href={`/accounts/${a.slug}/brief`} size="sm">
                <FileText />
                Brief me
              </ButtonLink>
              <ShareButton token={a.customerToken} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-display font-semibold">{a.name}</h1>
              <StatusPill status={d.health.status} />
              <ExpansionPill level={d.expansion.level} />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {a.industry}
              {a.employees ? ` · ${formatNumber(a.employees)} employees` : ""}
              {d.profile.champion.name ? ` · Champion: ${d.profile.champion.name}, ${d.profile.champion.title}` : ""}
            </p>
          </div>

          <div className="mt-5 max-w-3xl">
            <JourneyStepper
              stage={a.stage}
              stageDay={d.stageDay}
              pilotLengthDays={a.pilotLengthDays}
              renewalInDays={s.renewalInDays}
            />
          </div>
        </div>

        <KeyFacts
          className="rounded-none border-x-0 border-b-0 shadow-none"
          items={[
            { label: "Seats", value: formatNumber(a.seats) },
            {
              label: "Active",
              value: s.activePct != null ? `${s.activePct}%` : "Not live yet",
              sub:
                s.activeChange != null && s.activeChange !== 0
                  ? `${s.activeChange > 0 ? "+" : ""}${s.activeChange} pts in 30 days`
                  : s.activeSeats != null
                    ? `${formatNumber(s.activeSeats)} seats`
                    : undefined,
            },
            {
              label: "Monthly spend",
              value: s.monthlySpend != null ? formatUSD(s.monthlySpend) : "-",
              sub: spendChange != null ? `${spendChange > 0 ? "+" : ""}${spendChange}% vs last month` : undefined,
            },
            {
              label: "Plan",
              value: `${d.milestones.filter((m) => m.status === "done").length} of ${d.milestones.length} done`,
              sub: s.overdueCount ? `${s.overdueCount} overdue` : "Nothing overdue",
            },
            {
              label: a.pilotLengthDays ? "Pilot ends" : "Renewal",
              value: a.pilotLengthDays
                ? `In ${Math.max(0, a.pilotLengthDays - d.stageDay)} days`
                : s.renewalInDays != null
                  ? `In ${s.renewalInDays} days`
                  : "-",
            },
            {
              label: "Champion last visit",
              value: lastVisit == null ? "Not yet" : lastVisit === 0 ? "Today" : `${lastVisit} days ago`,
            },
          ]}
        />
      </section>

      <div className="print:hidden">
        <AccountTabNav slug={a.slug} questionCount={d.questions.length} />
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-[300px] animate-pulse rounded-2xl border border-border bg-bg" />
      <div className="h-10 animate-pulse rounded bg-surface-strong" />
    </div>
  );
}
