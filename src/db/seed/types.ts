import type {
  AccountProfile,
  InsightContent,
  MilestoneStatus,
  QuestionTopic,
  Stage,
  TeamUsage,
} from "@/lib/schemas";

// Seed accounts are written relative to "today" (stage days, days ago, months ago)
// so the demo story stays true whenever the database is reset.

export type SeedAccount = {
  slug: string;
  name: string;
  industry: string;
  employees: number;
  seats: number;
  stage: Stage;
  /** Which day of the stage it is today. */
  stageDay: number;
  pilotLengthDays?: number;
  renewalInDays?: number;
  championLastVisitDaysAgo: number;
  dealNotes: string;
  profile: AccountProfile;
  milestones: {
    title: string;
    description: string;
    dueDay: number;
    status: MilestoneStatus;
    completedDay?: number;
    completedBy?: "rep" | "customer";
  }[];
  usage: { daysAgo: number; teams: TeamUsage[] }[];
  spend: { monthsAgo: number; seat: number; usage: number }[];
  questions: { question: string; answer: string; topic: QuestionTopic; daysAgo: number }[];
  /** Pre-written "Claude's take" so the demo loads instantly. Phase 5 replaces these live. */
  insights: Partial<InsightContent>;
};

/** Builds per-team usage rows from team definitions and active counts in the same order. */
export function teamsFrom(defs: [team: string, seats: number][], active: number[]): TeamUsage[] {
  if (defs.length !== active.length) throw new Error("teamsFrom: length mismatch");
  return defs.map(([team, seats], i) => ({ team, seats, active: active[i] }));
}
