import type { MilestoneStatus, QuestionTopic } from "./schemas";
import { daysBetween, todayISO } from "./dates";
import { ADOPTION_WINDOW_DAYS, baselineSnapshot, pct, sortSnapshots } from "./adoption";
import { SPEND_DROP_PCT } from "./spend";

// At-risk rules from SPEC section 5.4. Pure: data in, status and signals out.
// Claude writes the plain-English explanation and recovery play on top of these (Phase 5).

export type HealthStatus = "on_track" | "watch" | "at_risk";

export type SignalKey =
  | "adoption_drop"
  | "spend_drop"
  | "champion_quiet"
  | "milestones_overdue"
  | "security_questions";

export type Signal = { key: SignalKey; label: string; detail: string };

export type HealthInput = {
  now?: Date;
  seats: number;
  championName?: string | null;
  championLastVisitAt: Date | null;
  usage: { date: string; activeSeats: number }[];
  spend: { month: string; seatSpend: number; usageSpend: number }[];
  milestones: { dueDate: string; status: MilestoneStatus }[];
  questions: { topic: QuestionTopic; askedAt: Date }[];
};

export const THRESHOLDS = {
  adoptionDropPoints: 10,
  adoptionWindowDays: ADOPTION_WINDOW_DAYS,
  // Applied to additional usage (AI credits beyond the included pool). Seat spend is contractual and
  // rarely moves mid-term, so a drop in usage spend is the meaningful signal.
  spendDropPct: SPEND_DROP_PCT,
  championQuietDays: 14,
  overdueMilestones: 2,
  securityQuestions: 3,
  securityWindowDays: 7,
} as const;

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  on_track: "On track",
  watch: "Watch",
  at_risk: "At risk",
};

export function isOverdue(m: { dueDate: string; status: MilestoneStatus }, today: string): boolean {
  return m.status !== "done" && m.dueDate < today;
}

export const activePct = pct;

/** Plain-English versions of the rules, shown on the Health tab. */
export const RULES: { key: SignalKey; text: string }[] = [
  { key: "adoption_drop", text: "Active seats drop 10 or more points over 30 days" },
  { key: "spend_drop", text: "Additional usage spend drops 15% or more over two months" },
  { key: "champion_quiet", text: "Champion hasn't opened the customer app in 14 or more days" },
  { key: "milestones_overdue", text: "Two or more plan milestones are overdue" },
  { key: "security_questions", text: "Three or more security or compliance questions in a week" },
];

export function assessHealth(input: HealthInput): { status: HealthStatus; signals: Signal[] } {
  const now = input.now ?? new Date();
  const today = todayISO(now);
  const signals: Signal[] = [];

  // 1. % active seats down 10+ points over the last 30 days.
  const usage = sortSnapshots(input.usage);
  const latest = usage.at(-1);
  if (latest) {
    const baseline = baselineSnapshot(usage);
    if (baseline) {
      const from = activePct(baseline.activeSeats, input.seats);
      const to = activePct(latest.activeSeats, input.seats);
      if (from - to >= THRESHOLDS.adoptionDropPoints) {
        signals.push({
          key: "adoption_drop",
          label: `Seat activity down ${from - to} points in 30 days`,
          detail: `${from}% active ${daysBetween(baseline.date, latest.date)} days ago, ${to}% now.`,
        });
      }
    }
  }

  // 2. Usage-based spend down 15%+ over the last two months.
  const spend = [...input.spend].sort((a, b) => a.month.localeCompare(b.month));
  if (spend.length >= 3) {
    const base = spend.at(-3)!.usageSpend;
    const last = spend.at(-1)!.usageSpend;
    if (base > 0) {
      const dropPct = Math.round(((base - last) / base) * 100);
      if (dropPct >= THRESHOLDS.spendDropPct) {
        signals.push({
          key: "spend_drop",
          label: `Additional usage down ${dropPct}% over two months`,
          detail: `$${base.toLocaleString("en-US")} to $${last.toLocaleString("en-US")} a month.`,
        });
      }
    }
  }

  // 3. Champion hasn't visited the customer app in 14+ days.
  if (input.championLastVisitAt) {
    const quietDays = daysBetween(input.championLastVisitAt, now);
    if (quietDays >= THRESHOLDS.championQuietDays) {
      const who = input.championName ?? "The champion";
      signals.push({
        key: "champion_quiet",
        label: `Champion quiet for ${quietDays} days`,
        detail: `${who} last opened the customer app ${quietDays} days ago.`,
      });
    }
  }

  // 4. Two or more milestones overdue.
  const overdue = input.milestones.filter((m) => isOverdue(m, today));
  if (overdue.length >= THRESHOLDS.overdueMilestones) {
    signals.push({
      key: "milestones_overdue",
      label: `${overdue.length} milestones overdue`,
      detail: `${overdue.length} plan milestones are past their due date.`,
    });
  }

  // 5. Three or more security or compliance questions within 7 days.
  const since = now.getTime() - THRESHOLDS.securityWindowDays * 24 * 60 * 60 * 1000;
  const secQs = input.questions.filter(
    (q) => (q.topic === "security" || q.topic === "compliance") && q.askedAt.getTime() >= since,
  );
  if (secQs.length >= THRESHOLDS.securityQuestions) {
    signals.push({
      key: "security_questions",
      label: `${secQs.length} security questions this week`,
      detail: `${secQs.length} security or compliance questions in the last 7 days.`,
    });
  }

  const status: HealthStatus =
    signals.length >= 2 ? "at_risk" : signals.length === 1 ? "watch" : "on_track";
  return { status, signals };
}
