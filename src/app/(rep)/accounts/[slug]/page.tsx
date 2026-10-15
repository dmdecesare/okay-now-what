import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SuccessCriteriaList } from "@/components/account/success-criteria";
import { daysBetween } from "@/lib/dates";
import { loadAccount } from "./load";

export default function OverviewPage({ params }: PageProps<"/accounts/[slug]">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: { params: PageProps<"/accounts/[slug]">["params"] }) {
  const { account, profile } = await loadAccount(params);
  const lastVisit = account.championLastVisitAt
    ? daysBetween(account.championLastVisitAt, new Date())
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <h2 className="font-semibold">What we heard</h2>
          <p className="mt-1 text-sm text-ink-muted">{profile.summary}</p>
          <ul className="mt-4 space-y-4">
            {profile.goals.map((g) => (
              <li key={g.goal} className="border-l-2 border-accent pl-4">
                <p className="font-medium">{g.goal}</p>
                <p className="mt-0.5 text-sm text-ink-muted">&ldquo;{g.inTheirWords}&rdquo;</p>
              </li>
            ))}
          </ul>
        </Card>

        {profile.successCriteria.length > 0 && (
          <Card>
            <h2 className="mb-4 font-semibold">Pilot success criteria</h2>
            <SuccessCriteriaList criteria={profile.successCriteria} />
          </Card>
        )}

        <Card>
          <h2 className="font-semibold">Concerns raised during the deal</h2>
          <ul className="mt-4 space-y-4">
            {profile.concerns.map((c) => (
              <li key={c.concern}>
                <p className="font-medium">
                  {c.concern} <span className="text-sm font-normal text-ink-faint">· {c.raisedBy}</span>
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  <span className="font-medium text-ink">Our plan: </span>
                  {c.response}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <details className="group rounded-xl border border-border bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold">
            Original deal notes
            <span className="text-sm font-normal text-ink-muted group-open:hidden">Show</span>
            <span className="hidden text-sm font-normal text-ink-muted group-open:inline">Hide</span>
          </summary>
          <p className="whitespace-pre-wrap border-t border-border px-5 py-4 font-mono text-sm text-ink-muted">
            {account.dealNotes}
          </p>
        </details>
      </div>

      <div className="space-y-6">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Champion</p>
          <p className="mt-2 font-semibold">{profile.champion.name ?? "Not named yet"}</p>
          <p className="text-sm text-ink-muted">{profile.champion.title}</p>
          <p className="mt-3 text-sm">{profile.champion.notes}</p>
          <p className="mt-3 border-t border-border pt-3 text-sm text-ink-muted">
            {lastVisit == null
              ? "Hasn't opened the customer app yet"
              : lastVisit === 0
                ? "Opened the customer app today"
                : `Last opened the customer app ${lastVisit} ${lastVisit === 1 ? "day" : "days"} ago`}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Stakeholders</p>
          <ul className="mt-3 space-y-4">
            {profile.stakeholders.map((s) => (
              <li key={s.title}>
                <p className="font-medium">
                  {s.name ? `${s.name}, ` : ""}
                  {s.title}
                </p>
                <p className="text-sm text-ink-muted">{s.notes}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
