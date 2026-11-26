import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { refunds, users, transactions, notifications } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomRef } from "@/lib/format";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") || "all";
  const kind = new URL(req.url).searchParams.get("kind") || "all";
  const conds = [];
  if (status !== "all") conds.push(eq(refunds.status, status));
  if (kind !== "all") conds.push(eq(refunds.kind, kind));
  const rows = await db
    .select({
      id: refunds.id,
      kind: refunds.kind,
      reference: refunds.reference,
      amount: refunds.amount,
      currency: refunds.currency,
      reason: refunds.reason,
      status: refunds.status,
      createdAt: refunds.createdAt,
      decidedAt: refunds.decidedAt,
      email: users.email,
      fullName: users.fullName,
      txRef: transactions.reference,
    })
    .from(refunds)
    .leftJoin(users, eq(users.id, refunds.userId))
    .leftJoin(transactions, eq(transactions.id, refunds.txId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(refunds.createdAt))
    .limit(100);
  return NextResponse.json({ refunds: rows });
}

export async function POST(req: Request) {
  // Create a refund/dispute case (usually from a transaction)
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { txId, kind, amount, reason } = await req.json();
  if (!txId) return NextResponse.json({ error: "Transaction required." }, { status: 400 });
  const txs = await db.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
  if (!txs.length) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  const tx = txs[0];
  const amt = amount ? Number(amount) : tx.amount - tx.fee;
  if (!amt || amt <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  const inserted = await db
    .insert(refunds)
    .values({
      kind: kind === "dispute" ? "dispute" : "refund",
      userId: tx.userId,
      txId: tx.id,
      reference: randomRef("SDK-R"),
      amount: Math.round(amt),
      currency: tx.currency,
      reason: reason?.slice(0, 1000) || null,
    })
    .returning();
  await audit(admin, "refund.create", inserted[0].reference, `tx=${tx.reference} amount=${amt}`);
  return NextResponse.json({ ok: true, refund: inserted[0] });
}

export async function PATCH(req: Request) {
  // Approve (execute) or reject a case
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, decision } = await req.json();
  if (!id || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "Invalid." }, { status: 400 });
  }
  const rows = await db.select().from(refunds).where(eq(refunds.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const r = rows[0];
  if (r.status !== "pending") return NextResponse.json({ error: "Already decided." }, { status: 400 });

  if (decision === "approve") {
    // Execute: credit the end-customer back by debiting the merchant wallet
    const urows = await db.select().from(users).where(eq(users.id, r.userId)).limit(1);
    const u = urows[0];
    const bal = r.currency === "USDT" ? u.balanceUsdt : r.currency === "XOF" ? u.balanceXof : u.balanceXaf;
    if (r.amount > bal) return NextResponse.json({ error: "Merchant wallet has insufficient balance to fund this refund." }, { status: 400 });
    if (r.currency === "USDT") await db.update(users).set({ balanceUsdt: sql`${users.balanceUsdt} - ${r.amount}` }).where(eq(users.id, r.userId));
    else if (r.currency === "XOF") await db.update(users).set({ balanceXof: sql`${users.balanceXof} - ${r.amount}` }).where(eq(users.id, r.userId));
    else await db.update(users).set({ balanceXaf: sql`${users.balanceXaf} - ${r.amount}` }).where(eq(users.id, r.userId));
    await db.insert(transactions).values({
      userId: r.userId,
      type: "payout",
      amount: r.amount,
      currency: r.currency,
      status: "success",
      reference: r.reference,
      label: `${r.kind === "dispute" ? "Dispute payout" : "Refund"} — ${r.reason || "admin decision"}`,
      paymentLinkId: undefined,
    });
    await db.update(refunds).set({ status: "completed", decidedBy: admin.id, decidedAt: new Date() }).where(eq(refunds.id, id));
    await db.insert(notifications).values({
      userId: r.userId,
      title: "Refund executed",
      message: `A refund of ${r.amount.toLocaleString("fr-FR")} ${r.currency} was executed on your account (${r.reference}).`,
    });
  } else {
    await db.update(refunds).set({ status: "rejected", decidedBy: admin.id, decidedAt: new Date() }).where(eq(refunds.id, id));
    await db.insert(notifications).values({
      userId: r.userId,
      title: "Refund rejected",
      message: `Your refund request ${r.reference} was reviewed and rejected. Contact support for details.`,
    });
  }
  await audit(admin, `refund.${decision}`, r.reference, `amount=${r.amount} ${r.currency}`);
  return NextResponse.json({ ok: true });
}
