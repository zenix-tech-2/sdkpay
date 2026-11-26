import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { db, pool } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "sdkpay-dev-secret-change-me-32chars!!"
);
export const COOKIE_NAME = "sdkpay_session";

export async function signToken(payload: { sub: string; jti: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { sub: string; jti: string };
  } catch {
    return null;
  }
}

function parseDevice(ua: string) {
  const mobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Browser";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";
  return `${mobile ? "Mobile" : "Desktop"} · ${browser}`;
}

export async function createSession(userId: string) {
  const jti = randomBytes(24).toString("hex");
  const token = await signToken({ sub: userId, jti });
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  let device: string | undefined;
  let ip: string | undefined;
  try {
    const h = await headers();
    device = parseDevice(h.get("user-agent") || "");
    ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
  } catch {
    /* ignore */
  }
  await db.insert(sessions).values({ userId, tokenId: jti, expiresAt, device, ip });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.jti) {
      await db.delete(sessions).where(eq(sessions.tokenId, payload.jti)).catch(() => {});
    }
  }
  store.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub || !payload?.jti) return null;
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenId, payload.jti))
    .limit(1);
  if (!rows.length) return null;
  if (new Date(rows[0].expiresAt).getTime() < Date.now()) return null;
  const urows = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!urows.length) return null;
  const { passwordHash, ...safe } = urows[0] as Record<string, unknown>;
  void passwordHash;
  return safe as unknown as {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    referralCode: string;
    balanceXaf: number;
    balanceXof: number;
    balanceUsdt: number;
    reducedFeeUntil: Date | null;
    status: string;
    role: string;
    kycStatus: string;
    language: string;
    createdAt: Date;
  };
}

// lightweight query helper for raw pool usage
export { pool };
