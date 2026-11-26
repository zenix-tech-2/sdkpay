import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { createAdminSession, publicAdmin } from "@/lib/admin-auth";
import { ensureSchema } from "@/lib/ensure-schema";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return Response.json({ error: "Identifiants administrateur incorrects" }, { status: 401 });
    }
    const [updated] = await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, admin.id)).returning();
    await createAdminSession(admin.id);
    return Response.json({ ok: true, admin: publicAdmin(updated ?? admin) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Connexion impossible" }, { status: 500 });
  }
}
