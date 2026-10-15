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

export type Account = typeof accounts.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type UsageSnapshot = typeof usageSnapshots.$inferSelect;
export type SpendMonth = typeof spendMonths.$inferSelect;
export type CustomerQuestion = typeof customerQuestions.$inferSelect;
