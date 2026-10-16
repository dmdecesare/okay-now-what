import { z } from "zod";
import { GUIDE_TOPIC_IDS } from "./guide-topics";
import { DOC_KEYS } from "./resources";

// Shapes for the account content Claude generates from deal notes (Phase 6).
// Seed data uses the same shapes, and everything is validated before it is saved.

export const STAGES = ["pilot", "onboarding", "rolling_out"] as const;
export type Stage = (typeof STAGES)[number];

export const goalSchema = z.object({
  goal: z.string().describe("Short outcome the customer wants, written by us"),
  inTheirWords: z.string().describe("How the customer said it during the deal"),
});

export const personSchema = z.object({
  name: z.string().nullable(),
  title: z.string(),
  notes: z.string().describe("What this person cares about and how to work with them"),
});

export const concernSchema = z.object({
  concern: z.string(),
  raisedBy: z.string(),
  response: z.string().describe("How the plan addresses it"),
});

export const successCriterionSchema = z.object({
  label: z.string(),
  target: z.string(),
  current: z.string().nullable(),
  status: z.enum(["met", "on_track", "behind", "not_started"]),
});

export const setupStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  why: z.string().describe("Tied to a concern from the deal where possible"),
  steps: z.array(z.string()),
  audience: z.enum(["admin", "security", "team_lead", "developer"]),
  /** Official docs for this step, chosen only from the verified catalog. */
  docs: z.array(z.enum(DOC_KEYS)).max(3).optional(),
});

export const faqItemSchema = z.object({ q: z.string(), a: z.string() });

export const championKitSchema = z.object({
  launchAnnouncement: z.string(),
  enablementAgenda: z.string(),
  developerFaq: z.array(faqItemSchema),
});

export const guidePickSchema = z.object({
  topic: z.enum(GUIDE_TOPIC_IDS),
  why: z.string().describe("One line on why this matters for this customer"),
});

export const accountProfileSchema = z.object({
  summary: z.string(),
  goals: z.array(goalSchema),
  champion: personSchema,
  stakeholders: z.array(personSchema),
  concerns: z.array(concernSchema),
  successCriteria: z.array(successCriterionSchema),
  thisWeek: z.array(z.string()),
  setupSteps: z.array(setupStepSchema),
  championKit: championKitSchema,
  guides: z.array(guidePickSchema),
  /** Value-report assumptions the rep can edit. Defaults apply when missing. */
  roiAssumptions: z
    .object({ hoursSavedPerWeek: z.number(), hourlyCost: z.number() })
    .nullable()
    .optional(),
});

export type AccountProfile = z.infer<typeof accountProfileSchema>;

// ---------------------------------------------------------------------------
// Add account (Phase 6): the rep's form input, and the two halves Claude builds.
// ---------------------------------------------------------------------------

const optionalInt = (min: number, max: number) => z.number().int().min(min).max(max).optional();

export const newAccountInputSchema = z.object({
  name: z.string().trim().min(2, "Add the company name").max(80),
  industry: z.string().trim().min(2, "Add the industry").max(60),
  seats: z.number({ message: "Add the number of seats" }).int().min(1, "Seats must be at least 1").max(100000),
  stage: z.enum(STAGES),
  notes: z
    .string()
    .trim()
    .min(40, "Paste a bit more from your deal notes (at least a few sentences)")
    .max(8000, "That's a lot of notes. Trim them to 8,000 characters or fewer"),
  employees: optionalInt(1, 1_000_000),
  pilotLengthDays: optionalInt(7, 180),
  stageDay: optionalInt(1, 365),
  renewalMonths: optionalInt(1, 36),
});
export type NewAccountInput = z.infer<typeof newAccountInputSchema>;

export const milestoneDraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDay: z.number().int().min(1).max(400).describe("Day of the stage it's due, where day 1 is the stage start"),
  alreadyDone: z.boolean().describe("True only if the notes say it already happened"),
});

/** Call A: plan and people. */
export const buildPlanSchema = accountProfileSchema
  .pick({
    summary: true,
    goals: true,
    champion: true,
    stakeholders: true,
    concerns: true,
    successCriteria: true,
    thisWeek: true,
    guides: true,
  })
  .extend({ milestones: z.array(milestoneDraftSchema).min(6).max(10) });

/** Call B: setup guide and champion kit. */
export const buildKitSchema = accountProfileSchema.pick({ setupSteps: true, championKit: true });
export type SuccessCriterion = z.infer<typeof successCriterionSchema>;

export const teamUsageSchema = z.object({
  team: z.string(),
  active: z.number().int(),
  seats: z.number().int(),
});
export type TeamUsage = z.infer<typeof teamUsageSchema>;

