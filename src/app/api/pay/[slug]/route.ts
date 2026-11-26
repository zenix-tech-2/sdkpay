import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentLinks, users, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { hasReducedFees } from "@/lib/fees";
import { getFeeConfig, num } from "@/lib/platform";
import { executeCollect } from "@/lib/providers/router";
import { COUNTRIES } from "@/data/countries";

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
    if (!owner || owner.status === "suspended") return NextResponse.json({ error: "Ce marchand ne peut pas recevoir de paiements." }, { status: 400 });

    // Work out the payer's country from the phone prefix (+237..., 00237...), else assume the merchant's country.
    const digits = String(phone).replace(/[^\d+]/g, "");
    const intl = digits.startsWith("00") ? `+${digits.slice(2)}` : digits;
    const byDial = intl.startsWith("+") ? [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => intl.startsWith(c.dial)) : undefined;
    const payerCountry = byDial ?? COUNTRIES.find((c) => c.name === owner.country);
    if (!payerCountry || payerCountry.currency !== link.currency) {
      return NextResponse.json(
        { error: `Ce lien accepte uniquement les paiements en ${link.currency}. Saisissez votre numéro avec l'indicatif pays (ex. +237...).` },
        { status: 400 }
      );
    }
    const fullPhone = intl.startsWith("+") ? intl : `${payerCountry.dial}${intl.replace(/^0+/, "")}`;

    const cfg = await getFeeConfig();
    const fee = Math.round(amt * num(cfg.momo_fee, 0.04) * (hasReducedFees(owner) ? 0.5 : 1));
    const credited = amt - fee;
    const ref = randomRef("SDK-P");
    const before = link.currency === "XOF" ? owner.balanceXof : owner.balanceXaf;
    // The payment stays PENDING until the provider confirms the customer approved it on their phone.
    const inserted = await db
      .insert(transactions)
      .values({
        userId: link.userId,
        type: "payment_received",
        amount: amt,
        currency: link.currency,
        fee,
        status: "pending",
        operator,
        phone: fullPhone,
        reference: ref,
        label: `Paiement ${link.title}${name ? ` — ${name}` : ""}`,
        paymentLinkId: link.id,
        counterparty: name || fullPhone,
        country: payerCountry.name,
        channel: "link",
        balanceBefore: before,
        balanceAfter: before + credited,
      })
      .returning({ id: transactions.id });
    const txId = inserted[0].id;

    const prov = await executeCollect(
      {
        amount: amt,
        currency: link.currency,
        countryCode: payerCountry.code,
        phone: fullPhone,
        operator,
        reference: ref,
        description: `${link.title} (${ref})`,
        customerName: name || undefined,
      },
      { txId, userId: link.userId }
    );
    await db.update(transactions).set({ provider: prov.provider, providerRef: prov.providerRef }).where(eq(transactions.id, txId));
    if (prov.live && !prov.ok) {
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, txId));
      return NextResponse.json({ error: prov.error || "Le paiement n'a pas pu être initié." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, reference: ref, amount: amt, checkoutUrl: prov.checkoutUrl || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
