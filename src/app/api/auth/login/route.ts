import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, publicUser } from "@/lib/auth";
import { ensureSchema } from "@/lib/ensure-schema";
import { apiError } from "@/lib/api-helpers";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const [user] = await db.select().from(users).where(eq(users.email, identifier)).limit(1);
    const account = user ?? (await db.select().from(users).where(eq(users.username, identifier)).limit(1))[0];
    if (!account || !verifyPassword(password, account.passwordHash)) {
      return Response.json({ error: "Identifiants incorrects" }, { status: 401 });
    }
    await createSession(account.id);
    return Response.json({ ok: true, user: publicUser(account) });
  } catch (error) {
    return apiError(error);
  }
}
