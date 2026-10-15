import Link from "next/link";
import type { AccountSummary } from "@/db/queries";
import { StatusPill } from "@/components/ui/badges";

/** Top of the book of business: every account with at least one risk signal. */
export function AtRiskPanel({ accounts }: { accounts: AccountSummary[] }) {
  const flagged = accounts
    .filter((a) => a.health.status !== "on_track")
    .sort((a, b) => b.health.signals.length - a.health.signals.length);

  if (flagged.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-muted">
        <span className="font-semibold text-ink">Needs attention:</span> nothing on fire. Nice.
      </section>
    );
  }

  return (
    <section
      aria-labelledby="at-risk-heading"
      className="overflow-hidden rounded-xl border border-risk/25 bg-risk-soft/40"
    >
      <div className="flex items-center justify-between gap-3 border-b border-risk/15 px-5 py-3">
        <h2 id="at-risk-heading" className="font-semibold">
          Needs attention
        </h2>
        <span className="text-sm text-ink-muted">
          {flagged.length} {flagged.length === 1 ? "account" : "accounts"}
        </span>
      </div>
      <ul className="divide-y divide-risk/15">
        {flagged.map((a) => (
          <li key={a.id} className="bg-bg/70 px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href={`/accounts/${a.slug}`} className="font-semibold hover:text-accent">
                {a.name}
              </Link>
              <StatusPill status={a.health.status} />
              <span className="text-sm text-ink-faint">
                {a.health.signals.length} {a.health.signals.length === 1 ? "signal" : "signals"}
              </span>
            </div>
            <p className="mt-1.5 text-sm">
              {a.riskPlay?.content.reason ?? a.health.signals[0]?.label}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-ink-muted">
                <span className="font-medium text-ink">Suggested play: </span>
                {a.riskPlay?.content.play.title ?? "Open the account to plan a recovery play"}
              </p>
              <Link
                href={`/accounts/${a.slug}/health`}
                className="font-medium text-accent hover:text-accent-hover"
              >
                See the play
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
