import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { settleTxFromProvider } from "@/lib/providers/settle";
import { logEvent } from "@/lib/providers/router";

/**
 * SasPay webhook receiver (backup provider).
 * Register {PUBLIC_BASE_URL}/api/webhooks/saaspay in the SasPay dashboard
 * (Développeur → Webhooks) with events transaction.created/success/failed.
 * Verified against SASPAY_WEBHOOK_SECRET when set (SasPay signs payloads;
 * both `t=...,v1=...` and plain-hex formats are accepted).
 */
/** Returns "valid" only for a cryptographically verified body; anything else must be re-checked with SasPay. */
function verifySignature(raw: string, headers: Headers): "valid" | "unsigned" | "invalid" {
  const secret = process.env.SASPAY_WEBHOOK_SECRET || "";
  if (!secret) return "unsigned";
  const sig =
    headers.get("x-saspay-signature") ||
    headers.get("saspay-signature") ||
    headers.get("x-webhook-signature") ||
    "";
  if (!sig) return "unsigned"; // header name varies by version — accepted but re-verified with SasPay
  const v1 = sig.includes("v1=") ? sig.split("v1=")[1].split(",")[0] : sig;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  return v1.trim() === expected ? "valid" : "invalid";
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sigState = verifySignature(raw, req.headers);
  if (sigState === "invalid") {
    await logEvent({ provider: "saaspay", action: "webhook", status: "error", message: "invalid signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = String(body.event ?? body.type ?? "").toLowerCase();
  const d = (body.data ?? body.object ?? body) as Record<string, unknown>;
  const statusRaw = `${event} ${String(d.status ?? "")}`.toLowerCase();
  const status = statusRaw.includes("success") ? "success" : statusRaw.includes("fail") ? "failed" : "pending";
  const providerRef = (d.id as string) || (d.payment_id as string) || (d.payout_id as string) || undefined;
  const meta = (d.metadata ?? {}) as Record<string, unknown>;
  const reference = (meta.reference as string) || (d.reference as string) || undefined;

  await logEvent({ provider: "saaspay", action: "webhook", message: `event=${event} ref=${providerRef || reference}` });
  const tx = await settleTxFromProvider({ providerRef, reference, status: status as "success" | "failed" | "pending", provider: "SasPay", verify: sigState !== "valid" });
  return NextResponse.json({ ok: true, matched: !!tx });
}
