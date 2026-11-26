import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { USDT_UNIT, microToUsdt } from "@/lib/crypto";
import { getFeeConfig, num } from "@/lib/platform";
import { executeCryptoDisburse } from "@/lib/providers/router";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const cfg = await getFeeConfig();
    const flatFee = num(cfg.crypto_flat_fee_usdt, 1);
    const { amountUsdt, network, address, feePayer } = await req.json();
    const amt = Number(amountUsdt);
    if (!amt || amt < 1) return NextResponse.json({ error: "Minimum withdrawal: 1 USDT." }, { status: 400 });
    const maxW = num(cfg.max_crypto_withdraw, 1500);
    if (amt > maxW) return NextResponse.json({ error: `Maximum withdrawal: ${maxW.toLocaleString("en-US")} USDT.` }, { status: 400 });
    if (!address?.trim() || address.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a valid destination address." }, { status: 400 });
    }
    const micro = Math.round(amt * USDT_UNIT);
    const feeMicro = Math.round(flatFee * USDT_UNIT);
    const recipientPays = feePayer === "recipient";
    const debited = recipientPays ? micro : micro + feeMicro;
    if (recipientPays && micro <= feeMicro) {
      return NextResponse.json({ error: `Amount must be greater than the ${flatFee} USDT fee.` }, { status: 400 });
    }
    if (debited > user.balanceUsdt) {
      return NextResponse.json(
        { error: `Insufficient USDT balance. Available: ${microToUsdt(user.balanceUsdt).toFixed(4)} USDT.` },
        { status: 400 }
      );
    }
    const net = network || "TRC20";
    const ref = randomRef("SDK-W");
    const inserted = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "withdraw",
        amount: micro,
        currency: "USDT",
        fee: feeMicro,
        status: "pending",
        operator: `USDT (${net})`,
        phone: address.trim(),
        reference: ref,
        label: `Retrait crypto USDT.${net}${recipientPays ? " (frais destinataire)" : ""}`,
        counterparty: user.fullName,
        country: user.country,
        balanceBefore: user.balanceUsdt,
        balanceAfter: user.balanceUsdt - debited,
      })
      .returning({ id: transactions.id });
    const txId = inserted[0].id;

    const prov = await executeCryptoDisburse(
      { amountUsdt: recipientPays ? amt - flatFee : amt, network: net, address: address.trim(), reference: ref },
      { txId, userId: user.id }
    );
    await db.update(transactions).set({ provider: prov.provider, providerRef: prov.providerRef }).where(eq(transactions.id, txId));
    if (prov.live && !prov.ok) {
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, txId));
      return NextResponse.json({ error: prov.error || "Provider error. No amount debited." }, { status: 502 });
    }
    await db.update(users).set({ balanceUsdt: user.balanceUsdt - debited }).where(eq(users.id, user.id));
    const finalStatus = prov.live && prov.status === "pending" ? "pending" : "success";
    await db.update(transactions).set({ status: finalStatus, updatedAt: new Date() }).where(eq(transactions.id, txId));
    await db.insert(notifications).values({
      userId: user.id,
      title: "Retrait crypto envoyé",
      message: `Retrait de ${microToUsdt(recipientPays ? micro - feeMicro : micro).toFixed(4)} USDT vers ${address.trim().slice(0, 12)}... Réf : ${ref}`,
    });
    return NextResponse.json({ ok: true, id: txId, reference: ref, debitedMicro: debited, feeMicro, provider: prov.provider });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
