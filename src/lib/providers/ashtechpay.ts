import { getBaseUrl } from "@/lib/base-url";
import type {
  CollectParams,
  CollectResult,
  CryptoChargeParams,
  CryptoChargeResult,
  DisburseParams,
  ProviderClient,
  ProviderTxStatus,
  RouteInput,
} from "./types";

/**
 * AshTechPay Direct API — PRIMARY provider (Mobile Money + crypto).
 * Contract based on AshTechPay developer docs (doc.ashtechpay.com):
 *   POST {base}/collect     — Mobile Money collection
 *   POST {base}/disburse    — Mobile Money payout
 *   GET  {base}/transaction/:id — status
 *   POST {base}/crypto/collect  — crypto charge / address
 * Auth: Authorization: Bearer <ASHTECHPAY_API_KEY>
 * Paths are overridable via env for future doc revisions.
 */

const BASE = (process.env.ASHTECHPAY_BASE_URL || "https://ashtechpay.com/v1").replace(/\/$/, "");
const COLLECT_PATH = process.env.ASHTECHPAY_COLLECT_PATH || "/collect";
const DISBURSE_PATH = process.env.ASHTECHPAY_DISBURSE_PATH || "/disburse";
const STATUS_PATH = process.env.ASHTECHPAY_STATUS_PATH || "/transaction";
const CRYPTO_PATH = process.env.ASHTECHPAY_CRYPTO_PATH || "/crypto/collect";
const CRYPTO_DISBURSE_PATH = process.env.ASHTECHPAY_CRYPTO_DISBURSE_PATH || "/crypto/disburse";

// AshTechPay coverage (primary). Countries/operators outside this map
// automatically fall back to SaasPay (backup).
const COVERAGE = new Set([
  "BJ", "BF", "CM", "CF", "CG", "CI", "GA", "GH", "GN",
  "ML", "NE", "CD", "SN", "TD", "TG", "NG", "KE", "RW",
]);

// Display name -> AshTechPay operator code
const OPERATORS: Record<string, string> = {
  "mtn momo": "MTN",
  "mtn money": "MTN",
  "mtn": "MTN",
  "orange money": "ORANGE",
  "orange": "ORANGE",
  "wave": "WAVE",
  "moov money": "MOOV",
  "moov": "MOOV",
  "airtel money": "AIRTEL",
  "airtel": "AIRTEL",
  "free money": "FREE",
  "free": "FREE",
  "m-pesa": "MPESA",
  "mpesa": "MPESA",
  "tmoney": "TMONEY",
  "t-money": "TMONEY",
  "telecel money": "TELECEL",
  "telecel": "TELECEL",
  "coris money": "CORIS",
  "coris": "CORIS",
  "celtiis money": "CELTIIS",
  "celtiis": "CELTIIS",
  "zamani": "ZAMANI",
  "wizall money": "WIZALL",
  "smartcash": "SMARTCASH",
  "vodacom": "VODACOM",
  "mixx": "MIXX",
  "opay": "OPAY",
  "palmpay": "PALMPAY",
};

function apiKey() {
  return process.env.ASHTECHPAY_API_KEY || "";
}

function mapStatus(s: unknown): ProviderTxStatus {
  const v = String(s ?? "").toLowerCase();
  if (["success", "successful", "completed", "complete", "approved", "paid", "ok"].includes(v)) return "success";
  if (["failed", "failure", "rejected", "expired", "cancelled", "canceled", "error"].includes(v)) return "failed";
  return "pending";
}

