import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { pin } = await req.json();
  const rows = await db.select({ pinHash: users.pinHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!rows[0]?.pinHash) return NextResponse.json({ ok: true, required: false });
  if (!pin) return NextResponse.json({ ok: false, required: true });
  const ok = await bcrypt.compare(pin, rows[0].pinHash!);
  return NextResponse.json({ ok, required: true });
}
