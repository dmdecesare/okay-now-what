import type { AccountDetail } from "@/db/queries";
import { computeNudges, type Nudge } from "./nudges";

/** The rep's nudges for one account, from the full account detail. */
export function repNudges(d: AccountDetail, now: Date = new Date()): Nudge[] {
  return computeNudges(
    {
      seats: d.account.seats,
      milestones: d.milestones,
      usage: d.usage,
      learners: d.learningLearners,
      pulseAnswers: d.pulse.count,
      championName: d.profile.champion.name,
      championLastVisitAt: d.account.championLastVisitAt,
      openHelp: d.helpRequests.filter((r) => r.status === "open"),
      unansweredQuestions: d.questions.filter((q) => !q.answer).length,
    },
    "rep",
    now,
  );
}
