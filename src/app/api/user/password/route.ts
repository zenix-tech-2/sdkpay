import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { current, next } = await req.json();
  if (!current || !next || next.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }
  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const ok = await bcrypt.compare(current, rows[0].passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(next, 10), updatedAt: new Date() })
    .where(eq(users.id, user.id));
  await db.insert(notifications).values({
    userId: user.id,
    title: "Mot de passe modifié",
    message: "Votre mot de passe a été modifié avec succès. Si ce n'était pas vous, contactez le support.",
  });
  return NextResponse.json({ ok: true });
}
