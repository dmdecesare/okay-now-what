import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { NoUsageNote } from "@/components/account/no-usage-note";
import { PremiumSpendChart, SpendTotalChart } from "@/components/charts/spend-chart";
import { summarizeSpend } from "@/lib/spend";
import { PRICING_NOTE } from "@/lib/constants";
import { formatUSD } from "@/lib/format";
import { loadAccount } from "../load";

const signed = (n: number | null) => (n == null ? "-" : `${n > 0 ? "+" : ""}${n}%`);
const trendOf = (n: number | null) => (n == null ? undefined : n > 0 ? "up" : n < 0 ? "down" : "flat") as
  | "up"
  | "down"
  | "flat"
  | undefined;

export default function SpendPage({ params }: PageProps<"/accounts/[slug]/spend">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Spend params={params} />
    </Suspense>
  );
}

async function Spend({ params }: { params: PageProps<"/accounts/[slug]/spend">["params"] }) {
  const { spend } = await loadAccount(params);
  if (spend.length === 0) return <NoUsageNote title="No spend data yet" />;

  const s = summarizeSpend(spend);
  const last = s.months.at(-1)!;
  const first = s.months.length >= 3 ? s.months.at(-3)! : null;

  return (
    <div className="space-y-6">
      {s.dropping && first && (
        <div role="status" className="flex gap-3 rounded-xl border border-risk/25 bg-risk-soft px-5 py-4 text-sm">
          <span className="font-semibold text-risk">Spend is dropping.</span>
          <span>
            Premium request spend fell {Math.abs(s.premiumTwoMonthChange!)}% in two months ({formatUSD(first.premium)} in{" "}
            {first.label} to {formatUSD(last.premium)} in {last.label}). Less agent mode and Chat use usually comes first.
          </span>
        </div>
      )}

      <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Stat label={`Total, ${last.label}`} value={formatUSD(last.total)} />
        <Stat label="Vs last month" value={signed(s.changeVsLastMonth)} trend={trendOf(s.changeVsLastMonth)} />
        <Stat label="Seats" value={formatUSD(last.seat)} sub="Per month" />
        <Stat
          label="Premium requests"
          value={formatUSD(last.premium)}
          sub={s.premiumTwoMonthChange != null ? `${signed(s.premiumTwoMonthChange)} over two months` : "Usage-based"}
          trend={trendOf(s.premiumTwoMonthChange)}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Monthly spend</h2>
          <p className="mb-3 text-sm text-ink-muted">Seats and premium requests, stacked.</p>
          <SpendTotalChart data={s.months} />
        </Card>
        <Card>
          <h2 className="font-semibold">Premium request spend</h2>
          <p className="mb-3 text-sm text-ink-muted">Usage-based spend on its own scale, where changes show up first.</p>
          <PremiumSpendChart data={s.months} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">By month</h2>
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
            <thead className="text-ink-faint">
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Month</th>
                <th className="py-2 pr-4 font-medium">Seats</th>
                <th className="py-2 pr-4 font-medium">Premium requests</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {s.months.map((m) => (
                <tr key={m.month} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium">{m.label}</td>
                  <td className="py-2 pr-4">{formatUSD(m.seat)}</td>
                  <td className="py-2 pr-4">{formatUSD(m.premium)}</td>
                  <td className="py-2 font-medium">{formatUSD(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">{PRICING_NOTE}</p>
      </Card>
    </div>
  );
}
