import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { hasReducedFees } from "@/lib/fees";
import { getFeeConfig, num } from "@/lib/platform";
import { maybeRewardReferrer } from "@/lib/referrals";
import { executeDisburse } from "@/lib/providers/router";
import { COUNTRIES } from "@/data/countries";

export const WITHDRAW_FEE_RATE = 0.04;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.status === "suspended") return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  try {
    const cfg = await getFeeConfig();
    const minW = num(cfg.min_withdraw, 550);
    const maxW = num(cfg.max_withdraw, 2000000);
    const manual = cfg.manual_withdrawals === "true";
    const { amount, operator, phone, currency, country } = await req.json();
    const amt = Number(amount);
    if (!amt || amt < minW) return NextResponse.json({ error: `Minimum withdrawal: ${minW}.` }, { status: 400 });
    if (amt > maxW) return NextResponse.json({ error: `Maximum withdrawal: ${maxW.toLocaleString("en-US")}.` }, { status: 400 });
    if (!operator || !phone) return NextResponse.json({ error: "Opérateur et numéro requis." }, { status: 400 });
    const cur = currency === "XOF" ? "XOF" : "XAF";
    const balance = cur === "XOF" ? user.balanceXof : user.balanceXaf;
    const fee = Math.round(amt * num(cfg.momo_fee, WITHDRAW_FEE_RATE) * (hasReducedFees(user) ? 0.5 : 1));
    if (amt + fee > balance) {
      return NextResponse.json({ error: `Solde insuffisant. Disponible : ${balance.toLocaleString("fr-FR")} ${cur}.` }, { status: 400 });
    }
    const countryName = country || user.country;
    const cc = COUNTRIES.find((c) => c.name === countryName)?.code ?? "CM";
    const ref = randomRef("SDK-W");
    const inserted = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "withdraw",
        amount: amt,
        currency: cur,
        fee,
        status: "pending",
        operator,
        phone,
        reference: ref,
        label: `Retrait ${operator}`,
        counterparty: user.fullName,
        country: countryName,
        balanceBefore: balance,
        balanceAfter: manual ? balance : balance - amt - fee,
      })
      .returning({ id: transactions.id });
    const txId = inserted[0].id;

    // Manual mode: hold for admin review, debit on approval
    if (manual) {
      await db.insert(notifications).values({
        userId: user.id,
        title: "Retrait en attente de vérification",
        message: `Votre retrait de ${amt.toLocaleString("fr-FR")} ${cur} vers ${phone} (${operator}) est en attente de vérification par notre équipe. Réf : ${ref}`,
      });
      return NextResponse.json({ ok: true, id: txId, reference: ref, fee, status: "pending", provider: "manual" });
    }

    const prov = await executeDisburse(
      {
        amount: amt - fee,
        currency: cur,
        countryCode: cc,
        phone: phone.replace(/\s/g, ""),
        operator,
        reference: ref,
        description: `SDK Pay withdrawal ${ref}`,
      },
      { txId, userId: user.id }
    );
    await db
      .update(transactions)
      .set({ provider: prov.provider, providerRef: prov.providerRef })
      .where(eq(transactions.id, txId));

    if (prov.live && !prov.ok) {
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, txId));
      return NextResponse.json({ error: prov.error || "Provider error. No amount debited." }, { status: 502 });
    }

    // Debit (reserved) — refunded automatically if the provider later reports failure
    if (cur === "XOF") {
      await db.update(users).set({ balanceXof: balance - amt - fee }).where(eq(users.id, user.id));
    } else {
      await db.update(users).set({ balanceXaf: balance - amt - fee }).where(eq(users.id, user.id));
    }
    const finalStatus = prov.live && prov.status === "pending" ? "pending" : "success";
    await db.update(transactions).set({ status: finalStatus, updatedAt: new Date() }).where(eq(transactions.id, txId));
    await db.insert(notifications).values({
      userId: user.id,
      title: finalStatus === "pending" ? "Retrait en attente" : "Retrait effectué",
      message:
        finalStatus === "pending"
          ? `Votre retrait de ${amt.toLocaleString("fr-FR")} ${cur} vers ${phone} (${operator}) est en cours de traitement. Réf : ${ref}`
          : `Retrait de ${amt.toLocaleString("fr-FR")} ${cur} vers ${phone} (${operator}). Réf : ${ref}`,
    });
    await maybeRewardReferrer(user.id);
    return NextResponse.json({ ok: true, id: txId, reference: ref, fee, status: finalStatus, provider: prov.provider });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
