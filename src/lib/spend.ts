import { formatMonth } from "./format";

// Spend math for the Spend tab and the spend trend arrow.

/** Usage-based spend drop that counts as a risk signal (see SPEC 5.4 and lib/health.ts). */
export const SPEND_DROP_PCT = 15;

type Month = { month: string; seatSpend: number; usageSpend: number };

export type SpendSummary = {
  months: { month: string; label: string; seat: number; usage: number; total: number }[];
  current: { seat: number; usage: number; total: number } | null;
  /** Total spend vs last month, in percent. */
  changeVsLastMonth: number | null;
  /** Additional usage over the last two months, in percent. */
  usageTwoMonthChange: number | null;
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
    usage: m.usageSpend,
    total: m.seatSpend + m.usageSpend,
  }));

  const last = months.at(-1);
  const prev = months.at(-2);
  const twoBack = months.at(-3);
  const usageTwoMonthChange = last && twoBack ? pctChange(twoBack.usage, last.usage) : null;

  return {
    months,
    current: last ? { seat: last.seat, usage: last.usage, total: last.total } : null,
    changeVsLastMonth: last && prev ? pctChange(prev.total, last.total) : null,
    usageTwoMonthChange,
    dropping: usageTwoMonthChange != null && usageTwoMonthChange <= -SPEND_DROP_PCT,
  };
}
