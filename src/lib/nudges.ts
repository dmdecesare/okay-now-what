import { pct, sortSnapshots } from "./adoption";
import { daysBetween, todayISO } from "./dates";
import { formatDate } from "./format";
import type { MilestoneStatus, TeamUsage } from "./schemas";

// Automatic nudges: small, timely prompts computed from the account's data (no AI). Customers see
// theirs on the portal home. The rep sees the same ones plus a few internal ones, each with a
// Claude-drafted email to send.

export type NudgeAudience = "customer" | "rep";

export type Nudge = {
  /** Stable id, for example "late:<milestone id>". */
  key: string;
  tone: "info" | "warn";
  /** What the customer sees. Only customer-visible facts. */
  customer: string;
  /** What the rep sees. */
  rep: string;
  /** Portal tab or rep tab it points to. */
  target: "plan" | "learn" | "videos" | "home" | "questions" | "overview" | "adoption";
  repOnly?: boolean;
};

export type NudgeInput = {
  seats: number;
  milestones: { id: string; title: string; dueDate: string; status: MilestoneStatus }[];
  usage: { date: string; activeSeats: number; teams: TeamUsage[] }[];
  learners: number;
  pulseAnswers: number;
  championName?: string | null;
  championLastVisitAt?: Date | null;
  openHelp?: { createdAt: Date }[];
  unansweredQuestions?: number;
};

export const NUDGE_RULES = {
  dueSoonDays: 3,
  teamLowPct: 40,
  teamMinSeats: 10,
  championQuietDays: 14,
  helpWaitingDays: 2,
} as const;

export function computeNudges(input: NudgeInput, audience: NudgeAudience, now: Date = new Date()): Nudge[] {
  const today = todayISO(now);
  const out: Nudge[] = [];

  const open = input.milestones.filter((m) => m.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  for (const m of open) {
    const days = daysBetween(today, m.dueDate);
    if (days < 0) {
      out.push({
        key: `late:${m.id}`,
        tone: "warn",
        customer: `"${m.title}" was due ${formatDate(m.dueDate)}. If something's in the way, ask your account team for help.`,
        rep: `"${m.title}" is ${-days} ${-days === 1 ? "day" : "days"} overdue.`,
        target: "plan",
      });
    } else if (days <= NUDGE_RULES.dueSoonDays) {
      out.push({
        key: `soon:${m.id}`,
        tone: "info",
        customer: `"${m.title}" is due ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}.`,
        rep: `"${m.title}" is due ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}.`,
        target: "plan",
      });
    }
  }

  const latest = sortSnapshots(input.usage).at(-1);
  const lowTeams = (latest?.teams ?? []).filter(
    (t) => t.seats >= NUDGE_RULES.teamMinSeats && pct(t.active, t.seats) < NUDGE_RULES.teamLowPct,
  );
  for (const t of lowTeams.slice(0, 2)) {
    out.push({
      key: `team:${t.team}`,
      tone: "warn",
      customer: `${t.team} is at ${pct(t.active, t.seats)}% weekly use. A short hands-on session or the first-week checklist could help them get started.`,
      rep: `${t.team} is at ${pct(t.active, t.seats)}% active (${t.active} of ${t.seats}).`,
      target: audience === "customer" ? "videos" : "adoption",
    });
  }

  if (latest && input.learners === 0) {
    out.push({
      key: "no-learners",
      tone: "info",
      customer: "No one has started a learning path yet. Share the Learn tab with your developers.",
      rep: "No developers have started a learning path yet.",
      target: "learn",
    });
  }
  if (latest && input.pulseAnswers === 0) {
    out.push({
      key: "no-pulse",
      tone: "info",
      customer: "Ask your developers to answer this week's pulse. It takes five seconds.",
      rep: "No developer pulse answers in the last 30 days.",
      target: "home",
    });
  }

  if (audience === "rep") {
    if (input.championLastVisitAt) {
      const quiet = daysBetween(input.championLastVisitAt, now);
      if (quiet >= NUDGE_RULES.championQuietDays) {
        out.push({
          key: "champion-quiet",
          tone: "warn",
          customer: "",
          rep: `${input.championName ?? "The champion"} hasn't opened the portal in ${quiet} days.`,
          target: "overview",
          repOnly: true,
        });
      }
    }
    const waiting = (input.openHelp ?? []).filter((r) => daysBetween(r.createdAt, now) >= NUDGE_RULES.helpWaitingDays);
    if (waiting.length) {
      out.push({
        key: "help-waiting",
        tone: "warn",
        customer: "",
        rep: `${waiting.length} help ${waiting.length === 1 ? "request has" : "requests have"} been open for ${NUDGE_RULES.helpWaitingDays}+ days.`,
        target: "overview",
        repOnly: true,
      });
    }
    if (input.unansweredQuestions) {
      out.push({
        key: "unanswered",
        tone: "info",
        customer: "",
        rep: `${input.unansweredQuestions} customer ${input.unansweredQuestions === 1 ? "question needs" : "questions need"} a reply.`,
        target: "questions",
        repOnly: true,
      });
    }
  }

  // Overdue first, then warnings, then the rest.
  return out.sort((a, b) => Number(b.key.startsWith("late:")) - Number(a.key.startsWith("late:")) || Number(b.tone === "warn") - Number(a.tone === "warn"));
}
