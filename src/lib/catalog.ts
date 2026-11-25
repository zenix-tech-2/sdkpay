/**
 * Live provider catalog — used by the landing page to show REAL coverage.
 * SasPay's /countries/ is public; AshTech's /v1/countries requires the merchant
 * Direct API key (used when configured). Cached for 1 hour; falls back to a
 * static list when both providers are unreachable.
 */

export interface CoverageCountry {
  code: string;      // ISO 2-letter, lowercase for flagcdn
  name: string;
  currency: string;
  provider: "saspay" | "ashtech" | "both";
}

const AFRICAN = ["BJ","BF","CM","CF","CG","CD","CI","GA","GW","ML","NE","SN","TD","TG","SL","ZM","NG","GH","KE","UG","TZ","RW","MG","KM","CV","MR","GN","ET","MZ","AO"];

const STATIC_FALLBACK: CoverageCountry[] = [
  { code: "cm", name: "Cameroun", currency: "XAF", provider: "both" },
  { code: "bj", name: "Bénin", currency: "XOF", provider: "both" },
  { code: "ci", name: "Côte d'Ivoire", currency: "XOF", provider: "both" },
  { code: "sn", name: "Sénégal", currency: "XOF", provider: "both" },
  { code: "bf", name: "Burkina Faso", currency: "XOF", provider: "both" },
  { code: "tg", name: "Togo", currency: "XOF", provider: "both" },
  { code: "ml", name: "Mali", currency: "XOF", provider: "ashtech" },
  { code: "ne", name: "Niger", currency: "XOF", provider: "ashtech" },
  { code: "ga", name: "Gabon", currency: "XAF", provider: "ashtech" },
  { code: "cg", name: "Congo", currency: "XAF", provider: "ashtech" },
  { code: "cf", name: "Centrafrique", currency: "XAF", provider: "ashtech" },
  { code: "td", name: "Tchad", currency: "XAF", provider: "ashtech" },
  { code: "gw", name: "Guinée-Bissau", currency: "XOF", provider: "ashtech" },
  { code: "cd", name: "RD Congo", currency: "CDF", provider: "saspay" },
  { code: "sl", name: "Sierra Leone", currency: "SLE", provider: "ashtech" },
  { code: "zm", name: "Zambie", currency: "ZMW", provider: "ashtech" },
];

async function fetchSasPay(): Promise<Map<string, CoverageCountry>> {
  const map = new Map<string, CoverageCountry>();
  try {
    const res = await fetch("https://api.saspay.me/api/v1/countries/", { next: { revalidate: 3600 } });
    if (!res.ok) return map;
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any[] = json?.data ?? [];
    for (const c of list) {
      const code = String(c?.iso_code ?? "").toUpperCase();
      if (!code || !c?.is_active) continue;
      if (!AFRICAN.includes(code)) continue;
      map.set(code, { code: code.toLowerCase(), name: String(c?.name ?? code), currency: String(c?.default_currency ?? ""), provider: "saspay" });
    }
  } catch { /* provider unreachable — caller merges static fallback */ }
  return map;
}

async function fetchAshTech(): Promise<Map<string, CoverageCountry>> {
  const map = new Map<string, CoverageCountry>();
  const key = process.env.ASHTECH_API_KEY;
  if (!key) return map;
  try {
    const base = process.env.ASHTECH_BASE_URL || "https://www.ashtechpay.com/v1";
    const res = await fetch(`${base}/countries`, { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } });
    if (!res.ok) return map;
    const json = await res.json();
    // tolerate list/data/countries envelopes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = json?.data ?? json?.countries ?? json;
    const list: any[] = Array.isArray(raw) ? raw : Object.values(raw ?? {}).flat().filter(Array.isArray).flat();
    for (const c of list.flat(2)) {
      if (!c || typeof c !== "object") continue;
      const code = String(c.iso_code ?? c.country_code ?? c.code ?? c.iso2 ?? "").toUpperCase();
      if (!code || code.length !== 2 || !AFRICAN.includes(code)) continue;
      map.set(code, { code: code.toLowerCase(), name: String(c.name ?? c.country ?? code), currency: String(c.currency ?? c.default_currency ?? c.currency_code ?? ""), provider: "ashtech" });
    }
  } catch { /* ignore */ }
  return map;
}

export interface CoverageCatalog {
  countries: CoverageCountry[];      // African, active, merged from both providers
  totalActive: number;               // SasPay global active count (all regions)
  source: "live" | "fallback";
  fetchedAt: string;
}

export async function getCoverageCatalog(): Promise<CoverageCatalog> {
  const [saspay, ashtech] = await Promise.all([fetchSasPay(), fetchAshTech()]);
  const merged = new Map<string, CoverageCountry>();

  for (const [code, c] of saspay) merged.set(code, c);
  for (const [code, c] of ashtech) {
    const existing = merged.get(code);
    merged.set(code, existing ? { ...existing, provider: "both", name: existing.name || c.name, currency: existing.currency || c.currency } : c);
  }

  let totalActive = 0;
  try {
    const res = await fetch("https://api.saspay.me/api/v1/countries/", { next: { revalidate: 3600 } });
    const json = await res.json();
    totalActive = (json?.data ?? []).filter((c: { is_active?: boolean }) => c?.is_active).length;
  } catch { /* keep 0 */ }

  let countries = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  let source: CoverageCatalog["source"] = merged.size ? "live" : "fallback";
  if (!countries.length) countries = STATIC_FALLBACK;

  return { countries, totalActive, source, fetchedAt: new Date().toISOString() };
}
