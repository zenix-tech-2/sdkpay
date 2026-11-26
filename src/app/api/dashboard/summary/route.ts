import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { paymentLinks, transactions, notifications } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [linkCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, user.id));
  const [txCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, user.id));
  const [collected] = await db
    .select({ total: sql<number>`coalesce(sum(${paymentLinks.totalCollected}),0)` })
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, user.id));
  const [unread] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  const recentTx = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt))
    .limit(6);

  const recentLinks = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, user.id))
    .orderBy(desc(paymentLinks.createdAt))
    .limit(5);

  return NextResponse.json({
    user,
    stats: {
      links: Number(linkCount?.count ?? 0),
      transactions: Number(txCount?.count ?? 0),
      collected: Number(collected?.total ?? 0),
      unread: Number(unread?.count ?? 0),
    },
    recentTx,
    recentLinks,
  });
}
