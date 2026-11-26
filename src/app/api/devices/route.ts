import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, verifyToken, COOKIE_NAME } from "@/lib/auth";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";

async function currentJti() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.jti ?? null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const jti = await currentJti();
  if (jti) {
    await db.update(sessions).set({ lastActiveAt: new Date() }).where(eq(sessions.tokenId, jti));
  }
  const rows = await db
    .select({
      id: sessions.id,
      tokenId: sessions.tokenId,
      device: sessions.device,
      ip: sessions.ip,
      lastActiveAt: sessions.lastActiveAt,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.lastActiveAt));
  return NextResponse.json({
    current: jti,
    devices: rows.map((r) => ({ ...r, isCurrent: r.tokenId === jti })),
  });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const jti = await currentJti();
  if (url.searchParams.get("others") === "1") {
    if (!jti) return NextResponse.json({ error: "No session." }, { status: 400 });
    await db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.tokenId, jti)));
    return NextResponse.json({ ok: true });
  }
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const rows = await db.select().from(sessions).where(and(eq(sessions.id, id), eq(sessions.userId, user.id))).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (rows[0].tokenId === jti) return NextResponse.json({ error: "Cannot disconnect this device here. Use Log out." }, { status: 400 });
  await db.delete(sessions).where(eq(sessions.id, id));
  return NextResponse.json({ ok: true });
}