export const MILESTONE_STATUSES = ["todo", "in_progress", "done"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const QUESTION_TOPICS = ["security", "compliance", "setup", "usage", "other"] as const;
export type QuestionTopic = (typeof QUESTION_TOPICS)[number];

// AI insights shown on the rep side. Pre-written for the demo accounts (source "seed"),
// generated live by Claude from Phase 5 on (source "live").

export const riskPlaySchema = z.object({
  reason: z.string().describe("One line for the at-risk panel"),
  explanation: z.string().describe("Two or three sentences on what is going on"),
  play: z.object({
    title: z.string(),
    steps: z.array(z.string()).min(1).max(5),
  }),
});
export type RiskPlay = z.infer<typeof riskPlaySchema>;

export const nextBestActionSchema = z.object({
  actions: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(1)
    .max(3),
});
export type NextBestAction = z.infer<typeof nextBestActionSchema>;

export const questionThemesSchema = z.object({
  summary: z.string(),
  themes: z.array(z.object({ theme: z.string(), count: z.number().int(), note: z.string() })),
});
export type QuestionThemes = z.infer<typeof questionThemesSchema>;

export const callBriefSchema = z.object({
  headline: z.string().describe("One sentence: the state of the account going into the call"),
  whatChanged: z.array(z.string()).min(1).max(5),
  openQuestions: z.array(z.string()).max(4),
  risks: z.array(z.string()).max(3),
  opportunities: z.array(z.string()).max(3),
  talkTrack: z
    .array(z.object({ topic: z.string(), say: z.string() }))
    .min(3)
    .max(5),
  asks: z.array(z.string()).max(3),
});
export type CallBrief = z.infer<typeof callBriefSchema>;

export const expansionPitchSchema = z.object({
  headline: z.string().describe("One line for the home panel"),
  why: z.string().describe("Two or three sentences on why now"),
  proposal: z.string().describe("What to propose, in seats or teams from the data, with no prices"),
  talkingPoints: z.array(z.string()).min(2).max(4),
  nextStep: z.string(),
});
export type ExpansionPitch = z.infer<typeof expansionPitchSchema>;

export const INSIGHT_KINDS = ["risk_play", "next_best_action", "question_themes", "call_brief", "expansion_pitch"] as const;
export type InsightKind = (typeof INSIGHT_KINDS)[number];

export type InsightContent = {
  risk_play: RiskPlay;
  next_best_action: NextBestAction;
  question_themes: QuestionThemes;
  call_brief: CallBrief;
  expansion_pitch: ExpansionPitch;
};

export const insightSchemas = {
  risk_play: riskPlaySchema,
  next_best_action: nextBestActionSchema,
  question_themes: questionThemesSchema,
  call_brief: callBriefSchema,
  expansion_pitch: expansionPitchSchema,
} as const;

// The customer-facing business review. Everything in it is shown to the customer's executives.
export const businessReviewSchema = z.object({
  title: z.string(),
  period: z.string().describe("For example: First 75 days"),
  executiveSummary: z.string().describe("Three or four sentences for an executive"),
  goals: z
    .array(
      z.object({
        goal: z.string(),
        status: z.enum(["achieved", "on_track", "in_progress", "not_started"]),
        evidence: z.string(),
      }),
    )
    .min(1)
    .max(5),
  adoptionHighlights: z.array(z.string()).max(4),
  wins: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(1)
    .max(4),
  nextQuarter: z
    .array(z.object({ title: z.string(), detail: z.string(), owner: z.string(), timing: z.string() }))
    .min(1)
    .max(5),
  asks: z.array(z.string()).max(3),
});
export type BusinessReview = z.infer<typeof businessReviewSchema>;

// "Log a call": Claude reads the rep's notes and proposes changes to the account. The rep reviews
// them before anything is saved.
export const callUpdateSchema = z.object({
  summary: z.string().describe("Two or three sentences: what happened on the call"),
  completedMilestoneIds: z.array(z.string()).max(10),
  startedMilestoneIds: z.array(z.string()).max(10),
  rescheduledMilestones: z
    .array(z.object({ id: z.string(), dueInDays: z.number().int().min(0).max(365) }))
    .max(10)
    .describe("Existing milestones the call gave a new date for"),
  newMilestones: z
    .array(z.object({ title: z.string(), description: z.string(), dueInDays: z.number().int().min(0).max(365) }))
    .max(5),
  newConcerns: z.array(z.object({ concern: z.string(), raisedBy: z.string(), response: z.string() })).max(4),
  newStakeholders: z.array(z.object({ name: z.string().nullable(), title: z.string(), notes: z.string() })).max(4),
  championNote: z.string().nullable().describe("An updated one-line note on the champion, or null if nothing changed"),
  followUpEmail: z.string(),
});
export type CallUpdate = z.infer<typeof callUpdateSchema>;

export const MATERIAL_KINDS = [
  "launch_email",
  "enablement_agenda",
  "developer_faq",
  "checkin_email",
  "pilot_readout",
  "value_summary",
] as const;
export type MaterialKind = (typeof MATERIAL_KINDS)[number];
