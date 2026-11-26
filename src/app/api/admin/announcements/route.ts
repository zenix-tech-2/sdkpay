import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(100);
  return NextResponse.json({ announcements: rows });
}

export async function POST(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, body, bullets, mediaUrl, status } = await req.json();
  if (!title?.trim() || !body?.trim()) return NextResponse.json({ error: "Title and body required." }, { status: 400 });
  const inserted = await db
    .insert(announcements)
    .values({
      title: title.trim().slice(0, 160),
      body: body.trim().slice(0, 5000),
      bullets: Array.isArray(bullets) ? JSON.stringify(bullets.map(String).slice(0, 10)) : null,
      mediaUrl: mediaUrl?.trim() || null,
      status: status === "published" ? "published" : "draft",
      createdBy: admin.id,
    })
    .returning();
  await audit(admin, "announcement.create", inserted[0].id, title.slice(0, 100));
  return NextResponse.json({ ok: true, announcement: inserted[0] });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, body, bullets, mediaUrl, status } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof title === "string" && title.trim()) patch.title = title.trim().slice(0, 160);
  if (typeof body === "string" && body.trim()) patch.body = body.trim().slice(0, 5000);
  if (Array.isArray(bullets)) patch.bullets = JSON.stringify(bullets.map(String).slice(0, 10));
  if (typeof mediaUrl === "string") patch.mediaUrl = mediaUrl.trim() || null;
  if (status === "published" || status === "draft" || status === "archived") patch.status = status;
  await db.update(announcements).set(patch).where(eq(announcements.id, id));
  await audit(admin, "announcement.update", id, JSON.stringify({ status: patch.status }));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(announcements).where(eq(announcements.id, id));
  await audit(admin, "announcement.delete", id, "");
  return NextResponse.json({ ok: true });
}
