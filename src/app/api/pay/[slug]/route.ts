import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { paymentLinks, users } from "@/db/schema";
import { apiError } from "@/lib/api-helpers";
import { ensureSchema } from "@/lib/ensure-schema";
import { applyTransaction } from "@/lib/ledger";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

async function findLink(slug: string) {
  const rows = await db.select({
    link: paymentLinks,
    merchant: { fullName: users.fullName, username: users.username, countryCode: users.countryCode },
  }).from(paymentLinks).innerJoin(users, eq(users.id, paymentLinks.userId)).where(eq(paymentLinks.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureSchema();
    const { slug } = await params;
    const row = await findLink(slug);
    if (!row) return Response.json({ error: "Lien de paiement introuvable" }, { status: 404 });
    await db.update(paymentLinks).set({ views: sql`${paymentLinks.views} + 1` }).where(eq(paymentLinks.id, row.link.id));
    return Response.json({ link: row.link, merchant: row.merchant });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureSchema();
    const { slug } = await params;
    const row = await findLink(slug);
    if (!row) return Response.json({ error: "Lien de paiement introuvable" }, { status: 404 });
    const link = row.link;
    if (link.status !== "active") return Response.json({ error: "Ce lien de paiement n'est plus actif" }, { status: 400 });
    if (link.expiryDate && Date.parse(link.expiryDate) < Date.now()) return Response.json({ error: "Ce lien de paiement a expiré" }, { status: 400 });

    const body = await request.json();
    const phone = String(body.phone ?? "").trim();
    const operator = String(body.operator ?? "MTN Money").trim();
    const payerName = String(body.payerName ?? "Client").trim();
    const countryCode = String(body.countryCode ?? "").trim().toUpperCase() || "CM";
    const countryName = String(body.countryName ?? "Cameroun").trim();
    if (phone.replace(/\D/g, "").length < 8) return Response.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
    if (link.allowedCountries !== "all" && link.allowedCountries && !link.allowedCountries.split(",").includes(countryCode)) {
      return Response.json({ error: "Les paiements ne sont pas acceptés depuis ce pays" }, { status: 400 });
    }

    const amount = link.freeAmount ? Math.round(Number(body.amount)) : link.amount;
    if (!Number.isFinite(amount) || amount < 100) return Response.json({ error: "Le montant minimum est de 100 FCFA" }, { status: 400 });
    const providerReference = `PAY-${slug}-${Date.now().toString(36).toUpperCase()}`;
    const routing = await routeDirectPayment({
      mode: "mobile",
      direction: "collect",
      amount,
      currency: link.currency,
      countryCode,
      countryName,
      operator,
      phone,
      reference: providerReference,
      description: `Paiement ${link.title}`,
      customer: { name: payerName, phone },
    });
    if (!routing.simulated && routing.status === "failed") return Response.json({ error: routing.reason ?? "Provider payment failed" }, { status: 502 });

    const outcome = await applyTransaction({
      userId: link.userId,
      linkId: link.id,
      type: "payment",
      direction: "in",
      amount,
      fee: 0,
      grossAmount: amount,
      balanceDelta: amount,
      method: operator,
      counterparty: phone,
      note: `Paiement ${link.title}${payerName ? ` · ${payerName}` : ""}`,
      countryName,
      recipientName: payerName,
      flow: "payment_link",
      ...providerColumns(routing),
    });
    return Response.json({
      ok: true,
      reference: outcome.transaction.reference,
      amount,
      title: link.title,
      redirectUrl: link.redirectUrl,
      pdfUrl: link.pdfUrl,
      provider: routing.provider,
      fallbackUsed: routing.fallbackUsed,
      checkoutUrl: routing.checkoutUrl,
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
