import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { transactions, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { settleTxFromProvider } from "@/lib/providers/settle";
import { executeDisburse } from "@/lib/providers/router";
import { COUNTRIES } from "@/data/countries";
import { maybeRewardReferrer } from "@/lib/referrals";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const urows = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, rows[0].userId))
    .limit(1);
  return NextResponse.json({ transaction: rows[0], user: urows[0] ?? null });
}

function notDebited(tx: { balanceBefore: number | null; balanceAfter: number | null }) {
  return tx.balanceBefore !== null && tx.balanceAfter !== null && tx.balanceBefore === tx.balanceAfter;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json();
  if (action !== "complete" && action !== "fail") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const tx = rows[0];
  if (tx.status !== "pending") return NextResponse.json({ error: "Only pending transactions can be decided." }, { status: 400 });

  if (action === "fail") {
    await settleTxFromProvider({
      providerRef: tx.providerRef || undefined,
      reference: tx.reference,
      status: "failed",
      provider: `manual (${admin.email})`,
    });
    await audit(admin, "tx.fail", tx.reference, `id=${id}`);
    return NextResponse.json({ ok: true });
  }

  // Complete: manual (not yet debited) withdrawals are disbursed + debited now
  if ((tx.type === "withdraw" || tx.type === "send_out" || tx.type === "payout") && notDebited(tx)) {
    const urows = await db.select().from(users).where(eq(users.id, tx.userId)).limit(1);
    const u = urows[0];
    const bal = tx.currency === "USDT" ? u.balanceUsdt : tx.currency === "XOF" ? u.balanceXof : u.balanceXaf;
    if (tx.amount + tx.fee > bal) {
      return NextResponse.json({ error: "Merchant wallet balance too low to complete." }, { status: 400 });
    }
    if (tx.operator && tx.phone && tx.currency !== "USDT") {
      const cc = COUNTRIES.find((c) => c.name === tx.country)?.code ?? "CM";
      const prov = await executeDisburse(
        {
          amount: tx.amount - tx.fee,
          currency: tx.currency,
          countryCode: cc,
          phone: tx.phone.replace(/\s/g, ""),
          operator: tx.operator,
          reference: tx.reference,
          description: `SDK Pay withdrawal ${tx.reference} (approved by ${admin.email})`,
        },
        { txId: tx.id, userId: tx.userId }
      );
      await db.update(transactions).set({ provider: prov.provider, providerRef: prov.providerRef }).where(eq(transactions.id, id));
      if (prov.live && !prov.ok) {
        await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, id));
        await audit(admin, "tx.fail", tx.reference, `provider error: ${prov.error}`);
        return NextResponse.json({ error: prov.error || "Provider error." }, { status: 502 });
      }
    }
    if (tx.currency === "USDT") {
      await db.update(users).set({ balanceUsdt: bal - tx.amount - tx.fee }).where(eq(users.id, tx.userId));
    } else if (tx.currency === "XOF") {
      await db.update(users).set({ balanceXof: bal - tx.amount - tx.fee }).where(eq(users.id, tx.userId));
    } else {
      await db.update(users).set({ balanceXaf: bal - tx.amount - tx.fee }).where(eq(users.id, tx.userId));
    }
    await db
      .update(transactions)
      .set({ status: "success", balanceAfter: bal - tx.amount - tx.fee, updatedAt: new Date() })
      .where(eq(transactions.id, id));
    await db.insert(notifications).values({
      userId: tx.userId,
      title: "Withdrawal approved",
      message: `Your withdrawal of ${tx.amount.toLocaleString("en-US")} ${tx.currency} was approved and sent. Réf : ${tx.reference}`,
    });
    if (tx.currency !== "USDT") await maybeRewardReferrer(tx.userId);
    await audit(admin, "tx.complete", tx.reference, `manual approval, debited ${tx.amount + tx.fee}`);
    return NextResponse.json({ ok: true });
  }

  await settleTxFromProvider({
    providerRef: tx.providerRef || undefined,
    reference: tx.reference,
    status: "success",
    provider: `manual (${admin.email})`,
  });
  await audit(admin, "tx.complete", tx.reference, `id=${id}`);
  return NextResponse.json({ ok: true });
}
