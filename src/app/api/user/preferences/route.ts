import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS = { email: true, push: false, sms: false, marketing: false };

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db.select({ notifPrefs: users.notifPrefs }).from(users).where(eq(users.id, user.id)).limit(1);
  try {
    return NextResponse.json({ prefs: { ...DEFAULTS, ...(rows[0]?.notifPrefs ? JSON.parse(rows[0].notifPrefs!) : {}) } });
  } catch {
    return NextResponse.json({ prefs: DEFAULTS });
  }
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await req.json();
  const prefs = {
    email: !!body.email,
    push: !!body.push,
    sms: !!body.sms,
    marketing: !!body.marketing,
  };
  await db.update(users).set({ notifPrefs: JSON.stringify(prefs) }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true, prefs });
}
