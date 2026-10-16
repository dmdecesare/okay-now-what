import { CalendarRange, CheckCircle2, Flag, Handshake, Sparkles, Target, Trophy } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { Sparkline } from "@/components/ui/sparkline";
import { brandColor, type SeedLogoId } from "@/lib/logos";
import type { BusinessReview as Review } from "@/lib/schemas";
import { cn } from "@/lib/cn";

// The business review as the customer's executives see it. Customer-safe by construction: the props
// are the review itself plus numbers from the customer's own portal (no spend, health, or notes).

export type ReviewStats = {
  seats: number;
  activeSeats: number | null;
  activePct: number | null;
  adoption: number[];
  milestonesDone: number;
  milestonesTotal: number;
  learners: number;
  completions: number;
};

const GOAL_STATUS: Record<Review["goals"][number]["status"], { label: string; className: string }> = {
  achieved: { label: "Achieved", className: "bg-ok-soft text-ok ring-ok/15" },
  on_track: { label: "On track", className: "bg-accent-soft text-accent-ink ring-accent/15" },
  in_progress: { label: "In progress", className: "bg-growth-soft text-growth ring-growth/15" },
  not_started: { label: "Not started", className: "bg-surface-strong text-ink-muted ring-border" },
};

function Stat({ label, value, sub, chart }: { label: string; value: string; sub?: string; chart?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 rounded-xl border border-border bg-bg p-4">
      <div>
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <p className="mt-1 text-kpi font-semibold tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
      </div>
      {chart}
    </div>
  );
}

function Heading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted [&_svg]:size-4 [&_svg]:text-accent">
      {icon}
      {children}
    </h2>
  );
}

export function BusinessReviewView({
  name,
  logoId,
  review,
  stats,
  date,
}: {
  name: string;
  logoId: SeedLogoId | null;
  review: Review;
  stats: ReviewStats;
  date?: string;
}) {
  const brand = brandColor(name, null, logoId);
  const planPct = stats.milestonesTotal ? Math.round((stats.milestonesDone / stats.milestonesTotal) * 100) : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-bg shadow-card print:border-0 print:shadow-none">
      <header
        className="relative px-6 py-7 text-white sm:px-8"
        style={{ background: `linear-gradient(135deg, #0b1a17 0%, ${brand} 160%)` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AccountLogo name={name} logoId={logoId} size={40} className="ring-2 ring-white/20" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">
                {name} <span className="font-normal text-white/50">x</span> Copilot
              </p>
              <p className="text-xs text-white/60">Business review</p>
            </div>
          </div>
          <p className="text-xs text-white/60">
            {review.period}
            {date ? ` · ${date}` : ""}
          </p>
        </div>
        <h1 className="mt-6 max-w-3xl text-[1.6rem] font-semibold leading-tight tracking-tight">{review.title}</h1>
      </header>

      <div className="space-y-8 px-6 py-7 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Developers using Copilot"
            value={stats.activeSeats != null ? `${stats.activeSeats}` : "Not live yet"}
            sub={stats.activePct != null ? `${stats.activePct}% of ${stats.seats} seats` : undefined}
            chart={stats.adoption.length > 1 ? <Sparkline values={stats.adoption} width={64} height={24} /> : undefined}
          />
          <Stat label="Plan progress" value={`${planPct}%`} sub={`${stats.milestonesDone} of ${stats.milestonesTotal} milestones`} />
          <Stat label="Developers learning" value={`${stats.learners}`} sub="on a learning path" />
          <Stat label="Challenges completed" value={`${stats.completions}`} sub="hands-on, with official docs" />
        </div>

        <section>
          <Heading icon={<Sparkles />}>Summary</Heading>
          <p className="max-w-3xl text-[15px] leading-relaxed">{review.executiveSummary}</p>
        </section>

        <section>
          <Heading icon={<Target />}>Goals</Heading>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {review.goals.map((g) => (
              <li key={g.goal} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{g.goal}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{g.evidence}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                    GOAL_STATUS[g.status].className,
                  )}
                >
                  {GOAL_STATUS[g.status].label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <Heading icon={<Trophy />}>Wins</Heading>
            <ul className="space-y-3">
              {review.wins.map((w) => (
                <li key={w.title} className="flex gap-3 rounded-xl border border-border bg-surface/50 p-3.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">{w.title}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{w.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          {review.adoptionHighlights.length > 0 && (
            <section>
              <Heading icon={<Flag />}>Adoption highlights</Heading>
              <ul className="space-y-2.5">
                {review.adoptionHighlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-sm">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section>
          <Heading icon={<CalendarRange />}>The next 90 days</Heading>
          <ol className="relative space-y-3 border-l border-border pl-5">
            {review.nextQuarter.map((n) => (
              <li key={n.title} className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-bg" aria-hidden />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-ink-faint">
                    {n.owner} · {n.timing}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">{n.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {review.asks.length > 0 && (
          <section className="rounded-xl border border-accent/20 bg-accent-soft/50 p-4">
            <Heading icon={<Handshake />}>How you can help</Heading>
            <ul className="space-y-1.5 text-sm">
              {review.asks.map((a) => (
                <li key={a} className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="border-t border-border pt-4 text-xs text-ink-faint">
          Prepared by your GitHub account team with help from Claude. Numbers come from your Copilot usage and your
          onboarding plan.
        </p>
      </div>
    </article>
  );
}

/** The review's headline numbers, from the customer-safe view and learning path counts. */
export function reviewStats(
  view: { seats: number; usage: { date: string; activeSeats: number }[]; milestones: { status: string }[] },
  learning: { learners: number; completions: number },
): ReviewStats {
  const usage = [...view.usage].sort((a, b) => a.date.localeCompare(b.date));
  const latest = usage.at(-1);
  const pct = (n: number) => Math.round((n / view.seats) * 100);
  return {
    seats: view.seats,
    activeSeats: latest?.activeSeats ?? null,
    activePct: latest ? pct(latest.activeSeats) : null,
    adoption: usage.map((u) => pct(u.activeSeats)),
    milestonesDone: view.milestones.filter((m) => m.status === "done").length,
    milestonesTotal: view.milestones.length,
    learners: learning.learners,
    completions: learning.completions,
  };
}
