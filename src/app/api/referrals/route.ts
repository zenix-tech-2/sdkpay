import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select({
      id: referrals.id,
      reward: referrals.reward,
      status: referrals.status,
      createdAt: referrals.createdAt,
      fullName: users.fullName,
    })
    .from(referrals)
    .leftJoin(users, eq(users.id, referrals.referredId))
    .where(eq(referrals.referrerId, user.id))
    .orderBy(desc(referrals.createdAt));

  const [sum] = await db
    .select({ total: sql<number>`coalesce(sum(${referrals.reward}),0)` })
    .from(referrals)
    .where(eq(referrals.referrerId, user.id));

  return NextResponse.json({
    referralCode: user.referralCode,
    referrals: rows,
    totalEarned: Number(sum?.total ?? 0),
  });
}
