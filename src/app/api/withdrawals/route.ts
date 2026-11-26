import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";
import { applyTransaction } from "@/lib/ledger";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const methodType = String(body.methodType ?? "mobile");
    const countryCode = String(body.countryCode ?? "CM").trim().toUpperCase();
    const countryName = String(body.countryName ?? "Cameroon").trim();

    if (methodType === "mobile") {
      const gross = Math.round(Number(body.amount));
      const operator = String(body.operator ?? "MTN Money").trim();
      const phone = String(body.phone ?? "").trim();
      if (!Number.isFinite(gross) || gross < 550 || gross > 2_000_000) return Response.json({ error: "Le retrait doit être compris entre 550 et 2 000 000 XAF" }, { status: 400 });
      if (phone.replace(/\D/g, "").length < 8) return Response.json({ error: "Numéro Mobile Money invalide" }, { status: 400 });
      const fee = Math.round(gross * 0.04);
      const net = gross - fee;
      const reference = `W-${Date.now().toString(36).toUpperCase()}-${randomCode(6).toUpperCase()}`;
      const routing = await routeDirectPayment({
        mode: "mobile",
        direction: "payout",
        amount: gross,
        currency: "XAF",
        countryCode,
        countryName,
        operator,
        phone,
        reference,
        description: "Mobile Money withdrawal",
        customer: { email: result.user.email, name: result.user.fullName, phone },
      });
      if (!routing.simulated && routing.status === "failed") return Response.json({ error: routing.reason ?? "Provider payout failed" }, { status: 502 });
      const outcome = await applyTransaction({
        userId: result.user.id,
        type: "withdraw",
        direction: "out",
        amount: net,
        fee,
        grossAmount: gross,
        balanceDelta: -gross,
        method: operator,
        counterparty: phone,
        note: "Withdrawal",
        countryName,
        recipientName: result.user.fullName,
        currency: "XAF",
        amountDecimal: net,
        feeDecimal: fee,
        grossDecimal: gross,
        flow: "mobile_withdraw",
        ...providerColumns(routing),
      });
      return Response.json({ ok: true, ...outcome, routing }, { status: 201 });
    }

    if (methodType === "crypto") {
      const amount = Number(body.amount);
      const network = String(body.network ?? "USDT.TRC20").trim();
      const address = String(body.address ?? body.walletAddress ?? "").trim();
      const feePayer = body.feePayer === "recipient" ? "recipient" : "you";
      if (!Number.isFinite(amount) || amount < 1 || amount > 1500) return Response.json({ error: "Le retrait doit être compris entre 1 et 1 500 USDT" }, { status: 400 });
      if (address.length < 10) return Response.json({ error: "Adresse de destination invalide" }, { status: 400 });

      const fee = 1;
      const debited = amount + (feePayer === "you" ? fee : 0);
      const recipientGets = amount - (feePayer === "recipient" ? fee : 0);
      const reference = `W-C-${Date.now().toString(36).toUpperCase()}-${randomCode(6).toUpperCase()}`;
      const routing = await routeDirectPayment({
        mode: "crypto",
        direction: "payout",
        amount,
        currency: "USDT",
        countryCode,
        countryName,
        network,
        walletAddress: address,
        reference,
        description: "USDT withdrawal",
      });
      if (!routing.simulated && routing.status === "failed") return Response.json({ error: routing.reason ?? "Ashtechpay crypto payout failed" }, { status: 502 });
      const outcome = await db.transaction(async (trx) => {
        const [account] = await trx.select({ usdtBalance: users.usdtBalance }).from(users).where(eq(users.id, result.user.id)).limit(1);
        const before = account?.usdtBalance ?? 0;
        if (before < debited) throw new Error("Solde USDT insuffisant");
        const [updated] = await trx.update(users)
          .set({ usdtBalance: sql`${users.usdtBalance} - ${debited}` })
          .where(eq(users.id, result.user.id))
          .returning({ usdtBalance: users.usdtBalance });
        const after = updated?.usdtBalance ?? before - debited;
        const [record] = await trx.insert(transactions).values({
          userId: result.user.id,
          type: "withdraw",
          direction: "out",
          amount: Math.round(recipientGets * 10000),
          fee: Math.round(fee * 10000),
          grossAmount: Math.round(debited * 10000),
          status: "completed",
          method: network,
          counterparty: address,
          reference: `SDK-W-${Date.now().toString(36).toUpperCase()}-${randomCode(8).toUpperCase()}`,
          note: "Crypto Withdrawal (USDT)",
          balanceBefore: Math.round(before * 10000),
          balanceAfter: Math.round(after * 10000),
          siteReference: `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
          recipientName: result.user.fullName,
          countryName,
          currency: "USDT",
          amountDecimal: recipientGets,
          feeDecimal: fee,
          grossDecimal: debited,
          balanceBeforeDecimal: before,
          balanceAfterDecimal: after,
          network,
          walletAddress: address,
          providerReference: reference,
          feePayer,
          flow: "crypto_withdraw",
          ...providerColumns(routing),
        }).returning();
        return { transaction: record, balance: after };
      });
      return Response.json({ ok: true, ...outcome, routing }, { status: 201 });
    }

    return Response.json({ error: "Méthode de retrait inconnue" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("Solde insuffisant")) return Response.json({ error: message }, { status: 400 });
    return apiError(error);
  }
}
