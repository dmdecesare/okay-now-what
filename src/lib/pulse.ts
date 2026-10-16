import { daysBetween } from "./dates";

// The developer pulse: a weekly 1 to 5 "how useful has Copilot been this week?" with an optional blocker.

export const PULSE_WINDOW_DAYS = 30;

export const PULSE_LABELS: Record<number, string> = {
  1: "Not useful",
  2: "A little",
  3: "Somewhat",
  4: "Very",
  5: "Can't work without it",
};

export type PulseSummary = {
  count: number;
  average: number | null;
  /** Count of each score, 1 to 5. */
  distribution: [number, number, number, number, number];
  blockers: { text: string; daysAgo: number }[];
};

export function summarizePulse(
  rows: { score: number; blocker: string | null; createdAt: Date }[],
  now: Date = new Date(),
): PulseSummary {
  const recent = rows.filter((r) => daysBetween(r.createdAt, now) <= PULSE_WINDOW_DAYS);
  const distribution: PulseSummary["distribution"] = [0, 0, 0, 0, 0];
  for (const r of recent) if (r.score >= 1 && r.score <= 5) distribution[r.score - 1]++;
  const total = recent.reduce((n, r) => n + r.score, 0);
  return {
    count: recent.length,
    average: recent.length ? Math.round((total / recent.length) * 10) / 10 : null,
    distribution,
    blockers: recent
      .filter((r) => r.blocker)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map((r) => ({ text: r.blocker!, daysAgo: daysBetween(r.createdAt, now) })),
  };
}
