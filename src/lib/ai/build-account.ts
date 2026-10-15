import "server-only";
import { like } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accountProfiles, accounts, milestones } from "@/db/schema";
import { newCustomerToken } from "@/db/seed";
import { accountProfileSchema, buildKitSchema, buildPlanSchema, type NewAccountInput } from "@/lib/schemas";
import { addDays, todayISO } from "@/lib/dates";
import { slugify } from "@/lib/slug";
import { recordCall } from "@/lib/rate-limit";
import { generateStructured, systemBlocks } from "./client";
import { cleanStrings } from "./format";
import type { BuildStep } from "@/lib/build-events";
import { BUILD_KIT_SYSTEM, BUILD_PLAN_SYSTEM, buildAccountInput } from "./prompts";

// Builds a full account from deal notes: two Claude calls in parallel (plan and people,
// setup guide and champion kit), validated, then saved in one go. Nothing is written
// unless both calls succeed.


async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const db = await getDb();
  const taken = new Set(
    (await db.select({ slug: accounts.slug }).from(accounts).where(like(accounts.slug, `${base}%`))).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

export async function buildAccount(
  input: NewAccountInput,
  ipHash: string,
  onStep: (step: BuildStep) => void,
): Promise<{ slug: string }> {
  const context = buildAccountInput(input);

  const track = <T>(promise: Promise<T>, step: BuildStep) =>
    promise.then((r) => {
      onStep(step);
      return r;
    });

  let plan, kit;
  try {
    [plan, kit] = await Promise.all([
      track(generateStructured("buildAccount", buildPlanSchema, systemBlocks(BUILD_PLAN_SYSTEM), context), "plan"),
      track(generateStructured("buildAccount", buildKitSchema, systemBlocks(BUILD_KIT_SYSTEM), context), "kit"),
    ]);
  } catch (err) {
    await recordCall("buildAccount", ipHash, "error");
    throw err;
  }
  await recordCall("buildAccount", ipHash, "ok", {
    input: plan.usage.input + kit.usage.input,
    output: plan.usage.output + kit.usage.output,
  });

  const { milestones: drafts, ...planRest } = cleanStrings(plan.data);
  const profile = accountProfileSchema.parse({
    ...planRest,
    ...cleanStrings(kit.data),
    successCriteria: input.stage === "pilot" ? planRest.successCriteria : [],
  });

  const today = todayISO();
  const stageDay = input.stageDay ?? 1;
  const stageStartDate = addDays(today, -(stageDay - 1));
  const dayToDate = (day: number) => addDays(stageStartDate, day - 1);
  const slug = await uniqueSlug(input.name);

  const db = await getDb();
  const [row] = await db
    .insert(accounts)
    .values({
      slug,
      name: input.name,
      industry: input.industry,
      employees: input.employees ?? null,
      seats: input.seats,
      stage: input.stage,
      stageStartDate,
      pilotLengthDays: input.stage === "pilot" ? (input.pilotLengthDays ?? 60) : null,
      renewalDate:
        input.stage !== "pilot" && input.renewalMonths ? addDays(today, Math.round(input.renewalMonths * 30.4)) : null,
      customerToken: newCustomerToken(),
      championLastVisitAt: null,
      dealNotes: input.notes,
    })
    .returning({ id: accounts.id });

  await db.insert(accountProfiles).values({ accountId: row.id, data: profile });
  await db.insert(milestones).values(
    [...drafts]
      .sort((a, b) => a.dueDay - b.dueDay)
      .map((m, i) => ({
        accountId: row.id,
        title: m.title,
        description: m.description,
        dueDate: dayToDate(m.dueDay),
        status: m.alreadyDone ? ("done" as const) : ("todo" as const),
        completedAt: m.alreadyDone ? new Date() : null,
        completedBy: m.alreadyDone ? ("rep" as const) : null,
        sortOrder: i,
      })),
  );

  onStep("app");
  return { slug };
}
