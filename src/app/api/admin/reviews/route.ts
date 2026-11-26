import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") || "all";
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(reviews)
    .leftJoin(users, eq(users.id, reviews.userId))
    .where(status === "all" ? undefined : eq(reviews.status, status))
    .orderBy(desc(reviews.createdAt))
    .limit(100);
  return NextResponse.json({ reviews: rows });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id || !["pending", "published", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Invalid." }, { status: 400 });
  }
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  await audit(admin, `review.${status}`, id, "");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(reviews).where(eq(reviews.id, id));
  await audit(admin, "review.delete", id, "");
  return NextResponse.json({ ok: true });
}
