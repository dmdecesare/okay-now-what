"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { AiError, FRIENDLY_AI_MESSAGE } from "@/lib/ai/client";
import { generateMaterial, insightFeature, regenerateInsight } from "@/lib/ai/insights";
import type { AiFeature } from "@/lib/ai/config";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp, isRateLimited, recordCall } from "@/lib/rate-limit";
import { generateBusinessReview, setReviewPublished } from "@/lib/ai/review";
import { INSIGHT_KINDS, MATERIAL_KINDS, type InsightKind, type MaterialKind } from "@/lib/schemas";
import type { ActionResult } from "./milestones";

// Rep-side AI actions. The demo has no login (SPEC section 2), so these are protected by
// input checks and rate limits rather than auth.

async function run(feature: AiFeature, work: (ipHash: string) => Promise<void>): Promise<ActionResult> {
  const ipHash = hashIp(callerIp(await headers()));
  if (await isRateLimited("rep", ipHash)) {
    await recordCall(feature, ipHash, "limited");
    return { ok: false, message: BREATHER_MESSAGE };
  }
  try {
    await work(ipHash);
    refresh();
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof AiError ? FRIENDLY_AI_MESSAGE[err.reason] : FRIENDLY_AI_MESSAGE.api_error };
  }
}

export async function refreshInsightAction(slug: string, kind: InsightKind): Promise<ActionResult> {
  if (typeof slug !== "string" || !(INSIGHT_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, message: "Something's off with that request." };
  }
  return run(insightFeature(kind), (ip) => regenerateInsight(slug, kind, ip));
}

export async function generateToolAction(slug: string, kind: MaterialKind): Promise<ActionResult> {
  if (typeof slug !== "string" || !(MATERIAL_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, message: "Something's off with that request." };
  }
  return run("tools", (ip) => generateMaterial(slug, kind, ip));
}

export async function generateReviewAction(slug: string): Promise<ActionResult> {
  if (typeof slug !== "string") return { ok: false, message: "Something's off with that request." };
  return run("businessReview", (ip) => generateBusinessReview(slug, ip));
}

/** Publishing doesn't call Claude, so it uses the write limit instead of the AI limit. */
export async function setReviewPublishedAction(slug: string, publish: boolean): Promise<ActionResult> {
  if (typeof slug !== "string" || typeof publish !== "boolean") {
    return { ok: false, message: "Something's off with that request." };
  }
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };
  const ok = await setReviewPublished(slug, publish);
  if (!ok) return { ok: false, message: "Write the review first, then publish it." };
  refresh();
  return { ok: true };
}
