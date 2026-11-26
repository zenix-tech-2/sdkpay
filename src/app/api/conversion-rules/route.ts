import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { conversionRules } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select()
    .from(conversionRules)
    .where(eq(conversionRules.userId, user.id))
    .orderBy(desc(conversionRules.createdAt));
  return NextResponse.json({ rules: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { sources, destination } = await req.json();
  const list = Array.isArray(sources) ? sources.filter(Boolean) : [];
  if (!list.length) return NextResponse.json({ error: "Select at least one source wallet." }, { status: 400 });
  if (!["XAF", "XOF", "USDT"].includes(destination)) {
    return NextResponse.json({ error: "Select a destination wallet." }, { status: 400 });
  }
  const inserted = await db
    .insert(conversionRules)
    .values({ userId: user.id, sources: list.join(","), destination, threshold: 500 })
    .returning();
  return NextResponse.json({ ok: true, rule: inserted[0] });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db
    .update(conversionRules)
    .set({ isActive: !!isActive })
    .where(and(eq(conversionRules.id, id), eq(conversionRules.userId, user.id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(conversionRules).where(and(eq(conversionRules.id, id), eq(conversionRules.userId, user.id)));
  return NextResponse.json({ ok: true });
}
