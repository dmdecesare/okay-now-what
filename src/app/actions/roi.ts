"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getAccountDetail } from "@/db/queries";
import { accountProfiles } from "@/db/schema";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp } from "@/lib/rate-limit";
import { roiAssumptionsSchema } from "@/lib/roi";
import type { ActionResult } from "./milestones";

/** The rep sets the value-report assumptions for one account. */
export async function setRoiAssumptions(slug: string, input: unknown): Promise<ActionResult> {
  const parsed = roiAssumptionsSchema.safeParse(input);
  if (typeof slug !== "string" || !parsed.success) {
    return { ok: false, message: "Use 0.5 to 10 hours a week and a $25 to $250 hourly cost." };
  }
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };
  const detail = await getAccountDetail(slug);
  if (!detail) return { ok: false, message: "That account doesn't exist." };
  const db = await getDb();
  await db
    .update(accountProfiles)
    .set({ data: { ...detail.profile, roiAssumptions: parsed.data }, updatedAt: new Date() })
    .where(eq(accountProfiles.accountId, detail.account.id));
  refresh();
  return { ok: true };
}
