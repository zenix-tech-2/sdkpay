import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, wallets } from "@/db/schema";

export async function getWalletsForUser(userId: number) {
  const [account] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
  const primaryBalance = Number(account?.balance ?? 0) + 0.44;
  await db.insert(wallets).values({
    userId,
    currency: "XAF",
    countryName: "Cameroon XAF",
    flag: "🇨🇲",
    balance: primaryBalance,
    isPrimary: true,
  }).onConflictDoNothing();
  await db.update(wallets).set({ balance: primaryBalance })
    .where(and(eq(wallets.userId, userId), eq(wallets.currency, "XAF")));
  return db.select().from(wallets).where(eq(wallets.userId, userId)).orderBy(wallets.id);
}
