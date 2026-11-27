import { db } from "@/db";
import { providerEvents } from "@/db/schema";
import { ashtechpay } from "./ashtechpay";
import { saaspay } from "./saaspay";
import type {
  CollectParams,
  CollectResult,
  CryptoChargeParams,
  CryptoChargeResult,
  DisburseParams,
  ProviderClient,
  ProviderName,
  RouteDecision,
  RouteInput,
} from "./types";
import { providerMode, demoEnabled } from "./types";

/**
 * Routing policy:
 *  - Crypto            -> AshTechPay Direct (always; demo-simulated without a key)
 *  - Mobile Money      -> AshTechPay if it covers country+operator, else SasPay backup
 *  - On primary error  -> automatic failover to SasPay (when it covers + is configured)
 *  - No keys configured -> transparent demo mode (simulation, marked provider "demo")
 */

export function selectProvider(input: RouteInput): RouteDecision {
  const mode = providerMode();
  const cc = input.countryCode.toUpperCase();

  if (input.method === "crypto") {
    if (ashtechpay.isConfigured() && mode !== "demo" && mode !== "saaspay") {
      return { provider: "ashtechpay", live: true, reason: "Crypto via AshTechPay Direct (live)" };
    }
    return { provider: "demo", live: false, reason: "AshTechPay key missing — crypto simulated (demo)" };
  }

  if (mode === "demo") return { provider: "demo", live: false, reason: "PROVIDER_MODE=demo" };
  if (mode === "ashtechpay") {
    return ashtechpay.isConfigured()
      ? { provider: "ashtechpay", live: true, reason: "Forced AshTechPay (PROVIDER_MODE)" }
      : { provider: "demo", live: false, reason: "AshTechPay forced but key missing — demo" };
  }
  if (mode === "saaspay") {
    return saaspay.isConfigured()
      ? { provider: "saaspay", live: true, reason: "Forced SasPay (PROVIDER_MODE)" }
      : { provider: "demo", live: false, reason: "SasPay forced but key missing — demo" };
  }

  // auto
  if (ashtechpay.supports(input)) {
    if (ashtechpay.isConfigured()) {
      return { provider: "ashtechpay", live: true, reason: `AshTechPay covers ${cc}${input.operator ? ` / ${input.operator}` : ""}` };
    }
    return { provider: "demo", live: false, reason: `AshTechPay covers ${cc} but key missing — demo` };
  }
  if (saaspay.supports(input)) {
    if (saaspay.isConfigured()) {
      return {
        provider: "saaspay",
        live: true,
        reason: `AshTechPay lacks ${cc}${input.operator ? ` / ${input.operator}` : ""} — SasPay backup`,
      };
    }
    return { provider: "demo", live: false, reason: `SasPay would cover ${cc} but key missing — demo` };
  }
  return { provider: "demo", live: false, reason: `No provider covers ${cc} — demo` };
}

export function clientFor(name: ProviderName): ProviderClient | null {
  if (name === "ashtechpay") return ashtechpay;
  if (name === "saaspay") return saaspay;
  return null;
}

export async function logEvent(e: {
  txId?: string;
  userId?: string;
  provider: string;
  action: string;
  status?: string;
  message?: string;
}) {
  try {
    await db.insert(providerEvents).values({
      txId: e.txId,
      userId: e.userId,
      provider: e.provider,
      action: e.action,
      status: e.status || "ok",
      message: e.message,
    });
  } catch {
    /* logging must never break payments */
  }
}

const UNAVAILABLE =
  "Mobile Money is not available for this country or operator right now. Please try another option. No amount was debited.";

