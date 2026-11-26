import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { maybeRewardReferrer } from "@/lib/referrals";
import { runAutoConversion } from "@/lib/auto-convert";

/** Apply a provider-side status change to one of our transactions. */
export async function settleTxFromProvider(opts: {
  providerRef?: string;
  reference?: string;
  status: "success" | "failed" | "pending";
  provider: string;
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
  if (opts.status === "pending") return tx;

  if (opts.status === "failed") {
    await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, tx.id));
    let refunded = false;
    // Only refund if the wallet was actually debited (manual holds are not)
    const held = tx.balanceBefore !== null && tx.balanceAfter !== null && tx.balanceBefore === tx.balanceAfter;
    if (["withdraw", "send_out", "payout"].includes(tx.type) && !held) {
      const back = tx.amount + tx.fee;
      if (tx.currency === "USDT") {
        await db.update(users).set({ balanceUsdt: sql`${users.balanceUsdt} + ${back}` }).where(eq(users.id, tx.userId));
      } else if (tx.currency === "XOF") {
        await db.update(users).set({ balanceXof: sql`${users.balanceXof} + ${back}` }).where(eq(users.id, tx.userId));
      } else {
        await db.update(users).set({ balanceXaf: sql`${users.balanceXaf} + ${back}` }).where(eq(users.id, tx.userId));
      }
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
  await db.update(transactions).set({ status: "success", updatedAt: new Date() }).where(eq(transactions.id, tx.id));
  if (tx.type === "deposit" || tx.type === "payment_received" || tx.type === "send_in") {
    if (tx.currency === "USDT") {
      await db.update(users).set({ balanceUsdt: sql`${users.balanceUsdt} + ${credited}` }).where(eq(users.id, tx.userId));
    } else if (tx.currency === "XOF") {
      await db.update(users).set({ balanceXof: sql`${users.balanceXof} + ${credited}` }).where(eq(users.id, tx.userId));
    } else {
      await db.update(users).set({ balanceXaf: sql`${users.balanceXaf} + ${credited}` }).where(eq(users.id, tx.userId));
    }
  }
  const unit = tx.currency === "USDT" ? `${(credited / 10000).toFixed(4)} USDT` : `${credited.toLocaleString("fr-FR")} ${tx.currency}`;
  await db.insert(notifications).values({
    userId: tx.userId,
    title: `${txTitle(tx.type)} confirmed`,
    message: `${txTitle(tx.type)} of ${unit} via ${opts.provider} confirmed. Réf : ${tx.reference}`,
  });
  if ((tx.type === "deposit" || tx.type === "withdraw") && tx.currency !== "USDT") {
    await maybeRewardReferrer(tx.userId);
  }
  if (tx.type === "deposit" || tx.type === "payment_received") {
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
