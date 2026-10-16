"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { getDb } from "@/db/client";
import { isTokenShape } from "@/db/queries";
import { accounts, milestones } from "@/db/schema";
import { headers } from "next/headers";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp } from "@/lib/rate-limit";

// Server actions are reachable by direct POST, so each one re-checks that the
// milestone belongs to the account named by the caller's token or slug.

export type ActionResult = { ok: true } | { ok: false; message: string };

async function setDone(
  accountWhere: ReturnType<typeof eq>,
  milestoneId: string,
  done: boolean,
  by: "rep" | "customer",
): Promise<ActionResult> {
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };

  const db = await getDb();
  const [account] = await db.select({ id: accounts.id }).from(accounts).where(accountWhere).limit(1);
  if (!account) return { ok: false, message: "We couldn't find that plan." };

  const updated = await db
    .update(milestones)
    .set(
      done
        ? { status: "done", completedAt: new Date(), completedBy: by }
        : { status: "todo", completedAt: null, completedBy: null },
    )
    .where(and(eq(milestones.id, milestoneId), eq(milestones.accountId, account.id)))
    .returning({ id: milestones.id });

  if (updated.length === 0) return { ok: false, message: "We couldn't find that milestone." };
  refresh();
  return { ok: true };
}

export async function setMilestoneDoneAsCustomer(
  token: string,
  milestoneId: string,
  done: boolean,
): Promise<ActionResult> {
  if (!isTokenShape(token) || typeof milestoneId !== "string") {
    return { ok: false, message: "That link doesn't look right." };
  }
  try {
    return await setDone(eq(accounts.customerToken, token), milestoneId, Boolean(done), "customer");
  } catch {
    return { ok: false, message: "Couldn't save that. Please try again." };
  }
}

export async function setMilestoneDoneAsRep(
  slug: string,
  milestoneId: string,
  done: boolean,
): Promise<ActionResult> {
  if (typeof slug !== "string" || typeof milestoneId !== "string") {
    return { ok: false, message: "Something's off with that request." };
  }
  try {
    return await setDone(eq(accounts.slug, slug), milestoneId, Boolean(done), "rep");
  } catch {
    return { ok: false, message: "Couldn't save that. Please try again." };
  }
}