function pickRef(json: Record<string, unknown>): string | undefined {
  const d = (json.data ?? json) as Record<string, unknown>;
  for (const k of ["transaction_id", "transactionId", "reference", "id", "payment_id", "trx_id"]) {
    if (typeof d[k] === "string" && (d[k] as string).length > 2) return d[k] as string;
  }
  return undefined;
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
        Authorization: `Bearer ${apiKey()}`,
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
      const msg =
        (json.message as string) || (json.error as string) || `AshTechPay HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

export function ashtechOperatorCode(displayName: string): string | null {
  return OPERATORS[displayName.trim().toLowerCase()] ?? null;
}

export const ashtechpay: ProviderClient = {
  name: "ashtechpay",
  label: "AshTechPay",

  isConfigured() {
    return apiKey().length > 8;
  },

  isSandbox() {
    return apiKey().includes("test") || (process.env.ASHTECHPAY_MODE || "").toLowerCase() === "sandbox";
  },

  supports(input: RouteInput) {
    if (input.method === "crypto") return true; // crypto always via AshTechPay
    if (!COVERAGE.has(input.countryCode.toUpperCase())) return false;
    if (input.operator && !ashtechOperatorCode(input.operator)) return false;
    return true;
  },

  coverage() {
    return { countries: [...COVERAGE].sort(), note: "Primary provider · Mobile Money + crypto" };
  },

  async collect(p: CollectParams): Promise<CollectResult> {
    try {
      const op = ashtechOperatorCode(p.operator) ?? p.operator;
      const json = await call(COLLECT_PATH, {
        method: "POST",
        body: JSON.stringify({
          country_code: p.countryCode.toUpperCase(),
          amount: Math.round(p.amount),
          currency: p.currency,
          phone: p.phone.replace(/\s/g, ""),
          operator: op,
          reference: p.reference,
          description: p.description || `SDK Pay deposit ${p.reference}`,
          webhook_url: `${await getBaseUrl()}/api/webhooks/ashtechpay`,
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      return {
        ok: true,
        providerRef: pickRef(json) ?? p.reference,
        status: mapStatus(d.status ?? json.status ?? "pending"),
        checkoutUrl: (d.checkout_url ?? d.payment_url ?? null) as string | null,
        raw: json,
      };
    } catch (e) {
      return { ok: false, status: "failed", error: e instanceof Error ? e.message : "AshTechPay collect failed" };
    }
  },

  async disburse(p: DisburseParams): Promise<CollectResult> {
    try {
      const op = ashtechOperatorCode(p.operator) ?? p.operator;
      const json = await call(DISBURSE_PATH, {
        method: "POST",
        body: JSON.stringify({
          country_code: p.countryCode.toUpperCase(),
          amount: Math.round(p.amount),
          currency: p.currency,
          phone: p.phone.replace(/\s/g, ""),
          operator: op,
          reference: p.reference,
          description: p.description || `SDK Pay payout ${p.reference}`,
          webhook_url: `${await getBaseUrl()}/api/webhooks/ashtechpay`,
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      return {
        ok: true,
        providerRef: pickRef(json) ?? p.reference,
        status: mapStatus(d.status ?? json.status ?? "pending"),
        raw: json,
      };
    } catch (e) {
      return { ok: false, status: "failed", error: e instanceof Error ? e.message : "AshTechPay disburse failed" };
    }
  },

  async getStatus(providerRef: string) {
    try {
      const json = await call(`${STATUS_PATH}/${encodeURIComponent(providerRef)}`, { method: "GET" });
      const d = (json.data ?? json) as Record<string, unknown>;
      return { status: mapStatus(d.status ?? json.status), raw: json };
    } catch {
      return { status: "pending" as ProviderTxStatus };
    }
  },

  async cryptoDisburse(p: { amountUsdt: number; network: string; address: string; reference: string; userId?: string }): Promise<CollectResult> {
    try {
      const json = await call(CRYPTO_DISBURSE_PATH, {
        method: "POST",
        body: JSON.stringify({
          amount: p.amountUsdt,
          currency: "USDT",
          network: p.network,
          address: p.address,
          reference: p.reference,
          user_id: p.userId || p.reference,
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      return {
        ok: true,
        providerRef: pickRef(json) ?? p.reference,
        status: mapStatus(d.status ?? json.status ?? "pending"),
        raw: json,
      };
    } catch (e) {
      return { ok: false, status: "failed", error: e instanceof Error ? e.message : "AshTechPay crypto payout failed" };
    }
  },

  async cryptoCharge(p: CryptoChargeParams): Promise<CryptoChargeResult> {
    try {
      const json = await call(CRYPTO_PATH, {
        method: "POST",
        body: JSON.stringify({
          amount: p.amountUsdt,
          currency: "USDT",
          network: p.network,
          country_code: (p.countryCode || "CM").toUpperCase(),
          reference: p.reference,
          user_id: p.userId || p.reference,
        }),
      });
      const d = (json.data ?? json) as Record<string, unknown>;
      const address = (d.address ?? d.deposit_address) as string | undefined;
      if (!address) throw new Error("AshTechPay did not return a deposit address");
      return {
        ok: true,
        address,
        providerRef: pickRef(json) ?? p.reference,
        expiresIn: (d.expires_in as number) || 300,
        raw: json,
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "AshTechPay crypto failed" };
    }
  },
};
