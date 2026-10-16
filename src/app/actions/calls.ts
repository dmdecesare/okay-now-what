"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { getAccountDetail } from "@/db/queries";
import { accountProfiles, callLogs, milestones } from "@/db/schema";
import { AiError, FRIENDLY_AI_MESSAGE, generateStructured, systemBlocks } from "@/lib/ai/client";
import { cleanStrings } from "@/lib/ai/format";
import { CALL_LOG_SYSTEM, callLogInput } from "@/lib/ai/prompts";
import { addDays, todayISO } from "@/lib/dates";
import { BREATHER_MESSAGE, allowWrite, callerIp, hashIp, isRateLimited, recordCall } from "@/lib/rate-limit";
import { callUpdateSchema, type CallUpdate } from "@/lib/schemas";

// "Log a call": Claude proposes updates from the rep's notes (nothing is saved), then the rep
// applies the changes they ticked. Protected by input checks and rate limits (no login in the demo).

const notesSchema = z.object({
  notes: z.string().trim().min(20).max(8000),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ProposeResult = { ok: true; proposal: CallUpdate } | { ok: false; message: string };

export async function proposeCallUpdate(slug: string, notes: string, occurredOn: string): Promise<ProposeResult> {
  const parsed = notesSchema.safeParse({ notes, occurredOn });
  if (typeof slug !== "string" || !parsed.success) {
    return { ok: false, message: "Paste at least a couple of sentences of notes first." };
  }
  const ipHash = hashIp(callerIp(await headers()));
  if (await isRateLimited("rep", ipHash)) {
    await recordCall("callLog", ipHash, "limited");
    return { ok: false, message: BREATHER_MESSAGE };
  }
  const detail = await getAccountDetail(slug);
  if (!detail) return { ok: false, message: "That account doesn't exist." };

  try {
    const { data, usage } = await generateStructured(
      "callLog",
      callUpdateSchema,
      systemBlocks(CALL_LOG_SYSTEM),
      callLogInput(detail, parsed.data.notes, parsed.data.occurredOn),
    );
    const proposal = callUpdateSchema.parse(cleanStrings(data));
    // Keep only milestone ids that belong to this account and can actually change.
    const open = new Set(detail.milestones.filter((m) => m.status !== "done").map((m) => m.id));
    const todo = new Set(detail.milestones.filter((m) => m.status === "todo").map((m) => m.id));
    proposal.completedMilestoneIds = [...new Set(proposal.completedMilestoneIds)].filter((id) => open.has(id));
    proposal.startedMilestoneIds = [...new Set(proposal.startedMilestoneIds)].filter(
      (id) => todo.has(id) && !proposal.completedMilestoneIds.includes(id),
    );
    proposal.rescheduledMilestones = proposal.rescheduledMilestones.filter(
      (r, i, all) => open.has(r.id) && !proposal.completedMilestoneIds.includes(r.id) && all.findIndex((x) => x.id === r.id) === i,
    );
    await recordCall("callLog", ipHash, "ok", usage);
    return { ok: true, proposal };
  } catch (err) {
    await recordCall("callLog", ipHash, "error");
    return { ok: false, message: err instanceof AiError ? FRIENDLY_AI_MESSAGE[err.reason] : FRIENDLY_AI_MESSAGE.api_error };
  }
}

const applySchema = notesSchema.extend({
  summary: z.string().trim().min(1).max(1500),
  completedMilestoneIds: z.array(z.string().uuid()).max(10),
  startedMilestoneIds: z.array(z.string().uuid()).max(10),
  rescheduledMilestones: z.array(z.object({ id: z.string().uuid(), dueInDays: z.number().int().min(0).max(365) })).max(10),
  newMilestones: callUpdateSchema.shape.newMilestones,
  newConcerns: callUpdateSchema.shape.newConcerns,
  newStakeholders: callUpdateSchema.shape.newStakeholders,
  championNote: z.string().max(500).nullable(),
});
export type ApplyCallInput = z.infer<typeof applySchema>;

export async function applyCallUpdate(slug: string, input: ApplyCallInput): Promise<{ ok: boolean; message?: string }> {
  const parsed = applySchema.safeParse(input);
  if (typeof slug !== "string" || !parsed.success) return { ok: false, message: "Something's off with those changes." };
  if (!allowWrite(hashIp(callerIp(await headers())))) return { ok: false, message: BREATHER_MESSAGE };

  const detail = await getAccountDetail(slug);
  if (!detail) return { ok: false, message: "That account doesn't exist." };
  const u = parsed.data;
  const db = await getDb();
  const accountId = detail.account.id;
  const now = new Date();
  const today = todayISO(now);

  if (u.completedMilestoneIds.length) {
    await db
      .update(milestones)
      .set({ status: "done", completedAt: now, completedBy: "rep" })
      .where(and(eq(milestones.accountId, accountId), inArray(milestones.id, u.completedMilestoneIds)));
  }
  if (u.startedMilestoneIds.length) {
    await db
      .update(milestones)
      .set({ status: "in_progress" })
      .where(
        and(eq(milestones.accountId, accountId), eq(milestones.status, "todo"), inArray(milestones.id, u.startedMilestoneIds)),
      );
  }
  for (const r of u.rescheduledMilestones) {
    await db
      .update(milestones)
      .set({ dueDate: addDays(today, r.dueInDays) })
      .where(and(eq(milestones.accountId, accountId), eq(milestones.id, r.id)));
  }
  if (u.newMilestones.length) {
    const nextOrder = Math.max(-1, ...detail.milestones.map((m) => m.sortOrder)) + 1;
    await db.insert(milestones).values(
      u.newMilestones.map((m, i) => ({
        accountId,
        title: m.title,
        description: m.description,
        dueDate: addDays(today, m.dueInDays),
        status: "todo" as const,
        sortOrder: nextOrder + i,
      })),
    );
  }
  if (u.newConcerns.length || u.newStakeholders.length || u.championNote) {
    const profile = {
      ...detail.profile,
      concerns: [...detail.profile.concerns, ...u.newConcerns],
      stakeholders: [...detail.profile.stakeholders, ...u.newStakeholders],
      champion: u.championNote ? { ...detail.profile.champion, notes: u.championNote } : detail.profile.champion,
    };
    await db.update(accountProfiles).set({ data: profile, updatedAt: now }).where(eq(accountProfiles.accountId, accountId));
  }
  await db.insert(callLogs).values({ accountId, occurredOn: u.occurredOn, notes: u.notes, summary: u.summary });

  refresh();
  return { ok: true };
}
