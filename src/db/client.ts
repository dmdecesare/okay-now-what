import fs from "node:fs";
import path from "node:path";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

// One shared database handle per server process.
// With DATABASE_URL set (Vercel + Neon), it talks to hosted Postgres.
// Without it (local dev), it runs PGlite, a real Postgres stored in .data/pglite.

// Both drivers share Drizzle's Postgres query API; the PGlite type stands in for either.
export type DB = PgliteDatabase<typeof schema>;

declare global {
  var __okayNowWhatDb: Promise<DB> | undefined;
}

export function getDb(): Promise<DB> {
  if (!globalThis.__okayNowWhatDb) {
    globalThis.__okayNowWhatDb = createDb().catch((err) => {
      globalThis.__okayNowWhatDb = undefined;
      throw err;
    });
  }
  return globalThis.__okayNowWhatDb;
}

async function createDb(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const db = drizzle({ client: neon(url), schema }) as unknown as DB;
    await seedIfEmpty(db);
    return db;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const dataDir = path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = drizzle({ client: new PGlite(dataDir), schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedIfEmpty(db);
  return db;
}
