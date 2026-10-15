import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { displayStatus } from "@/lib/milestones";
import { todayISO } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { loadCustomer } from "./data";

export default function CustomerHomePage({ params }: PageProps<"/c/[token]">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <CustomerHome params={params} />
    </Suspense>
  );
}

async function CustomerHome({ params }: { params: PageProps<"/c/[token]">["params"] }) {
  const c = await loadCustomer(params);
  const today = todayISO();
  const firstName = c.profile.champion.name?.split(" ")[0];
  const done = c.milestones.filter((m) => m.status === "done").length;
  const next = c.milestones
    .filter((m) => m.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const base = `/c/${c.token}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title font-semibold">Welcome{firstName ? `, ${firstName}` : ""}.</h2>
        <p className="mt-1 text-ink-muted">
          Everything your team needs to get going with Copilot, in one place. Here&apos;s what we&apos;re working
          toward together.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {c.profile.goals.map((g) => (
          <Card key={g.goal} className="flex items-start gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
            <p className="font-medium">{g.goal}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-5 lg:col-span-2">
          <div>
            <h2 className="font-semibold">Your progress</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {done} of {c.milestones.length} plan milestones done
              {c.pilotLengthDays ? ` · Day ${c.stageDay} of your ${c.pilotLengthDays}-day pilot` : ""}
            </p>
          </div>
          <ProgressBar value={c.milestones.length ? (done / c.milestones.length) * 100 : 0} label="Plan progress" />
          {next && (
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Up next</p>
              <p className="mt-1 font-semibold">{next.title}</p>
              <p className="text-sm text-ink-muted">
                {displayStatus(next, today) === "overdue" ? "Was due" : "Due"} {formatDate(next.dueDate)}
              </p>
              <Link href={`${base}/plan`} className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-hover">
                Go to your plan
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">This week</h2>
          <ul className="mt-3 space-y-3">
            {c.profile.thisWeek.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href={`${base}/setup`} title="Setup guide" body="Admin and security steps, built around your questions." />
        <QuickLink href={`${base}/kit`} title="Champion kit" body="Launch email, session agenda, and a developer FAQ." />
        <QuickLink href={`${base}/guides`} title="Guides" body="From first install to agent mode, picked for your team." />
      </div>
    </div>
  );
}

function QuickLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-colors group-hover:border-border-strong group-hover:bg-surface/50">
        <p className="font-semibold group-hover:text-accent">{title}</p>
        <p className="mt-1 text-sm text-ink-muted">{body}</p>
      </Card>
    </Link>
  );
}
