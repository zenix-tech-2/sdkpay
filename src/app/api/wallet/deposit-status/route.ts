import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { DEPOSIT_AUTO_APPROVE_MS, DEPOSIT_EXPIRY_MS } from "../deposit/route";
import { maybeRewardReferrer } from "@/lib/referrals";
import { runAutoConversion } from "@/lib/auto-convert";
import { queryProviderStatus } from "@/lib/providers/router";
import { settleTxFromProvider } from "@/lib/providers/settle";

/**
 * Poll endpoint for the "Processing" screen.
 * - Live provider txs: queries AshTechPay/SasPay status (webhooks also update).
 * - Demo txs: auto-approves after 15s, expires after 8min.
 */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .limit(1);
  if (!rows.length) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const tx = rows[0];
  if (tx.status !== "pending") return NextResponse.json({ status: tx.status, transaction: tx });

  // Live provider transaction -> poll the provider
  if (tx.providerRef && !tx.providerRef.includes("DEMO") && (tx.provider === "ashtechpay" || tx.provider === "saaspay")) {
    const live = await queryProviderStatus(tx.provider, tx.providerRef);
    if (live.status !== "pending") {
      const settled = await settleTxFromProvider({
        providerRef: tx.providerRef,
        reference: tx.reference,
        status: live.status,
        provider: tx.provider === "ashtechpay" ? "AshTechPay" : "SasPay",
      });
      return NextResponse.json({ status: live.status, transaction: settled || tx });
    }
    return NextResponse.json({ status: "pending", transaction: tx });
  }

  // Demo simulation
  if (tx.type === "deposit") {
    const age = Date.now() - new Date(tx.createdAt).getTime();
    if (age > DEPOSIT_EXPIRY_MS) {
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, id));
      await db.insert(notifications).values({
        userId: user.id,
        title: "Dépôt expiré",
        message: `La demande ${tx.reference} a expiré sans approbation. Aucun montant débité.`,
      });
      return NextResponse.json({ status: "failed", transaction: { ...tx, status: "failed" } });
    }
    if (age > DEPOSIT_AUTO_APPROVE_MS) {
      const credited = tx.amount - tx.fee;
      await db.update(transactions).set({ status: "success", updatedAt: new Date() }).where(eq(transactions.id, id));
      if (tx.currency === "XOF") {
        await db.update(users).set({ balanceXof: sql`${users.balanceXof} + ${credited}` }).where(eq(users.id, user.id));
      } else {
        await db.update(users).set({ balanceXaf: sql`${users.balanceXaf} + ${credited}` }).where(eq(users.id, user.id));
      }
      await db.insert(notifications).values({
        userId: user.id,
        title: "Dépôt confirmé",
        message: `Dépôt de ${tx.amount.toLocaleString("fr-FR")} ${tx.currency} via ${tx.operator} confirmé. ${credited.toLocaleString("fr-FR")} crédités. Réf : ${tx.reference}`,
      });
      await maybeRewardReferrer(user.id);
      await runAutoConversion(user.id).catch(() => {});
      return NextResponse.json({ status: "success", transaction: { ...tx, status: "success" } });
    }
  }

  return NextResponse.json({ status: tx.status, transaction: tx });
}

export async function POST(req: Request) {
  // Cancel a pending deposit
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .limit(1);
  if (!rows.length) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (rows[0].status !== "pending") return NextResponse.json({ error: "Already processed." }, { status: 400 });
  await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, id));
  await db.insert(notifications).values({
    userId: user.id,
    title: "Dépôt annulé",
    message: `La demande ${rows[0].reference} a été annulée.`,
  });
  return NextResponse.json({ ok: true });
}
