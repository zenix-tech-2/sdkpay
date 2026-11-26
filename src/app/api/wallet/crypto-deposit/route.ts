import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { USDT_UNIT, microToUsdt } from "@/lib/crypto";
import { getFeeConfig, num } from "@/lib/platform";
import { executeCryptoCharge, queryProviderStatus } from "@/lib/providers/router";
import { settleTxFromProvider } from "@/lib/providers/settle";
import { demoEnabled } from "@/lib/providers/types";
import { COUNTRIES } from "@/data/countries";
import { runAutoConversion } from "@/lib/auto-convert";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const cfg = await getFeeConfig();
    const { amountUsdt, network, country, refundAddress } = await req.json();
    const amt = Number(amountUsdt);
    const minDep = num(cfg.min_crypto_deposit, 1);
    if (!amt || amt < minDep) return NextResponse.json({ error: `Minimum deposit: ${minDep} USDT.` }, { status: 400 });
    if (amt > 50000) return NextResponse.json({ error: "Maximum deposit: 50,000 USDT." }, { status: 400 });
    const net = network || "TRC20";
    const micro = Math.round(amt * USDT_UNIT);
    const fee = Math.round(micro * num(cfg.crypto_deposit_fee, 0.025));
    const credited = micro - fee;
    const ref = randomRef("SDK-C");
    const countryName = country || user.country;
    const cc = COUNTRIES.find((c) => c.name === countryName)?.code ?? "CM";

    const inserted = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "deposit",
        amount: micro,
        currency: "USDT",
        fee,
        status: "pending",
        operator: `USDT (${net})`,
        phone: "",
        reference: ref,
        label: `Dépôt crypto USDT.${net}`,
        counterparty: refundAddress?.trim() || null,
        country: countryName,
        balanceBefore: user.balanceUsdt,
        balanceAfter: user.balanceUsdt + credited,
      })
      .returning({ id: transactions.id });
    const txId = inserted[0].id;

    // AshTechPay crypto Direct (or demo address when no key)
    const prov = await executeCryptoCharge(
      { amountUsdt: amt, network: net, countryCode: cc, reference: ref },
      { txId, userId: user.id }
    );
    if (prov.live && !prov.ok) {
      await db.update(transactions).set({ status: "failed", provider: prov.provider, updatedAt: new Date() }).where(eq(transactions.id, txId));
      return NextResponse.json({ error: prov.error || "Crypto deposits are unavailable right now." }, { status: 502 });
    }
    const { demoTronAddress } = await import("@/lib/crypto");
    const address = prov.live && prov.ok && prov.address ? prov.address : demoTronAddress(ref);
    await db
      .update(transactions)
      .set({ phone: address, provider: prov.provider, providerRef: prov.providerRef || ref })
      .where(eq(transactions.id, txId));

    return NextResponse.json({
      ok: true,
      id: txId,
      reference: ref,
      address,
      amountMicro: micro,
      feeMicro: fee,
      netMicro: credited,
      provider: prov.provider,
      expiresIn: prov.expiresIn || 300,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // "I sent the funds" -> the PROVIDER must confirm the payment. The user's click alone never credits anything.
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const { id } = await req.json();
    const rows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);
    if (!rows.length) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    const tx = rows[0];
    if (tx.status !== "pending") return NextResponse.json({ error: "Already processed.", status: tx.status }, { status: 400 });

    if (tx.provider === "ashtechpay" && tx.providerRef && !tx.providerRef.includes("DEMO")) {
      const live = await queryProviderStatus("ashtechpay", tx.providerRef);
      if (live.status === "pending") {
        return NextResponse.json({ error: "Payment not detected yet. Your balance is credited automatically once the network confirms it.", status: "pending" }, { status: 409 });
      }
      const settled = await settleTxFromProvider({ reference: tx.reference, status: live.status, provider: "AshTechPay" });
      return NextResponse.json({ ok: live.status === "success", id, status: settled?.status ?? live.status });
    }
    if (demoEnabled() && tx.provider === "demo") {
      await settleTxFromProvider({ reference: tx.reference, status: "success", provider: "Demo" });
      return NextResponse.json({ ok: true, id });
    }
    return NextResponse.json({ error: "This deposit cannot be verified. Nothing was credited." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
