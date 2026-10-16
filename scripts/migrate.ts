// Applies the Drizzle migrations in drizzle/ to the hosted Postgres database
// named by DATABASE_URL (Neon, via Vercel). Local PGlite migrates itself on startup.
//
//   npm run db:prod:migrate     # uses .env.production.local, pulled from Vercel
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL isn't set. Run `vercel env pull .env.production.local` first.");
  }
  const host = new URL(url).host;
  console.log(`Migrating ${host}...`);
  await migrate(drizzle({ client: neon(url) }), { migrationsFolder: "drizzle" });
  console.log("Migrations applied.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
