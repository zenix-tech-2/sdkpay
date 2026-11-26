import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { USDT_UNIT, CRYPTO_WITHDRAW_FEE_USDT, microToUsdt } from "@/lib/crypto";
import { hasReducedFees } from "@/lib/fees";
import { getFeeConfig, num } from "@/lib/platform";
import { executeDisburse, executeCryptoDisburse } from "@/lib/providers/router";
import { COUNTRIES } from "@/data/countries";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.status === "suspended") return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  try {
    const body = await req.json();
    const mode = body.mode || "internal";

    /* ---------- INTERNAL: free transfer between SDK Pay users ---------- */
    if (mode === "internal") {
      const { recipient, amount, currency, note } = body;
      const amt = Number(amount);
      if (!recipient?.trim()) return NextResponse.json({ error: "Destinataire requis." }, { status: 400 });
      if (!amt || amt < 100) return NextResponse.json({ error: "Montant minimum : 100." }, { status: 400 });
      const cur = currency === "XOF" ? "XOF" : "XAF";
      const balance = cur === "XOF" ? user.balanceXof : user.balanceXaf;
      if (amt > balance) {
        return NextResponse.json({ error: `Solde insuffisant. Disponible : ${balance.toLocaleString("fr-FR")} ${cur}.` }, { status: 400 });
      }
      const key = recipient.trim().toLowerCase();
      const found = await db
        .select()
        .from(users)
        .where(or(eq(users.email, key), eq(users.username, key), eq(users.phone, recipient.trim())))
        .limit(1);

      const ref = randomRef("SDK-T");
      const inserted = await db
        .insert(transactions)
        .values({
          userId: user.id,
          type: "send_out",
          amount: amt,
          currency: cur,
          status: "success",
          reference: ref,
          label: `Envoi vers ${recipient.trim()}${note ? ` — ${note}` : ""}`,
          counterparty: recipient.trim(),
          country: user.country,
          balanceBefore: balance,
          balanceAfter: balance - amt,
        })
        .returning({ id: transactions.id });

      if (cur === "XOF") {
        await db.update(users).set({ balanceXof: user.balanceXof - amt }).where(eq(users.id, user.id));
      } else {
        await db.update(users).set({ balanceXaf: user.balanceXaf - amt }).where(eq(users.id, user.id));
      }

      if (found.length && found[0].id !== user.id) {
        const dest = found[0];
        const destBefore = cur === "XOF" ? dest.balanceXof : dest.balanceXaf;
        await db.insert(transactions).values({
          userId: dest.id,
          type: "send_in",
          amount: amt,
          currency: cur,
          status: "success",
          reference: ref,
          label: `Reçu de ${user.fullName}${note ? ` — ${note}` : ""}`,
          counterparty: user.username,
          country: dest.country,
          balanceBefore: destBefore,
          balanceAfter: destBefore + amt,
        });
        if (cur === "XOF") {
          await db.update(users).set({ balanceXof: dest.balanceXof + amt }).where(eq(users.id, dest.id));
        } else {
          await db.update(users).set({ balanceXaf: dest.balanceXaf + amt }).where(eq(users.id, dest.id));
        }
        await db.insert(notifications).values({
          userId: dest.id,
          title: "Fonds reçus",
          message: `Vous avez reçu ${amt.toLocaleString("fr-FR")} ${cur} de ${user.fullName}.`,
        });
      }

      await db.insert(notifications).values({
        userId: user.id,
        title: "Envoi confirmé",
        message: `Envoi de ${amt.toLocaleString("fr-FR")} ${cur} vers ${recipient.trim()}. Réf : ${ref}`,
      });
      return NextResponse.json({ ok: true, id: inserted[0].id, reference: ref, fee: 0, internal: found.length > 0 });
    }

    /* ---------- MOBILE MONEY: send to any phone number (4% fee) ---------- */
    if (mode === "momo") {
      const { name, phone, operator, country, amount, currency } = body;
      const amt = Number(amount);
      if (!phone?.trim() || phone.trim().length < 4) return NextResponse.json({ error: "Valid phone number required." }, { status: 400 });
      if (!amt || amt < 100) return NextResponse.json({ error: "Minimum amount: 100." }, { status: 400 });
      if (!operator) return NextResponse.json({ error: "Operator required." }, { status: 400 });
      const cur = currency === "XOF" ? "XOF" : "XAF";
      const balance = cur === "XOF" ? user.balanceXof : user.balanceXaf;
      const feeCfg = await getFeeConfig();
      const fee = Math.round(amt * num(feeCfg.momo_fee, 0.04) * (hasReducedFees(user) ? 0.5 : 1));
      if (amt + fee > balance) {
        return NextResponse.json({ error: `Insufficient balance. Available: ${balance.toLocaleString("fr-FR")} ${cur}.` }, { status: 400 });
      }
      const countryName = country || user.country;
      const cc = COUNTRIES.find((c) => c.name === countryName)?.code ?? "CM";
      const ref = randomRef("SDK-T");
      const inserted = await db
        .insert(transactions)
        .values({
          userId: user.id,
          type: "send_out",
          amount: amt,
          currency: cur,
          fee,
          status: "pending",
          operator,
          phone: phone.trim(),
          reference: ref,
          label: `Envoi ${operator} vers ${name?.trim() || phone.trim()}`,
          counterparty: name?.trim() || phone.trim(),
          country: countryName,
          balanceBefore: balance,
          balanceAfter: balance - amt - fee,
        })
        .returning({ id: transactions.id });
      const txId = inserted[0].id;

      const prov = await executeDisburse(
        {
          amount: amt,
          currency: cur,
          countryCode: cc,
          phone: phone.trim().replace(/\s/g, ""),
          operator,
          reference: ref,
          description: `SDK Pay transfer ${ref}`,
        },
        { txId, userId: user.id }
      );
      await db.update(transactions).set({ provider: prov.provider, providerRef: prov.providerRef }).where(eq(transactions.id, txId));
      if (prov.live && !prov.ok) {
        await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, txId));
        return NextResponse.json({ error: prov.error || "Provider error. No amount debited." }, { status: 502 });
      }
      if (cur === "XOF") {
        await db.update(users).set({ balanceXof: balance - amt - fee }).where(eq(users.id, user.id));
      } else {
        await db.update(users).set({ balanceXaf: balance - amt - fee }).where(eq(users.id, user.id));
      }
      const finalStatus = prov.live && prov.status === "pending" ? "pending" : "success";
      await db.update(transactions).set({ status: finalStatus, updatedAt: new Date() }).where(eq(transactions.id, txId));
      await db.insert(notifications).values({
        userId: user.id,
        title: "Envoi Mobile Money confirmé",
        message: `${amt.toLocaleString("fr-FR")} ${cur} envoyés au ${phone.trim()} (${operator}). Réf : ${ref}`,
      });
      return NextResponse.json({ ok: true, id: txId, reference: ref, fee, provider: prov.provider });
    }

    /* ---------- CRYPTO: send USDT (flat 1 USDT fee, via AshTechPay) ---------- */
    if (mode === "crypto") {
      const { address, network, amountUsdt, note, feePayer } = body;
      const amt = Number(amountUsdt);
      if (!address?.trim() || address.trim().length < 10) {
        return NextResponse.json({ error: "Please enter a valid destination address." }, { status: 400 });
      }
      if (!amt || amt < 1) return NextResponse.json({ error: "Minimum: 1 USDT." }, { status: 400 });
      const micro = Math.round(amt * USDT_UNIT);
      const feeMicro = Math.round(CRYPTO_WITHDRAW_FEE_USDT * USDT_UNIT);
      const recipientPays = feePayer === "recipient";
      if (recipientPays && micro <= feeMicro) {
        return NextResponse.json({ error: "Amount must be greater than the 1 USDT fee." }, { status: 400 });
      }
      const debited = recipientPays ? micro : micro + feeMicro;
      if (debited > user.balanceUsdt) {
        return NextResponse.json(
          { error: `Insufficient USDT balance. Available: ${microToUsdt(user.balanceUsdt).toFixed(4)} USDT.` },
          { status: 400 }
        );
      }
      const net = network || "TRC20";
      const ref = randomRef("SDK-T");
      const inserted = await db
        .insert(transactions)
        .values({
          userId: user.id,
          type: "send_out",
          amount: micro,
          currency: "USDT",
          fee: feeMicro,
          status: "pending",
          operator: `USDT (${net})`,
          phone: address.trim(),
          reference: ref,
          label: `Envoi crypto USDT.${net}${recipientPays ? " (frais destinataire)" : ""}${note ? ` — ${note}` : ""}`,
          counterparty: address.trim().slice(0, 20) + "...",
          country: user.country,
          balanceBefore: user.balanceUsdt,
          balanceAfter: user.balanceUsdt - debited,
        })
        .returning({ id: transactions.id });
      const txId = inserted[0].id;

      const prov = await executeCryptoDisburse(
        { amountUsdt: recipientPays ? amt - CRYPTO_WITHDRAW_FEE_USDT : amt, network: net, address: address.trim(), reference: ref },
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
        title: "Envoi crypto confirmé",
        message: `${microToUsdt(recipientPays ? micro - feeMicro : micro).toFixed(4)} USDT envoyés vers ${address.trim().slice(0, 12)}... Réf : ${ref}`,
      });
      return NextResponse.json({ ok: true, id: txId, reference: ref, feeMicro, debitedMicro: debited, provider: prov.provider });
    }

    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
