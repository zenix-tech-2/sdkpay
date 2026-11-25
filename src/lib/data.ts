import { db } from "@/db";
import { accounts, transactions, notifications, paymentLinks } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getAccounts(userId: string) {
  return db.select().from(accounts).where(eq(accounts.userId, userId));
}

export async function getPrimaryAccount(userId: string) {
  const rows = await db.select().from(accounts).where(eq(accounts.userId, userId));
  return rows.find((a) => a.isPrimary) ?? rows[0] ?? null;
}

export async function getUnreadCount(userId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(sql`${notifications.userId} = ${userId} and ${notifications.read} = false`);
  return row?.n ?? 0;
}

export async function getLatestTransactions(userId: string, limit = 50) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTxSummary(userId: string) {
  const [row] = await db
    .select({
      incoming: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.direction} = 'credit' and ${transactions.status} = 'completed'), 0)`,
      outgoing: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.direction} = 'debit' and ${transactions.status} = 'completed'), 0)`,
      total: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  return {
    incoming: Number(row?.incoming ?? 0),
    outgoing: Number(row?.outgoing ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export async function getPaymentLinks(userId: string) {
  return db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, userId))
    .orderBy(desc(paymentLinks.createdAt));
}

export async function getMonthlySeries(userId: string) {
  const rows = await db
    .select({
      day: sql<string>`to_char(${transactions.createdAt}, 'DD Mon')`,
      incoming: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.direction} = 'credit' and ${transactions.status} = 'completed'), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(sql`to_char(${transactions.createdAt}, 'DD Mon'), date_trunc('day', ${transactions.createdAt})`)
    .orderBy(sql`date_trunc('day', ${transactions.createdAt})`)
    .limit(14);
  return rows.map((r) => ({ day: r.day, value: Number(r.incoming) }));
}
