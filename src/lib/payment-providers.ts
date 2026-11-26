export type ProviderName = "ashtechpay" | "saaspay";
export type PaymentMode = "mobile" | "crypto";
export type PaymentDirection = "collect" | "payout";

export type DirectPaymentInput = {
  mode: PaymentMode;
  direction?: PaymentDirection;
  amount: number;
  currency: string;
  countryCode?: string;
  countryName?: string;
  operator?: string;
  phone?: string;
  reference: string;
  description?: string;
  notifyUrl?: string;
  network?: string;
  walletAddress?: string;
  customer?: { email?: string; name?: string; phone?: string };
};

export type PaymentRouteResult = {
  provider: ProviderName;
  simulated: boolean;
  status: "pending" | "requires_action" | "success" | "failed";
  externalId?: string;
  checkoutUrl?: string;
  ussdCode?: string;
  depositAddress?: string;
  fallbackUsed: boolean;
  reason?: string;
  unsupported?: boolean;
  raw?: unknown;
};

const ASHTECH_DEFAULT_COUNTRIES = ["CM", "CI", "SN", "BJ", "TG", "GH", "NG", "KE", "GA", "CF", "CG", "BF", "ML", "GN", "NE", "TD"];
const ASHTECH_DEFAULT_OPERATORS = ["MTN Money", "Orange Money", "Wave", "Moov Money", "Airtel Money", "Free Money", "M-Pesa", "Celtiis Money", "Coris Money"];
const DEMO_USDT_ADDRESS = "TYZQ18SpQTGCiZShoRe5a9i42tf4RsM5Nt";

