import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier?.trim() || !password) {
      return NextResponse.json({ error: "Email / nom d'utilisateur et mot de passe requis." }, { status: 400 });
    }
    const idLower = identifier.trim().toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, idLower), eq(users.username, idLower)))
      .limit(1);
    if (!rows.length) {
      return NextResponse.json({ error: "Compte introuvable. Vérifiez vos identifiants." }, { status: 401 });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }
    if (user.status === "suspended") {
      return NextResponse.json({ error: "Account suspended. Contact support@sdkpay.com." }, { status: 403 });
    }
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
