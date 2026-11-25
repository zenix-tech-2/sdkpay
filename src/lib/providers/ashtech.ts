/**
 * AshTech Pay — Direct API adapter (PRIMARY provider)
 * Docs: https://doc.ashtechpay.com  (base URL: https://www.ashtechpay.com/v1)
 * Auth: Bearer ak_...  (Direct API key — never exposed to the browser)
 */
import {
  CollectInput, CollectResult, PayoutInput, PayoutResult, VerifyResult,
  ProviderHttpError, ProviderNetworkError, NormalizedStatus,
} from "./types";

const base = () => process.env.ASHTECH_BASE_URL || "https://www.ashtechpay.com/v1";
const apiKey = () => process.env.ASHTECH_API_KEY || "";
export const ashtechAvailable = () => apiKey().length > 0;
const userId = () => process.env.ASHTECH_USER_ID || "";
const notifyUrl = (override?: string | null) => override || (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, "")}/api/webhooks/ashtech` : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call<T = any>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (e) {
    throw new ProviderNetworkError("ashtech", e instanceof Error ? e.message : "network error");
  }
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
  if (!res.ok) {
    const message = json?.message || json?.error || `HTTP ${res.status}`;
    throw new ProviderHttpError("ashtech", res.status, String(message), text);
  }
  return json as T;
}

/** Tolerate the different envelope shapes AshTech has used across API versions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickId(json: any): string | null {
  return (
    json?.transaction_id ?? json?.id ?? json?.reference ?? json?.data?.transaction_id ??
    json?.data?.id ?? json?.data?.reference ?? json?.transaction?.id ?? json?.data?.transaction?.id ?? null
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickStatus(json: any): string | null {
  return json?.status ?? json?.data?.status ?? json?.transaction?.status ?? json?.data?.transaction?.status ?? null;
}
function normalizeStatus(raw: string | null | undefined): NormalizedStatus {
  const s = (raw ?? "").toLowerCase();
  if (["success", "completed", "confirmed", "paid", "settled", "approved"].includes(s)) return "completed";
  if (["failed", "rejected", "expired", "cancelled", "canceled", "declined"].includes(s)) return "failed";
  return "pending";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickNumber(json: any, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = json?.[k] ?? json?.data?.[k] ?? json?.transaction?.[k];
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

/** Mobile Money collection — POST /v1/collect */
export async function collect(input: CollectInput): Promise<CollectResult> {
  const json = await call("/collect", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId(),
      amount: input.amount,
      currency: input.currency,
      country_code: input.countryCode,
      operator: input.operator,
      phone: input.phone.replace(/[^\d+]/g, ""),
      reference: input.reference,
      ...(notifyUrl(input.notifyUrl) ? { notify_url: notifyUrl(input.notifyUrl) } : {}),
    }),
  });
  const rawStatus = pickStatus(json);
  return {
    provider: "ashtech",
    providerRef: pickId(json),
    status: normalizeStatus(rawStatus),
    creditedAmount: pickNumber(json, "credited_amount", "credited", "net"),
    rawStatus,
    raw: json,
  };
}

/** Crypto collection — POST /v1/crypto/collect */
export async function cryptoCollect(input: CollectInput & { network?: string; networkCode?: string }): Promise<CollectResult & { address?: string | null }> {
  const json = await call("/crypto/collect", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId(),
      amount: input.amount,
      ...(input.networkCode ? { network: input.networkCode } : {}),
      reference: input.reference,
      ...(notifyUrl(input.notifyUrl) ? { notify_url: notifyUrl(input.notifyUrl) } : {}),
      customer: {
        email: input.customerEmail ?? "merchant@sdkpay.com",
        first_name: input.customerFirstName ?? "SDK",
        last_name: input.customerLastName ?? "Pay",
      },
    }),
  });
  const rawStatus = pickStatus(json);
  return {
    provider: "ashtech",
    providerRef: pickId(json),
    status: normalizeStatus(rawStatus),
    rawStatus,
    raw: json,
    address: json?.address ?? json?.data?.address ?? json?.data?.deposit_address ?? null,
  };
}

/** Transaction status — GET /v1/transaction/:id?user_id=... */
export async function verify(providerRef: string): Promise<VerifyResult> {
  const json = await call(`/transaction/${encodeURIComponent(providerRef)}?user_id=${encodeURIComponent(userId())}`, { method: "GET" });
  const rawStatus = pickStatus(json);
  return {
    provider: "ashtech",
    providerRef,
    status: normalizeStatus(rawStatus),
    creditedAmount: pickNumber(json, "credited_amount", "credited", "net", "amount_received"),
    feeAmount: pickNumber(json, "total_fee_amount", "fee_amount", "ashtech_fee_amount", "fee"),
    rawStatus,
  };
}

/** Mobile Money payout — POST /v1/payouts/mobile-money */
export async function payout(input: PayoutInput): Promise<PayoutResult> {
  const json = await call("/payouts/mobile-money", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId(),
      amount: input.amount,
      currency: input.currency,
      country_code: input.countryCode,
      operator: input.operator,
      phone: input.phone.replace(/[^\d+]/g, ""),
      recipient_name: input.recipientName ?? undefined,
      reference: input.reference,
      ...(notifyUrl(input.notifyUrl) ? { notify_url: notifyUrl(input.notifyUrl) } : {}),
    }),
  });
  const rawStatus = pickStatus(json);
  return { provider: "ashtech", providerRef: pickId(json), status: normalizeStatus(rawStatus), rawStatus };
}
