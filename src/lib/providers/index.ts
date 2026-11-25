/**
 * Provider router — AshTech Pay (primary, Direct API) with SasPay (backup) failover.
 *
 * Failover policy: if AshTech reports the operator/country as unavailable
 * (4xx with catalog/operator/country/network wording, or 5xx, or a network
 * error/timeout), the call is retried once on SasPay. Auth errors (401/403)
 * and rate limits (429) never fail over — they surface so they get fixed.
 *
 * If neither provider is configured the router returns a `local` result so the
 * product keeps working in demo mode (transactions settle via polling).
 */
import * as ashtech from "./ashtech";
import * as saspay from "./saspay";
import {
  CollectInput, CollectResult, PayoutInput, PayoutResult, VerifyResult,
  ProviderHttpError, ProviderNetworkError,
} from "./types";

export const providersConfigured = () => ({
  primary: ashtech.ashtechAvailable() ? ("ashtech" as const) : null,
  backup: saspay.saspayAvailable() ? ("saspay" as const) : null,
});

const unavailableRe = /country|operator|network|unavailable|unsupported|not.?found|not.?supported|no.?match|catalog|inactive|disabled|unassign/i;

function shouldFailover(e: unknown): boolean {
  if (e instanceof ProviderNetworkError) return true;
  if (e instanceof ProviderHttpError) {
    if (e.status === 401 || e.status === 403 || e.status === 429) return false;
    if (e.status >= 500) return true;
    if ([400, 404, 410, 422, 424].includes(e.status) && unavailableRe.test(e.body ?? e.message)) return true;
    // SasPay raises 422 prepayment_otp_missing etc. — those are valid on SasPay too; still try backup
    if (e.status === 422) return true;
    return false;
  }
  return false;
}

export async function collectWithFallback(input: CollectInput): Promise<CollectResult> {
  if (ashtech.ashtechAvailable()) {
    try {
      return await ashtech.collect(input);
    } catch (e) {
      if (!shouldFailover(e) || !saspay.saspayAvailable()) throw e;
      // else fall through to SasPay
    }
  }
  if (saspay.saspayAvailable()) {
    return saspay.collect(input);
  }
  return { provider: "local", providerRef: null, status: "pending", rawStatus: "LOCAL_DEMO" };
}

export async function payoutWithFallback(input: PayoutInput): Promise<PayoutResult> {
  if (ashtech.ashtechAvailable()) {
    try {
      return await ashtech.payout(input);
    } catch (e) {
      if (!shouldFailover(e) || !saspay.saspayAvailable()) throw e;
    }
  }
  if (saspay.saspayAvailable()) {
    return saspay.payout(input);
  }
  return { provider: "local", providerRef: null, status: "pending", rawStatus: "LOCAL_DEMO" };
}

export async function verifyProviderRef(provider: string, providerRef: string): Promise<VerifyResult> {
  if (provider === "ashtech") return ashtech.verify(providerRef);
  if (provider === "saspay") return saspay.verify(providerRef);
  throw new Error(`Provider ${provider} cannot verify references`);
}

export { ashtech, saspay };
