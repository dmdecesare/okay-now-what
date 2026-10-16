import type { Stage, SuccessCriterion, TeamUsage } from "./schemas";
import { pct, sortSnapshots } from "./adoption";
import { summarizeSpend } from "./spend";

// Expansion rules: the growth side of account health. Pure, like lib/health.ts: data in, level
// and signals out. Claude writes the expansion pitch on top of these.

export type ExpansionLevel = "strong" | "emerging" | "none";

export type ExpansionKey = "team_near_full" | "seats_near_full" | "usage_growth" | "pilot_beating_targets";

export type ExpansionSignal = { key: ExpansionKey; label: string; detail: string };

export type ExpansionInput = {
  stage: Stage;
  seats: number;
  usage: { date: string; activeSeats: number; teams?: TeamUsage[] }[];
  spend: { month: string; seatSpend: number; usageSpend: number }[];
  successCriteria: Pick<SuccessCriterion, "status">[];
};

export const EXPANSION_THRESHOLDS = {
  teamMinSeats: 10,
  teamActivePct: 90,
  seatsActivePct: 90,
  usageGrowthPct: 50,
} as const;

export const EXPANSION_LABELS: Record<ExpansionLevel, string> = {
  strong: "Expansion ready",
  emerging: "Growth signal",
  none: "No signal yet",
};

/** Plain-English versions of the rules, shown on the Health and growth tab. */
export const EXPANSION_RULES: { key: ExpansionKey; text: string }[] = [
  { key: "team_near_full", text: "A team of 10 or more seats is 90% or more active" },
  { key: "seats_near_full", text: "90% or more of all purchased seats are active" },
  { key: "usage_growth", text: "Additional usage grew 50% or more over two months" },
  { key: "pilot_beating_targets", text: "A pilot has met at least half its success criteria, with none behind" },
];

export function assessExpansion(input: ExpansionInput): { level: ExpansionLevel; signals: ExpansionSignal[] } {
  const signals: ExpansionSignal[] = [];
  const latest = sortSnapshots(input.usage).at(-1);

  // 1. A sizable team is almost fully active: ready for more seats or a wider rollout.
  const fullTeams = (latest?.teams ?? []).filter(
    (t) => t.seats >= EXPANSION_THRESHOLDS.teamMinSeats && pct(t.active, t.seats) >= EXPANSION_THRESHOLDS.teamActivePct,
  );
  if (fullTeams.length > 0) {
    const names = fullTeams.map((t) => `${t.team} (${pct(t.active, t.seats)}%)`).join(", ");
    signals.push({
      key: "team_near_full",
      label: fullTeams.length === 1 ? `${fullTeams[0].team} is ${pct(fullTeams[0].active, fullTeams[0].seats)}% active` : `${fullTeams.length} teams at 90%+ active`,
      detail: `Near-full adoption: ${names}.`,
    });
  }

  // 2. The whole purchase is nearly used up.
  if (latest) {
    const active = pct(latest.activeSeats, input.seats);
    if (active >= EXPANSION_THRESHOLDS.seatsActivePct) {
      signals.push({
        key: "seats_near_full",
        label: `${active}% of seats active`,
        detail: `${latest.activeSeats} of ${input.seats} purchased seats are active.`,
      });
    }
  }

  // 3. Usage beyond the included pool is climbing fast.
  if (input.spend.length >= 3) {
    const change = summarizeSpend(input.spend).usageTwoMonthChange;
    if (change != null && change >= EXPANSION_THRESHOLDS.usageGrowthPct) {
      signals.push({
        key: "usage_growth",
        label: `Additional usage up ${change}%`,
        detail: `AI credit use beyond the included pool grew ${change}% over two months.`,
      });
    }
  }

  // 4. A pilot that is beating its targets is the classic expansion moment.
  if (input.stage === "pilot" && input.successCriteria.length > 0) {
    const met = input.successCriteria.filter((c) => c.status === "met").length;
    const behind = input.successCriteria.some((c) => c.status === "behind");
    if (met * 2 >= input.successCriteria.length && !behind) {
      signals.push({
        key: "pilot_beating_targets",
        label: `${met} of ${input.successCriteria.length} pilot criteria met`,
        detail: `The pilot has met ${met} of ${input.successCriteria.length} success criteria and none are behind.`,
      });
    }
  }

  const level: ExpansionLevel = signals.length >= 2 ? "strong" : signals.length === 1 ? "emerging" : "none";
  return { level, signals };
}
