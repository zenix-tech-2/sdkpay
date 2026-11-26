import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";
import { applyTransaction } from "@/lib/ledger";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const rows = await db.select().from(transactions).where(eq(transactions.userId, result.user.id)).orderBy(desc(transactions.createdAt));
    return Response.json({ transactions: rows });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const type = String(body.type ?? "");
    const grossAmount = Math.round(Number(body.amount));
    const method = String(body.method ?? "Mobile Money").trim();
    const counterparty = String(body.counterparty ?? "").trim();
    const note = String(body.note ?? "").trim();
    const countryName = String(body.countryName ?? "Cameroon").trim();
    const countryCode = String(body.countryCode ?? "CM").trim().toUpperCase();
    const recipientName = String(body.recipientName ?? "").trim();
    const siteReference = String(body.siteReference ?? "").trim();
    if (!["deposit", "withdraw", "send"].includes(type)) return Response.json({ error: "Opération non reconnue" }, { status: 400 });
    if (!Number.isFinite(grossAmount) || grossAmount < 100) return Response.json({ error: "Le montant minimum est de 100 FCFA" }, { status: 400 });
    if ((type === "withdraw" || type === "send") && !counterparty) return Response.json({ error: "Indiquez le destinataire ou le numéro de retrait" }, { status: 400 });

    const fee = Math.round(grossAmount * 0.04);
    const netAmount = grossAmount - fee;
    const reference = `TX-${Date.now().toString(36).toUpperCase()}-${randomCode(6).toUpperCase()}`;
    const routing = await routeDirectPayment({
      mode: "mobile",
      direction: type === "deposit" ? "collect" : "payout",
      amount: grossAmount,
      currency: "XAF",
      countryCode,
      countryName,
      operator: method,
      phone: counterparty,
      reference,
      description: note || type,
      customer: { email: result.user.email, name: recipientName || result.user.fullName, phone: counterparty },
    });
    if (!routing.simulated && routing.status === "failed") return Response.json({ error: routing.reason ?? "Provider request failed" }, { status: 502 });

    const outcome = await applyTransaction({
      userId: result.user.id,
      type,
      direction: type === "deposit" ? "in" : "out",
      amount: netAmount,
      fee,
      grossAmount,
      balanceDelta: type === "deposit" ? netAmount : -grossAmount,
      method,
      counterparty,
      note: note || (type === "deposit" ? "Mobile Money Deposit" : type === "withdraw" ? "Withdrawal" : "Transfer"),
      countryName,
      recipientName: recipientName || (type === "deposit" ? "" : result.user.fullName),
      siteReference: siteReference || undefined,
      currency: "XAF",
      amountDecimal: netAmount,
      feeDecimal: fee,
      grossDecimal: grossAmount,
      flow: type === "deposit" ? "mobile_deposit" : type === "withdraw" ? "mobile_withdraw" : "mobile_send",
      ...providerColumns(routing),
    });
    return Response.json({ ok: true, ...outcome, routing }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("Solde insuffisant")) return Response.json({ error: message }, { status: 400 });
    return apiError(error);
  }
}
