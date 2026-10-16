import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AccountSummary } from "@/db/queries";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/cn";

export type HeroStat = {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  spark?: number[];
  tone?: "up" | "down";
};

/** One plain-English sentence about the week, built from the data (no AI, so it's always right). */
export function weekSummary(accounts: AccountSummary[]): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const short = (a: AccountSummary) => a.name.split(" ")[0];
  const link = (a: AccountSummary, href = `/accounts/${a.slug}`) => (
    <Link key={a.slug + href} href={href} className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
      {short(a)}
    </Link>
  );

  const flagged = accounts.filter((a) => a.health.status === "at_risk");
  if (flagged.length) {
    parts.push(
      <span key="risk">
        {flagged.map((a, i) => [i > 0 && (i === flagged.length - 1 ? " and " : ", "), link(a, `/accounts/${a.slug}/health`)])}{" "}
        {flagged.length === 1 ? "needs a recovery play" : "need recovery plays"}
      </span>,
    );
  }
  const pilot = accounts
    .filter((a) => a.pilotLengthDays)
    .map((a) => ({ a, left: a.pilotLengthDays! - a.stageDay }))
    .filter((p) => p.left >= 0)
    .sort((x, y) => x.left - y.left)[0];
  const ready = accounts.filter((a) => a.expansion.level === "strong");
  if (ready.length) {
    const pilotIsReady = pilot && ready.some((a) => a.id === pilot.a.id);
    parts.push(
      <span key="growth">
        {ready.map((a, i) => [i > 0 && (i === ready.length - 1 ? " and " : ", "), link(a, `/accounts/${a.slug}/health#growth`)])}{" "}
        {ready.length === 1 ? "is ready to grow" : "are ready to grow"}
        {pilotIsReady && ready.length === 1 ? `, with its pilot readout ${pilot.left} days out` : ""}
      </span>,
    );
    if (pilotIsReady && ready.length === 1) {
      return parts.flatMap((p, i) => (i === 0 ? [p] : [", and ", p])).concat(".");
    }
  }
  if (pilot) {
    parts.push(
      <span key="pilot">
        {link(pilot.a)}&apos;s pilot readout is {pilot.left} days out
      </span>,
    );
  }
  if (parts.length === 0) return [<span key="calm">Every account is on track. A good week to look for growth.</span>];

  return parts.flatMap((p, i) => (i === 0 ? [p] : [i === parts.length - 1 ? ", and " : ", ", p])).concat(".");
}

/** The branded top of the book: greeting, what matters this week, and the headline numbers. */
export function HomeHero({
  date,
  summary,
  stats,
  actions,
}: {
  date: React.ReactNode;
  summary: React.ReactNode;
  stats: HeroStat[];
  actions?: React.ReactNode;
}) {
  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl bg-[#0b1a17] text-white shadow-panel"
      aria-labelledby="hero-heading"
    >
      {/* Brand glow and a faint grid, purely decorative */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_0%_0%,rgb(20_184_166/0.35),transparent_60%),radial-gradient(50%_80%_at_100%_100%,rgb(29_78_216/0.35),transparent_60%),linear-gradient(135deg,#0b1a17,#0f2e2a_55%,#0d1f33)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />

      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-7">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#5eead4]">{date}</p>
          <h1 id="hero-heading" className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
            Welcome back, Derek
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">{summary}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-end justify-between gap-3 bg-[#0b1a17]/60 px-6 py-4 backdrop-blur sm:px-8">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-white/60">{s.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</dd>
              {s.sub && (
                <dd
                  className={cn(
                    "mt-0.5 text-xs",
                    s.tone === "up" ? "text-[#5eead4]" : s.tone === "down" ? "text-[#fca5a5]" : "text-white/55",
                  )}
                >
                  {s.sub}
                </dd>
              )}
            </div>
            {s.spark && s.spark.length > 1 && (
              <Sparkline values={s.spark} tone="onDark" width={72} height={26} className="hidden shrink-0 sm:block" />
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HeroLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/15"
    >
      {children}
      <ArrowUpRight className="size-4 opacity-70" />
    </Link>
  );
}
