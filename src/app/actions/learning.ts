"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { and, count, countDistinct, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getAccountIdForToken, isTokenShape } from "@/db/queries";
import { learningCompletions } from "@/db/schema";
import { learnerInputSchema, MAX_LEARNERS_PER_ACCOUNT, nameKey } from "@/lib/learning";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp } from "@/lib/rate-limit";
import type { ActionResult } from "./milestones";

// Learning path check-offs from the customer portal. Authorized by the private link token, with
// input checks, the write rate limit, and a cap on learners per account.

export async function setChallengeDone(token: string, input: unknown): Promise<ActionResult> {
  if (typeof token !== "string" || !isTokenShape(token)) return { ok: false, message: "This link isn't valid." };
  const parsed = learnerInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Use 2 to 24 letters for your name, then try again." };
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };

  const accountId = await getAccountIdForToken(token);
  if (!accountId) return { ok: false, message: "This link isn't valid." };

  const { name, role, challengeId, done } = parsed.data;
  const key = nameKey(name);
  const db = await getDb();

  if (done) {
    const [mine] = await db
      .select({ n: count() })
      .from(learningCompletions)
      .where(and(eq(learningCompletions.accountId, accountId), eq(learningCompletions.nameKey, key)));
    if ((mine?.n ?? 0) === 0) {
      const [all] = await db
        .select({ n: countDistinct(learningCompletions.nameKey) })
        .from(learningCompletions)
        .where(eq(learningCompletions.accountId, accountId));
      if ((all?.n ?? 0) >= MAX_LEARNERS_PER_ACCOUNT) {
        return { ok: false, message: "This portal has reached its learner limit. Ask your account team." };
      }
    }
    await db
      .insert(learningCompletions)
      .values({ accountId, displayName: name.trim(), nameKey: key, role, challengeId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(learningCompletions)
      .where(
        and(
          eq(learningCompletions.accountId, accountId),
          eq(learningCompletions.nameKey, key),
          eq(learningCompletions.challengeId, challengeId),
        ),
      );
  }
  refresh();
  return { ok: true };
}
