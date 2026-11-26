import { db } from "@/db";
import { platformSettings } from "@/db/schema";

export const FEE_DEFAULTS = {
  momo_fee: "0.04",
  crypto_deposit_fee: "0.025",
  crypto_flat_fee_usdt: "1",
  min_deposit: "100",
  min_withdraw: "550",
  max_withdraw: "2000000",
  min_crypto_deposit: "1",
  max_crypto_withdraw: "1500",
  manual_withdrawals: "false",
};

let cache: Record<string, string> | null = null;
let cachedAt = 0;

export async function getFeeConfig(): Promise<Record<string, string>> {
  if (cache && Date.now() - cachedAt < 30000) return { ...FEE_DEFAULTS, ...cache };
  try {
    const rows = await db.select().from(platformSettings);
    cache = {};
    rows.forEach((r) => {
      cache![r.key] = r.value;
    });
    cachedAt = Date.now();
  } catch {
    cache = {};
  }
  return { ...FEE_DEFAULTS, ...cache };
}

export function num(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
