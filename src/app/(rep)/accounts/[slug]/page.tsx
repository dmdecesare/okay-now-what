import { Suspense } from "react";
import { MessageSquareQuote, NotebookPen, ShieldQuestion, Target, UserRound, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SuccessCriteriaList } from "@/components/account/success-criteria";
import { NewAccountBanner } from "@/components/account/new-account-banner";
import { daysBetween } from "@/lib/dates";
import { loadAccount } from "./load";

export default function OverviewPage({ params, searchParams }: PageProps<"/accounts/[slug]">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Overview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({
  params,
  searchParams,
}: Pick<PageProps<"/accounts/[slug]">, "params" | "searchParams">) {
  const { account, profile } = await loadAccount(params);
  const justBuilt = (await searchParams).new === "1";
  const lastVisit = account.championLastVisitAt
    ? daysBetween(account.championLastVisitAt, new Date())
    : null;

  return (
    <div className="space-y-6">
      {justBuilt && <NewAccountBanner name={account.name} token={account.customerToken} />}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-0">
            <CardHeader icon={<MessageSquareQuote className="size-4" />} title="What we heard" description={profile.summary} />
            <CardBody>
              {profile.goals.length === 0 && (
                <p className="text-sm text-ink-faint">No goals came through in the notes yet.</p>
              )}
              <ul className="space-y-3">
                {profile.goals.map((g, i) => (
                  <li key={g.goal} className="flex gap-3 rounded-lg border border-border bg-surface/50 p-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{g.goal}</p>
                      <p className="mt-0.5 text-sm italic text-ink-muted">&ldquo;{g.inTheirWords}&rdquo;</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {profile.successCriteria.length > 0 && (
            <Card className="p-0">
              <CardHeader icon={<Target className="size-4" />} title="Pilot success criteria" />
              <CardBody>
                <SuccessCriteriaList criteria={profile.successCriteria} />
              </CardBody>
            </Card>
          )}

          <Card className="p-0">
            <CardHeader icon={<ShieldQuestion className="size-4" />} title="Concerns raised during the deal" />
            <CardBody>
              {profile.concerns.length === 0 && (
                <p className="text-sm text-ink-faint">None noted. Worth asking what could slow them down.</p>
              )}
              <ul className="divide-y divide-border">
                {profile.concerns.map((c) => (
                  <li key={c.concern} className="py-3 first:pt-0 last:pb-0">
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
            </CardBody>
          </Card>

          <details className="group rounded-xl border border-border bg-bg shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold">
              <span className="flex items-center gap-2.5">
                <NotebookPen className="size-4 text-ink-faint" />
                Original deal notes
              </span>
              <span className="text-sm font-normal text-ink-muted group-open:hidden">Show</span>
              <span className="hidden text-sm font-normal text-ink-muted group-open:inline">Hide</span>
            </summary>
            <p className="whitespace-pre-wrap border-t border-border bg-surface/50 px-5 py-4 font-mono text-sm text-ink-muted" data-deal-notes>
              {account.dealNotes}
            </p>
          </details>
        </div>

        <div className="space-y-6">
          <Card className="p-0">
            <CardHeader icon={<UserRound className="size-4" />} title="Champion" />
            <CardBody>
              <p className="font-semibold">{profile.champion.name ?? "Not named yet"}</p>
              <p className="text-sm text-ink-muted">{profile.champion.title}</p>
              <p className="mt-3 text-sm">{profile.champion.notes}</p>
              <p className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm text-ink-muted">
                <span
                  className={`size-2 rounded-full ${lastVisit != null && lastVisit >= 14 ? "bg-risk" : lastVisit == null ? "bg-ink-faint" : "bg-ok"}`}
                  aria-hidden
                />
                {lastVisit == null
                  ? "Hasn't opened the customer portal yet"
                  : lastVisit === 0
                    ? "Opened the customer portal today"
                    : `Last opened the customer portal ${lastVisit} ${lastVisit === 1 ? "day" : "days"} ago`}
              </p>
            </CardBody>
          </Card>

          <Card className="p-0">
            <CardHeader icon={<Users className="size-4" />} title="Stakeholders" />
            <CardBody>
              {profile.stakeholders.length === 0 && (
                <p className="text-sm text-ink-faint">No one else named yet. Ask who signs off and who rolls it out.</p>
              )}
              <ul className="space-y-3">
                {profile.stakeholders.map((s) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-xs font-semibold text-ink-muted" aria-hidden>
                      {(s.name ?? s.title).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {s.name ? `${s.name}, ` : ""}
                        {s.title}
                      </p>
                      <p className="text-sm text-ink-muted">{s.notes}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
