import { randomBytes } from "node:crypto";
import { count } from "drizzle-orm";
import { accountProfileSchema, businessReviewSchema, insightSchemas, type InsightKind } from "@/lib/schemas";
import { nameKey } from "@/lib/learning";
import { addDays, monthStart, todayISO } from "@/lib/dates";
import type { DB } from "../client";
import {
  accountProfiles,
  accounts,
  aiInsights,
  businessReviews,
  customerQuestions,
  learningCompletions,
  generatedMaterials,
  milestones,
  spendMonths,
  usageSnapshots,
} from "../schema";
import { bluestone } from "./bluestone";
import { copperleaf } from "./copperleaf";
import { harborline } from "./harborline";
import type { SeedAccount } from "./types";

export const SEED_ACCOUNTS: SeedAccount[] = [harborline, copperleaf, bluestone];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Long, unguessable token for a customer's private link. */
export function newCustomerToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function seedIfEmpty(db: DB): Promise<boolean> {
  const [{ n }] = await db.select({ n: count() }).from(accounts);
  if (n > 0) return false;
  await insertSeed(db);
  return true;
}

/** Deletes everything and reloads the three demo accounts. */
export async function resetAndSeed(db: DB): Promise<void> {
  // Children first, then accounts. (No transaction: Neon's HTTP driver does not support them.)
  await db.delete(learningCompletions);
  await db.delete(businessReviews);
  await db.delete(aiInsights);
  await db.delete(generatedMaterials);
  await db.delete(customerQuestions);
  await db.delete(spendMonths);
  await db.delete(usageSnapshots);
  await db.delete(milestones);
  await db.delete(accountProfiles);
  await db.delete(accounts);
  await insertSeed(db);
}

async function insertSeed(db: DB, now: Date = new Date()): Promise<void> {
  const today = todayISO(now);

  for (const s of SEED_ACCOUNTS) {
    const profile = accountProfileSchema.parse(s.profile);
    const stageStartDate = addDays(today, -(s.stageDay - 1));
    const dayToDate = (day: number) => addDays(stageStartDate, day - 1);

    const [row] = await db
      .insert(accounts)
      .values({
        slug: s.slug,
        name: s.name,
        industry: s.industry,
        employees: s.employees,
        seats: s.seats,
        stage: s.stage,
        stageStartDate,
        pilotLengthDays: s.pilotLengthDays ?? null,
        renewalDate: s.renewalInDays != null ? addDays(today, s.renewalInDays) : null,
        customerToken: newCustomerToken(),
        championLastVisitAt: new Date(now.getTime() - s.championLastVisitDaysAgo * DAY_MS),
        dealNotes: s.dealNotes,
      })
      .returning({ id: accounts.id });

    const accountId = row.id;

    await db.insert(accountProfiles).values({ accountId, data: profile });

    await db.insert(milestones).values(
      s.milestones.map((m, i) => ({
        accountId,
        title: m.title,
        description: m.description,
        dueDate: dayToDate(m.dueDay),
        status: m.status,
        completedAt:
          m.status === "done" && m.completedDay != null
            ? new Date(dayToDate(m.completedDay) + "T16:00:00Z")
            : null,
        completedBy: m.status === "done" ? (m.completedBy ?? "rep") : null,
        sortOrder: i,
      })),
    );

    await db.insert(usageSnapshots).values(
      s.usage.map((u) => ({
        accountId,
        date: addDays(today, -u.daysAgo),
        activeSeats: u.teams.reduce((sum, t) => sum + t.active, 0),
        teams: u.teams,
      })),
    );

    await db.insert(spendMonths).values(
      s.spend.map((m) => ({
        accountId,
        month: monthStart(today, m.monthsAgo),
        seatSpend: m.seat,
        usageSpend: m.usage,
      })),
    );

    const insightRows = (Object.keys(s.insights) as InsightKind[]).map((kind) => ({
      accountId,
      kind,
      content: insightSchemas[kind].parse(s.insights[kind]),
      source: "seed" as const,
      generatedAt: now,
    }));
    if (insightRows.length > 0) await db.insert(aiInsights).values(insightRows);

    if (s.learning?.length) {
      await db.insert(learningCompletions).values(
        s.learning.flatMap((l, li) =>
          l.challenges.map((challengeId, ci) => ({
            accountId,
            displayName: l.name,
            nameKey: nameKey(l.name),
            role: l.role,
            challengeId,
            source: "seed" as const,
            completedAt: new Date(now.getTime() - (l.daysAgo + l.challenges.length - ci) * DAY_MS - li * 41 * 60 * 1000),
          })),
        ),
      );
    }

    if (s.review) {
      await db.insert(businessReviews).values({
        accountId,
        content: businessReviewSchema.parse(s.review.content),
        status: s.review.status,
        source: "seed",
        generatedAt: now,
        publishedAt: s.review.status === "published" ? now : null,
      });
    }

    if (s.questions.length > 0) {
      await db.insert(customerQuestions).values(
        s.questions.map((q, i) => ({
          accountId,
          question: q.question,
          answer: q.answer,
          topic: q.topic,
          sources: q.sources ?? null,
          // Spread across the working day so ordering is stable.
          askedAt: new Date(now.getTime() - q.daysAgo * DAY_MS - (i + 1) * 37 * 60 * 1000),
        })),
      );
    }
  }
}
