import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { assessHealth, activePct, type HealthStatus, type Signal } from "@/lib/health";
import { assessExpansion, type ExpansionLevel, type ExpansionSignal } from "@/lib/expansion";
import { baselineSnapshot, sortSnapshots } from "@/lib/adoption";
import { daysBetween, stageDay, todayISO } from "@/lib/dates";
import {
  businessReviewSchema,
  insightSchemas,
  type AccountProfile,
  type BusinessReview,
  type InsightContent,
  type InsightKind,
  type MaterialKind,
  type Stage,
  type TeamUsage,
} from "@/lib/schemas";
import { toChecklist, type ChecklistMilestone } from "@/lib/milestones";
import { seedLogoId, type SeedLogoId } from "@/lib/logos";
import { summarizeLearning, type LearningSummary } from "@/lib/learning";
import { summarizePulse, type PulseSummary } from "@/lib/pulse";
import { getDb } from "./client";
import {
  accountProfiles,
  accounts,
  aiInsights,
  businessReviews,
  callLogs,
  customerQuestions,
  helpRequests,
  pulseResponses,
  learningCompletions,
  generatedMaterials,
  milestones,
  spendMonths,
  usageSnapshots,
  type Account,
  type CallLog,
  type CustomerQuestion,
  type HelpRequest,
  type Milestone,
  type SpendMonth,
  type UsageSnapshot,
} from "./schema";

export type SpendTrend = "up" | "down" | "flat" | "none";

export type Insight<K extends InsightKind> = {
  content: InsightContent[K];
  source: "seed" | "live";
  generatedAt: Date;
};
export type Insights = { [K in InsightKind]?: Insight<K> };

export type Health = { status: HealthStatus; signals: Signal[] };

export type Expansion = { level: ExpansionLevel; signals: ExpansionSignal[] };

export type AccountSummary = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  stage: Stage;
  stageDay: number;
  pilotLengthDays: number | null;
  seats: number;
  activeSeats: number | null;
  activePct: number | null;
  /** Points of % active gained or lost over the last 30 days. */
  activeChange: number | null;
  /** % active at each usage snapshot, oldest first. */
  adoptionSeries: number[];
  monthlySpend: number | null;
  /** Total monthly spend, oldest first. */
  spendSeries: number[];
  spendTrend: SpendTrend;
  renewalInDays: number | null;
  championName: string | null;
  championLastVisitAt: Date | null;
  overdueCount: number;
  health: Health;
  expansion: Expansion;
  riskPlay?: Insight<"risk_play">;
  expansionPitch?: Insight<"expansion_pitch">;
  openRequests: number;
  pulseAverage: number | null;
};

function groupBy<T, K>(rows: T[], key: (r: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = out.get(k);
    if (list) list.push(r);
    else out.set(k, [r]);
  }
  return out;
}

function spendTrend(spend: { month: string; seatSpend: number; usageSpend: number }[]): SpendTrend {
  if (spend.length < 2) return "none";
  const [prev, last] = spend.slice(-2).map((m) => m.seatSpend + m.usageSpend);
  const change = (last - prev) / prev;
  // Seat spend dominates the total, so even a small move is worth an arrow.
  if (change > 0.005) return "up";
  if (change < -0.005) return "down";
  return "flat";
}

/** Validates stored insight JSON; anything that doesn't match its schema is skipped. */
function toInsights(rows: (typeof aiInsights.$inferSelect)[]): Insights {
  const out: Insights = {};
  for (const r of rows) {
    const parsed = insightSchemas[r.kind]?.safeParse(r.content);
    if (!parsed?.success) continue;
    (out as Record<string, unknown>)[r.kind] = {
      content: parsed.data,
      source: r.source,
      generatedAt: r.generatedAt,
    };
  }
  return out;
}

function healthFor(
  a: Account,
  profile: AccountProfile | undefined,
  data: {
    usage: UsageSnapshot[];
    spend: SpendMonth[];
    milestones: Milestone[];
    questions: CustomerQuestion[];
  },
  now: Date,
): Health {
  return assessHealth({
    now,
    seats: a.seats,
    championName: profile?.champion.name,
    championLastVisitAt: a.championLastVisitAt,
    usage: data.usage,
    spend: data.spend,
    milestones: data.milestones,
    questions: data.questions,
  });
}

