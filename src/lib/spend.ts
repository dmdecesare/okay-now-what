import { formatMonth } from "./format";

// Spend math for the Spend tab and the spend trend arrow.

/** Usage-based spend drop that counts as a risk signal (see SPEC 5.4 and lib/health.ts). */
export const SPEND_DROP_PCT = 15;

type Month = { month: string; seatSpend: number; premiumRequestSpend: number };

export type SpendSummary = {
  months: { month: string; label: string; seat: number; premium: number; total: number }[];
  current: { seat: number; premium: number; total: number } | null;
  /** Total spend vs last month, in percent. */
  changeVsLastMonth: number | null;
  /** Premium request spend over the last two months, in percent. */
  premiumTwoMonthChange: number | null;
  dropping: boolean;
};

function pctChange(from: number, to: number): number | null {
  return from > 0 ? Math.round(((to - from) / from) * 100) : null;
}

export function summarizeSpend(spend: Month[]): SpendSummary {
  const sorted = [...spend].sort((a, b) => a.month.localeCompare(b.month));
  const months = sorted.map((m) => ({
    month: m.month,
    label: formatMonth(m.month),
    seat: m.seatSpend,
    premium: m.premiumRequestSpend,
    total: m.seatSpend + m.premiumRequestSpend,
  }));

  const last = months.at(-1);
  const prev = months.at(-2);
  const twoBack = months.at(-3);
  const premiumTwoMonthChange = last && twoBack ? pctChange(twoBack.premium, last.premium) : null;

  return {
    months,
    current: last ? { seat: last.seat, premium: last.premium, total: last.total } : null,
    changeVsLastMonth: last && prev ? pctChange(prev.total, last.total) : null,
    premiumTwoMonthChange,
    dropping: premiumTwoMonthChange != null && premiumTwoMonthChange <= -SPEND_DROP_PCT,
  };
}
