export interface Country {
  name: string;
  code: string; // ISO
  dial: string;
  flag: string;
  currency: string;
  /** Per-country wallet code shown in the app (e.g. XOFB, XOFF, XAF) */
  wallet: string;
  operators: string[];
}

export const COUNTRIES: Country[] = [
  { name: "Bénin", code: "BJ", dial: "+229", flag: "🇧🇯", currency: "XOF", wallet: "XOFB", operators: ["Celtiis Money", "Coris Money", "MTN MoMo", "Moov Money"] },
  { name: "Burkina Faso", code: "BF", dial: "+226", flag: "🇧🇫", currency: "XOF", wallet: "XOFF", operators: ["Orange Money", "Moov Money", "Telecel Money", "Coris Money"] },
  { name: "Cameroun", code: "CM", dial: "+237", flag: "🇨🇲", currency: "XAF", wallet: "XAF", operators: ["MTN MoMo", "Orange Money"] },
  { name: "Centrafrique", code: "CF", dial: "+236", flag: "🇨🇫", currency: "XAF", wallet: "XAFCF", operators: ["Orange Money", "Moov Money"] },
  { name: "Congo", code: "CG", dial: "+242", flag: "🇨🇬", currency: "XAF", wallet: "XAFC", operators: ["MTN MoMo", "Airtel Money"] },
  { name: "Côte d'Ivoire", code: "CI", dial: "+225", flag: "🇨🇮", currency: "XOF", wallet: "XOFC", operators: ["Wave", "Orange Money", "MTN MoMo", "Moov Money"] },
  { name: "Gabon", code: "GA", dial: "+241", flag: "🇬🇦", currency: "XAF", wallet: "XAFG", operators: ["Airtel Money", "Moov Money"] },
  { name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭", currency: "GHS", wallet: "GHS", operators: ["MTN MoMo", "Vodafone Cash", "AirtelTigo"] },
  { name: "Guinée", code: "GN", dial: "+224", flag: "🇬🇳", currency: "GNF", wallet: "GNF", operators: ["Orange Money", "MTN MoMo"] },
  { name: "Guinée-Bissau", code: "GW", dial: "+245", flag: "🇬🇼", currency: "XOF", wallet: "XOFGW", operators: ["Orange Money", "MTN MoMo"] },
  { name: "Mali", code: "ML", dial: "+223", flag: "🇲🇱", currency: "XOF", wallet: "XOFM", operators: ["Orange Money", "Moov Money"] },
  { name: "Niger", code: "NE", dial: "+227", flag: "🇳🇪", currency: "XOF", wallet: "XOFN", operators: ["Airtel Money", "Moov Money", "Zamani"] },
  { name: "RD Congo", code: "CD", dial: "+243", flag: "🇨🇩", currency: "CDF", wallet: "CDF", operators: ["M-Pesa", "Orange Money", "Airtel Money"] },
  { name: "Sénégal", code: "SN", dial: "+221", flag: "🇸🇳", currency: "XOF", wallet: "XOFS", operators: ["Wave", "Orange Money", "Free Money"] },
  { name: "Tchad", code: "TD", dial: "+235", flag: "🇹🇩", currency: "XAF", wallet: "XAFTD", operators: ["Airtel Money", "Moov Money"] },
  { name: "Togo", code: "TG", dial: "+228", flag: "🇹🇬", currency: "XOF", wallet: "XOFT", operators: ["TMoney", "Moov Money"] },
  { name: "Nigéria", code: "NG", dial: "+234", flag: "🇳🇬", currency: "NGN", wallet: "NGN", operators: ["OPay", "PalmPay", "GTB"] },
  { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪", currency: "KES", wallet: "KES", operators: ["M-Pesa", "Airtel Money"] },
  { name: "Maroc", code: "MA", dial: "+212", flag: "🇲🇦", currency: "MAD", wallet: "MAD", operators: ["Inwi Money", "Orange Money"] },
  { name: "Tunisie", code: "TN", dial: "+216", flag: "🇹🇳", currency: "TND", wallet: "TND", operators: ["e-Dinar", "Flouci"] },
  { name: "Algérie", code: "DZ", dial: "+213", flag: "🇩🇿", currency: "DZD", wallet: "DZD", operators: ["CIB", "BaridiMob"] },
  { name: "Madagascar", code: "MG", dial: "+261", flag: "🇲🇬", currency: "MGA", wallet: "MGA", operators: ["MVola", "Orange Money", "Airtel Money"] },
  { name: "Rwanda", code: "RW", dial: "+250", flag: "🇷🇼", currency: "RWF", wallet: "RWF", operators: ["MTN MoMo", "Airtel Money"] },
  { name: "Sierra Leone", code: "SL", dial: "+232", flag: "🇸🇱", currency: "SLL", wallet: "SLL", operators: ["Orange Money", "Africell Money"] },
  { name: "Zambie", code: "ZM", dial: "+260", flag: "🇿🇲", currency: "ZMW", wallet: "ZMW", operators: ["MTN MoMo", "Airtel Money"] },
  { name: "Ouganda", code: "UG", dial: "+256", flag: "🇺🇬", currency: "UGX", wallet: "UGX", operators: ["MTN MoMo", "Airtel Money"] },
  { name: "Tanzanie", code: "TZ", dial: "+255", flag: "🇹🇿", currency: "TZS", wallet: "TZS", operators: ["M-Pesa", "Mixx by Yas", "Airtel Money"] },
  { name: "Zimbabwe", code: "ZW", dial: "+263", flag: "🇿🇼", currency: "ZWG", wallet: "ZWG", operators: ["EcoCash", "OneMoney"] },
  { name: "Malawi", code: "MW", dial: "+265", flag: "🇲🇼", currency: "MWK", wallet: "MWK", operators: ["Airtel Money", "TNM Mpamba"] },
  { name: "Mozambique", code: "MZ", dial: "+258", flag: "🇲🇿", currency: "MZN", wallet: "MZN", operators: ["M-Pesa", "mKesh"] },
  { name: "Éthiopie", code: "ET", dial: "+251", flag: "🇪🇹", currency: "ETB", wallet: "ETB", operators: ["M-Pesa", "telebirr"] },
  { name: "Afrique du Sud", code: "ZA", dial: "+27", flag: "🇿🇦", currency: "ZAR", wallet: "ZAR", operators: ["MTN MoMo", "Vodacom"] },
  { name: "Égypte", code: "EG", dial: "+20", flag: "🇪🇬", currency: "EGP", wallet: "EGP", operators: ["Vodafone Cash", "Orange Money"] },
];

export const DIAL_MAP: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.dial, c])
);

