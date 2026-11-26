import { db } from "@/db";
import { users, transactions, notifications, paymentLinks } from "@/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { maybeRewardReferrer } from "@/lib/referrals";
import { runAutoConversion } from "@/lib/auto-convert";
import { queryProviderStatus } from "./router";
import type { ProviderName } from "./types";

const FAMILIES = ["XAF", "XOF", "USDT"];

/** Move money on the stored balance columns. Other currencies (NGN, GHS...) are derived from the ledger. */
async function adjustBalance(userId: string, currency: string, delta: number) {
  if (currency === "USDT") await db.update(users).set({ balanceUsdt: sql`${users.balanceUsdt} + ${delta}` }).where(eq(users.id, userId));
  else if (currency === "XOF") await db.update(users).set({ balanceXof: sql`${users.balanceXof} + ${delta}` }).where(eq(users.id, userId));
  else if (currency === "XAF") await db.update(users).set({ balanceXaf: sql`${users.balanceXaf} + ${delta}` }).where(eq(users.id, userId));
}

/**
 * Apply a provider-side status change to one of our transactions.
 *
 * - `verify: true`  -> the claimed status is NOT trusted (e.g. an unsigned webhook): we ask the
 *   provider directly and only act on what the provider itself reports.
 * - The pending -> success/failed transition is claimed atomically, so a deposit can never be
 *   credited twice (webhook + polling racing each other).
 */
export async function settleTxFromProvider(opts: {
  providerRef?: string;
  reference?: string;
  status: "success" | "failed" | "pending";
  provider: string;
  verify?: boolean;
}) {
  if (!opts.providerRef && !opts.reference) return null;
  const conds = [];
  if (opts.providerRef) conds.push(eq(transactions.providerRef, opts.providerRef));
  if (opts.reference) conds.push(eq(transactions.reference, opts.reference));
  const rows = await db
    .select()
    .from(transactions)
    .where(or(...conds))
    .limit(1);
  if (!rows.length) return null;
  const tx = rows[0];
  if (tx.status !== "pending") return tx;

  let status = opts.status;
  if (opts.verify) {
    const live = tx.provider === "ashtechpay" || tx.provider === "saaspay";
    if (!live || !tx.providerRef || tx.providerRef.includes("DEMO")) return tx; // cannot verify -> never trust
    status = (await queryProviderStatus(tx.provider as ProviderName, tx.providerRef)).status;
  }
  if (status === "pending") return tx;

  // Atomic claim: only one caller wins the pending -> final transition.
  const claimed = await db
    .update(transactions)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(transactions.id, tx.id), eq(transactions.status, "pending")))
    .returning({ id: transactions.id });
  if (!claimed.length) {
    const fresh = await db.select().from(transactions).where(eq(transactions.id, tx.id)).limit(1);
    return fresh[0] ?? tx;
  }

  if (status === "failed") {
    let refunded = false;
    // Only refund if the wallet was actually debited (manual holds are not)
    const held = tx.balanceBefore !== null && tx.balanceAfter !== null && tx.balanceBefore === tx.balanceAfter;
    if (["withdraw", "send_out", "payout"].includes(tx.type) && !held && FAMILIES.includes(tx.currency)) {
      await adjustBalance(tx.userId, tx.currency, tx.amount + tx.fee);
      refunded = true;
    }
    await db.insert(notifications).values({
      userId: tx.userId,
      title: `${txTitle(tx.type)} failed`,
      message: `Your ${tx.amount.toLocaleString("fr-FR")} ${tx.currency} ${txTitle(tx.type).toLowerCase()} via ${opts.provider} failed. ${refunded ? "Amount refunded to your wallet." : "No amount was debited."} Réf : ${tx.reference}`,
    });
    return { ...tx, status: "failed" };
  }

  // success
  const credited = tx.amount - tx.fee;
  if (tx.type === "deposit" || tx.type === "payment_received" || tx.type === "send_in") {
    await adjustBalance(tx.userId, tx.currency, credited);
  }
  if (tx.type === "payment_received" && tx.paymentLinkId) {
    await db
      .update(paymentLinks)
      .set({
        totalCollected: sql`${paymentLinks.totalCollected} + ${credited}`,
        paymentsCount: sql`${paymentLinks.paymentsCount} + 1`,
      })
      .where(eq(paymentLinks.id, tx.paymentLinkId));
  }
  const unit = tx.currency === "USDT" ? `${(credited / 10000).toFixed(4)} USDT` : `${credited.toLocaleString("fr-FR")} ${tx.currency}`;
  await db.insert(notifications).values({
    userId: tx.userId,
    title: `${txTitle(tx.type)} confirmed`,
    message: `${txTitle(tx.type)} of ${unit} via ${opts.provider} confirmed. Réf : ${tx.reference}`,
  });
  if ((tx.type === "deposit" || tx.type === "withdraw") && (tx.currency === "XAF" || tx.currency === "XOF")) {
    await maybeRewardReferrer(tx.userId);
  }
  if ((tx.type === "deposit" || tx.type === "payment_received") && FAMILIES.includes(tx.currency)) {
    await runAutoConversion(tx.userId).catch(() => {});
  }
  return { ...tx, status: "success" };
}

function txTitle(t: string) {
  switch (t) {
    case "deposit": return "Deposit";
    case "withdraw": return "Withdrawal";
    case "send_out": return "Transfer";
    case "send_in": return "Transfer";
    case "payment_received": return "Payment";
    default: return "Transaction";
  }
}
