import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { db } from "@/db";
import { users, transactions, paymentLinks, supportTickets, refunds, reviews, kycSubmissions } from "@/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const day = 86400000;
  const now = Date.now();
  const d24 = new Date(now - day);
  const d7 = new Date(now - 7 * day);
  const d14 = new Date(now - 14 * day);
  const d30 = new Date(now - 30 * day);

  const [[uTotal], [uActive], [uSusp], [uNew7]] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(users).where(eq(users.status, "active")),
    db.select({ c: count() }).from(users).where(eq(users.status, "suspended")),
    db.select({ c: count() }).from(users).where(gte(users.createdAt, d7)),
  ]);
  const [[kycPending]] = [await db.select({ c: count() }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending"))];
  const [txRows] = await Promise.all([
    db
      .select({ c: count(), vol: sql<number>`coalesce(sum(case when ${transactions.currency} != 'USDT' then ${transactions.amount} else 0 end),0)` })
      .from(transactions)
      .where(gte(transactions.createdAt, d24)),
  ]);
  const [rev] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${transactions.fee}),0)` })
      .from(transactions)
      .where(and(eq(transactions.status, "success"), gte(transactions.createdAt, d30))),
  ]);
  const [[tOpen]] = [await db.select({ c: count() }).from(supportTickets).where(eq(supportTickets.status, "open"))];
  const [[rPend]] = [await db.select({ c: count() }).from(refunds).where(eq(refunds.status, "pending"))];
  const [[rvPend]] = [await db.select({ c: count() }).from(reviews).where(eq(reviews.status, "pending"))];
  const [[lCount]] = [await db.select({ c: count() }).from(paymentLinks)];

  // 14-day series
  const newUsers = await db.select({ d: users.createdAt }).from(users).where(gte(users.createdAt, d14));
  const recentTx = await db
    .select({ d: transactions.createdAt, a: transactions.amount, c: transactions.currency })
    .from(transactions)
    .where(gte(transactions.createdAt, d14));
  const series: { day: string; users: number; txs: number; volume: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(now - i * day);
    const key = dt.toISOString().slice(0, 10);
    const u = newUsers.filter((r) => r.d.toISOString().slice(0, 10) === key).length;
    const txs = recentTx.filter((r) => r.d.toISOString().slice(0, 10) === key);
    series.push({
      day: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: u,
      txs: txs.length,
      volume: txs.reduce((s, t) => s + (t.c === "USDT" ? 0 : t.a), 0),
    });
  }

  const latestUsers = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, country: users.country, createdAt: users.createdAt })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);
  const latestTx = await db
    .select({
      id: transactions.id,
      reference: transactions.reference,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      email: users.email,
    })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .orderBy(desc(transactions.createdAt))
    .limit(6);
  const latestTickets = await db
    .select({ id: supportTickets.id, subject: supportTickets.subject, status: supportTickets.status, createdAt: supportTickets.createdAt, email: users.email })
    .from(supportTickets)
    .leftJoin(users, eq(users.id, supportTickets.userId))
    .orderBy(desc(supportTickets.createdAt))
    .limit(5);

  return NextResponse.json({
    stats: {
      users: Number(uTotal.c),
      activeUsers: Number(uActive.c),
      suspended: Number(uSusp.c),
      newUsers7: Number(uNew7.c),
      kycPending: Number(kycPending.c),
      tx24h: Number(txRows[0]?.c ?? 0),
      vol24h: Number(txRows[0]?.vol ?? 0),
      revenue30d: Number(rev[0]?.total ?? 0),
      ticketsOpen: Number(tOpen.c),
      refundsPending: Number(rPend.c),
      reviewsPending: Number(rvPend.c),
      links: Number(lCount.c),
    },
    badges: {
      kyc: Number(kycPending.c),
      refunds: Number(rPend.c),
      tickets: Number(tOpen.c),
      reviews: Number(rvPend.c),
    },
    series,
    latestUsers,
    latestTx,
    latestTickets,
  });
}