function demoRef(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-DEMO-${s}`;
}

export async function executeCollect(
  p: CollectParams & { countryCode: string },
  ctx: { txId?: string; userId?: string } = {}
): Promise<CollectResult & { provider: ProviderName; live: boolean; reason: string }> {
  const decision = selectProvider({ countryCode: p.countryCode, operator: p.operator, currency: p.currency, method: "momo" });
  const tryOrder: ProviderName[] = [decision.provider];
  // automatic failover: primary error -> backup (if it covers the route)
  if (
    decision.provider === "ashtechpay" &&
    saaspay.isConfigured() &&
    saaspay.supports({ countryCode: p.countryCode, operator: p.operator, currency: p.currency, method: "momo" })
  ) {
    tryOrder.push("saaspay");
  }

  for (const name of tryOrder) {
    const client = clientFor(name);
    if (!client) continue;
    const res = await client.collect(p);
    await logEvent({
      txId: ctx.txId,
      userId: ctx.userId,
      provider: name,
      action: "collect",
      status: res.ok ? "ok" : "error",
      message: res.ok ? `ref=${res.providerRef} status=${res.status}` : res.error,
    });
    if (res.ok) {
      return {
        ...res,
        provider: name,
        live: true,
        reason: name === decision.provider ? decision.reason : `Failover to SasPay after AshTechPay error`,
      };
    }
    if (name === "ashtechpay" && tryOrder.includes("saaspay")) continue;
    // last resort for this provider and it errored: fall through to demo only if it was a coverage miss
    return { ...res, provider: name, live: true, reason: decision.reason };
  }

  if (!demoEnabled()) {
    await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "collect", status: "error", message: decision.reason });
    return { ok: false, status: "failed", error: UNAVAILABLE, provider: "demo", live: true, reason: decision.reason };
  }
  await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "collect", message: decision.reason });
  return {
    ok: true,
    provider: "demo",
    live: false,
    reason: decision.reason,
    providerRef: demoRef(decision.provider === "saaspay" ? "SSP" : "ASH"),
    status: "pending",
  };
}

export async function executeDisburse(
  p: DisburseParams & { countryCode: string },
  ctx: { txId?: string; userId?: string } = {}
): Promise<CollectResult & { provider: ProviderName; live: boolean; reason: string }> {
  const decision = selectProvider({ countryCode: p.countryCode, operator: p.operator, currency: p.currency, method: "momo" });
  const tryOrder: ProviderName[] = [decision.provider];
  if (
    decision.provider === "ashtechpay" &&
    saaspay.isConfigured() &&
    saaspay.supports({ countryCode: p.countryCode, operator: p.operator, currency: p.currency, method: "momo" })
  ) {
    tryOrder.push("saaspay");
  }

  for (const name of tryOrder) {
    const client = clientFor(name);
    if (!client) continue;
    const res = await client.disburse(p);
    await logEvent({
      txId: ctx.txId,
      userId: ctx.userId,
      provider: name,
      action: "disburse",
      status: res.ok ? "ok" : "error",
      message: res.ok ? `ref=${res.providerRef} status=${res.status}` : res.error,
    });
    if (res.ok) {
      return {
        ...res,
        provider: name,
        live: true,
        reason: name === decision.provider ? decision.reason : `Failover to SasPay after AshTechPay error`,
      };
    }
    if (name === "ashtechpay" && tryOrder.includes("saaspay")) continue;
    return { ...res, provider: name, live: true, reason: decision.reason };
  }

  if (!demoEnabled()) {
    await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "disburse", status: "error", message: decision.reason });
    return { ok: false, status: "failed", error: UNAVAILABLE, provider: "demo", live: true, reason: decision.reason };
  }
  await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "disburse", message: decision.reason });
  return {
    ok: true,
    provider: "demo",
    live: false,
    reason: decision.reason,
    providerRef: demoRef(decision.provider === "saaspay" ? "SSP" : "ASH"),
    status: "success",
  };
}

export async function executeCryptoCharge(
  p: CryptoChargeParams,
  ctx: { txId?: string; userId?: string } = {}
): Promise<CryptoChargeResult & { provider: ProviderName; live: boolean; reason: string }> {
  const decision = selectProvider({ countryCode: p.countryCode || "CM", currency: "USDT", method: "crypto" });
  if (decision.provider === "ashtechpay") {
    const res = await ashtechpay.cryptoCharge!({ ...p, userId: p.userId ?? ctx.userId });
    await logEvent({
      txId: ctx.txId,
      userId: ctx.userId,
      provider: "ashtechpay",
      action: "crypto_charge",
      status: res.ok ? "ok" : "error",
      message: res.ok ? `ref=${res.providerRef}` : res.error,
    });
    if (res.ok) return { ...res, provider: "ashtechpay" as ProviderName, live: true, reason: decision.reason };
    return { ...res, provider: "ashtechpay" as ProviderName, live: true, reason: decision.reason };
  }
  if (!demoEnabled()) {
    await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "crypto_charge", status: "error", message: decision.reason });
    return { ok: false, error: "Crypto deposits are not available right now. Please try again later.", provider: "demo", live: true, reason: decision.reason };
  }
  await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "crypto_charge", message: decision.reason });
  return { ok: true, provider: "demo", live: false, reason: decision.reason };
}

export async function executeCryptoDisburse(
  p: { amountUsdt: number; network: string; address: string; reference: string; countryCode?: string },
  ctx: { txId?: string; userId?: string } = {}
): Promise<CollectResult & { provider: ProviderName; live: boolean; reason: string }> {
  const decision = selectProvider({ countryCode: p.countryCode || "CM", currency: "USDT", method: "crypto" });
  if (decision.provider === "ashtechpay" && ashtechpay.cryptoDisburse) {
    const res = await ashtechpay.cryptoDisburse({ ...p, userId: ctx.userId });
    await logEvent({
      txId: ctx.txId,
      userId: ctx.userId,
      provider: "ashtechpay",
      action: "crypto_disburse",
      status: res.ok ? "ok" : "error",
      message: res.ok ? `ref=${res.providerRef} status=${res.status}` : res.error,
    });
    return { ...res, provider: "ashtechpay" as ProviderName, live: true, reason: decision.reason };
  }
  if (!demoEnabled()) {
    await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "crypto_disburse", status: "error", message: decision.reason });
    return { ok: false, status: "failed", error: "Crypto withdrawals are not available right now. No amount debited.", provider: "demo", live: true, reason: decision.reason };
  }
  await logEvent({ txId: ctx.txId, userId: ctx.userId, provider: "demo", action: "crypto_disburse", message: decision.reason });
  return { ok: true, provider: "demo", live: false, reason: decision.reason, providerRef: `ASH-DEMO-CP${Date.now().toString(36).toUpperCase()}`, status: "success" };
}

export async function queryProviderStatus(
  provider: ProviderName,
  providerRef: string
): Promise<{ status: "pending" | "success" | "failed" }> {
  const client = clientFor(provider);
  if (!client || !providerRef || providerRef.includes("DEMO")) return { status: "pending" };
  try {
    return await client.getStatus(providerRef);
  } catch {
    return { status: "pending" };
  }
}
