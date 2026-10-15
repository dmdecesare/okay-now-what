"use server";

import { and, eq, isNull, lt, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { isTokenShape } from "@/db/queries";
import { accounts } from "@/db/schema";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Records that someone opened the customer app. There's no login, so any visit on the
 * private link counts as the champion. Writes at most once an hour per account.
 * Rep previews (?preview=1) never call this.
 */
export async function recordVisit(token: string): Promise<void> {
  if (!isTokenShape(token)) return;
  try {
    const db = await getDb();
    const now = new Date();
    await db
      .update(accounts)
      .set({ championLastVisitAt: now })
      .where(
        and(
          eq(accounts.customerToken, token),
          or(
            isNull(accounts.championLastVisitAt),
            lt(accounts.championLastVisitAt, new Date(now.getTime() - ONE_HOUR_MS)),
          ),
        ),
      );
  } catch {
    // Visit tracking should never break the page.
  }
}