export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

/** Resolve the settlement wallet (XAF/XOF) for a per-country wallet code. */
export function baseWallet(walletCode: string): "XAF" | "XOF" {
  if (walletCode.startsWith("XOF")) return "XOF";
  return "XAF";
}

export interface Operator {
  name: string;
  short: string;
  color: string;
  textColor: string;
}

export const OPERATORS: Operator[] = [
  { name: "Airtel Money", short: "airtel", color: "#E40000", textColor: "#fff" },
  { name: "Vodacom", short: "vodacom", color: "#E60000", textColor: "#fff" },
  { name: "Wave", short: "wave", color: "#1DC1EC", textColor: "#fff" },
  { name: "Free Money", short: "Free", color: "#C4122E", textColor: "#fff" },
  { name: "Wizall Money", short: "Wizall", color: "#00A9CE", textColor: "#fff" },
  { name: "Zamani", short: "zamani", color: "#F5C400", textColor: "#7a5b00" },
  { name: "SmartCash", short: "smart", color: "#E40000", textColor: "#fff" },
  { name: "Telecel Money", short: "telecel", color: "#ED1C24", textColor: "#fff" },
  { name: "Moov Money", short: "Moov", color: "#0057A8", textColor: "#fff" },
  { name: "MTN MoMo", short: "MTN", color: "#FFCC00", textColor: "#111" },
  { name: "Mixx By Yas", short: "mixx", color: "#0057A8", textColor: "#fff" },
  { name: "M-Pesa", short: "M-PESA", color: "#4CAF50", textColor: "#fff" },
  { name: "Orange Money", short: "Orange", color: "#FF7900", textColor: "#fff" },
  { name: "Celtiis Money", short: "celtiis", color: "#123A8F", textColor: "#fff" },
  { name: "Coris Money", short: "coris", color: "#00A9E0", textColor: "#fff" },
  { name: "TMoney", short: "TMoney", color: "#0B6CB4", textColor: "#fff" },
];

const BRAND_MAP: Record<string, { short: string; bg: string; fg: string }> = Object.fromEntries(
  OPERATORS.map((o) => [o.name.toLowerCase(), { short: o.short, bg: o.color, fg: o.textColor }])
);

/** Brand tile for any operator name (with deterministic fallback color). */
export function operatorBrand(name: string): { short: string; bg: string; fg: string } {
  const hit = BRAND_MAP[name.toLowerCase()];
  if (hit) return hit;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const short = name.replace(/money|cash|momo/gi, "").trim().split(/\s+/)[0]?.slice(0, 8) || name.slice(0, 6);
  return { short, bg: `hsl(${h}, 65%, 42%)`, fg: "#fff" };
}
