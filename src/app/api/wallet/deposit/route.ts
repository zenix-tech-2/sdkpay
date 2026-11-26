import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { transactions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { hasReducedFees } from "@/lib/fees";
import { getFeeConfig, num } from "@/lib/platform";
import { executeCollect } from "@/lib/providers/router";
import { COUNTRIES } from "@/data/countries";
import { foreignBalance } from "@/lib/foreign-balance";

export const DEPOSIT_FEE_RATE = 0.04;
/** A pending request expires after 8 minutes without approval. */
export const DEPOSIT_EXPIRY_MS = 8 * 60 * 1000;
/** Only used when PROVIDER_MODE=demo (simulation). Never used for real payments. */
export const DEPOSIT_AUTO_APPROVE_MS = 15 * 1000;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.status === "suspended") return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  try {
    const cfg = await getFeeConfig();
    const { amount, operator, phone, country, channel } = await req.json();
    const amt = Number(amount);
    const minDep = num(cfg.min_deposit, 100);
    if (!amt || amt < minDep) return NextResponse.json({ error: `Montant minimum : ${minDep}.` }, { status: 400 });
    if (!operator || !phone) return NextResponse.json({ error: "Opérateur et numéro requis." }, { status: 400 });
    // The currency ALWAYS comes from the selected country (Nigeria -> NGN, Ghana -> GHS...), never from the client.
    const countryObj =
      COUNTRIES.find((c) => c.name === country) ??
      COUNTRIES.find((c) => c.code === String(country || "").toUpperCase()) ??
      COUNTRIES.find((c) => c.name === user.country);
    if (!countryObj) return NextResponse.json({ error: "Country not supported." }, { status: 400 });
    if (!countryObj.operators.includes(operator)) {
      return NextResponse.json({ error: `${operator} is not available in ${countryObj.name}.` }, { status: 400 });
    }
    const cur = countryObj.currency;
    const rate = num(cfg.momo_fee, DEPOSIT_FEE_RATE) * (hasReducedFees(user) ? 0.5 : 1);
    const fee = Math.round(amt * rate);
    const credited = amt - fee;
    const before =
      cur === "XOF" ? user.balanceXof : cur === "XAF" ? user.balanceXaf : await foreignBalance(user.id, cur);
    const countryName = countryObj.name;
    const cc = countryObj.code;

    const ref = randomRef("SDK-D");
    const inserted = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "deposit",
        amount: amt,
        currency: cur,
        fee,
        status: "pending",
        operator,
        phone,
        reference: ref,
        label: `Dépôt ${operator}`,
        country: countryName,
        balanceBefore: before,
        balanceAfter: before + credited,
        channel: channel === "api" ? "api" : "dashboard",
      })
      .returning({ id: transactions.id });
    const txId = inserted[0].id;

    // Route to AshTechPay (primary) or SasPay (backup). Without a configured provider the request is refused (no simulation).
    const prov = await executeCollect(
      {
        amount: amt,
        currency: cur,
        countryCode: cc,
        phone: phone.replace(/\s/g, ""),
        operator,
        reference: ref,
        description: `SDK Pay deposit ${ref}`,
        customerName: user.fullName,
        customerEmail: user.email,
      },
      { txId, userId: user.id }
    );
    await db
      .update(transactions)
      .set({ provider: prov.provider, providerRef: prov.providerRef })
      .where(eq(transactions.id, txId));

    if (prov.live && !prov.ok) {
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, txId));
      await db.insert(notifications).values({
        userId: user.id,
        title: "Dépôt rejeté",
        message: `Votre dépôt a été rejeté (${prov.provider}) : ${prov.error}. Aucun montant débité.`,
      });
      return NextResponse.json({ error: prov.error || "Provider error." }, { status: 502 });
    }

    await db.insert(notifications).values({
      userId: user.id,
      title: "Demande de dépôt envoyée",
      message: `Composez votre code PIN sur ${phone} (${operator}) pour approuver ${amt.toLocaleString("fr-FR")} ${cur}. Réf : ${ref}`,
    });

    return NextResponse.json({
      ok: true,
      id: txId,
      reference: ref,
      credited,
      fee,
      provider: prov.provider,
      checkoutUrl: prov.checkoutUrl || null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
