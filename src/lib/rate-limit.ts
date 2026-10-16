import "server-only";
import { createHash } from "node:crypto";
import { and, count, eq, gte, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aiCalls } from "@/db/schema";
import { RATE_LIMITS, type AiFeature } from "./ai/config";

// Database-backed limits, so they hold across serverless instances on Vercel.

const GROUPS = {
  ask: { features: ["ask"] as AiFeature[], limit: () => RATE_LIMITS.askPerHour },
  rep: {
    features: [
      "nextBestAction",
      "riskPlay",
      "questionThemes",
      "tools",
      "repChat",
      "callBrief",
      "expansionPitch",
      "businessReview",
      "callLog",
    ] as AiFeature[],
    limit: () => RATE_LIMITS.repPerHour,
  },
  build: { features: ["buildAccount"] as AiFeature[], limit: () => RATE_LIMITS.buildPerHour },
};

export function hashIp(ip: string): string {
  return createHash("sha256").update(`okay-now-what:${ip}`).digest("hex").slice(0, 32);
}

/** Best-effort caller IP from proxy headers. Only ever stored hashed. */
export function callerIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}

export async function isRateLimited(group: keyof typeof GROUPS, ipHash: string): Promise<boolean> {
  const db = await getDb();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { features } = GROUPS[group];
  const limit = GROUPS[group].limit();

  const [[mine], [all]] = await Promise.all([
    db
      .select({ n: count() })
      .from(aiCalls)
      .where(
        and(
          eq(aiCalls.ipHash, ipHash),
          inArray(aiCalls.feature, features),
          gte(aiCalls.createdAt, hourAgo),
          // Blocked attempts don't count, so a limited caller isn't locked out longer.
          ne(aiCalls.status, "limited"),
        ),
      ),
    db
      .select({ n: count() })
      .from(aiCalls)
      .where(and(gte(aiCalls.createdAt, dayAgo), ne(aiCalls.status, "limited"))),
  ]);
  return mine.n >= limit || all.n >= RATE_LIMITS.globalPerDay;
}

export async function recordCall(
  feature: AiFeature,
  ipHash: string,
  status: "ok" | "error" | "refused" | "limited",
  usage?: { input: number; output: number },
): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(aiCalls).values({
      feature,
      ipHash,
      status,
      inputTokens: usage?.input ?? null,
      outputTokens: usage?.output ?? null,
    });
  } catch {
    // Logging a call must never break the feature.
  }
}

// Light, in-memory limit for non-AI writes (milestone check-offs, visit tracking).
// Per server instance, which is enough to stop casual spam on a public demo link.
const writeLog = new Map<string, number[]>();

export function allowWrite(ipHash: string): boolean {
  const now = Date.now();
  const recent = (writeLog.get(ipHash) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= RATE_LIMITS.writesPerMinute) {
    writeLog.set(ipHash, recent);
    return false;
  }
  recent.push(now);
  writeLog.set(ipHash, recent);
  if (writeLog.size > 5000) writeLog.clear();
  return true;
}

export const BREATHER_MESSAGE = "Taking a short breather. Please try again in a bit.";
