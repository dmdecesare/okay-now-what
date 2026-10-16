import Link from "next/link";
import { Armchair } from "lucide-react";
import type { AccountSummary } from "@/db/queries";
import { AccountLogo } from "@/components/logos/account-logo";
import { CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Active seats against purchased seats, one full-width bar per account, so accounts compare by share
 * active. The seat counts sit next to each bar.
 */
export function SeatUtilization({ accounts }: { accounts: AccountSummary[] }) {
  const totalSeats = accounts.reduce((n, a) => n + a.seats, 0);
  const totalActive = accounts.reduce((n, a) => n + (a.activeSeats ?? 0), 0);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<Armchair className="size-4" />}
        title="Seat utilization"
        description={`${formatNumber(totalActive)} of ${formatNumber(totalSeats)} purchased seats active this week.`}
        action={
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-chart-1" aria-hidden /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-surface-strong ring-1 ring-inset ring-border" aria-hidden /> Not yet active
            </span>
          </div>
        }
      />
      <ul className="space-y-5 px-5 py-5">
        {accounts.map((a) => {
          const active = a.activeSeats ?? 0;
          const share = a.seats ? (active / a.seats) * 100 : 0;
          const falling = (a.activeChange ?? 0) <= -10;
          return (
            <li key={a.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <Link href={`/accounts/${a.slug}/adoption`} className="flex min-w-0 items-center gap-2 font-medium hover:text-accent">
                  <AccountLogo name={a.name} slug={a.slug} size={20} className="rounded-[5px]" />
                  <span className="truncate">{a.name}</span>
                </Link>
                <span className="shrink-0 tabular-nums text-ink-muted">
                  <span className="font-semibold text-ink">{a.activePct != null ? `${a.activePct}%` : "Not live"}</span>
                  {a.activePct != null && ` · ${formatNumber(active)} of ${formatNumber(a.seats)}`}
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-surface-strong"
                role="img"
                aria-label={`${a.name}: ${formatNumber(active)} of ${formatNumber(a.seats)} seats active`}
              >
                <div
                  className={cn("h-full rounded-full", falling ? "bg-risk" : "bg-chart-1")}
                  style={{ width: `${share}%` }}
                />
              </div>
              {falling && (
                <p className="mt-1 text-xs text-risk">Down {Math.abs(a.activeChange!)} points in 30 days</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
