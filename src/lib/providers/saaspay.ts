import type {
  CollectParams,
  CollectResult,
  DisburseParams,
  ProviderClient,
  ProviderTxStatus,
  RouteInput,
} from "./types";

/**
 * SasPay (saaspay.me) — BACKUP provider for Mobile Money.
 * Used automatically when a country or operator is not covered by AshTechPay.
 * Docs: https://docs.saspay.me — base https://api.saspay.me/api/v1
 *   POST /payments/softpay/        — collect (push or redirect via checkout_url)
 *   GET  /payments/{id}/verify/    — verify collection
 *   POST /payouts/initialize/      — disburse to mobile money
 *   GET  /payouts/{id}/verify/     — verify payout
 * Auth: Authorization: Bearer <SASPAY_SECRET_KEY> (sk_test_ / sk_live_)
 */

const BASE = (process.env.SASPAY_BASE_URL || "https://api.saspay.me/api/v1").replace(/\/$/, "");

// SasPay documented country coverage (18)
const COVERAGE = new Set([
  "BF", "BJ", "CD", "CI", "CM", "GH", "GN", "KE",
  "ML", "MW", "NE", "NG", "RW", "SN", "TG", "TZ", "UG", "ZM",
]);

// Display name -> SasPay network prefix (code = `${prefix}_${cc}`)
const NETWORKS: Record<string, string> = {
  "mtn momo": "mtn",
  "mtn money": "mtn",
  "mtn": "mtn",
  "orange money": "orange",
  "orange": "orange",
  "wave": "wave",
  "moov money": "moov",
  "moov": "moov",
  "airtel money": "airtel",
  "airtel": "airtel",
  "free money": "free",
  "free": "free",
  "m-pesa": "mpesa",
  "mpesa": "mpesa",
  "tmoney": "tmoney",
  "t-money": "tmoney",
  "coris money": "coris",
  "coris": "coris",
  "celtiis money": "celtiis",
  "celtiis": "celtiis",
  "e-money": "emoney",
};

function secret() {
  return process.env.SASPAY_SECRET_KEY || "";
}

function mapStatus(s: unknown): ProviderTxStatus {
  const v = String(s ?? "").toLowerCase();
  if (["success", "successful", "completed", "complete", "paid", "approved"].includes(v)) return "success";
  if (["failed", "failure", "rejected", "expired", "cancelled", "canceled"].includes(v)) return "failed";
  return "pending";
}

async function call(path: string, init: RequestInit, timeoutMs = 25000): Promise<Record<string, unknown>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret()}`,
        ...(init.headers || {}),
      },
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      json = { _raw: text };
    }
    if (!res.ok) {
      const d = (json.data ?? json) as Record<string, unknown>;
      const msg = (d.message as string) || (json.message as string) || (json.detail as string) || `SasPay HTTP ${res.status}`;
      throw new Error(typeof msg === "string" ? msg : `SasPay HTTP ${res.status}`);
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

export function saspayNetwork(displayOperator: string, countryCode: string): string | null {
  const prefix = NETWORKS[displayOperator.trim().toLowerCase()];
  if (!prefix) return null;
  return `${prefix}_${countryCode.toLowerCase()}`;
}

export const saaspay: ProviderClient = {
  name: "saaspay",
  label: "SasPay",

  isConfigured() {
    return secret().length > 8;
  },

  isSandbox() {
    return secret().startsWith("sk_test_");
  },

  supports(input: RouteInput) {
    if (input.method === "crypto") return false; // crypto always via AshTechPay
    if (!COVERAGE.has(input.countryCode.toUpperCase())) return false;
    if (input.operator && !saspayNetwork(input.operator, input.countryCode)) return false;
    return true;
  },

  coverage() {
    return { countries: [...COVERAGE].sort(), note: "Backup provider · Mobile Money fallback" };
  },

  async collect(p: CollectParams): Promise<CollectResult> {
    try {
      const network = saspayNetwork(p.operator, p.countryCode);
      if (!network) throw new Error(`SasPay: operator "${p.operator}" not mapped for ${p.countryCode}`);
      const json = await call("/payments/softpay/", {
        method: "POST",
        headers: { "Idempotency-Key": p.reference },
        body: JSON.stringify({
          amount: Number(p.amount).toFixed(2),
          currency: p.currency,
          country: p.countryCode.toUpperCase(),
          network,
          description: p.description || `SDK Pay deposit ${p.reference}`,
          customer: {
            phone: p.phone.replace(/\s/g, ""),
            first_name: p.customerName || "SDK Pay",
            last_name: "Customer",
            email: p.customerEmail || "customer@sdkpay.com",
          },
          metadata: { reference: p.reference },
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      const id = (d.id ?? d.payment_id ?? d.paymentId) as string | undefined;
      return {
        ok: true,
        providerRef: id ?? p.reference,
        status: mapStatus(d.status ?? "pending"),
        checkoutUrl: (d.checkout_url ?? d.checkoutUrl ?? null) as string | null,
        raw: json,
      };
    } catch (e) {
      return { ok: false, status: "failed", error: e instanceof Error ? e.message : "SasPay collect failed" };
    }
  },

  async disburse(p: DisburseParams): Promise<CollectResult> {
    try {
      const network = saspayNetwork(p.operator, p.countryCode);
      if (!network) throw new Error(`SasPay: operator "${p.operator}" not mapped for ${p.countryCode}`);
      const json = await call("/payouts/initialize/", {
        method: "POST",
        headers: { "Idempotency-Key": p.reference },
        body: JSON.stringify({
          amount: Number(p.amount).toFixed(2),
          currency: p.currency,
          country: p.countryCode.toUpperCase(),
          network,
          recipient: { phone: p.phone.replace(/\s/g, "") },
          description: p.description || `SDK Pay payout ${p.reference}`,
          metadata: { reference: p.reference },
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      const id = (d.id ?? d.payout_id ?? d.payoutId) as string | undefined;
      return {
        ok: true,
        providerRef: id ?? p.reference,
        status: mapStatus(d.status ?? "pending"),
        raw: json,
      };
    } catch (e) {
      return { ok: false, status: "failed", error: e instanceof Error ? e.message : "SasPay payout failed" };
    }
  },

  async getStatus(providerRef: string) {
    // Try payment verify first, then payout verify.
    for (const path of [`/payments/${encodeURIComponent(providerRef)}/verify/`, `/payouts/${encodeURIComponent(providerRef)}/verify/`]) {
      try {
        const json = await call(path, { method: "GET" });
        const d = (json.data ?? json) as Record<string, unknown>;
        const s = mapStatus(d.status);
        if (d.status !== undefined) return { status: s, raw: json };
      } catch {
        continue;
      }
    }
    return { status: "pending" as ProviderTxStatus };
  },
};