export type AccountDetail = {
  account: Account;
  profile: AccountProfile;
  stageDay: number;
  milestones: Milestone[];
  usage: UsageSnapshot[];
  spend: SpendMonth[];
  /** Newest first. */
  questions: CustomerQuestion[];
  insights: Insights;
  health: Health;
  expansion: Expansion;
  /** Logged calls, newest first. Rep-only. */
  calls: CallLog[];
  /** Help the customer asked for in their portal, newest first. */
  helpRequests: HelpRequest[];
  pulse: PulseSummary;
  /** Saved tool drafts, by kind. */
  materials: Partial<Record<MaterialKind, { content: string; updatedAt: Date }>>;
};

/** Everything the rep sees for one account. Deduped per request across layout and tab. */
export const getAccountDetail = cache(async (slug: string): Promise<AccountDetail | null> => {
  const db = await getDb();
  const [row] = await db
    .select({ account: accounts, profile: accountProfiles.data })
    .from(accounts)
    .innerJoin(accountProfiles, eq(accountProfiles.accountId, accounts.id))
    .where(eq(accounts.slug, slug))
    .limit(1);
  if (!row) return null;

  const id = row.account.id;
  const [ms, usage, spend, questions, insights, materials, calls, requests, pulse] = await Promise.all([
    db.select().from(milestones).where(eq(milestones.accountId, id)).orderBy(asc(milestones.sortOrder)),
    db.select().from(usageSnapshots).where(eq(usageSnapshots.accountId, id)).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).where(eq(spendMonths.accountId, id)).orderBy(asc(spendMonths.month)),
    db
      .select()
      .from(customerQuestions)
      .where(eq(customerQuestions.accountId, id))
      .orderBy(desc(customerQuestions.askedAt)),
    db.select().from(aiInsights).where(eq(aiInsights.accountId, id)),
    db.select().from(generatedMaterials).where(eq(generatedMaterials.accountId, id)),
    db.select().from(callLogs).where(eq(callLogs.accountId, id)).orderBy(desc(callLogs.occurredOn), desc(callLogs.createdAt)),
    db.select().from(helpRequests).where(eq(helpRequests.accountId, id)).orderBy(desc(helpRequests.createdAt)),
    db.select().from(pulseResponses).where(eq(pulseResponses.accountId, id)),
  ]);

  const now = new Date();
  return {
    account: row.account,
    profile: row.profile,
    stageDay: stageDay(row.account.stageStartDate, now),
    milestones: ms,
    usage,
    spend,
    questions,
    insights: toInsights(insights),
    health: healthFor(row.account, row.profile, { usage, spend, milestones: ms, questions }, now),
    expansion: expansionFor(row.account, row.profile, usage, spend),
    calls,
    helpRequests: requests,
    pulse: summarizePulse(pulse, now),
    materials: Object.fromEntries(materials.map((m) => [m.kind, { content: m.content, updatedAt: m.updatedAt }])),
  };
});

function expansionFor(a: Account, profile: AccountProfile, usage: UsageSnapshot[], spend: SpendMonth[]): Expansion {
  return assessExpansion({
    stage: a.stage,
    seats: a.seats,
    usage,
    spend,
    successCriteria: profile.successCriteria,
  });
}

/**
 * Every account in full, loaded with one query per table and grouped in memory.
 * Rep side only. Feeds the book of business, the sidebar, and the rep chat.
 */
