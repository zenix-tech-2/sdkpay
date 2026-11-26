import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { randomCode } from "@/lib/format";

type LedgerInput = {
  userId: number;
  type: string;
  direction: "in" | "out";
  amount: number;
  fee?: number;
  grossAmount?: number;
  balanceDelta?: number;
  method?: string;
  counterparty?: string;
  note?: string;
  linkId?: number | null;
  status?: string;
  siteReference?: string;
  recipientName?: string;
  countryName?: string;
  currency?: string;
  amountDecimal?: number;
  feeDecimal?: number;
  grossDecimal?: number;
  network?: string;
  walletAddress?: string;
  depositAddress?: string;
  providerReference?: string;
  feePayer?: string;
  flow?: string;
  expiresAt?: Date | null;
  provider?: string;
  providerExternalId?: string;
  providerCheckoutUrl?: string;
  providerFallback?: boolean;
  providerStatus?: string;
};

export async function applyTransaction(input: LedgerInput) {
  const amount = Math.round(input.amount);
  const fee = Math.round(input.fee ?? 0);
  const grossAmount = Math.round(input.grossAmount ?? amount + fee);
  const delta = Math.round(input.balanceDelta ?? (input.direction === "in" ? amount : -(amount + fee)));
  const currency = input.currency ?? "XAF";
  const amountDecimal = input.amountDecimal ?? amount;
  const feeDecimal = input.feeDecimal ?? fee;
  const grossDecimal = input.grossDecimal ?? grossAmount;
  const now = new Date();

  return db.transaction(async (tx) => {
    const [current] = await tx.select({ balance: users.balance }).from(users).where(eq(users.id, input.userId)).limit(1);
    const balanceBefore = current?.balance ?? 0;
    if (delta < 0 && balanceBefore < Math.abs(delta)) {
      throw new Error("Solde insuffisant pour cette opération");
    }
    const [updated] = await tx
      .update(users)
      .set({ balance: sql`${users.balance} + ${delta}` })
      .where(eq(users.id, input.userId))
      .returning({ balance: users.balance });
    const balanceAfter = updated?.balance ?? balanceBefore + delta;

    const [record] = await tx.insert(transactions).values({
      userId: input.userId,
      linkId: input.linkId ?? null,
      type: input.type,
      direction: input.direction,
      amount,
      fee,
      status: input.status ?? "completed",
      method: input.method ?? "Mobile Money",
      counterparty: input.counterparty ?? "",
      reference: `SDK-${Date.now().toString(36).toUpperCase()}-${randomCode(5).toUpperCase()}`,
      note: input.note ?? "",
      grossAmount,
      balanceBefore,
      balanceAfter,
      siteReference: input.siteReference ?? `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
      recipientName: input.recipientName ?? "",
      countryName: input.countryName ?? "Cameroun",
      currency,
      amountDecimal,
      feeDecimal,
      grossDecimal,
      balanceBeforeDecimal: balanceBefore,
      balanceAfterDecimal: balanceAfter,
      network: input.network ?? "",
      walletAddress: input.walletAddress ?? "",
      depositAddress: input.depositAddress ?? "",
      providerReference: input.providerReference ?? "",
      feePayer: input.feePayer ?? "",
      flow: input.flow ?? "",
      expiresAt: input.expiresAt ?? null,
      provider: input.provider ?? "ashtechpay",
      providerExternalId: input.providerExternalId ?? "",
      providerCheckoutUrl: input.providerCheckoutUrl ?? "",
      providerFallback: input.providerFallback ?? false,
      providerStatus: input.providerStatus ?? "",
      createdAt: now,
      updatedAt: now,
    }).returning();

    return { transaction: record, balance: balanceAfter, balanceBefore };
  });
}
