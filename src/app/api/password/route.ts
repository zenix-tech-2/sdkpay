import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function PATCH(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const current = String(body.currentPassword ?? "");
    const next = String(body.newPassword ?? "");
    if (next.length < 6) return Response.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    if (!verifyPassword(current, result.user.passwordHash)) return Response.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, result.user.id));
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
