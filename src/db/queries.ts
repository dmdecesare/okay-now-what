import { asc, eq } from "drizzle-orm";
import { assessHealth, activePct, type HealthStatus, type Signal } from "@/lib/health";
import { stageDay } from "@/lib/dates";
import type { AccountProfile, Stage } from "@/lib/schemas";
import { getDb } from "./client";
import {
  accountProfiles,
  accounts,
  customerQuestions,
  milestones,
  spendMonths,
  usageSnapshots,
} from "./schema";

export type SpendTrend = "up" | "down" | "flat" | "none";

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
  spendTrend: SpendTrend;
  health: { status: HealthStatus; signals: Signal[] };
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

/** Every account with its latest usage, spend trend, and health. Rep side only. */
export async function listAccountSummaries(now: Date = new Date()): Promise<AccountSummary[]> {
  const db = await getDb();
  const [accts, profiles, usage, spend, ms, qs] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.createdAt), asc(accounts.name)),
    db.select().from(accountProfiles),
    db.select().from(usageSnapshots).orderBy(asc(usageSnapshots.date)),
    db.select().from(spendMonths).orderBy(asc(spendMonths.month)),
    db.select().from(milestones),
    db.select().from(customerQuestions),
  ]);

  const profileBy = new Map(profiles.map((p) => [p.accountId, p.data]));
  const usageBy = groupBy(usage, (u) => u.accountId);
  const spendBy = groupBy(spend, (s) => s.accountId);
  const msBy = groupBy(ms, (m) => m.accountId);
  const qsBy = groupBy(qs, (q) => q.accountId);

  return accts.map((a) => {
    const u = usageBy.get(a.id) ?? [];
    const s = spendBy.get(a.id) ?? [];
    const latest = u.at(-1);
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
      spendTrend: spendTrend(s),
      health: assessHealth({
        now,
        seats: a.seats,
        championName: profileBy.get(a.id)?.champion.name,
        championLastVisitAt: a.championLastVisitAt,
        usage: u,
        spend: s,
        milestones: msBy.get(a.id) ?? [],
        questions: qsBy.get(a.id) ?? [],
      }),
    };
  });
}

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

/** Rep-side helper for building share links. */
export async function listCustomerLinks(): Promise<{ slug: string; name: string; token: string }[]> {
  const db = await getDb();
  return db
    .select({ slug: accounts.slug, name: accounts.name, token: accounts.customerToken })
    .from(accounts)
    .orderBy(asc(accounts.createdAt), asc(accounts.name));
}