async function loadBook(now: Date = new Date()): Promise<AccountDetail[]> {
  const db = await getDb();
  const [accts, profiles, usage, spend, ms, qs, insights, materials, calls, requests, pulse] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.createdAt), asc(accounts.name)),
    db.select().from(accountProfiles),
    db.select().from(usageSnapshots).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).orderBy(asc(spendMonths.month)),
    db.select().from(milestones).orderBy(asc(milestones.sortOrder)),
    db.select().from(customerQuestions).orderBy(desc(customerQuestions.askedAt)),
    db.select().from(aiInsights),
    db.select().from(generatedMaterials),
    db.select().from(callLogs).orderBy(desc(callLogs.occurredOn), desc(callLogs.createdAt)),
    db.select().from(helpRequests).orderBy(desc(helpRequests.createdAt)),
    db.select().from(pulseResponses),
  ]);

  const callsBy = groupBy(calls, (c) => c.accountId);
  const requestsBy = groupBy(requests, (r) => r.accountId);
  const pulseBy = groupBy(pulse, (r) => r.accountId);
  const profileBy = new Map(profiles.map((p) => [p.accountId, p.data]));
  const usageBy = groupBy(usage, (u) => u.accountId);
  const spendBy = groupBy(spend, (s) => s.accountId);
  const msBy = groupBy(ms, (m) => m.accountId);
  const qsBy = groupBy(qs, (q) => q.accountId);
  const insightsBy = groupBy(insights, (i) => i.accountId);
  const materialsBy = groupBy(materials, (m) => m.accountId);

  return accts.flatMap((a) => {
    const profile = profileBy.get(a.id);
    if (!profile) return [];
    const u = usageBy.get(a.id) ?? [];
    const s = spendBy.get(a.id) ?? [];
    const m = msBy.get(a.id) ?? [];
    const q = qsBy.get(a.id) ?? [];
    return [
      {
        account: a,
        profile,
        stageDay: stageDay(a.stageStartDate, now),
        milestones: m,
        usage: u,
        spend: s,
        questions: q,
        insights: toInsights(insightsBy.get(a.id) ?? []),
        health: healthFor(a, profile, { usage: u, spend: s, milestones: m, questions: q }, now),
        expansion: expansionFor(a, profile, u, s),
        calls: callsBy.get(a.id) ?? [],
        helpRequests: requestsBy.get(a.id) ?? [],
        pulse: summarizePulse(pulseBy.get(a.id) ?? [], now),
        materials: Object.fromEntries(
          (materialsBy.get(a.id) ?? []).map((x) => [x.kind, { content: x.content, updatedAt: x.updatedAt }]),
        ),
      },
    ];
  });
}

/** The whole book, deduped per request across the sidebar, the page, and the rep chat. */
export const getBook = cache(() => loadBook());

/** The at-a-glance numbers for one account (used by the book and by the account header). */
export function summarize(d: AccountDetail, now: Date = new Date()): AccountSummary {
  const a = d.account;
  const usage = sortSnapshots(d.usage);
  const latest = usage.at(-1);
  const base = baselineSnapshot(usage);
  const lastMonth = d.spend.at(-1);
  const today = todayISO(now);
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    industry: a.industry,
    stage: a.stage,
    stageDay: d.stageDay,
    pilotLengthDays: a.pilotLengthDays,
    seats: a.seats,
    activeSeats: latest?.activeSeats ?? null,
    activePct: latest ? activePct(latest.activeSeats, a.seats) : null,
    activeChange:
      latest && base ? activePct(latest.activeSeats, a.seats) - activePct(base.activeSeats, a.seats) : null,
    adoptionSeries: usage.map((x) => activePct(x.activeSeats, a.seats)),
    monthlySpend: lastMonth ? lastMonth.seatSpend + lastMonth.usageSpend : null,
    spendSeries: d.spend.map((x) => x.seatSpend + x.usageSpend),
    spendTrend: spendTrend(d.spend),
    renewalInDays: a.renewalDate ? daysBetween(today, a.renewalDate) : null,
    championName: d.profile.champion.name,
    championLastVisitAt: a.championLastVisitAt,
    overdueCount: d.milestones.filter((m) => m.status !== "done" && m.dueDate < today).length,
    health: d.health,
    expansion: d.expansion,
    riskPlay: d.insights.risk_play,
    expansionPitch: d.insights.expansion_pitch,
    openRequests: d.helpRequests.filter((r) => r.status === "open").length,
    pulseAverage: d.pulse.average,
  };
}

