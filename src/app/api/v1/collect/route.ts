import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";
import { applyTransaction } from "@/lib/ledger";
import { providerColumns, routeDirectPayment } from "@/lib/payment-providers";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const auth = request.headers.get("authorization") ?? "";
    const key = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    if (!key) return Response.json({ error: "API key manquante (Authorization: Bearer sk_test_...)" }, { status: 401 });
    const [account] = await db.select().from(users).where(eq(users.apiKey, key)).limit(1);
    if (!account) return Response.json({ error: "Clé API invalide" }, { status: 401 });

    const body = await request.json();
    const amount = Math.round(Number(body.amount));
    const phone = String(body.phone ?? "").trim();
    const operator = String(body.operator ?? "Mobile Money").trim();
    const countryCode = String(body.country_code ?? body.countryCode ?? "CM").trim().toUpperCase();
    const countryName = String(body.country_name ?? body.countryName ?? "Cameroun").trim();
    const reference = String(body.reference ?? `ORDER-${Date.now()}`);
    if (!Number.isFinite(amount) || amount < 100) return Response.json({ error: "amount doit être supérieur ou égal à 100" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 8) return Response.json({ error: "phone invalide" }, { status: 400 });

    const routing = await routeDirectPayment({
      mode: "mobile",
      direction: "collect",
      amount,
      currency: String(body.currency ?? "XAF"),
      countryCode,
      countryName,
      operator,
      phone,
      reference,
      description: `Collecte API · ${reference}`,
    });
    const outcome = await applyTransaction({
      userId: account.id,
      type: "api_payment",
      direction: "in",
      amount,
      fee: 0,
      grossAmount: amount,
      balanceDelta: amount,
      method: operator,
      counterparty: phone,
      note: `Collecte API · ${reference}`,
      siteReference: reference,
      countryName,
      flow: "api_collect",
      ...providerColumns(routing),
    });
    return Response.json({
      status: "success",
      transaction_id: outcome.transaction.reference,
      amount,
      currency: String(body.currency ?? "XAF"),
      operator,
      customer_phone: phone,
      reference,
      new_balance: outcome.balance,
      provider: routing.provider,
      fallback_used: routing.fallbackUsed,
      provider_status: routing.status,
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erreur serveur" }, { status: 500 });
  }
}
