import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, LifeBuoy, Megaphone, PlayCircle, Target } from "lucide-react";
import { CardBody, CardHeader } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { Journey, journeyStep } from "@/components/customer/journey";
import { displayStatus } from "@/lib/milestones";
import { todayISO } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { brandColor } from "@/lib/logos";
import { cn } from "@/lib/cn";
import { getCustomerLearning, getCustomerSupport } from "@/db/queries";
import { HeadsUp } from "@/components/customer/heads-up";
import { FirstWeek } from "@/components/customer/first-week";
import { computeNudges } from "@/lib/nudges";
import { PulseCard } from "@/components/customer/pulse-card";
import { RequestHelp } from "@/components/customer/request-help";
import { HELP_KIND_LABELS } from "@/lib/support";
import { loadCustomer } from "./data";

export default function CustomerHomePage({ params }: PageProps<"/c/[token]">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <CustomerHome params={params} />
    </Suspense>
  );
}

function Ring({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="size-[84px] -rotate-90" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#5eead4"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  );
}

async function CustomerHome({ params }: { params: PageProps<"/c/[token]">["params"] }) {
  const c = await loadCustomer(params);
  const [supportRow, learning] = await Promise.all([getCustomerSupport(c.token), getCustomerLearning(c.token)]);
  const support = supportRow ?? { requests: [], pulse: { count: 0, average: null } };
  const nudges = computeNudges(
    { seats: c.seats, milestones: c.milestones, usage: c.usage, learners: learning?.learners ?? 0, pulseAnswers: support.pulse.count },
    "customer",
  );
  const today = todayISO();
  const firstName = c.profile.champion.name?.split(" ")[0];
  const done = c.milestones.filter((m) => m.status === "done").length;
  const pct = c.milestones.length ? Math.round((done / c.milestones.length) * 100) : 0;
  const open = c.milestones.filter((m) => m.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const next = open[0];
  const base = `/c/${c.token}`;
  const brand = brandColor(c.name, null, c.logoId);
  const step = journeyStep(c.stage, c.stageDay, c.pilotLengthDays, c.milestones.length ? done / c.milestones.length : 0);

  return (
    <div className="space-y-6">
      <section
        className="relative isolate overflow-hidden rounded-2xl text-white shadow-panel"
        style={{ background: `linear-gradient(135deg, #0b1a17 0%, ${brand} 140%)` }}
        aria-labelledby="welcome-heading"
      >
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_100%_0%,rgb(20_184_166/0.35),transparent_65%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden
        />
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#5eead4]">
              {c.pilotLengthDays ? `Day ${c.stageDay} of your ${c.pilotLengthDays}-day pilot` : `Day ${c.stageDay} with Copilot`}
            </p>
            <h1 id="welcome-heading" className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
              Welcome{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-white/75">
              Everything your team needs to get the most out of Copilot: your plan, guides picked for you, and answers
              any time.
            </p>
            {next && (
              <Link
                href={`${base}/plan`}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-white/90"
              >
                Up next: {next.title}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
            <div className="relative">
              <Ring value={pct} />
              <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums">{pct}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Your plan</p>
              <p className="text-sm text-white/70">
                {done} of {c.milestones.length} milestones done
              </p>
            </div>
          </div>
        </div>
      </section>

      <HeadsUp token={c.token} nudges={nudges} />

      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="mb-3 text-title font-semibold">
          Your journey
        </h2>
        <Journey current={step} />
      </section>

      <FirstWeek token={c.token} />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PulseCard token={c.token} average={support.pulse.average} count={support.pulse.count} />
        <section className="rounded-xl border border-border bg-bg p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <LifeBuoy className="size-4" />
              </span>
              <div>
                <h2 className="font-semibold">Need a hand?</h2>
                <p className="text-sm text-ink-muted">Book a session or flag a blocker. Your account team sees it right away.</p>
              </div>
            </div>
            <RequestHelp token={c.token} variant="card" />
          </div>
          {support.requests.length > 0 && (
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
              {support.requests.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink-faint">{HELP_KIND_LABELS[r.kind].label}</p>
                    <p className="line-clamp-2">{r.message}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      r.status === "resolved" ? "bg-ok-soft text-ok" : "bg-surface-strong text-ink-muted",
                    )}
                  >
                    {r.status === "resolved" ? "Done" : "With your account team"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card lg:col-span-2">
          <CardHeader icon={<Target className="size-4" />} title="What we're working toward" description="The goals your team set for Copilot." />
          <CardBody>
            <ul className="grid gap-3 sm:grid-cols-2">
              {c.profile.goals.map((g, i) => (
                <li key={g.goal} className="flex gap-3 rounded-lg border border-border bg-surface/50 p-3.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium">{g.goal}</p>
                </li>
              ))}
            </ul>
          </CardBody>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
          <CardHeader icon={<CalendarCheck className="size-4" />} title="This week" />
          <CardBody>
            {c.profile.thisWeek.length === 0 && <p className="text-sm text-ink-faint">Nothing urgent this week. Nice work.</p>}
            <ul className="space-y-3">
              {c.profile.thisWeek.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </CardBody>
        </section>
      </div>

      {open.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
          <CardHeader
            icon={<ClipboardCheck className="size-4" />}
            title="Coming up in your plan"
            action={
              <Link href={`${base}/plan`} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover">
                See the full plan <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {open.slice(0, 3).map((m) => {
              const overdue = displayStatus(m, today) === "overdue";
              return (
                <li key={m.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="truncate text-xs text-ink-muted">{m.description}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      overdue ? "bg-watch-soft text-watch" : "bg-surface-strong text-ink-muted",
                    )}
                  >
                    {overdue ? "Was due" : "Due"} {formatDate(m.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href={`${base}/setup`} icon={<ClipboardCheck className="size-5" />} title="Setup guide" body="Admin and security steps, built around your questions." />
        <QuickLink href={`${base}/kit`} icon={<Megaphone className="size-5" />} title="Champion kit" body="Launch email, session agenda, and a developer FAQ." />
        <QuickLink href={`${base}/guides`} icon={<BookOpen className="size-5" />} title="Guides" body="From first install to agent mode, picked for your team." />
      </div>
      <QuickLink
        href={`${base}/videos`}
        icon={<PlayCircle className="size-5" />}
        title="Short official videos"
        body="Send the right ones to your developers in one click."
        wide
      />
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  body,
  wide,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  wide?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border bg-bg p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30",
        wide && "sm:items-center",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold group-hover:text-accent">{title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{body}</p>
      </div>
      <ArrowRight className="mt-1 size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
