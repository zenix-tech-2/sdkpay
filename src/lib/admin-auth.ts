import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers, type AdminUser } from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";

export const ADMIN_SESSION_COOKIE = "sdkpay_admin_session";

export async function createAdminSession(adminUserId: number) {
  const token = randomBytes(32).toString("hex");
  const days = Number(process.env.ADMIN_SESSION_TTL_DAYS ?? 7);
  const expiresAt = new Date(Date.now() + (Number.isFinite(days) ? days : 7) * 86400000);
  await db.insert(adminSessions).values({ token, adminUserId, expiresAt });
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    expires: expiresAt,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
    jar.delete(ADMIN_SESSION_COOKIE);
  }
}

export async function getAdminSession(): Promise<AdminUser | null> {
  await ensureSchema();
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db.select({ admin: adminUsers })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminUserId))
    .where(and(eq(adminSessions.token, token), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.admin ?? null;
}

export async function requireAdmin(): Promise<{ admin: AdminUser } | { response: Response }> {
  const admin = await getAdminSession();
  if (!admin) return { response: Response.json({ error: "Admin session required" }, { status: 401 }) };
  return { admin };
}

export function publicAdmin(admin: AdminUser) {
  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    createdAt: admin.createdAt,
    lastLoginAt: admin.lastLoginAt,
  };
}
