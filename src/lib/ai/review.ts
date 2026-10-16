import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getAccountDetail, getCustomerView, getLearningForAccount } from "@/db/queries";
import { businessReviews } from "@/db/schema";
import { businessReviewSchema } from "@/lib/schemas";
import { recordCall } from "@/lib/rate-limit";
import { generateStructured, systemBlocks } from "./client";
import { cleanStrings } from "./format";
import { BUSINESS_REVIEW_SYSTEM, businessReviewInput } from "./prompts";

// Writes the customer-facing business review as a draft. The input is the customer-safe view
// (the same data the customer's portal shows) plus learning path counts, so nothing internal
// (notes, health, spend, questions) can end up in it. The rep publishes it separately.

export async function generateBusinessReview(slug: string, ipHash: string): Promise<void> {
  const detail = await getAccountDetail(slug);
  if (!detail) throw new Error("Account not found");
  const view = await getCustomerView(detail.account.customerToken);
  if (!view) throw new Error("Account not found");
  const learning = await getLearningForAccount(detail.account.id);

  try {
    const { data, usage } = await generateStructured(
      "businessReview",
      businessReviewSchema,
      systemBlocks(BUSINESS_REVIEW_SYSTEM),
      businessReviewInput(view, learning),
    );
    const content = businessReviewSchema.parse(cleanStrings(data));
    const db = await getDb();
    const now = new Date();
    await db
      .insert(businessReviews)
      .values({ accountId: detail.account.id, content, status: "draft", source: "live", generatedAt: now })
      .onConflictDoUpdate({
        target: businessReviews.accountId,
        // A new version goes back to draft so the rep can read it before the customer does.
        set: { content, status: "draft", source: "live", generatedAt: now, publishedAt: null },
      });
    await recordCall("businessReview", ipHash, "ok", usage);
  } catch (err) {
    await recordCall("businessReview", ipHash, "error");
    throw err;
  }
}

export async function setReviewPublished(slug: string, publish: boolean): Promise<boolean> {
  const detail = await getAccountDetail(slug);
  if (!detail) return false;
  const db = await getDb();
  const updated = await db
    .update(businessReviews)
    .set({ status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null })
    .where(eq(businessReviews.accountId, detail.account.id))
    .returning({ id: businessReviews.accountId });
  return updated.length > 0;
}
