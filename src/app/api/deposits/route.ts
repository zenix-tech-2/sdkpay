import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const gross = Math.round(Number(body.amount));
    const operator = String(body.operator ?? body.method ?? "MTN Money").trim();
    const phone = String(body.phone ?? body.counterparty ?? "").trim();
    const countryName = String(body.countryName ?? "Cameroun").trim();
    const countryCode = String(body.countryCode ?? "CM").trim().toUpperCase();
    const siteReference = String(body.siteReference ?? "").trim();
    if (!Number.isFinite(gross) || gross < 100) return Response.json({ error: "Le montant minimum est de 100 FCFA" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 8) return Response.json({ error: "Numéro Mobile Money invalide" }, { status: 400 });

    const fee = Math.round(gross * 0.04);
    const net = gross - fee;
    const [account] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, result.user.id)).limit(1);
    const balance = account?.balance ?? 0;
    const reference = `SDK-D-${Date.now().toString(36).toUpperCase()}-${randomCode(8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + (7 * 60 + 48) * 1000);
    const routing = await routeDirectPayment({
      mode: "mobile",
      direction: "collect",
      amount: gross,
      currency: "XAF",
      countryCode,
      countryName,
      operator,
      phone,
      reference,
      description: "Mobile Money Deposit",
      customer: { email: result.user.email, name: result.user.fullName, phone },
    });

    const [record] = await db.insert(transactions).values({
      userId: result.user.id,
      type: "deposit",
      direction: "in",
      amount: net,
      fee,
      grossAmount: gross,
      status: "pending",
      method: operator,
      counterparty: phone,
      reference,
      note: "Mobile Money Deposit",
      balanceBefore: balance,
      balanceAfter: balance,
      siteReference: siteReference || `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
      recipientName: result.user.fullName,
      countryName,
      currency: "XAF",
      amountDecimal: net,
      feeDecimal: fee,
      grossDecimal: gross,
      balanceBeforeDecimal: balance,
      balanceAfterDecimal: balance,
      providerReference: reference,
      flow: "mobile_deposit",
      expiresAt,
      ...providerColumns(routing),
    }).returning();

    return Response.json({ transaction: record, routing }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
