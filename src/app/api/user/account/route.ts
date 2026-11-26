import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser, destroySession } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  sessions,
  paymentLinks,
  notifications,
  wallets,
  payoutNumbers,
  supportTickets,
  apiKeys,
  conversionRules,
  referrals,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { password, confirm } = await req.json().catch(() => ({}));
  if (confirm !== "DELETE") return NextResponse.json({ error: "Please type DELETE to confirm." }, { status: 400 });
  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const ok = await bcrypt.compare(password || "", rows[0].passwordHash);
  if (!ok) return NextResponse.json({ error: "Password is incorrect." }, { status: 400 });

  const uid = user.id;
  await db.delete(sessions).where(eq(sessions.userId, uid));
  await db.delete(paymentLinks).where(eq(paymentLinks.userId, uid));
  await db.delete(notifications).where(eq(notifications.userId, uid));
  await db.delete(wallets).where(eq(wallets.userId, uid));
  await db.delete(payoutNumbers).where(eq(payoutNumbers.userId, uid));
  await db.delete(supportTickets).where(eq(supportTickets.userId, uid));
  await db.delete(apiKeys).where(eq(apiKeys.userId, uid));
  await db.delete(conversionRules).where(eq(conversionRules.userId, uid));
  await db.delete(referrals).where(or(eq(referrals.referrerId, uid), eq(referrals.referredId, uid)));
  // Transactions are kept for ledger integrity, anonymized by account removal.
  await db.delete(users).where(eq(users.id, uid));
  await destroySession();
  return NextResponse.json({ ok: true });
}
