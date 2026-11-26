import { db } from "@/db";
import { referrals, users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Called when a referred user completes their first eligible Mobile Money
 * deposit or withdrawal: unlocks the referrer's 5-day 50%-off-fees period.
 */
export async function maybeRewardReferrer(referredUserId: string) {
  try {
    const rows = await db
      .select()
      .from(referrals)
      .where(and(eq(referrals.referredId, referredUserId), eq(referrals.status, "pending")))
      .limit(1);
    if (!rows.length) return;
    const ref = rows[0];
    const until = new Date(Date.now() + 5 * 24 * 3600 * 1000);
    await db.update(referrals).set({ status: "paid" }).where(eq(referrals.id, ref.id));
    await db.update(users).set({ reducedFeeUntil: until }).where(eq(users.id, ref.referrerId));
    await db.insert(notifications).values({
      userId: ref.referrerId,
      title: "Reduced-fee period unlocked! 🎉",
      message: `Your invitee is now active. Enjoy 50% off Mobile Money deposit & withdrawal fees for 5 days (until ${until.toLocaleDateString("en-US", { month: "short", day: "numeric" })}).`,
    });
  } catch (e) {
    console.error("referral reward failed", e);
  }
}
