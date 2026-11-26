import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { paymentLinks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { slugify } from "@/lib/format";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const links = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, user.id))
    .orderBy(desc(paymentLinks.createdAt));
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const {
      title,
      amount,
      currency,
      description,
      expiresAt,
      customSlug,
      imageUrl,
      pdfUrl,
      redirectUrl,
      allowedCountries,
    } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

    let slug: string;
    if (customSlug?.trim()) {
      slug = slugify(customSlug.trim());
      if (slug.length < 3) return NextResponse.json({ error: "Custom URL too short (min. 3 characters)." }, { status: 400 });
      const exists = await db.select({ id: paymentLinks.id }).from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
      if (exists.length) return NextResponse.json({ error: "This custom URL is already taken." }, { status: 409 });
    } else {
      slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
    }

    if (imageUrl && typeof imageUrl === "string" && imageUrl.length > 700_000) {
      return NextResponse.json({ error: "Image too large (max ~500KB after encoding). Use a smaller image." }, { status: 400 });
    }

    const inserted = await db
      .insert(paymentLinks)
      .values({
        userId: user.id,
        title: title.trim(),
        slug,
        amount: amount ? Number(amount) : null,
        currency: currency || "XAF",
        description: description?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        imageUrl: imageUrl?.trim() || null,
        pdfUrl: pdfUrl?.trim() || null,
        redirectUrl: redirectUrl?.trim() || null,
        allowedCountries: allowedCountries || "ALL",
      })
      .returning();
    return NextResponse.json({ ok: true, link: inserted[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
