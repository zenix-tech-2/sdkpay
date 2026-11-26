import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const adminOnly = process.env.ADMIN_ONLY_DEPLOYMENT === "1";
const databaseUrl = adminOnly
  ? (process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (or ADMIN_DATABASE_URL for an admin-only deployment)");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
