import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { payoutNumbers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rows = await db
    .select()
    .from(payoutNumbers)
    .where(eq(payoutNumbers.userId, user.id))
    .orderBy(desc(payoutNumbers.createdAt));
  return NextResponse.json({ numbers: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { kind, label, phone, address, operator, network, country } = await req.json();
  if (kind === "crypto") {
    if (!address?.trim() || address.trim().length < 10) {
      return NextResponse.json({ error: "Valid address required." }, { status: 400 });
    }
  } else if (!phone?.trim() || phone.trim().length < 4) {
    return NextResponse.json({ error: "Valid phone number required." }, { status: 400 });
  }
  const inserted = await db
    .insert(payoutNumbers)
    .values({
      userId: user.id,
      kind: kind === "crypto" ? "crypto" : "momo",
      label: label?.trim().slice(0, 80) || null,
      phone: phone?.trim().slice(0, 40) || null,
      address: address?.trim() || null,
      operator: operator?.slice(0, 60) || null,
      network: network?.slice(0, 20) || null,
      country: country?.slice(0, 80) || null,
    })
    .returning();
  return NextResponse.json({ ok: true, number: inserted[0] });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(payoutNumbers).where(and(eq(payoutNumbers.id, id), eq(payoutNumbers.userId, user.id)));
  return NextResponse.json({ ok: true });
}
