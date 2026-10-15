// Date helpers. Dates are stored as YYYY-MM-DD strings (UTC) so they compare cleanly.

const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function addDays(isoDate: string, days: number): string {
  return toISODate(new Date(Date.parse(isoDate) + days * DAY_MS));
}

/** Whole days from a to b (b minus a). */
export function daysBetween(a: string | Date, b: string | Date): number {
  const ta = typeof a === "string" ? Date.parse(a) : a.getTime();
  const tb = typeof b === "string" ? Date.parse(b) : b.getTime();
  return Math.floor((tb - ta) / DAY_MS);
}

/** First day of the month, `monthsAgo` months before the month of `isoDate`. */
export function monthStart(isoDate: string, monthsAgo = 0): string {
  const d = new Date(isoDate + "T00:00:00Z");
  return toISODate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - monthsAgo, 1)));
}

/** "Day N" of a stage, where the start date is day 1. */
export function stageDay(stageStartDate: string, now: Date = new Date()): number {
  return daysBetween(stageStartDate, todayISO(now)) + 1;
}