/** Every account with its latest usage, spend trend, health, and growth signals. Rep side only. */
export async function listAccountSummaries(now: Date = new Date()): Promise<AccountSummary[]> {
  const book = await getBook();
  return book.map((d) => summarize(d, now));
}

/** Summaries, deduped per request. */
export const getSummaries = cache(() => listAccountSummaries());

/**
 * What the customer app is allowed to see. Built field by field so internal data
 * (health, risk, spend, insights, questions, deal notes, rep notes) can't leak by accident.
 */
export type CustomerView = {
  name: string;
  /** Which hand-drawn demo logo to show, if any. The slug itself is not exposed. */
  logoId: SeedLogoId | null;
  industry: string;
  seats: number;
  stage: Stage;
  stageDay: number;
  pilotLengthDays: number | null;
  profile: Pick<AccountProfile, "successCriteria" | "thisWeek" | "setupSteps" | "championKit" | "guides"> & {
    // Goals without the "in their words" quotes and champion without rep notes:
    // both come from internal deal notes.
    goals: { goal: string }[];
    champion: { name: string | null; title: string };
  };
  milestones: ChecklistMilestone[];
  usage: { date: string; activeSeats: number; teams: TeamUsage[] }[];
};

/** Private links are 32 URL-safe characters; anything else can't be one. */
export function isTokenShape(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(token);
}

export const getCustomerView = cache(async (token: string): Promise<CustomerView | null> => {
  if (!isTokenShape(token)) return null;

  const db = await getDb();
  const [row] = await db
    .select({ account: accounts, profile: accountProfiles.data })
    .from(accounts)
    .innerJoin(accountProfiles, eq(accountProfiles.accountId, accounts.id))
    .where(eq(accounts.customerToken, token))
    .limit(1);
  if (!row) return null;

  const { account: a, profile: p } = row;
  const [ms, usage] = await Promise.all([
    db.select().from(milestones).where(eq(milestones.accountId, a.id)).orderBy(asc(milestones.sortOrder)),
    db.select().from(usageSnapshots).where(eq(usageSnapshots.accountId, a.id)).orderBy(asc(usageSnapshots.date)),
  ]);

  return {
    name: a.name,
    logoId: seedLogoId(a.slug),
    industry: a.industry,
    seats: a.seats,
    stage: a.stage,
    stageDay: stageDay(a.stageStartDate),
    pilotLengthDays: a.pilotLengthDays,
    profile: {
      goals: p.goals.map((g) => ({ goal: g.goal })),
      champion: { name: p.champion.name, title: p.champion.title },
      successCriteria: p.successCriteria,
      thisWeek: p.thisWeek,
      setupSteps: p.setupSteps,
      championKit: p.championKit,
      guides: p.guides,
    },
    milestones: ms.map(toChecklist),
    usage: usage.map((u) => ({ date: u.date, activeSeats: u.activeSeats, teams: u.teams })),
  };
});

/**
 * Server-only context for the Ask assistant: the customer view plus the account ID and
 * the topics raised during the deal (concern titles only, no rep notes). Never sent to
 * the browser.
 */
export async function getAskContext(
  token: string,
): Promise<(CustomerView & { accountId: string; slug: string; concerns: string[] }) | null> {
  const view = await getCustomerView(token);
  if (!view) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: accounts.id, slug: accounts.slug, profile: accountProfiles.data })
    .from(accounts)
    .innerJoin(accountProfiles, eq(accountProfiles.accountId, accounts.id))
    .where(eq(accounts.customerToken, token))
    .limit(1);
  if (!row) return null;
  return { ...view, accountId: row.id, slug: row.slug, concerns: row.profile.concerns.map((c) => c.concern) };
}

// ----------------------------------------------------------------------------
// Business reviews and learning paths
// ----------------------------------------------------------------------------

export type StoredReview = {
  content: BusinessReview;
  status: "draft" | "published";
  source: "seed" | "live";
  generatedAt: Date;
  publishedAt: Date | null;
};