function envList(name: string, fallback: string[]) {
  const value = process.env[name];
  if (!value) return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function ashtechKey() {
  return process.env.ASHTECHPAY_DIRECT_KEY ?? process.env.ASHTECHPAY_API_KEY ?? "";
}

function saaspayKey() {
  return process.env.SAASPAY_API_KEY ?? process.env.SAASPAY_DIRECT_KEY ?? "";
}

function ashtechBase() {
  return (process.env.ASHTECHPAY_BASE_URL ?? "https://www.ashtechpay.com").replace(/\/$/, "");
}

function saaspayBase() {
  return (process.env.SAASPAY_BASE_URL ?? "https://api.saspay.me/api/v1").replace(/\/$/, "");
}

function normalizeCurrency(currency: string) {
  if (currency.startsWith("XOF")) return "XOF";
  if (currency.startsWith("XAF")) return "XAF";
  return currency;
}

function operatorSlug(operator?: string) {
  return (operator ?? "mobile").toLowerCase().replace(/money|wave|airtel|orange|moov|mtn|free|m-pesa|celtiis|coris/g, (match) => {
    if (match === "m-pesa") return "mpesa";
    return match;
  }).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").split("_")[0] || "mobile";
}

function saaspayNetwork(input: DirectPaymentInput) {
  const override = process.env.SAASPAY_NETWORK_MAP;
  if (override) {
    try {
      const map = JSON.parse(override) as Record<string, string>;
      const exactKey = `${input.countryCode ?? ""}:${input.operator ?? ""}`;
      const key = exactKey.toLowerCase();
      if (map[exactKey]) return map[exactKey];
      if (map[key]) return map[key];
      if (map[input.operator ?? ""]) return map[input.operator ?? ""];
    } catch { /* ignore malformed map */ }
  }
  return `${operatorSlug(input.operator)}_${(input.countryCode ?? "cm").toLowerCase()}`;
}

function pickString(body: unknown, keys: string[]) {
  if (!body || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  const data = record.data;
  if (data && typeof data === "object") return pickString(data, keys);
  return undefined;
}

function simulatedResult(provider: ProviderName, input: DirectPaymentInput, fallbackUsed: boolean, reason?: string): PaymentRouteResult {
  return {
    provider,
    simulated: true,
    status: "pending",
    externalId: `sim_${input.reference}`,
    depositAddress: input.mode === "crypto" && input.direction !== "payout" ? DEMO_USDT_ADDRESS : undefined,
    fallbackUsed,
    reason,
  };
}

function unsupportedResponse(status: number, text: string) {
  if (status === 404) return true;
  if (![400, 409, 422].includes(status)) return false;
  return /country|operator|network|unsupported|not available|not supported|indisponible|non pris en charge/i.test(text);
}

async function postJson(url: string, headers: Record<string, string>, payload: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    let body: unknown = text;
    try { body = text ? JSON.parse(text) : {}; } catch { /* keep text */ }
    return { response, text, body };
  } finally {
    clearTimeout(timer);
  }
}

async function callAshtech(input: DirectPaymentInput): Promise<PaymentRouteResult> {
  const key = ashtechKey();
  if (!key) return simulatedResult("ashtechpay", input, false, "No ASHTECHPAY_DIRECT_KEY configured; using demo routing");
  const direction = input.direction ?? "collect";
  const path = input.mode === "crypto"
    ? (direction === "payout" ? (process.env.ASHTECHPAY_CRYPTO_PAYOUT_PATH ?? "/v1/crypto/payout") : (process.env.ASHTECHPAY_CRYPTO_COLLECT_PATH ?? "/v1/crypto/collect"))
    : (direction === "payout" ? (process.env.ASHTECHPAY_PAYOUT_PATH ?? "/v1/payout") : (process.env.ASHTECHPAY_COLLECT_PATH ?? "/v1/collect"));
  const payload = {
    amount: input.amount,
    currency: input.currency,
    country_code: input.countryCode,
    country: input.countryName,
    operator: input.operator,
    phone: input.phone,
    reference: input.reference,
    description: input.description,
    notify_url: input.notifyUrl,
    network: input.network,
    wallet_address: input.walletAddress,
  };
  try {
    const { response, text, body } = await postJson(`${ashtechBase()}${path}`, { Authorization: `Bearer ${key}` }, payload);
    if (!response.ok) {
      return {
        provider: "ashtechpay",
        simulated: false,
        status: "failed",
        fallbackUsed: false,
        unsupported: unsupportedResponse(response.status, text),
        reason: `Ashtechpay HTTP ${response.status}`,
        raw: body,
      };
    }
    return {
      provider: "ashtechpay",
      simulated: false,
      status: response.status === 202 || response.status === 201 ? "pending" : "success",
      externalId: pickString(body, ["id", "transaction_id", "payment_id", "reference"]),
      checkoutUrl: pickString(body, ["checkout_url", "payment_link", "wave_url", "redirect_url"]),
      ussdCode: pickString(body, ["ussd_code", "ussd"]),
      depositAddress: pickString(body, ["deposit_address", "address", "wallet_address"]),
      fallbackUsed: false,
      raw: body,
    };
  } catch (error) {
    return { provider: "ashtechpay", simulated: false, status: "failed", fallbackUsed: false, reason: error instanceof Error ? error.message : "Ashtechpay request failed" };
  }
}

async function callSaaspay(input: DirectPaymentInput): Promise<PaymentRouteResult> {
  const key = saaspayKey();
  if (!key) return simulatedResult("saaspay", input, true, "No SAASPAY_API_KEY configured; using demo fallback");
  const direction = input.direction ?? "collect";
  const path = direction === "payout" ? (process.env.SAASPAY_PAYOUT_PATH ?? "/payments/transfer/") : (process.env.SAASPAY_COLLECT_PATH ?? "/payments/softpay/");
  const nameParts = (input.customer?.name ?? input.customer?.email ?? "SDK Pay Customer").split(" ");
  const payload = direction === "payout" ? {
    amount: input.amount.toFixed(2),
    currency: normalizeCurrency(input.currency),
    country: input.countryCode,
    network: saaspayNetwork(input),
    reference: input.reference,
    description: input.description,
    recipient: { phone: input.phone ?? input.walletAddress, name: input.customer?.name },
  } : {
    amount: input.amount.toFixed(2),
    currency: normalizeCurrency(input.currency),
    country: input.countryCode,
    network: saaspayNetwork(input),
    description: input.description ?? input.reference,
    customer: {
      email: input.customer?.email ?? "customer@sdkpay.com",
      first_name: nameParts[0] ?? "Customer",
      last_name: nameParts.slice(1).join(" ") || "SDK Pay",
      phone: input.phone ?? input.customer?.phone ?? "",
    },
  };
  try {
    const { response, text, body } = await postJson(`${saaspayBase()}${path}`, {
      Authorization: `Bearer ${key}`,
      "Idempotency-Key": input.reference,
    }, payload);
    if (!response.ok) {
      return { provider: "saaspay", simulated: false, status: "failed", fallbackUsed: true, reason: `Saaspay HTTP ${response.status}`, raw: body };
    }
    return {
      provider: "saaspay",
      simulated: false,
      status: "pending",
      externalId: pickString(body, ["id", "payment_id", "reference", "transaction_id"]),
      checkoutUrl: pickString(body, ["checkout_url", "payment_link", "redirect_url"]),
      fallbackUsed: true,
      raw: body,
    };
  } catch (error) {
    return { provider: "saaspay", simulated: false, status: "failed", fallbackUsed: true, reason: error instanceof Error ? error.message : "Saaspay request failed" };
  }
}

async function ashtechSupports(input: DirectPaymentInput) {
  const country = (input.countryCode ?? "CM").toUpperCase();
  const operator = (input.operator ?? "").trim();
  const envCountries = envList("ASHTECHPAY_SUPPORTED_COUNTRIES", ASHTECH_DEFAULT_COUNTRIES).map((item) => item.toUpperCase());
  const envOperators = envList("ASHTECHPAY_SUPPORTED_OPERATORS", ASHTECH_DEFAULT_OPERATORS).map((item) => item.toLowerCase());
  if (!envCountries.includes(country)) return false;
  if (operator && !envOperators.includes(operator.toLowerCase())) return false;

  const key = ashtechKey();
  if (!key || process.env.ASHTECHPAY_SKIP_CATALOG === "1") return true;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${ashtechBase()}/v1/countries`, { headers: { Authorization: `Bearer ${key}` }, signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!response.ok) return true;
    const body = await response.json();
    const text = JSON.stringify(body).toLowerCase();
    const countryFound = text.includes(country.toLowerCase());
    const operatorFound = !operator || text.includes(operator.toLowerCase());
    return countryFound && operatorFound;
  } catch {
    return true;
  }
}

export async function routeDirectPayment(input: DirectPaymentInput): Promise<PaymentRouteResult> {
  if (input.mode === "crypto") {
    return callAshtech(input);
  }
  const supported = await ashtechSupports(input);
  if (!supported) {
    const backup = await callSaaspay(input);
    return { ...backup, fallbackUsed: true, reason: backup.reason ?? "Country or operator unavailable on Ashtechpay" };
  }
  const primary = await callAshtech(input);
  if (!primary.simulated && primary.unsupported) {
    const backup = await callSaaspay(input);
    return { ...backup, fallbackUsed: true, reason: "Ashtechpay rejected this country/operator; Saaspay.me backup used" };
  }
  return primary;
}

export function providerColumns(result: PaymentRouteResult) {
  return {
    provider: result.provider,
    providerExternalId: result.externalId ?? "",
    providerCheckoutUrl: result.checkoutUrl ?? "",
    providerFallback: result.fallbackUsed,
    providerStatus: result.status,
  };
}

export function getProviderStatus() {
  return {
    primary: {
      name: "Ashtechpay Direct API",
      configured: Boolean(ashtechKey()),
      baseUrl: ashtechBase(),
      collectPath: process.env.ASHTECHPAY_COLLECT_PATH ?? "/v1/collect",
      cryptoPath: process.env.ASHTECHPAY_CRYPTO_COLLECT_PATH ?? "/v1/crypto/collect",
    },
    backup: {
      name: "Saaspay.me Direct API",
      configured: Boolean(saaspayKey()),
      baseUrl: saaspayBase(),
      collectPath: process.env.SAASPAY_COLLECT_PATH ?? "/payments/softpay/",
    },
    routing: {
      mobileMoneyPrimary: "Ashtechpay",
      mobileMoneyFallback: "Saaspay.me",
      fallbackCondition: "Country or operator unavailable on Ashtechpay",
      cryptoProvider: "Ashtechpay only",
    },
    supportedCountries: envList("ASHTECHPAY_SUPPORTED_COUNTRIES", ASHTECH_DEFAULT_COUNTRIES),
    supportedOperators: envList("ASHTECHPAY_SUPPORTED_OPERATORS", ASHTECH_DEFAULT_OPERATORS),
    environment: process.env.ASHTECHPAY_ENV ?? (ashtechKey().includes("test") ? "sandbox" : "demo"),
  };
}
