/** USDT is stored as integer micro-units: 1 USDT = 10_000 units (4 decimals). */
export const USDT_UNIT = 10_000;
export const USDT_RATE_XAF = 600;
export const CRYPTO_DEPOSIT_FEE = 0.025;
export const CRYPTO_WITHDRAW_FEE_USDT = 1;

export function usdtToMicro(v: number) {
  return Math.round(v * USDT_UNIT);
}

export function microToUsdt(m: number) {
  return m / USDT_UNIT;
}

export function fmtUsdt(micro: number, decimals = 4) {
  return `${(micro / USDT_UNIT).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} USDT`;
}

export function fmtAmount(amount: number, currency: string) {
  if (currency === "USDT") return fmtUsdt(amount);
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

export interface CryptoNetwork {
  id: string;
  label: string;
  short: string;
  iconBg: string;
  iconText: string;
}

export const CRYPTO_NETWORKS: CryptoNetwork[] = [
  { id: "TRC20", label: "Tron (TRX)", short: "USDT.TRC20", iconBg: "#EB0029", iconText: "T" },
  { id: "BEP20", label: "BNB Chain", short: "USDT.BEP20", iconBg: "#F0B90B", iconText: "B" },
  { id: "ERC20", label: "Ethereum", short: "USDT.ERC20", iconBg: "#627EEA", iconText: "E" },
];

/** Deterministic demo deposit address derived from a seed string. */
export function demoTronAddress(seed: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = 2166136261;
  const mix = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  };
  mix(seed);
  let out = "T";
  for (let i = 0; i < 33; i++) {
    h = Math.imul(h ^ (h >>> 13), 16777619);
    out += alphabet[Math.abs(h) % alphabet.length];
  }
  return out;
}

export function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function hhmmss(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
