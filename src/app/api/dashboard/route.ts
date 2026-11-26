import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, paymentLinks, transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { publicUser } from "@/lib/auth";
import { getWalletsForUser } from "@/lib/wallets";

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const user = result.user;
    const [links, txs, referrals, walletRows, notificationRows] = await Promise.all([
      db.select().from(paymentLinks).where(eq(paymentLinks.userId, user.id)).orderBy(desc(paymentLinks.createdAt), desc(paymentLinks.id)),
      db.select().from(transactions).where(eq(transactions.userId, user.id)).orderBy(desc(transactions.createdAt)).limit(50),
      db.select({ id: users.id, fullName: users.fullName, createdAt: users.createdAt }).from(users).where(eq(users.referredBy, user.referralCode)),
      getWalletsForUser(user.id),
      db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)),
    ]);
    const completed = txs.filter((t) => t.status === "completed" && (t.currency ?? "XAF") === "XAF");
    const totalIn = completed.filter((t) => t.direction === "in").reduce((sum, t) => sum + t.amount, 0);
    const totalOut = completed.filter((t) => t.direction === "out").reduce((sum, t) => sum + t.amount, 0);
    return Response.json({
      user: publicUser(user),
      links,
      transactions: txs,
      referrals,
      wallets: walletRows,
      notifications: notificationRows,
      stats: {
        totalIn,
        totalOut,
        linksCount: links.length,
        paymentsCount: completed.filter((t) => t.direction === "in").length,
        referralCount: referrals.length,
        views: links.reduce((sum, l) => sum + l.views, 0),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
