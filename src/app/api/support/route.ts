import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { supportTickets, ticketReplies, notifications } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, user.id))
    .orderBy(desc(supportTickets.createdAt))
    .limit(30);
  const ids = rows.map((r) => r.id);
  const reps = ids.length
    ? await db.select().from(ticketReplies).where(inArray(ticketReplies.ticketId, ids)).orderBy(desc(ticketReplies.createdAt))
    : [];
  const byTicket: Record<string, typeof reps> = {};
  reps.forEach((r) => {
    (byTicket[r.ticketId] ||= []).push(r);
  });
  Object.values(byTicket).forEach((list) => list.reverse());
  return NextResponse.json({ tickets: rows.map((t) => ({ ...t, replies: byTicket[t.id] || [] })) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { subject, category, message } = await req.json();
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }
  const inserted = await db
    .insert(supportTickets)
    .values({
      userId: user.id,
      subject: subject.trim().slice(0, 160),
      category: (category || "general").slice(0, 40),
      message: message.trim().slice(0, 4000),
    })
    .returning();
  await db.insert(notifications).values({
    userId: user.id,
    title: "Ticket support créé",
    message: `Votre demande « ${subject.trim()} » a bien été reçue. Notre équipe répond en moins de 24h.`,
  });
  return NextResponse.json({ ok: true, ticket: inserted[0] });
}
