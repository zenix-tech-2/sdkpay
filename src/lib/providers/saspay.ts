/**
 * SasPay — adapter (BACKUP provider, used when AshTech lacks an operator/country)
 * Docs: https://docs.saspay.me  (base URL: https://api.saspay.me/api/v1)
 * Auth: Bearer sk_test_... / sk_live_...  (server-side only)
 * Responses wrap payloads in `data`. Networks are per-country codes (e.g. mtn_bj).
 */
import { randomUUID } from "node:crypto";
import {
  CollectInput, CollectResult, PayoutInput, PayoutResult, VerifyResult,
  ProviderHttpError, ProviderNetworkError, NormalizedStatus,
} from "./types";

const base = () => process.env.SASPAY_BASE_URL || "https://api.saspay.me/api/v1";
const apiKey = () => process.env.SASPAY_API_KEY || "";
export const saspayAvailable = () => apiKey().length > 0;

const notifyUrl = (override?: string | null) => override || (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, "")}/api/webhooks/saspay` : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call<T = any>(path: string, init?: RequestInit, auth = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      headers: {
        ...(auth ? { Authorization: `Bearer ${apiKey()}` } : {}),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (e) {
    throw new ProviderNetworkError("saspay", e instanceof Error ? e.message : "network error");
  }
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    const message = json?.message || json?.error || (json ? JSON.stringify(json) : `HTTP ${res.status}`);
    throw new ProviderHttpError("saspay", res.status, String(message), text);
  }
  return json as T;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataOf = (json: any) => (json && typeof json === "object" && "data" in json ? json.data : json);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickId(json: any): string | null {
  const d = dataOf(json);
  return d?.id ?? d?.payment_id ?? d?.transaction_id ?? d?.reference ?? json?.id ?? null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickStatus(json: any): string | null {
  const d = dataOf(json);
  return d?.status ?? d?.payment_status ?? null;
}
function normalizeStatus(raw: string | null | undefined): NormalizedStatus {
  const s = (raw ?? "").toUpperCase();
  if (["SUCCESS", "COMPLETED", "CONFIRMED", "PAID", "SETTLED"].includes(s)) return "completed";
  if (["FAILED", "FAIL", "REJECTED", "EXPIRED", "CANCELLED", "CANCELED", "DECLINED", "INSUFFICIENT_BALANCE"].includes(s)) return "failed";
  return "pending";
}

/* ---------------- countries / networks catalog (cached) ---------------- */
type NetworkEntry = { code: string; name?: string; country?: string; country_code?: string; currency?: string; active?: boolean };
type CountriesPayload = unknown;

let catalogCache: { at: number; networks: NetworkEntry[] } | null = null;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenNetworks(json: any): NetworkEntry[] {
  const d = dataOf(json);
  const out: NetworkEntry[] = [];
  const push = (n: any, country?: string) => {
    if (!n || typeof n !== "object") return;
    if (n.code || n.network || n.id) {
      out.push({
        code: String(n.code ?? n.network ?? n.id),
        name: n.name ?? n.label ?? n.operator ?? n.title,
        country: n.country ?? country,
        country_code: n.country_code ?? n.country ?? country,
        currency: n.currency,
        active: n.active ?? n.is_active ?? true,
      });
    }
  };
  const roots = Array.isArray(d) ? d : [d?.countries, d?.networks, d?.items, d?.results, d];
  for (const root of roots.flat().filter(Boolean)) {
    if (Array.isArray(root)) { for (const item of root) push(item); continue; }
    // nested country object: { country: "BJ", networks: [...] }
    const nets = root?.networks ?? root?.operators ?? root?.methods;
    if (Array.isArray(nets)) { for (const n of nets) push(n, root.country ?? root.code ?? root.country_code); }
    else push(root);
  }
  return out.filter((n) => n.code);
}

export async function getNetworks(refresh = false): Promise<NetworkEntry[]> {
  if (!refresh && catalogCache && Date.now() - catalogCache.at < 10 * 60 * 1000) return catalogCache.networks;
  let networks: NetworkEntry[] = [];
  try {
    const json: CountriesPayload = await call("/countries/", { method: "GET" }, false); // public endpoint
    networks = flattenNetworks(json);
  } catch {
    // catalog unreachable — return empty; caller decides (fallback will surface error)
  }
  catalogCache = { at: Date.now(), networks };
  return networks;
}

const KEYWORDS: [RegExp, string[]][] = [
  [/mtn/i, ["mtn"]],
  [/orange/i, ["orange", "om"]],
  [/wave/i, ["wave"]],
  [/moov/i, ["moov"]],
  [/celtiis|celtis|t-money|flooz/i, ["celtiis", "flooz", "tmoney"]],
  [/coris/i, ["coris"]],
  [/airtel/i, ["airtel"]],
  [/wizall/i, ["wizall"]],
  [/djamo/i, ["djamo"]],
  [/mpesa|m-pesa/i, ["mpesa"]],
];

/** Resolve a network code for a country + operator label, e.g. ("BJ", "MTN Money") → "mtn_bj". */
export async function matchNetwork(countryCode: string, operatorLabel: string): Promise<string | null> {
  const networks = await getNetworks();
  const cc = countryCode.toLowerCase();
  const inCountry = networks.filter((n) => (n.country_code ?? n.country ?? "").toLowerCase().startsWith(cc));
  const pool = inCountry.length ? inCountry : networks; // some catalogs are flat without country
  if (!pool.length) return null;

  // score by keyword overlap between operator label and network name/code
  const needle = norm(operatorLabel);
  let best: { score: number; code: string } | null = null;
  for (const n of pool) {
    const hay = norm(`${n.name ?? ""} ${n.code}`);
    let score = 0;
    for (const [re, codes] of KEYWORDS) {
      if (re.test(operatorLabel)) {
        for (const c of codes) if (hay.includes(c)) score += 3;
      }
    }
    if (hay.includes(needle) || needle.includes(hay)) score += 2;
    // direct token overlap
    for (const token of needle.match(/[a-z0-9]{3,}/g) ?? []) if (hay.includes(token)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { score, code: n.code };
  }
  return best?.code ?? null;
}

const normalizePhone = (phone: string, countryCode: string) => {
  let p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (!p.startsWith("+")) {
    const dial: Record<string, string> = { CM: "237", BJ: "229", CI: "225", SN: "221", BF: "226", ML: "223", NE: "227", TG: "228", GA: "241", CG: "242", TD: "235", CD: "243", GW: "245", SL: "232", ZM: "260", CF: "236", IN: "91" };
    p = "+" + (dial[countryCode.toUpperCase()] ?? "") + p.replace(/^0+/, "");
  }
  return p;
};

export async function collect(input: CollectInput, network?: string): Promise<CollectResult> {
  const code = network ?? (await matchNetwork(input.countryCode, input.operator));
  if (!code) {
    throw new ProviderHttpError("saspay", 422, `No SasPay network matches operator "${input.operator}" in ${input.countryCode}`);
  }
  const [firstName, ...rest] = (input.customerFirstName ? `${input.customerFirstName} ${input.customerLastName ?? ""}`.trim() : "SDK Pay Customer").split(" ");
  const json = await call("/payments/softpay/", {
    method: "POST",
    headers: { "Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      amount: input.amount.toFixed(2),
      currency: input.currency,
      country: input.countryCode.toUpperCase(),
      network: code,
      description: "SDK Pay top up",
      customer: {
        email: input.customerEmail ?? "customer@sdkpay.com",
        first_name: firstName,
        last_name: rest.join(" ") || firstName,
        phone: normalizePhone(input.phone, input.countryCode),
      },
    }),
  });
  const d = dataOf(json);
  const rawStatus = pickStatus(json);
  return {
    provider: "saspay",
    providerRef: pickId(json),
    status: normalizeStatus(rawStatus),
    checkoutUrl: d?.checkout_url ?? d?.checkoutUrl ?? null,
    creditedAmount: d?.net_amount !== undefined ? Number(d.net_amount) : null,
    rawStatus,
    raw: json,
  };
}

/** Payment status — GET /payments/{id}/verify/ */
export async function verify(providerRef: string): Promise<VerifyResult> {
  const json = await call(`/payments/${encodeURIComponent(providerRef)}/verify/`, { method: "GET" });
  const d = dataOf(json);
  const rawStatus = pickStatus(json);
  return {
    provider: "saspay",
    providerRef,
    status: normalizeStatus(rawStatus),
    creditedAmount: d?.net_amount !== undefined ? Number(d.net_amount) : d?.amount !== undefined ? Number(d.amount) : null,
    feeAmount: d?.fee_amount !== undefined ? Number(d.fee_amount) : d?.fee !== undefined ? Number(d.fee) : null,
    rawStatus,
  };
}

export async function payout(input: PayoutInput): Promise<PayoutResult> {
  const code = await matchNetwork(input.countryCode, input.operator);
  const json = await call("/payouts/initialize/", {
    method: "POST",
    headers: { "Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      amount: input.amount.toFixed(2),
      currency: input.currency,
      country: input.countryCode.toUpperCase(),
      network: code ?? undefined,
      description: "SDK Pay withdrawal",
      recipient: {
        name: input.recipientName ?? "SDK Pay recipient",
        phone: normalizePhone(input.phone, input.countryCode),
      },
    }),
  });
  const rawStatus = pickStatus(json);
  return { provider: "saspay", providerRef: pickId(json), status: normalizeStatus(rawStatus), rawStatus };
}
