import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getAccountDetail, getAskContext } from "@/db/queries";
import { accountProfiles } from "@/db/schema";
import { promptRecipesSchema } from "@/lib/schemas";
import { recordCall } from "@/lib/rate-limit";
import { generateStructured, systemBlocks } from "./client";
import { cleanStrings } from "./format";
import { PROMPT_RECIPES_SYSTEM, promptRecipesInput } from "./prompts";

/** Writes this customer's prompt recipes from customer-safe context and saves them to their profile. */
export async function generatePromptRecipes(slug: string, ipHash: string): Promise<void> {
  const detail = await getAccountDetail(slug);
  if (!detail) throw new Error("Account not found");
  const ctx = await getAskContext(detail.account.customerToken);
  if (!ctx) throw new Error("Account not found");
  try {
    const { data, usage } = await generateStructured(
      "promptRecipes",
      promptRecipesSchema,
      systemBlocks(PROMPT_RECIPES_SYSTEM),
      promptRecipesInput(ctx),
    );
    const { recipes } = promptRecipesSchema.parse(cleanStrings(data));
    const db = await getDb();
    await db
      .update(accountProfiles)
      .set({ data: { ...detail.profile, promptRecipes: recipes }, updatedAt: new Date() })
      .where(eq(accountProfiles.accountId, detail.account.id));
    await recordCall("promptRecipes", ipHash, "ok", usage);
  } catch (err) {
    await recordCall("promptRecipes", ipHash, "error");
    throw err;
  }
}
