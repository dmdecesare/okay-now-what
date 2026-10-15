import type { TeamUsage } from "./schemas";
import { addDays } from "./dates";

// Adoption math shared by the health rules and the Adoption tab.

export const ADOPTION_WINDOW_DAYS = 30;

type Snapshot = { date: string; activeSeats: number; teams?: TeamUsage[] };

export function pct(active: number, seats: number): number {
  return seats > 0 ? Math.round((active / seats) * 100) : 0;
}

/** Sorted oldest first. */
export function sortSnapshots<T extends Snapshot>(usage: T[]): T[] {
  return [...usage].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * The comparison point for "over the last 30 days": the oldest snapshot that is
 * within 30 days of the latest one (and older than it).
 */
export function baselineSnapshot<T extends Snapshot>(sorted: T[]): T | undefined {
  const latest = sorted.at(-1);
  if (!latest) return undefined;
  const windowStart = addDays(latest.date, -ADOPTION_WINDOW_DAYS);
  return sorted.find((u) => u.date >= windowStart && u.date < latest.date);
}

export type TeamTrend = {
  team: string;
  seats: number;
  active: number;
  pct: number;
  basePct: number | null;
  change: number | null;
};

export function teamTrends(usage: Required<Snapshot>[]): TeamTrend[] {
  const sorted = sortSnapshots(usage);
  const latest = sorted.at(-1);
  if (!latest) return [];
  const base = baselineSnapshot(sorted);
  const baseBy = new Map(base?.teams.map((t) => [t.team, t]) ?? []);

  return latest.teams.map((t) => {
    const b = baseBy.get(t.team);
    const now = pct(t.active, t.seats);
    const before = b ? pct(b.active, b.seats) : null;
    return {
      team: t.team,
      seats: t.seats,
      active: t.active,
      pct: now,
      basePct: before,
      change: before == null ? null : now - before,
    };
  });
}

/** The team with the steepest drop, if it fell 10+ points. */
export function biggestDrop(trends: TeamTrend[]): TeamTrend | undefined {
  const worst = [...trends].sort((a, b) => (a.change ?? 0) - (b.change ?? 0))[0];
  return worst && worst.change != null && worst.change <= -10 ? worst : undefined;
}

/** Each team's highest % active across all snapshots. */
export function teamPeaks(usage: Required<Snapshot>[]): Map<string, number> {
  const peaks = new Map<string, number>();
  for (const s of usage) {
    for (const t of s.teams) peaks.set(t.team, Math.max(peaks.get(t.team) ?? 0, pct(t.active, t.seats)));
  }
  return peaks;
}
