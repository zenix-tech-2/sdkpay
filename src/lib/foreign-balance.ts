import { db } from "@/db";
import { transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Balance for currencies that have no dedicated column (NGN, GHS, KES...).
 * Derived from the ledger: only transactions confirmed by the provider count.
 */
export async function foreignBalance(userId: string, currency: string): Promise<number> {
  const rows = await db
    .select({ type: transactions.type, amount: transactions.amount, fee: transactions.fee })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.currency, currency), eq(transactions.status, "success")));
  let b = 0;
  for (const r of rows) {
    if (["deposit", "payment_received", "send_in"].includes(r.type)) b += r.amount - r.fee;
    else if (["withdraw", "send_out", "payout"].includes(r.type)) b -= r.amount + r.fee;
  }
  return b;
}
