import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
  return NextResponse.json({ notifications: rows });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  } else {
    await db.delete(notifications).where(eq(notifications.userId, user.id));
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.all) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, user.id));
  } else if (body.id) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, body.id), eq(notifications.userId, user.id)));
  }
  return NextResponse.json({ ok: true });
}