async function reviewFor(accountId: string): Promise<StoredReview | null> {
  const db = await getDb();
  const [row] = await db.select().from(businessReviews).where(eq(businessReviews.accountId, accountId)).limit(1);
  if (!row) return null;
  const parsed = businessReviewSchema.safeParse(row.content);
  if (!parsed.success) return null;
  return { content: parsed.data, status: row.status, source: row.source, generatedAt: row.generatedAt, publishedAt: row.publishedAt };
}

/** The rep's view of the review: drafts included. */
export async function getAccountReview(accountId: string): Promise<StoredReview | null> {
  return reviewFor(accountId);
}

async function accountIdForToken(token: string): Promise<string | null> {
  if (!isTokenShape(token)) return null;
  const db = await getDb();
  const [row] = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.customerToken, token)).limit(1);
  return row?.id ?? null;
}

/** The customer's view: only a published review, never a draft. */
export const getCustomerReview = cache(async (token: string): Promise<StoredReview | null> => {
  const id = await accountIdForToken(token);
  if (!id) return null;
  const review = await reviewFor(id);
  return review?.status === "published" ? review : null;
});

export async function getLearningForAccount(accountId: string): Promise<LearningSummary> {
  const db = await getDb();
  const rows = await db.select().from(learningCompletions).where(eq(learningCompletions.accountId, accountId));
  return summarizeLearning(rows);
}

/** Learning path progress for the customer portal (names are what learners typed, shown to their own team). */
export const getCustomerLearning = cache(async (token: string): Promise<LearningSummary | null> => {
  const id = await accountIdForToken(token);
  return id ? getLearningForAccount(id) : null;
});

/** For write actions: the account behind a customer token. */
export async function getAccountIdForToken(token: string): Promise<string | null> {
  return accountIdForToken(token);
}

export type CustomerSupport = {
  requests: { id: string; kind: HelpRequest["kind"]; message: string; status: HelpRequest["status"]; createdAt: Date }[];
  pulse: Pick<PulseSummary, "count" | "average">;
};

/** For the customer's portal: their own help requests and the team's pulse average (no blocker text). */
export const getCustomerSupport = cache(async (token: string): Promise<CustomerSupport | null> => {
  const id = await accountIdForToken(token);
  if (!id) return null;
  const db = await getDb();
  const [requests, pulse] = await Promise.all([
    db.select().from(helpRequests).where(eq(helpRequests.accountId, id)).orderBy(desc(helpRequests.createdAt)),
    db.select().from(pulseResponses).where(eq(pulseResponses.accountId, id)),
  ]);
  const summary = summarizePulse(pulse);
  return {
    requests: requests.slice(0, 5).map((r) => ({ id: r.id, kind: r.kind, message: r.message, status: r.status, createdAt: r.createdAt })),
    pulse: { count: summary.count, average: summary.average },
  };
});

export type CustomerValue = {
  seats: number;
  usage: { date: string; activeSeats: number; teams: TeamUsage[] }[];
  spend: { month: string; seatSpend: number; usageSpend: number }[];
  assumptions: AccountProfile["roiAssumptions"];
};

/**
 * For the customer's Value page only: what they pay per month (their own contract) and the value
 * assumptions. Kept out of CustomerView so no other customer page can receive spend data.
 */
export const getCustomerValue = cache(async (token: string): Promise<CustomerValue | null> => {
  if (!isTokenShape(token)) return null;
  const db = await getDb();
  const [row] = await db
    .select({ account: accounts, profile: accountProfiles.data })
    .from(accounts)
    .innerJoin(accountProfiles, eq(accountProfiles.accountId, accounts.id))
    .where(eq(accounts.customerToken, token))
    .limit(1);
  if (!row) return null;
  const [usage, spend] = await Promise.all([
    db.select().from(usageSnapshots).where(eq(usageSnapshots.accountId, row.account.id)).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).where(eq(spendMonths.accountId, row.account.id)).orderBy(asc(spendMonths.month)),
  ]);
  return {
    seats: row.account.seats,
    usage: usage.map((u) => ({ date: u.date, activeSeats: u.activeSeats, teams: u.teams })),
    spend: spend.map((s) => ({ month: s.month, seatSpend: s.seatSpend, usageSpend: s.usageSpend })),
    assumptions: row.profile.roiAssumptions ?? null,
  };
});
