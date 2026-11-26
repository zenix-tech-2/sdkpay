import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select({ webhookSecret: users.webhookSecret, webhookUrl: users.webhookUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const s = rows[0]?.webhookSecret;
  return NextResponse.json({
    hasSecret: !!s,
    masked: s ? `${s.slice(0, 6)}••••••••${s.slice(-4)}` : null,
    url: rows[0]?.webhookUrl ?? null,
  });
}

export async function POST() {
  // Generate (or regenerate) webhook secret — full value shown once
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const secret = `whsec_${randomBytes(24).toString("hex")}`;
  await db.update(users).set({ webhookSecret: secret }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true, secret });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { url } = await req.json();
  await db.update(users).set({ webhookUrl: url?.trim() || null }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
