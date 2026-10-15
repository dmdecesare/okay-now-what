// Resets the database to the three demo accounts.
// Local: stop `npm run dev` first (PGlite allows one process at a time).
import { count } from "drizzle-orm";
import { getDb } from "@/db/client";
import { resetAndSeed } from "@/db/seed";
import {
  accounts,
  customerQuestions,
  milestones,
  spendMonths,
  usageSnapshots,
} from "@/db/schema";

async function main() {
  const db = await getDb();
  await resetAndSeed(db);

  const tables = {
    accounts,
    milestones,
    "usage rows": usageSnapshots,
    "spend months": spendMonths,
    questions: customerQuestions,
  };

  console.log("Seeded demo data:");
  for (const [label, table] of Object.entries(tables)) {
    const [{ n }] = await db.select({ n: count() }).from(table);
    console.log(`  ${label.padEnd(13)} ${n}`);
  }
  console.log(
    `Database: ${process.env.DATABASE_URL ? "hosted Postgres (DATABASE_URL)" : "local PGlite (.data/pglite)"}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
