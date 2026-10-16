import Link from "next/link";
import type { AccountSummary } from "@/db/queries";
import { AccountLogo } from "@/components/logos/account-logo";
import { ExpansionPill, StageBadge, StatusPill } from "@/components/ui/badges";
import { MiniBar } from "@/components/ui/mini-bar";
import { Sparkline } from "@/components/ui/sparkline";
import { RowLink, Table, Td, Th, THead, Tr } from "@/components/ui/table";
import { formatNumber, formatUSD } from "@/lib/format";
import { cn } from "@/lib/cn";

function stageText(a: AccountSummary) {
  return a.pilotLengthDays ? `Day ${a.stageDay} of ${a.pilotLengthDays}` : `Day ${a.stageDay}`;
}

function renewalText(a: AccountSummary) {
  if (a.pilotLengthDays) {
    const left = a.pilotLengthDays - a.stageDay;
    return left >= 0 ? `Pilot ends in ${left} days` : "Pilot ended";
  }
  return a.renewalInDays != null ? `In ${a.renewalInDays} days` : "-";
}

function Change({ value }: { value: number | null }) {
  if (value == null || value === 0) return null;
  return (
    <span className={cn("whitespace-nowrap text-xs font-medium tabular-nums", value > 0 ? "text-ok" : "text-risk")}>
      {value > 0 ? "+" : ""}
      {value} pts
    </span>
  );
}

/** The book as a table on desktop, as stacked cards on phones. Every row is a link to the account. */
export function AccountsTable({ accounts }: { accounts: AccountSummary[] }) {
  return (
    <section aria-labelledby="accounts-heading" className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 id="accounts-heading" className="text-sm font-semibold">
          All accounts
        </h2>
        <span className="text-xs text-ink-faint">Sorted by date added</span>
      </div>

      <div className="hidden md:block">
        <Table>
          <THead>
            <tr>
              <Th className="pl-5">Account</Th>
              <Th>Stage</Th>
              <Th className="text-right">Seats</Th>
              <Th>Active seats</Th>
              <Th>Monthly spend</Th>
              <Th>Health</Th>
              <Th className="pr-5">Renewal</Th>
            </tr>
          </THead>
          <tbody>
            {accounts.map((a) => {
              const down = (a.activeChange ?? 0) <= -10;
              return (
                <Tr key={a.id}>
                  <Td className="pl-5">
                    <div className="flex items-center gap-3">
                      <AccountLogo name={a.name} slug={a.slug} size={34} />
                      <div className="min-w-0">
                        <RowLink href={`/accounts/${a.slug}`} className="block truncate">
                          {a.name}
                        </RowLink>
                        <p className="truncate text-xs text-ink-muted">{a.industry}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col items-start gap-1">
                      <StageBadge stage={a.stage} />
                      <span className="text-xs text-ink-faint">{stageText(a)}</span>
                    </div>
                  </Td>
                  <Td className="text-right tabular-nums">{formatNumber(a.seats)}</Td>
                  <Td>
                    {a.activePct != null ? (
                      <div className="flex items-center gap-3">
                        <MiniBar value={a.activePct} tone={down ? "risk" : "accent"} />
                        <Change value={a.activeChange} />
                      </div>
                    ) : (
                      <span className="text-xs text-ink-faint">Not live yet</span>
                    )}
                  </Td>
                  <Td>
                    {a.monthlySpend != null ? (
                      <div className="flex items-center gap-3">
                        <Sparkline
                          values={a.spendSeries}
                          width={56}
                          height={22}
                          tone={a.spendTrend === "down" ? "risk" : "accent"}
                        />
                        <span className="tabular-nums">{formatUSD(a.monthlySpend)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-faint">-</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusPill status={a.health.status} />
                      <ExpansionPill level={a.expansion.level} />
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap pr-5 text-sm text-ink-muted">{renewalText(a)}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {accounts.map((a) => (
          <li key={a.id}>
            <Link href={`/accounts/${a.slug}`} className="block px-4 py-4 hover:bg-surface/70">
              <div className="flex items-start gap-3">
                <AccountLogo name={a.name} slug={a.slug} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{a.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {a.industry} · {stageText(a)} · {formatNumber(a.seats)} seats
                      </p>
                    </div>
                    <StatusPill status={a.health.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {a.activePct != null ? (
                      <MiniBar value={a.activePct} tone={(a.activeChange ?? 0) <= -10 ? "risk" : "accent"} />
                    ) : (
                      <span className="text-xs text-ink-faint">Not live yet</span>
                    )}
                    <span className="text-sm tabular-nums text-ink-muted">
                      {a.monthlySpend != null ? `${formatUSD(a.monthlySpend)}/mo` : ""}
                    </span>
                  </div>
                  {a.expansion.level !== "none" && <ExpansionPill level={a.expansion.level} className="mt-2" />}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
