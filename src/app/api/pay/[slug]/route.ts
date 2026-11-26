import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentLinks, users, transactions, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { hasReducedFees } from "@/lib/fees";
import { getFeeConfig, num } from "@/lib/platform";
import { runAutoConversion } from "@/lib/auto-convert";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db.select().from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Lien introuvable." }, { status: 404 });
  const link = rows[0];
  const owners = await db.select({ fullName: users.fullName, username: users.username }).from(users).where(eq(users.id, link.userId)).limit(1);
  await db.update(paymentLinks).set({ views: sql`${paymentLinks.views} + 1` }).where(eq(paymentLinks.id, link.id));
  const expired = link.expiresAt ? new Date(link.expiresAt).getTime() < Date.now() : false;
  return NextResponse.json({ link: { ...link, views: link.views + 1 }, merchant: owners[0] ?? null, expired });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { amount, operator, phone, name } = await req.json();
    const rows = await db.select().from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
    if (!rows.length) return NextResponse.json({ error: "Lien introuvable." }, { status: 404 });
    const link = rows[0];
    if (!link.isActive) return NextResponse.json({ error: "Ce lien est désactivé." }, { status: 400 });
    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Ce lien a expiré." }, { status: 400 });
    }
    const amt = link.amount ?? Number(amount);
    if (!amt || amt < 100) return NextResponse.json({ error: "Montant invalide (min. 100)." }, { status: 400 });
    if (!operator || !phone) return NextResponse.json({ error: "Opérateur et numéro requis." }, { status: 400 });

    const ownerRows = await db.select().from(users).where(eq(users.id, link.userId)).limit(1);
    const owner = ownerRows[0];
    const cfg = await getFeeConfig();
    const fee = Math.round(amt * num(cfg.momo_fee, 0.04) * (hasReducedFees(owner) ? 0.5 : 1));
    const credited = amt - fee;
    const ref = randomRef("SDK-P");
    const before = link.currency === "XOF" ? owner.balanceXof : owner.balanceXaf;
    await db.insert(transactions).values({
      userId: link.userId,
      type: "payment_received",
      amount: amt,
      currency: link.currency,
      fee,
      status: "success",
      operator,
      phone,
      reference: ref,
      label: `Paiement ${link.title}${name ? ` — ${name}` : ""}`,
      paymentLinkId: link.id,
      counterparty: name || phone,
      country: owner.country,
      balanceBefore: before,
      balanceAfter: before + credited,
    });
    await db
      .update(paymentLinks)
      .set({
        totalCollected: sql`${paymentLinks.totalCollected} + ${credited}`,
        paymentsCount: sql`${paymentLinks.paymentsCount} + 1`,
      })
      .where(eq(paymentLinks.id, link.id));
    await db
      .update(users)
      .set(
        link.currency === "XOF"
          ? { balanceXof: sql`${users.balanceXof} + ${credited}` }
          : { balanceXaf: sql`${users.balanceXaf} + ${credited}` }
      )
      .where(eq(users.id, link.userId));
    await db.insert(notifications).values({
      userId: link.userId,
      title: "Paiement reçu",
      message: `Vous avez reçu ${amt.toLocaleString("fr-FR")} ${link.currency} via ${operator} pour « ${link.title} ». Réf : ${ref}`,
    });
    await runAutoConversion(link.userId).catch(() => {});
    return NextResponse.json({
      ok: true,
      reference: ref,
      amount: amt,
      pdfUrl: link.pdfUrl,
      redirectUrl: link.redirectUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
