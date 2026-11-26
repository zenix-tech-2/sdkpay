import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({ rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt })
    .from(reviews)
    .where(eq(reviews.status, "published"))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
  return NextResponse.json({ reviews: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { rating, comment } = await req.json();
  const r = Number(rating);
  if (!r || r < 1 || r > 5) return NextResponse.json({ error: "Rating 1-5 required." }, { status: 400 });
  await db.insert(reviews).values({ userId: user.id, rating: r, comment: comment?.trim().slice(0, 1000) || null });
  return NextResponse.json({ ok: true });
}
