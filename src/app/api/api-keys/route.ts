import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix, isLive: apiKeys.isLive, lastUsedAt: apiKeys.lastUsedAt, createdAt: apiKeys.createdAt })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(desc(apiKeys.createdAt));
  return NextResponse.json({ keys: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name || "Clé principale").toString().slice(0, 80);
  const isLive = body.mode === "live";
  const useAk = body.prefix === "ak";
  const secret = randomBytes(28).toString("hex");
  const key = useAk ? `ak_${secret.slice(0, 32)}` : `${isLive ? "sdk_live_" : "sdk_test_"}${secret}`;
  const keyHash = createHash("sha256").update(key).digest("hex");
  if (body.replaceName) {
    const { and } = await import("drizzle-orm");
    await db.delete(apiKeys).where(and(eq(apiKeys.userId, user.id), eq(apiKeys.name, body.replaceName)));
  }
  const inserted = await db
    .insert(apiKeys)
    .values({ userId: user.id, name, keyPrefix: key.slice(-6), keyHash, isLive: useAk ? true : isLive })
    .returning({ id: apiKeys.id, createdAt: apiKeys.createdAt });
  // Full key shown only once
  return NextResponse.json({ ok: true, key, id: inserted[0].id });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { and } = await import("drizzle-orm");
  await db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, user.id)));
  return NextResponse.json({ ok: true });
}
