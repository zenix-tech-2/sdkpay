/**
 * Ledger helpers shared by server actions and webhook handlers.
 * All balance mutations are idempotent — a transaction settles exactly once.
 */
import { db } from "@/db";
import { accounts, notifications, transactions, paymentLinks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export type TxRow = typeof transactions.$inferSelect;

async function primaryAccountId(userId: string) {
  const [acc] = await db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isPrimary, true))).limit(1);
  return acc ?? null;
}

/** Mark a pending deposit/payment as completed and credit the wallet. Returns true if it transitioned. */
export async function settleCredit(tx: TxRow, opts?: { creditedAmount?: number | null }): Promise<boolean> {
  if (tx.status === "completed") return false; // already settled — idempotent
  const credit = opts?.creditedAmount && opts.creditedAmount > 0 ? opts.creditedAmount : Number(tx.net);
  await db.transaction(async (trx) => {
    const [current] = await trx.select().from(transactions).where(eq(transactions.id, tx.id)).limit(1);
    if (!current || current.status === "completed") return;
    const [acc] = await trx.select().from(accounts).where(and(eq(accounts.userId, tx.userId), eq(accounts.isPrimary, true))).limit(1);
    const before = acc ? Number(acc.balance) : 0;
    if (acc) {
      await trx.update(accounts).set({ balance: sql`${accounts.balance} + ${credit}` }).where(eq(accounts.id, acc.id));
    }
    await trx.update(transactions)
      .set({ status: "completed", providerStatus: "completed", balanceBefore: String(before), balanceAfter: String(before + credit) })
      .where(eq(transactions.id, tx.id));
    // if this payment came through a payment link, bump its counters
    if (tx.paymentLinkId) {
      await trx.update(paymentLinks)
        .set({ paymentsCount: sql`${paymentLinks.paymentsCount} + 1`, collected: sql`${paymentLinks.collected} + ${credit}` })
        .where(eq(paymentLinks.id, tx.paymentLinkId));
    }
    await trx.insert(notifications).values({
      userId: tx.userId,
      title: "Deposit confirmed",
      body: `${credit.toLocaleString("fr-FR")} ${tx.currency} from your Mobile Money top-up has been credited to your balance.`,
      kind: "info",
    });
  });
  return true;
}

/** Mark a pending deposit/payment as failed. Returns true if it transitioned. */
export async function settleFailure(tx: TxRow, reason?: string): Promise<boolean> {
  if (tx.status === "failed") return false;
  await db.update(transactions).set({ status: "failed", providerStatus: "failed" }).where(eq(transactions.id, tx.id));
  await db.insert(notifications).values({
    userId: tx.userId,
    title: "Deposit failed",
    body: reason ? `Your top-up failed: ${reason}. No amount was debited.` : "Your top-up failed or was rejected. No amount was debited.",
    kind: "deposit_rejected",
  });
  return true;
}
