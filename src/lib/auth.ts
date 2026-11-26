import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";

const COOKIE_NAME = "sdkpay_session";

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    jar.delete(COOKIE_NAME);
  }
}

export async function getSessionUser(): Promise<User | null> {
  await ensureSchema();
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export function publicUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    dialCode: user.dialCode,
    countryCode: user.countryCode,
    referralCode: user.referralCode,
    apiKey: user.apiKey,
    webhookSecret: user.webhookSecret,
    balance: user.balance,
    usdtBalance: user.usdtBalance,
    theme: user.theme,
    notifyEmail: user.notifyEmail,
    notifyPush: user.notifyPush,
    notifySms: user.notifySms,
    notifyMarketing: user.notifyMarketing,
    conversionSources: user.conversionSources,
    conversionDestination: user.conversionDestination,
    conversionActive: user.conversionActive,
    withdrawalNumbers: user.withdrawalNumbers,
    pinConfigured: user.pinConfigured,
    accountId: `ASHTECH${String(user.id + 53769258)}`,
    createdAt: user.createdAt,
  };
}
