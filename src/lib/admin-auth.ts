import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { admins, adminSessions, adminAudit } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "sdkpay-dev-secret-change-me-32chars!!"
);
export const ADMIN_COOKIE = "sdkpay_admin";

export interface AdminSafe {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Create the first admin from env (or documented defaults) if table is empty. */
export async function ensureSeeded() {
  const rows = await db.select({ id: admins.id }).from(admins).limit(1);
  if (rows.length) return { seeded: false };
  const email = (process.env.ADMIN_EMAIL || "admin@sdkpay.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  await db.insert(admins).values({
    name: "Administrator",
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "super",
  });
  return { seeded: true };
}

export function defaultsHint() {
  return !process.env.ADMIN_PASSWORD;
}

export async function adminFromRequest(): Promise<AdminSafe | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const jti = payload.jti as string;
    const sub = payload.sub as string;
    if (!jti || !sub) return null;
    const srows = await db.select().from(adminSessions).where(eq(adminSessions.tokenId, jti)).limit(1);
    if (!srows.length) return null;
    if (new Date(srows[0].expiresAt).getTime() < Date.now()) return null;
    const arows = await db.select().from(admins).where(eq(admins.id, sub)).limit(1);
    if (!arows.length || !arows[0].isActive) return null;
    await db.update(adminSessions).set({ lastActiveAt: new Date() }).where(eq(adminSessions.tokenId, jti)).catch(() => {});
    const a = arows[0];
    return { id: a.id, name: a.name, email: a.email, role: a.role };
  } catch {
    return null;
  }
}

export async function adminLogin(email: string, password: string): Promise<AdminSafe | null> {
  const rows = await db.select().from(admins).where(eq(admins.email, email.toLowerCase())).limit(1);
  if (!rows.length || !rows[0].isActive) return null;
  const ok = await bcrypt.compare(password, rows[0].passwordHash);
  if (!ok) return null;
  const jti = randomBytes(24).toString("hex");
  const token = await new SignJWT({ sub: rows[0].id, jti, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);
  let device: string | undefined;
  let ip: string | undefined;
  try {
    const h = await headers();
    const ua = h.get("user-agent") || "";
    device = `${/mobile|android|iphone|ipad/i.test(ua) ? "Mobile" : "Desktop"} · ${/chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : /firefox/i.test(ua) ? "Firefox" : "Browser"}`;
    ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
  } catch { /* ignore */ }
  await db.insert(adminSessions).values({
    adminId: rows[0].id,
    tokenId: jti,
    device,
    ip,
    expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
  });
  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, rows[0].id));
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 3600,
  });
  return { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role };
}

export async function adminLogout() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const jti = payload.jti as string;
      if (jti) await db.delete(adminSessions).where(eq(adminSessions.tokenId, jti)).catch(() => {});
    } catch { /* ignore */ }
  }
  store.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function audit(admin: AdminSafe, action: string, target?: string, detail?: string) {
  try {
    await db.insert(adminAudit).values({
      adminId: admin.id,
      adminEmail: admin.email,
      action,
      target: target?.slice(0, 200),
      detail: detail?.slice(0, 2000),
    });
  } catch { /* never break admin flows */ }
}
