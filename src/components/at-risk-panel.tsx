import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import type { AccountSummary } from "@/db/queries";
import { AccountLogo } from "@/components/logos/account-logo";
import { StatusPill } from "@/components/ui/badges";

/** Top of the book of business: every account with at least one risk signal. */
export function AtRiskPanel({ accounts }: { accounts: AccountSummary[] }) {
  const flagged = accounts
    .filter((a) => a.health.status !== "on_track")
    .sort((a, b) => b.health.signals.length - a.health.signals.length);

  return (
    <section
      aria-labelledby="at-risk-heading"
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-risk-soft text-risk">
            <ShieldAlert className="size-3.5" />
          </span>
          <h2 id="at-risk-heading" className="text-sm font-semibold">
            Needs attention
          </h2>
        </div>
        <span className="rounded-full bg-surface-strong px-2 py-0.5 text-xs font-medium tabular-nums text-ink-muted">
          {flagged.length} {flagged.length === 1 ? "account" : "accounts"}
        </span>
      </div>

      {flagged.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing on fire. Nice.</p>
      ) : (
        <ul className="divide-y divide-border">
          {flagged.map((a) => (
            <li key={a.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <AccountLogo name={a.name} slug={a.slug} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <Link href={`/accounts/${a.slug}`} className="font-semibold hover:text-accent">
                      {a.name}
                    </Link>
                    <StatusPill status={a.health.status} />
                    <span className="text-xs text-ink-faint">
                      {a.health.signals.length} {a.health.signals.length === 1 ? "signal" : "signals"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">{a.riskPlay?.content.reason ?? a.health.signals[0]?.label}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
                    <p className="min-w-0 text-ink-muted">
                      <span className="font-medium text-ink">Suggested play: </span>
                      {a.riskPlay?.content.play.title ?? "Open the account to plan a recovery play"}
                    </p>
                    <Link
                      href={`/accounts/${a.slug}/health`}
                      className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
                    >
                      See the play <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
