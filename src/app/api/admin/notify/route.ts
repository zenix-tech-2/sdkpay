import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      email: users.email,
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
  return NextResponse.json({ notifications: rows });
}

export async function POST(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { scope, userId, email, title, message } = await req.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Title and message required." }, { status: 400 });
  }
  let targets: string[] = [];
  if (scope === "user") {
    if (userId) {
      targets = [userId];
    } else if (email?.trim()) {
      const u = await db.select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
      if (!u.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
      targets = [u[0].id];
    } else {
      return NextResponse.json({ error: "User email or id required." }, { status: 400 });
    }
  } else {
    const all = await db.select({ id: users.id }).from(users).where(eq(users.status, "active"));
    targets = all.map((u) => u.id);
  }
  if (!targets.length) return NextResponse.json({ error: "No recipients." }, { status: 400 });
  // batch insert
  const chunk = 200;
  for (let i = 0; i < targets.length; i += chunk) {
    await db.insert(notifications).values(
      targets.slice(i, i + chunk).map((uid) => ({
        userId: uid,
        title: title.trim().slice(0, 160),
        message: message.trim().slice(0, 2000),
      }))
    );
  }
  await audit(admin, "notify.send", scope === "user" ? targets[0] : "broadcast", `${title.slice(0, 80)} → ${targets.length} user(s)`);
  return NextResponse.json({ ok: true, count: targets.length });
}
