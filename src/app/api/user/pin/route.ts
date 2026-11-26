import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db.select({ pinHash: users.pinHash }).from(users).where(eq(users.id, user.id)).limit(1);
  return NextResponse.json({ configured: !!rows[0]?.pinHash });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { currentPin, password, newPin } = await req.json();
  if (!newPin || !/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: "PIN must be exactly 4 digits." }, { status: 400 });
  }
  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const me = rows[0];
  if (me.pinHash) {
    // changing PIN: verify current PIN or password
    let ok = false;
    if (currentPin && /^\d{4}$/.test(currentPin)) ok = await bcrypt.compare(currentPin, me.pinHash);
    if (!ok && password) ok = await bcrypt.compare(password, me.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current PIN or password is incorrect." }, { status: 400 });
  } else if (password) {
    const ok = await bcrypt.compare(password, me.passwordHash);
    if (!ok) return NextResponse.json({ error: "Password is incorrect." }, { status: 400 });
  }
  await db.update(users).set({ pinHash: await bcrypt.hash(newPin, 10) }).where(eq(users.id, user.id));
  await db.insert(notifications).values({
    userId: user.id,
    title: "Transaction PIN updated",
    message: "Your 4-digit transaction PIN was set. It will be required for withdrawals and transfers.",
  });
  return NextResponse.json({ ok: true });
}
