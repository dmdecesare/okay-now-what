import "server-only";
import type { z } from "zod";
import { getDb } from "@/db/client";
import { getAccountDetail } from "@/db/queries";
import { aiInsights, generatedMaterials } from "@/db/schema";
import { insightSchemas, type InsightKind, type MaterialKind } from "@/lib/schemas";
import { recordCall } from "@/lib/rate-limit";
import { generateStructured, generateText, systemBlocks } from "./client";
import type { AiFeature } from "./config";
import { cleanStrings, noEmDash } from "./format";
import {
  NEXT_BEST_ACTION_SYSTEM,
  QUESTION_THEMES_SYSTEM,
  RISK_PLAY_SYSTEM,
  TOOLS_SYSTEM,
  nextBestActionInput,
  questionThemesInput,
  riskPlayInput,
  toolInput,
} from "./prompts";

// Generates rep-side insights and tool drafts and saves them. Callers handle rate limits
// and turn AiError into a friendly message.

const INSIGHT_SETUP: Record<InsightKind, { feature: AiFeature; system: string; input: typeof nextBestActionInput }> = {
  next_best_action: { feature: "nextBestAction", system: NEXT_BEST_ACTION_SYSTEM, input: nextBestActionInput },
  risk_play: { feature: "riskPlay", system: RISK_PLAY_SYSTEM, input: riskPlayInput },
  question_themes: { feature: "questionThemes", system: QUESTION_THEMES_SYSTEM, input: questionThemesInput },
};

export async function regenerateInsight(slug: string, kind: InsightKind, ipHash: string): Promise<void> {
  const detail = await getAccountDetail(slug);
  if (!detail) throw new Error("Account not found");
  const setup = INSIGHT_SETUP[kind];

  try {
    // The three insight schemas differ, so validate as unknown here and re-parse below.
    const schema = insightSchemas[kind] as z.ZodType<unknown>;
    const { data, usage } = await generateStructured(
      setup.feature,
      schema,
      systemBlocks(setup.system),
      setup.input(detail),
    );
    const content = schema.parse(cleanStrings(data));
    const db = await getDb();
    await db
      .insert(aiInsights)
      .values({ accountId: detail.account.id, kind, content, source: "live", generatedAt: new Date() })
      .onConflictDoUpdate({
        target: [aiInsights.accountId, aiInsights.kind],
        set: { content, source: "live", generatedAt: new Date() },
      });
    await recordCall(setup.feature, ipHash, "ok", usage);
  } catch (err) {
    await recordCall(setup.feature, ipHash, "error");
    throw err;
  }
}

export async function generateMaterial(slug: string, kind: MaterialKind, ipHash: string): Promise<void> {
  const detail = await getAccountDetail(slug);
  if (!detail) throw new Error("Account not found");

  try {
    const { text, usage } = await generateText("tools", systemBlocks(TOOLS_SYSTEM), toolInput(kind, detail));
    const content = noEmDash(text);
    const db = await getDb();
    await db
      .insert(generatedMaterials)
      .values({ accountId: detail.account.id, kind, content, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [generatedMaterials.accountId, generatedMaterials.kind],
        set: { content, updatedAt: new Date() },
      });
    await recordCall("tools", ipHash, "ok", usage);
  } catch (err) {
    await recordCall("tools", ipHash, "error");
    throw err;
  }
}
