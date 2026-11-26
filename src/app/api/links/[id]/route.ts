import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { paymentLinks } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { slugify } from "@/lib/format";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (body.amount !== undefined) patch.amount = body.amount ? Number(body.amount) : null;
  if (typeof body.currency === "string") patch.currency = body.currency;
  if (typeof body.description === "string") patch.description = body.description || null;
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl || null;
  if (typeof body.pdfUrl === "string") patch.pdfUrl = body.pdfUrl || null;
  if (typeof body.redirectUrl === "string") patch.redirectUrl = body.redirectUrl || null;
  if (typeof body.allowedCountries === "string") patch.allowedCountries = body.allowedCountries || "ALL";
  if (body.expiresAt !== undefined) patch.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (typeof body.customSlug === "string" && body.customSlug.trim()) {
    const slug = slugify(body.customSlug.trim());
    if (slug.length < 3) return NextResponse.json({ error: "Custom URL too short." }, { status: 400 });
    const exists = await db
      .select({ id: paymentLinks.id })
      .from(paymentLinks)
      .where(and(eq(paymentLinks.slug, slug), ne(paymentLinks.id, id)))
      .limit(1);
    if (exists.length) return NextResponse.json({ error: "This custom URL is already taken." }, { status: 409 });
    patch.slug = slug;
  }
  await db
    .update(paymentLinks)
    .set(patch)
    .where(and(eq(paymentLinks.id, id), eq(paymentLinks.userId, user.id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;
  await db.delete(paymentLinks).where(and(eq(paymentLinks.id, id), eq(paymentLinks.userId, user.id)));
  return NextResponse.json({ ok: true });
}
