"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accounts } from "@/db/schema";
import { seedLogoId } from "@/lib/logos";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp } from "@/lib/rate-limit";
import type { ActionResult } from "./milestones";

/**
 * Deletes an account and everything tied to it (every child table cascades). The rep confirms by
 * typing the account name. The three demo accounts can't be deleted, so the public demo stays intact.
 */
export async function deleteAccount(slug: string, confirmName: string): Promise<ActionResult> {
  if (typeof slug !== "string" || typeof confirmName !== "string") {
    return { ok: false, message: "Something's off with that request." };
  }
  if (seedLogoId(slug)) return { ok: false, message: "The demo accounts can't be deleted." };
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };

  const db = await getDb();
  const [row] = await db.select({ id: accounts.id, name: accounts.name }).from(accounts).where(eq(accounts.slug, slug)).limit(1);
  if (!row) return { ok: false, message: "That account doesn't exist." };
  if (confirmName.trim().toLowerCase() !== row.name.trim().toLowerCase()) {
    return { ok: false, message: "Type the account name exactly to confirm." };
  }
  await db.delete(accounts).where(eq(accounts.id, row.id));
  // Clear every cached rep page so the sidebar and book drop the account right away.
  revalidatePath("/", "layout");
  redirect("/");
}
