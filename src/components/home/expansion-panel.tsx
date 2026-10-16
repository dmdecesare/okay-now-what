import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { AccountSummary } from "@/db/queries";
import { AccountLogo } from "@/components/logos/account-logo";
import { ExpansionPill } from "@/components/ui/badges";

/** The growth side of the book: accounts showing signs they are ready for more. */
export function ExpansionPanel({ accounts }: { accounts: AccountSummary[] }) {
  const ready = accounts
    .filter((a) => a.expansion.level !== "none")
    .sort((a, b) => b.expansion.signals.length - a.expansion.signals.length);

  return (
    <section
      aria-labelledby="expansion-heading"
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-growth-soft text-growth">
            <TrendingUp className="size-3.5" />
          </span>
          <h2 id="expansion-heading" className="text-sm font-semibold">
            Expansion opportunities
          </h2>
        </div>
        <span className="rounded-full bg-surface-strong px-2 py-0.5 text-xs font-medium tabular-nums text-ink-muted">
          {ready.length} {ready.length === 1 ? "account" : "accounts"}
        </span>
      </div>

      {ready.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">
          No growth signals yet. They appear when a team nears full adoption or usage climbs fast.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {ready.map((a) => (
            <li key={a.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <AccountLogo name={a.name} slug={a.slug} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <Link href={`/accounts/${a.slug}`} className="font-semibold hover:text-accent">
                      {a.name}
                    </Link>
                    <ExpansionPill level={a.expansion.level} />
                  </div>
                  {a.expansionPitch && <p className="mt-1 text-sm text-ink">{a.expansionPitch.content.headline}</p>}
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {a.expansion.signals.map((s) => (
                      <li key={s.key} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-ink-muted">
                        {s.label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/accounts/${a.slug}/health#growth`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    {a.expansionPitch ? "See the expansion play" : "See the growth signals"} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
