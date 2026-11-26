import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { fullName, username, phone, language } = await req.json();
  const patch: Record<string, unknown> = {};
  if (typeof fullName === "string" && fullName.trim()) patch.fullName = fullName.trim().slice(0, 120);
  if (typeof phone === "string" && phone.trim()) patch.phone = phone.trim().slice(0, 40);
  if (language === "fr" || language === "en") patch.language = language;
  if (typeof username === "string" && username.trim()) {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (clean.length < 3) return NextResponse.json({ error: "Username too short." }, { status: 400 });
    const exists = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, clean), ne(users.id, user.id)))
      .limit(1);
    if (exists.length) return NextResponse.json({ error: "Username already taken." }, { status: 409 });
    patch.username = clean;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await db.update(users).set({ ...patch, updatedAt: new Date() }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
