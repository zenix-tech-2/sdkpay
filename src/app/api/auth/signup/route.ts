import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, publicUser } from "@/lib/auth";
import { ensureSchema } from "@/lib/ensure-schema";
import { apiError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/password";
import { randomCode } from "@/lib/format";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const dialCode = String(body.dialCode ?? "+237");
    const countryCode = String(body.countryCode ?? "CM");
    const referral = String(body.referralCode ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const confirm = String(body.confirmPassword ?? "");

    if (!fullName || !username || !email || !phone || !password) {
      return Response.json({ error: "Veuillez remplir tous les champs obligatoires" }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Adresse e-mail invalide" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    if (password !== confirm) return Response.json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 });

    const existing = await db.select({ id: users.id }).from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);
    if (existing.length) return Response.json({ error: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé" }, { status: 409 });

    let referralCode = randomCode(6);
    while ((await db.select({ id: users.id }).from(users).where(eq(users.referralCode, referralCode)).limit(1)).length) {
      referralCode = randomCode(6);
    }
    let apiKey = `sk_test_${randomCode(18)}`;
    while ((await db.select({ id: users.id }).from(users).where(eq(users.apiKey, apiKey)).limit(1)).length) {
      apiKey = `sk_test_${randomCode(18)}`;
    }

    const [user] = await db.insert(users).values({
      fullName,
      username,
      email,
      phone,
      countryCode,
      dialCode,
      referralCode,
      referredBy: referral || null,
      apiKey,
      passwordHash: hashPassword(password),
      balance: 9,
    }).returning();

    await createSession(user.id);
    return Response.json({ ok: true, user: publicUser(user) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
