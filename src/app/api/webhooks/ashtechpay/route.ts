import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { settleTxFromProvider } from "@/lib/providers/settle";
import { logEvent } from "@/lib/providers/router";

/**
 * AshTechPay Direct webhook receiver.
 * Configure this URL in your AshTechPay dashboard:
 *   {PUBLIC_BASE_URL}/api/webhooks/ashtechpay
 * If ASHTECHPAY_WEBHOOK_SECRET is set, the X-AshTechPay-Signature header
 * (HMAC-SHA256 hex of the raw body) is verified.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.ASHTECHPAY_WEBHOOK_SECRET || "";
  if (secret) {
    const sig = req.headers.get("x-ashtechpay-signature") || req.headers.get("x-sdk-signature") || "";
    const expected = createHmac("sha256", secret).update(raw).digest("hex");
    try {
      if (!sig || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        await logEvent({ provider: "ashtechpay", action: "webhook", status: "error", message: "invalid signature" });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: Record<string, unknown> = {};
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const d = (body.data ?? body) as Record<string, unknown>;
  const statusRaw = String(d.status ?? body.status ?? body.event ?? "").toLowerCase();
  const status =
    statusRaw.includes("success") || statusRaw.includes("complete") || statusRaw.includes("paid") || statusRaw.includes("approved")
      ? "success"
      : statusRaw.includes("fail") || statusRaw.includes("reject") || statusRaw.includes("expire") || statusRaw.includes("cancel")
        ? "failed"
        : "pending";
  const providerRef =
    (d.transaction_id as string) || (d.transactionId as string) || (d.payment_id as string) || (d.id as string) || undefined;
  const reference = (d.reference as string) || (body.reference as string) || undefined;

  await logEvent({ provider: "ashtechpay", action: "webhook", message: `status=${status} ref=${providerRef || reference}` });
  const tx = await settleTxFromProvider({ providerRef, reference, status: status as "success" | "failed" | "pending", provider: "AshTechPay" });
  return NextResponse.json({ ok: true, matched: !!tx });
}
