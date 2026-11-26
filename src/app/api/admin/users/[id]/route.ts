import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { users, sessions, kycSubmissions, apiKeys, transactions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const { passwordHash, pinHash, ...safe } = rows[0] as Record<string, unknown>;
  void passwordHash;
  void pinHash;

  const [sess] = await db
    .select({ c: sql<number>`count(*)`, last: sql<string | null>`max(${sessions.lastActiveAt})` })
    .from(sessions)
    .where(eq(sessions.userId, id));
  const kyc = await db.select().from(kycSubmissions).where(eq(kycSubmissions.userId, id)).orderBy(desc(kycSubmissions.createdAt)).limit(10);
  const keys = await db
    .select({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix, isLive: apiKeys.isLive, createdAt: apiKeys.createdAt })
    .from(apiKeys)
    .where(eq(apiKeys.userId, id))
    .orderBy(desc(apiKeys.createdAt))
    .limit(20);
  const txs = await db.select().from(transactions).where(eq(transactions.userId, id)).orderBy(desc(transactions.createdAt)).limit(15);

  return NextResponse.json({
    user: safe,
    meta: { activeSessions: Number(sess?.c ?? 0), lastActive: sess?.last ?? null },
    kyc,
    keys,
    transactions: txs,
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.status === "active" || body.status === "suspended") patch.status = body.status;
  if (typeof body.internalNote === "string") patch.internalNote = body.internalNote.slice(0, 2000);
  if (body.role === "user" || body.role === "support") patch.role = body.role;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await db.update(users).set({ ...patch, updatedAt: new Date() }).where(eq(users.id, id));
  if (patch.status === "suspended") {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }
  await audit(admin, patch.status ? `user.${patch.status}` : "user.update", id, JSON.stringify(patch));
  return NextResponse.json({ ok: true });
}
