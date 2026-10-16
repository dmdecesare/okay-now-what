import { Clock, DollarSign, Hourglass, TrendingUp } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { HoursChart, ValueVsCostChart } from "@/components/charts/value-charts";
import { brandColor, type SeedLogoId } from "@/lib/logos";
import { formatDate, formatNumber, formatUSD } from "@/lib/format";
import { WEEKS_PER_MONTH, type Roi } from "@/lib/roi";

export type Productivity = { label: string; value: string; sub: string }[];

function Tile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-white/65 [&_svg]:size-3.5">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-white/60">{sub}</p>
    </div>
  );
}

/** The one-page value report the customer's executives see. Charts and estimates, printable. */
export function ValueReport({
  name,
  logoId,
  roi,
  productivity,
}: {
  name: string;
  logoId: SeedLogoId | null;
  roi: Roi;
  productivity: Productivity;
}) {
  const brand = brandColor(name, null, logoId);
  const a = roi.assumptions;
  const team = roi.byTeam.slice(0, 6);
  const maxTeam = Math.max(1, ...team.map((t) => t.hours));

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-bg print:rounded-none print:border-0">
      <header className="px-6 py-6 text-white sm:px-8" style={{ background: `linear-gradient(135deg, #0b1a17 0%, ${brand} 150%)` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AccountLogo name={name} logoId={logoId} size={36} className="ring-2 ring-white/20" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">
                {name} <span className="font-normal text-white/50">x</span> Copilot
              </p>
              <p className="text-xs text-white/60">The value of Copilot, this month</p>
            </div>
          </div>
          <p className="text-xs text-white/55">Estimates as of {formatDate(new Date().toISOString().slice(0, 10))}</p>
        </div>
        <h1 className="mt-5 max-w-3xl text-[1.55rem] font-semibold leading-tight tracking-tight">
          Copilot is giving your developers back about {formatNumber(roi.hoursSaved)} hours a month.
        </h1>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile icon={<DollarSign />} label="Estimated value this month" value={formatUSD(roi.valueSaved)} sub={`From ${formatNumber(roi.activeSeats)} active developers`} />
          <Tile icon={<Clock />} label="Hours back this month" value={formatNumber(roi.hoursSaved)} sub={`${a.hoursSavedPerWeek} hrs per developer a week`} />
          <Tile icon={<TrendingUp />} label="Return on investment" value={roi.roiMultiple != null ? `${roi.roiMultiple}x` : "-"} sub={`Value vs. ${formatUSD(roi.cost)} a month`} />
          <Tile icon={<Hourglass />} label="Payback" value={roi.paybackDays != null ? `${roi.paybackDays} ${roi.paybackDays === 1 ? "day" : "days"}` : "-"} sub="To cover a month of Copilot" />
        </div>
      </header>

      <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold">Estimated value vs. what you paid</h2>
          <p className="mb-3 text-xs text-ink-muted">Each month, at that month&apos;s adoption.</p>
          <ValueVsCostChart data={roi.months} />
        </section>
        <section>
          <h2 className="text-sm font-semibold">Hours back each month</h2>
          <p className="mb-3 text-xs text-ink-muted">Grows as more of your developers use Copilot every week.</p>
          <HoursChart data={roi.hoursSeries.map((h) => ({ ...h, label: formatDate(h.date) }))} />
        </section>
      </div>

      <div className="grid gap-6 border-t border-border px-6 py-6 sm:px-8 lg:grid-cols-2">
        {team.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold">Where the hours come from</h2>
            <p className="mb-3 text-xs text-ink-muted">Hours back a month, by team.</p>
            <ul className="space-y-2.5">
              {team.map((t) => (
                <li key={t.team}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{t.team}</span>
                    <span className="tabular-nums text-ink-muted">
                      {formatNumber(t.hours)} hrs · {t.active} of {t.seats} active
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-strong" aria-hidden>
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${(t.hours / maxTeam) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <h2 className="text-sm font-semibold">Productivity at a glance</h2>
          <p className="mb-3 text-xs text-ink-muted">From your team&apos;s activity in Copilot and this portal.</p>
          <div className="grid grid-cols-2 gap-2.5">
            {productivity.map((p) => (
              <div key={p.label} className="rounded-lg border border-border bg-surface/60 p-3">
                <p className="text-xs text-ink-muted">{p.label}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{p.value}</p>
                <p className="text-xs text-ink-faint">{p.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-surface/60 px-6 py-4 text-xs text-ink-muted sm:px-8">
        <span className="font-semibold text-ink">How we estimate this: </span>
        each active developer saves about {a.hoursSavedPerWeek} hours a week ({(a.hoursSavedPerWeek * WEEKS_PER_MONTH).toFixed(1)} a month), valued
        at {formatUSD(a.hourlyCost)} an hour. Cost is your Copilot seats plus any additional usage. These are estimates to
        guide decisions, not invoices. Your account team can adjust the assumptions with you.
      </footer>
    </article>
  );
}
