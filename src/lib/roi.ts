import { z } from "zod";
import { SEAT_PRICE_USD } from "./constants";
import { pct, sortSnapshots } from "./adoption";
import { formatMonth } from "./format";
import type { TeamUsage } from "./schemas";

// The value of Copilot to a customer, in dollars and hours. Pure: data in, numbers out.
// Savings are estimates from two assumptions the rep can edit per account (hours saved per
// active developer per week, and a loaded hourly cost). Cost is what the customer pays.

export const WEEKS_PER_MONTH = 4.33;

export const roiAssumptionsSchema = z.object({
  hoursSavedPerWeek: z.number().min(0.5).max(10),
  hourlyCost: z.number().int().min(25).max(250),
});
export type RoiAssumptions = z.infer<typeof roiAssumptionsSchema>;

export const DEFAULT_ROI: RoiAssumptions = { hoursSavedPerWeek: 2, hourlyCost: 75 };

export type RoiInput = {
  seats: number;
  usage: { date: string; activeSeats: number; teams?: TeamUsage[] }[];
  spend: { month: string; seatSpend: number; usageSpend: number }[];
  assumptions?: RoiAssumptions | null;
};

export type Roi = {
  live: boolean;
  assumptions: RoiAssumptions;
  activeSeats: number;
  activePct: number;
  /** Per month, at today's adoption. */
  hoursSaved: number;
  valueSaved: number;
  cost: number;
  /** Value divided by cost, for example 10.9. */
  roiMultiple: number | null;
  /** Days of value it takes to cover a month's cost. */
  paybackDays: number | null;
  /** Hours saved per month at each usage snapshot, oldest first. */
  hoursSeries: { date: string; hours: number; activePct: number }[];
  /** Estimated value vs. cost for each billed month, oldest first. */
  months: { month: string; label: string; value: number; cost: number }[];
  /** Hours saved per month, by team, biggest first. */
  byTeam: { team: string; hours: number; active: number; seats: number }[];
};

export function computeRoi(input: RoiInput): Roi {
  const a = input.assumptions ?? DEFAULT_ROI;
  const perSeatHours = a.hoursSavedPerWeek * WEEKS_PER_MONTH;
  const usage = sortSnapshots(input.usage);
  const latest = usage.at(-1);
  const spend = [...input.spend].sort((x, y) => x.month.localeCompare(y.month));
  const lastMonth = spend.at(-1);
  const cost = lastMonth ? lastMonth.seatSpend + lastMonth.usageSpend : input.seats * SEAT_PRICE_USD;

  const activeSeats = latest?.activeSeats ?? 0;
  const hoursSaved = Math.round(activeSeats * perSeatHours);
  const valueSaved = Math.round(hoursSaved * a.hourlyCost);

  // For each billed month, use the last usage snapshot on or before the end of that month.
  const months = spend.map((m) => {
    const monthEnd = `${m.month.slice(0, 7)}-31`;
    const snap = [...usage].reverse().find((u) => u.date <= monthEnd) ?? usage[0];
    const active = snap?.activeSeats ?? 0;
    return {
      month: m.month,
      label: formatMonth(m.month),
      value: Math.round(active * perSeatHours * a.hourlyCost),
      cost: m.seatSpend + m.usageSpend,
    };
  });

  return {
    live: !!latest,
    assumptions: a,
    activeSeats,
    activePct: latest ? pct(latest.activeSeats, input.seats) : 0,
    hoursSaved,
    valueSaved,
    cost,
    roiMultiple: latest && cost > 0 ? Math.round((valueSaved / cost) * 10) / 10 : null,
    paybackDays: latest && valueSaved > 0 ? Math.max(1, Math.round((cost / valueSaved) * 30)) : null,
    hoursSeries: usage.map((u) => ({
      date: u.date,
      hours: Math.round(u.activeSeats * perSeatHours),
      activePct: pct(u.activeSeats, input.seats),
    })),
    months,
    byTeam: (latest?.teams ?? [])
      .map((t) => ({ team: t.team, hours: Math.round(t.active * perSeatHours), active: t.active, seats: t.seats }))
      .sort((x, y) => y.hours - x.hours),
  };
}
