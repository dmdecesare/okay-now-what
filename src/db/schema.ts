import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AccountProfile,
  InsightKind,
  MaterialKind,
  MilestoneStatus,
  QuestionTopic,
  Stage,
  TeamUsage,
} from "@/lib/schemas";

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  employees: integer("employees"),
  seats: integer("seats").notNull(),
  stage: text("stage").$type<Stage>().notNull(),
  /** Day 1 of the current stage. "Day N" in the UI is computed from this. */
  stageStartDate: date("stage_start_date", { mode: "string" }).notNull(),
  pilotLengthDays: integer("pilot_length_days"),
  renewalDate: date("renewal_date", { mode: "string" }),
  /** Long random token for the private customer link (/c/[token]). */
  customerToken: text("customer_token").notNull().unique(),
  championLastVisitAt: timestamp("champion_last_visit_at", { withTimezone: true }),
  dealNotes: text("deal_notes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accountProfiles = pgTable("account_profiles", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<AccountProfile>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    status: text("status").$type<MilestoneStatus>().notNull().default("todo"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: text("completed_by").$type<"rep" | "customer">(),
    sortOrder: integer("sort_order").notNull(),
  },
  (t) => [index("milestones_account_idx").on(t.accountId)],
);

export const usageSnapshots = pgTable(
  "usage_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    activeSeats: integer("active_seats").notNull(),
    teams: jsonb("teams").$type<TeamUsage[]>().notNull(),
  },
  (t) => [index("usage_account_idx").on(t.accountId)],
);

export const spendMonths = pgTable(
  "spend_months",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    /** First day of the billing month. */
    month: date("month", { mode: "string" }).notNull(),
    seatSpend: integer("seat_spend").notNull(),
    usageSpend: integer("usage_spend").notNull(),
  },
  (t) => [index("spend_account_idx").on(t.accountId)],
);

export const customerQuestions = pgTable(
  "customer_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    topic: text("topic").$type<QuestionTopic>().notNull(),
    /** Keys from the verified doc catalog that the answer cited. */
    sources: jsonb("sources").$type<string[]>(),
    askedAt: timestamp("asked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("questions_account_idx").on(t.accountId)],
);

export const generatedMaterials = pgTable(
  "generated_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    kind: text("kind").$type<MaterialKind>().notNull(),
    content: text("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("materials_account_kind_idx").on(t.accountId, t.kind)],
);

export const aiInsights = pgTable(
  "ai_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    kind: text("kind").$type<InsightKind>().notNull(),
    /** Validated against insightSchemas[kind] before it is saved. */
    content: jsonb("content").notNull(),
    source: text("source").$type<"seed" | "live">().notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("insights_account_kind_idx").on(t.accountId, t.kind)],
);

/**
 * The customer-facing business review for an account. Built only from customer-safe data, so it can be
 * shown on the customer's success portal once the rep publishes it. One per account.
 */
export const businessReviews = pgTable("business_reviews", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  /** Validated against businessReviewSchema before it is saved. */
  content: jsonb("content").notNull(),
  status: text("status").$type<"draft" | "published">().notNull().default("draft"),
  source: text("source").$type<"seed" | "live">().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

/**
 * Developer learning path progress. There is no login, so learners are identified by the display
 * name they type (normalized into nameKey) within one account.
 */
export const learningCompletions = pgTable(
  "learning_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    nameKey: text("name_key").notNull(),
    role: text("role").notNull(),
    challengeId: text("challenge_id").notNull(),
    source: text("source").$type<"seed" | "live">().notNull().default("live"),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("learning_unique_idx").on(t.accountId, t.nameKey, t.challengeId),
    index("learning_account_idx").on(t.accountId),
  ],
);

/** Calls the rep logged: their notes and Claude's summary. Rep-only. */
export const callLogs = pgTable(
  "call_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    notes: text("notes").notNull(),
    summary: text("summary").notNull(),
    source: text("source").$type<"seed" | "live">().notNull().default("live"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("call_logs_account_idx").on(t.accountId)],
);

/** Help the customer asked for from their success portal: a session, a blocker, or anything else. */
export const helpRequests = pgTable(
  "help_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    kind: text("kind").$type<"session" | "blocker" | "other">().notNull(),
    message: text("message").notNull(),
    requesterName: text("requester_name"),
    status: text("status").$type<"open" | "resolved">().notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("help_requests_account_idx").on(t.accountId)],
);

/** Anonymous weekly pulse from developers in the portal: a 1 to 5 score and an optional blocker. */
export const pulseResponses = pgTable(
  "pulse_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    blocker: text("blocker"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pulse_account_idx").on(t.accountId, t.createdAt)],
);

/** One row per live AI call. Powers rate limiting and the "by the numbers" stats. */
export const aiCalls = pgTable(
  "ai_calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feature: text("feature").notNull(),
    /** Hashed caller IP. The raw IP is never stored. */
    ipHash: text("ip_hash").notNull(),
    status: text("status").$type<"ok" | "error" | "refused" | "limited">().notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_calls_created_idx").on(t.createdAt), index("ai_calls_ip_idx").on(t.ipHash, t.createdAt)],
);

export type Account = typeof accounts.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type UsageSnapshot = typeof usageSnapshots.$inferSelect;
export type SpendMonth = typeof spendMonths.$inferSelect;
export type CustomerQuestion = typeof customerQuestions.$inferSelect;
export type CallLog = typeof callLogs.$inferSelect;
export type HelpRequest = typeof helpRequests.$inferSelect;
export type PulseResponse = typeof pulseResponses.$inferSelect;
