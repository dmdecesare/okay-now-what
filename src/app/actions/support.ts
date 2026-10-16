"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getAccountDetail, getAccountIdForToken, isTokenShape } from "@/db/queries";
import { helpRequests, pulseResponses } from "@/db/schema";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp } from "@/lib/rate-limit";
import { helpRequestInputSchema, pulseInputSchema } from "@/lib/support";
import type { ActionResult } from "./milestones";

// Help requests and pulse answers from the customer portal (authorized by the private link token),
// and resolving requests on the rep side. In rep preview mode nothing is saved.

async function writeAllowed() {
  return allowWrite(hashIp(callerIp(await headers())));
}

export async function createHelpRequest(token: string, input: unknown, preview: boolean): Promise<ActionResult> {
  if (typeof token !== "string" || !isTokenShape(token)) return { ok: false, message: "This link isn't valid." };
  const parsed = helpRequestInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Add a few words about what you need, then send it." };
  if (preview === true) return { ok: true };
  if (!(await writeAllowed())) return { ok: false, message: BREATHER_MESSAGE };
  const accountId = await getAccountIdForToken(token);
  if (!accountId) return { ok: false, message: "This link isn't valid." };
  const db = await getDb();
  await db.insert(helpRequests).values({
    accountId,
    kind: parsed.data.kind,
    message: parsed.data.message,
    requesterName: parsed.data.name || null,
  });
  refresh();
  return { ok: true };
}

export async function submitPulse(token: string, input: unknown, preview: boolean): Promise<ActionResult> {
  if (typeof token !== "string" || !isTokenShape(token)) return { ok: false, message: "This link isn't valid." };
  const parsed = pulseInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Pick a score from 1 to 5." };
  if (preview === true) return { ok: true };
  if (!(await writeAllowed())) return { ok: false, message: BREATHER_MESSAGE };
  const accountId = await getAccountIdForToken(token);
  if (!accountId) return { ok: false, message: "This link isn't valid." };
  const db = await getDb();
  await db.insert(pulseResponses).values({ accountId, score: parsed.data.score, blocker: parsed.data.blocker || null });
  refresh();
  return { ok: true };
}

export async function setHelpRequestResolved(slug: string, requestId: string, resolved: boolean): Promise<ActionResult> {
  if (typeof slug !== "string" || typeof requestId !== "string" || typeof resolved !== "boolean") {
    return { ok: false, message: "Something's off with that request." };
  }
  if (!(await writeAllowed())) return { ok: false, message: BREATHER_MESSAGE };
  const detail = await getAccountDetail(slug);
  if (!detail) return { ok: false, message: "That account doesn't exist." };
  const db = await getDb();
  await db
    .update(helpRequests)
    .set({ status: resolved ? "resolved" : "open", resolvedAt: resolved ? new Date() : null })
    .where(and(eq(helpRequests.id, requestId), eq(helpRequests.accountId, detail.account.id)));
  refresh();
  return { ok: true };
}
