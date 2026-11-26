import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { publicUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const fullName = String(body.fullName ?? result.user.fullName).trim();
    const email = String(body.email ?? result.user.email).trim().toLowerCase();
    const phone = String(body.phone ?? result.user.phone).trim();
    if (!fullName || !email || !phone) return Response.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Adresse e-mail invalide" }, { status: 400 });
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length && existing[0].id !== result.user.id) return Response.json({ error: "Cet e-mail est déjà utilisé" }, { status: 409 });
    const [updated] = await db.update(users).set({ fullName, email, phone }).where(eq(users.id, result.user.id)).returning();
    return Response.json({ user: publicUser(updated) });
  } catch (error) {
    return apiError(error);
  }
}
