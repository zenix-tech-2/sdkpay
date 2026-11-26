import { COUNTRIES } from "@/data/countries";

export interface CatalogEntry {
  code: string;
  country: string;
  flag: string;
  iso: string;
}

const EXTRA: CatalogEntry[] = [
  { code: "INR", country: "Inde", flag: "🇮🇳", iso: "in" },
];

/** Full catalog for the "Add account" screen (deduped by wallet code). */
export const WALLET_CATALOG: CatalogEntry[] = (() => {
  const all: CatalogEntry[] = [
    ...COUNTRIES.map((c) => ({ code: c.wallet, country: c.name, flag: c.flag, iso: c.code.toLowerCase() })),
    ...EXTRA,
    { code: "USDT", country: "Crypto · Tron", flag: "₮", iso: "usdt" },
  ];
  const seen = new Set<string>();
  return all.filter((e) => (seen.has(e.code) ? false : (seen.add(e.code), true)));
})();

export function isoForWallet(code: string): string {
  return WALLET_CATALOG.find((c) => c.code === code)?.iso ?? "";
}

export function settlementOf(code: string): "XAF" | "XOF" | "USDT" {
  if (code === "USDT") return "USDT";
  if (code.startsWith("XOF")) return "XOF";
  return "XAF";
}

export function displayUnit(code: string) {
  return code === "USDT" ? "USDT" : "FCFA";
}
