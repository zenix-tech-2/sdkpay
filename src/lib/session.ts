import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export const SESSION_COOKIE = "sdk_session";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function getSessionUser() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = rows[0] ?? null;
  if (!user || user.status === "suspended") return null; // suspended accounts are signed out everywhere
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** public shape passed to client components (no password hash) */
export function publicUser(u: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>) {
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    phone: u.phone,
    country: u.country ?? "Cameroun",
    countryCode: u.countryCode ?? "cm",
    kycStatus: u.kycStatus,
    kycRejectionReason: u.kycRejectionReason ?? null,
    role: u.role,
    publicId: u.publicId,
    referralCode: u.referralCode,
  };
}
export type PublicUser = ReturnType<typeof publicUser>;
