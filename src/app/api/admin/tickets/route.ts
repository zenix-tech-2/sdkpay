import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { supportTickets, ticketReplies, users, notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const t = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    if (!t.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const u = await db
      .select({ id: users.id, fullName: users.fullName, email: users.email })
      .from(users)
      .where(eq(users.id, t[0].userId))
      .limit(1);
    const replies = await db.select().from(ticketReplies).where(eq(ticketReplies.ticketId, id)).orderBy(desc(ticketReplies.createdAt)).limit(50);
    return NextResponse.json({ ticket: t[0], user: u[0] ?? null, replies: replies.reverse() });
  }
  const status = url.searchParams.get("status") || "all";
  const rows = await db
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      category: supportTickets.category,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(supportTickets)
    .leftJoin(users, eq(users.id, supportTickets.userId))
    .where(status === "all" ? undefined : eq(supportTickets.status, status))
    .orderBy(desc(supportTickets.createdAt))
    .limit(100);
  return NextResponse.json({ tickets: rows });
}

export async function POST(req: Request) {
  // Admin reply
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId, message } = await req.json();
  if (!ticketId || !message?.trim()) return NextResponse.json({ error: "Message required." }, { status: 400 });
  const t = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  if (!t.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await db.insert(ticketReplies).values({ ticketId, author: "admin", adminId: admin.id, message: message.trim().slice(0, 4000) });
  if (t[0].status === "open") {
    await db.update(supportTickets).set({ status: "answered" }).where(eq(supportTickets.id, ticketId));
  }
  await db.insert(notifications).values({
    userId: t[0].userId,
    title: "Support replied",
    message: `Support replied to « ${t[0].subject} »: ${message.trim().slice(0, 180)}`,
  });
  await audit(admin, "ticket.reply", ticketId, message.slice(0, 120));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id || !["open", "answered", "closed"].includes(status)) return NextResponse.json({ error: "Invalid." }, { status: 400 });
  await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, id));
  await audit(admin, `ticket.${status}`, id, "");
  return NextResponse.json({ ok: true });
}
