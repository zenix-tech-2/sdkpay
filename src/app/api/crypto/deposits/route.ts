import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

const DEMO_DEPOSIT_ADDRESS = "TYZQ18SpQTGCiZShoRe5a9i42tf4RsM5Nt";

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const amount = Number(body.amount);
    const network = String(body.network ?? "USDT.TRC20").trim();
    const refundAddress = String(body.refundAddress ?? body.walletAddress ?? "").trim();
    const countryName = String(body.countryName ?? "Cameroon").trim();
    const countryCode = String(body.countryCode ?? "CM").trim().toUpperCase();
    if (!Number.isFinite(amount) || amount < 1) return Response.json({ error: "Le montant minimum est de 1 USDT" }, { status: 400 });

    const fee = amount * 0.025;
    const net = amount - fee;
    const [account] = await db.select({ usdtBalance: users.usdtBalance }).from(users).where(eq(users.id, result.user.id)).limit(1);
    const before = account?.usdtBalance ?? 0;
    const reference = `SDK-C-${Date.now().toString(36).toUpperCase()}-${randomCode(8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const routing = await routeDirectPayment({
      mode: "crypto",
      direction: "collect",
      amount,
      currency: "USDT",
      countryCode,
      countryName,
      network,
      walletAddress: refundAddress,
      reference,
      description: "USDT TRC20 deposit",
      customer: { email: result.user.email, name: result.user.fullName },
    });
    const depositAddress = routing.depositAddress ?? DEMO_DEPOSIT_ADDRESS;

    const [record] = await db.insert(transactions).values({
      userId: result.user.id,
      type: "deposit",
      direction: "in",
      amount: Math.round(net * 10000),
      fee: Math.round(fee * 10000),
      grossAmount: Math.round(amount * 10000),
      status: "pending",
      method: network,
      counterparty: refundAddress,
      reference,
      note: "Crypto Deposit (USDT)",
      balanceBefore: Math.round(before * 10000),
      balanceAfter: Math.round(before * 10000),
      siteReference: `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
      recipientName: result.user.fullName,
      countryName,
      currency: "USDT",
      amountDecimal: net,
      feeDecimal: fee,
      grossDecimal: amount,
      balanceBeforeDecimal: before,
      balanceAfterDecimal: before,
      network,
      walletAddress: refundAddress,
      depositAddress,
      providerReference: reference,
      flow: "crypto_deposit",
      expiresAt,
      ...providerColumns(routing),
    }).returning();

    return Response.json({ transaction: record, routing, amount, fee, net, depositAddress }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
