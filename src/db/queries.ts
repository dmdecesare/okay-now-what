import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { assessHealth, activePct, type HealthStatus, type Signal } from "@/lib/health";
import { stageDay } from "@/lib/dates";
import {
  insightSchemas,
  type AccountProfile,
  type InsightContent,
  type InsightKind,
  type Stage,
} from "@/lib/schemas";
import { getDb } from "./client";
import {
  accountProfiles,
  accounts,
  aiInsights,
  customerQuestions,
  milestones,
  spendMonths,
  usageSnapshots,
  type Account,
  type CustomerQuestion,
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

export type AccountSummary = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  stage: Stage;
  stageDay: number;
  seats: number;
  activeSeats: number | null;
  activePct: number | null;
  monthlySpend: number | null;
  spendTrend: SpendTrend;
  health: Health;
  riskPlay?: Insight<"risk_play">;
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

function spendTrend(spend: { month: string; seatSpend: number; premiumRequestSpend: number }[]): SpendTrend {
  if (spend.length < 2) return "none";
  const [prev, last] = spend.slice(-2).map((m) => m.seatSpend + m.premiumRequestSpend);
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

/** Every account with its latest usage, spend trend, and health. Rep side only. */
export async function listAccountSummaries(now: Date = new Date()): Promise<AccountSummary[]> {
  const db = await getDb();
  const [accts, profiles, usage, spend, ms, qs, insights] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.createdAt), asc(accounts.name)),
    db.select().from(accountProfiles),
    db.select().from(usageSnapshots).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).orderBy(asc(spendMonths.month)),
    db.select().from(milestones),
    db.select().from(customerQuestions),
    db.select().from(aiInsights),
  ]);

  const profileBy = new Map(profiles.map((p) => [p.accountId, p.data]));
  const usageBy = groupBy(usage, (u) => u.accountId);
  const spendBy = groupBy(spend, (s) => s.accountId);
  const msBy = groupBy(ms, (m) => m.accountId);
  const qsBy = groupBy(qs, (q) => q.accountId);
  const insightsBy = groupBy(insights, (i) => i.accountId);

  return accts.map((a) => {
    const u = usageBy.get(a.id) ?? [];
    const s = spendBy.get(a.id) ?? [];
    const latest = u.at(-1);
    const lastMonth = s.at(-1);
    return {
      id: a.id,
      slug: a.slug,
      name: a.name,
      industry: a.industry,
      stage: a.stage,
      stageDay: stageDay(a.stageStartDate, now),
      seats: a.seats,
      activeSeats: latest?.activeSeats ?? null,
      activePct: latest ? activePct(latest.activeSeats, a.seats) : null,
      monthlySpend: lastMonth ? lastMonth.seatSpend + lastMonth.premiumRequestSpend : null,
      spendTrend: spendTrend(s),
      health: healthFor(
        a,
        profileBy.get(a.id),
        { usage: u, spend: s, milestones: msBy.get(a.id) ?? [], questions: qsBy.get(a.id) ?? [] },
        now,
      ),
      riskPlay: toInsights(insightsBy.get(a.id) ?? []).risk_play,
    };
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
  const [ms, usage, spend, questions, insights] = await Promise.all([
    db.select().from(milestones).where(eq(milestones.accountId, id)).orderBy(asc(milestones.sortOrder)),
    db.select().from(usageSnapshots).where(eq(usageSnapshots.accountId, id)).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).where(eq(spendMonths.accountId, id)).orderBy(asc(spendMonths.month)),
    db
      .select()
      .from(customerQuestions)
      .where(eq(customerQuestions.accountId, id))
      .orderBy(desc(customerQuestions.askedAt)),
    db.select().from(aiInsights).where(eq(aiInsights.accountId, id)),
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
  };
});

/**
 * What the customer app is allowed to see. Built field by field so internal data
 * (health, risk, spend, deal notes, questions view) can't leak by accident.
 */
export type CustomerAccount = {
  name: string;
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
};

export async function getCustomerAccountByToken(token: string): Promise<CustomerAccount | null> {
  // Tokens are 32 URL-safe characters; skip the query for anything that can't be one.
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;

  const db = await getDb();
  const [row] = await db
    .select({ account: accounts, profile: accountProfiles.data })
    .from(accounts)
    .innerJoin(accountProfiles, eq(accountProfiles.accountId, accounts.id))
    .where(eq(accounts.customerToken, token))
    .limit(1);
  if (!row) return null;

  const { account: a, profile: p } = row;
  return {
    name: a.name,
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
  };
}
