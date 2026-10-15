import { z } from "zod";
import { GUIDE_TOPIC_IDS } from "./guide-topics";

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
});

export type AccountProfile = z.infer<typeof accountProfileSchema>;
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

export const MATERIAL_KINDS = [
  "launch_email",
  "enablement_agenda",
  "developer_faq",
  "checkin_email",
  "pilot_readout",
  "value_summary",
] as const;
export type MaterialKind = (typeof MATERIAL_KINDS)[number];
