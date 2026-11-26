export type ProviderName = "ashtechpay" | "saaspay" | "demo";

export type ProviderTxStatus = "pending" | "success" | "failed";

export interface RouteInput {
  countryCode: string; // ISO e.g. "CM"
  operator?: string; // display name e.g. "MTN MoMo"
  currency: string; // XAF | XOF | USDT | ...
  method: "momo" | "crypto";
}

export interface RouteDecision {
  provider: Exclude<ProviderName, "demo"> | "demo";
  live: boolean;
  reason: string;
}

export interface CollectParams {
  amount: number;
  currency: string;
  countryCode: string;
  phone: string;
  operator: string;
  reference: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface CollectResult {
  ok: boolean;
  providerRef?: string;
  status: ProviderTxStatus;
  checkoutUrl?: string | null;
  error?: string;
  raw?: unknown;
}

export interface DisburseParams {
  amount: number;
  currency: string;
  countryCode: string;
  phone: string;
  operator: string;
  reference: string;
  description?: string;
}

export interface CryptoChargeParams {
  amountUsdt: number;
  network: string; // TRC20 | BEP20 | ERC20
  countryCode?: string;
  reference: string;
}

export interface CryptoChargeResult {
  ok: boolean;
  address?: string;
  providerRef?: string;
  expiresIn?: number;
  error?: string;
  raw?: unknown;
}

export interface ProviderClient {
  name: Exclude<ProviderName, "demo">;
  label: string;
  isConfigured(): boolean;
  isSandbox(): boolean;
  supports(input: RouteInput): boolean;
  coverage(): { countries: string[]; note: string };
  collect(p: CollectParams): Promise<CollectResult>;
  disburse(p: DisburseParams): Promise<CollectResult>;
  getStatus(providerRef: string): Promise<{ status: ProviderTxStatus; raw?: unknown }>;
  cryptoCharge?(p: CryptoChargeParams): Promise<CryptoChargeResult>;
  cryptoDisburse?(p: { amountUsdt: number; network: string; address: string; reference: string }): Promise<CollectResult>;
}

export function providerMode(): "auto" | "ashtechpay" | "saaspay" | "demo" {
  const m = (process.env.PROVIDER_MODE || "auto").toLowerCase();
  if (m === "ashtechpay" || m === "saaspay" || m === "demo") return m;
  return "auto";
}

/** Simulation is only ever allowed when PROVIDER_MODE=demo is set explicitly. */
export function demoEnabled(): boolean {
  return providerMode() === "demo";
}
