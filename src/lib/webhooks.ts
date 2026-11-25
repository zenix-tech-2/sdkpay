/**
 * Provider webhook verification — raw-body HMAC-SHA256 checks, idempotent settling.
 * AshTech Pay (whsec_...) and SasPay both sign notifications; exact header names
 * vary across versions, so we probe the known candidates and accept hex/base64 digests.
 */
import crypto from "node:crypto";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { settleCredit, settleFailure } from "@/lib/ledger";

const SIGNATURE_HEADERS = [
  "x-ashtech-signature", "ashtech-signature", "x-signature", "x-webhook-signature",
  "x-saspay-signature", "saspay-signature", "x-provider-signature", "signature",
];

const COMPLETED = new Set(["success", "completed", "confirmed", "paid", "settled", "approved"]);
const FAILED = new Set(["failed", "fail", "rejected", "expired", "cancelled", "canceled", "declined", "insufficient_balance"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (body: any, ...keys: string[]): any => {
  for (const k of keys) {
    const v = k.split(".").reduce((o, p) => (o == null ? o : o[p]), body);
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
};

export async function handleProviderWebhook(provider: "ashtech" | "saspay", rawBody: string, headers: Headers) {
  const secret = (provider === "ashtech" ? process.env.ASHTECH_WEBHOOK_SECRET : process.env.SASPAY_WEBHOOK_SECRET) || "";

  // --- verify signature (reject everything when the secret is configured and signature is absent/wrong) ---
  if (!secret) {
    return { ok: false, status: 503, error: "Webhook secret not configured" };
  }
  const digests = [
    crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex"),
    crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64"),
    crypto.createHmac("sha256", secret).update(secret + rawBody, "utf8").digest("hex"),
    crypto.createHash("sha256").update(secret + rawBody, "utf8").digest("hex"),
  ];
  let verified = false;
  for (const h of SIGNATURE_HEADERS) {
    const raw = headers.get(h);
    if (!raw) continue;
    const v = raw.trim().replace(/^sha256=/i, "").toLowerCase();
    if (digests.some((d) => d.toLowerCase() === v)) { verified = true; break; }
  }
  if (!verified) return { ok: false, status: 401, error: "Invalid signature" };

  // --- parse + settle idempotently ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try { body = JSON.parse(rawBody); } catch { return { ok: false, status: 400, error: "Invalid JSON" }; }

  const providerRef = String(
    pick(body, "transaction_id", "id", "reference", "transaction.reference", "data.id", "data.transaction_id", "data.reference", "transaction.id") ?? ""
  );
  const rawStatus = String(pick(body, "status", "data.status", "transaction.status", "event", "data.event") ?? "").toLowerCase();
  const credited = Number(pick(body, "credited_amount", "data.credited_amount", "data.net_amount", "amount_received")) || null;
  const reason = String(pick(body, "reason", "message", "data.reason", "data.message") ?? "") || undefined;

  if (!providerRef) return { ok: true, status: 200, note: "No provider reference in payload" };

  const [tx] = await db.select().from(transactions).where(eq(transactions.providerRef, providerRef)).limit(1);
  if (!tx) return { ok: true, status: 200, note: "Unknown reference — acknowledged" };

  if (COMPLETED.has(rawStatus) || rawStatus.includes("payment.completed") || rawStatus.includes("success")) {
    await settleCredit(tx, { creditedAmount: credited });
  } else if (FAILED.has(rawStatus) || rawStatus.includes("failed") || rawStatus.includes("rejected")) {
    await settleFailure(tx, reason);
  } else {
    await db.update(transactions).set({ providerStatus: rawStatus || "pending" }).where(eq(transactions.id, tx.id));
  }
  return { ok: true, status: 200, ref: tx.ref };
}
