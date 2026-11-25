/** Shared types for payment provider adapters (AshTech Direct API + SasPay). */

export type ProviderId = "ashtech" | "saspay" | "local";
export type NormalizedStatus = "pending" | "completed" | "failed";

export interface CollectInput {
  amount: number;          // major units (e.g. 500 = 500 FCFA)
  currency: string;        // XAF | XOF | USDT | ...
  countryCode: string;     // ISO 2-letter, e.g. CM
  countryName: string;     // display name for logs/customer payloads
  operator: string;        // operator label, e.g. "MTN Money" (AshTech) — router resolves SasPay network code
  phone: string;           // customer MSISDN
  reference: string;       // our unique merchant reference
  customerEmail?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  notifyUrl?: string | null;
}

export interface CollectResult {
  provider: ProviderId;
  providerRef: string | null;
  status: NormalizedStatus;
  checkoutUrl?: string | null;
  creditedAmount?: number | null;
  rawStatus?: string | null;
  raw?: unknown;
}

export interface VerifyResult {
  provider: ProviderId;
  providerRef: string;
  status: NormalizedStatus;
  creditedAmount?: number | null;
  feeAmount?: number | null;
  rawStatus?: string | null;
}

export interface PayoutInput {
  amount: number;
  currency: string;
  countryCode: string;
  countryName: string;
  operator: string;
  phone: string;
  recipientName?: string | null;
  reference: string;
  notifyUrl?: string | null;
}

export interface PayoutResult {
  provider: ProviderId;
  providerRef: string | null;
  status: NormalizedStatus;
  rawStatus?: string | null;
}

/** HTTP-level provider failure — carries the response so the router can decide whether to fail over. */
export class ProviderHttpError extends Error {
  constructor(
    public readonly provider: ProviderId,
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "ProviderHttpError";
  }
}

/** Network timeout / DNS / socket failure. */
export class ProviderNetworkError extends Error {
  constructor(public readonly provider: ProviderId, message: string) {
    super(message);
    this.name = "ProviderNetworkError";
  }
}
