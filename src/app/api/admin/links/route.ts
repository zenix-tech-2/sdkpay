import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { paymentLinks, users } from "@/db/schema";
import { eq, and, desc, ilike, or, count } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 30));
  const offset = Number(url.searchParams.get("offset") || 0);
  const where = q
    ? or(ilike(paymentLinks.title, `%${q}%`), ilike(paymentLinks.slug, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined;
  const [total] = await db
    .select({ c: count() })
    .from(paymentLinks)
    .leftJoin(users, eq(users.id, paymentLinks.userId))
    .where(where as never);
  const rows = await db
    .select({
      id: paymentLinks.id,
      title: paymentLinks.title,
      slug: paymentLinks.slug,
      amount: paymentLinks.amount,
      currency: paymentLinks.currency,
      isActive: paymentLinks.isActive,
      views: paymentLinks.views,
      totalCollected: paymentLinks.totalCollected,
      paymentsCount: paymentLinks.paymentsCount,
      createdAt: paymentLinks.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(paymentLinks)
    .leftJoin(users, eq(users.id, paymentLinks.userId))
    .where(where as never)
    .orderBy(desc(paymentLinks.createdAt))
    .limit(limit)
    .offset(offset);
  return NextResponse.json({ links: rows, total: Number(total.c), limit, offset });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, isActive } = await req.json();
  if (!id || typeof isActive !== "boolean") return NextResponse.json({ error: "Invalid." }, { status: 400 });
  await db.update(paymentLinks).set({ isActive }).where(eq(paymentLinks.id, id));
  await audit(admin, isActive ? "link.enable" : "link.disable", id, "");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(paymentLinks).where(eq(paymentLinks.id, id));
  await audit(admin, "link.delete", id, "");
  return NextResponse.json({ ok: true });
}
