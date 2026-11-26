/**
 * Operator / provider logos.
 * LOCAL FILES FIRST (public/logos/operators/*, downloaded via scripts/fetch-assets.mjs),
 * then remote originals (Wikimedia Commons, Clearbit, Simple Icons),
 * then a branded color tile (never a broken image).
 */

function wiki(path: string, file: string, w = 256): string {
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${w}px-${file}.png`;
}

function clearbit(domain: string): string {
  return `https://logo.clearbit.com/${domain}?size=256`;
}

export interface LogoEntry {
  local?: string;
  src: string;
  fallback?: string;
}

const WIKI_MTN = wiki("2/2a", "MTN_2022_logo.svg");
const WIKI_ORANGE = wiki("c/c8", "Orange_logo.svg");
const WIKI_AIRTEL = wiki("f/fb", "Bharti_Airtel_Logo.svg");
const WIKI_MPESA = wiki("0/0b", "M-PESA.png");
const WIKI_FREE = wiki("5/52", "Free_logo.svg");
const WIKI_GTB = wiki("1/14", "GTBank_logo.svg");
const TETHER = "https://cdn.simpleicons.org/tether";

export const OPERATOR_LOGOS: Record<string, LogoEntry> = {
  "mtn momo": { src: WIKI_MTN, fallback: clearbit("mtn.com") },
  "mtn money": { src: WIKI_MTN, fallback: clearbit("mtn.com") },
  "mtn": { src: WIKI_MTN, fallback: clearbit("mtn.com") },
  "orange money": { local: "/logos/operators/si-orange.svg", src: WIKI_ORANGE, fallback: clearbit("orange.com") },
  "orange": { local: "/logos/operators/si-orange.svg", src: WIKI_ORANGE, fallback: clearbit("orange.com") },
  "airtel money": { local: "/logos/operators/si-airtel.svg", src: WIKI_AIRTEL, fallback: clearbit("airtel.africa") },
  "airtel": { local: "/logos/operators/si-airtel.svg", src: WIKI_AIRTEL, fallback: clearbit("airtel.africa") },
  "m-pesa": { src: WIKI_MPESA, fallback: clearbit("safaricom.co.ke") },
  "mpesa": { src: WIKI_MPESA, fallback: clearbit("safaricom.co.ke") },
  "free money": { src: WIKI_FREE, fallback: clearbit("free.sn") },
  "free": { src: WIKI_FREE, fallback: clearbit("free.sn") },
  "gtb": { src: WIKI_GTB, fallback: clearbit("gtbank.com") },
  "moov money": { src: clearbit("moov-africa.com") },
  "moov": { src: clearbit("moov-africa.com") },
  "wave": { src: clearbit("wave.com") },
  "tmoney": { src: clearbit("togocom.tg") },
  "t-money": { src: clearbit("togocom.tg") },
  "telecel money": { src: clearbit("telecelgroup.com") },
  "telecel": { src: clearbit("telecelgroup.com") },
  "coris money": { src: clearbit("coris.bank") },
  "coris": { src: clearbit("coris.bank") },
  "celtiis money": { src: clearbit("celtiis.bj") },
  "celtiis": { src: clearbit("celtiis.bj") },
  "vodacom": { src: clearbit("vodacom.com") },
  "vodafone cash": { local: "/logos/operators/si-vodafone.svg", src: clearbit("vodafone.com.gh") },
  "airteltigo": { src: clearbit("airteltigo.com.gh") },
  "opay": { src: clearbit("opay.com") },
  "palmpay": { src: clearbit("palmpay.com") },
  "inwi money": { src: clearbit("inwi.ma") },
  "inwi": { src: clearbit("inwi.ma") },
  "e-dinar": { src: clearbit("poste.tn") },
  "flouci": { src: clearbit("flouci.com") },
  "cib": { src: clearbit("cib.dz") },
  "baridimob": { src: clearbit("poste.dz") },
  "mvola": { src: clearbit("telma.mg") },
  "mixx by yas": { src: clearbit("yas.com") },
  "mixx": { src: clearbit("yas.com") },
  "wizall money": { src: clearbit("wizall.com") },
  "wizall": { src: clearbit("wizall.com") },
  "smartcash": { src: clearbit("smartcashpsb.ng") },
  "zamani": { src: clearbit("zamani.ne") },
  "africell money": { src: clearbit("africell.sl") },
  "africell": { src: clearbit("africell.sl") },
  "ecocash": { src: clearbit("ecocash.co.zw") },
  "onemoney": { src: clearbit("netone.co.zw") },
  "tnm mpamba": { src: clearbit("tnm.co.mw") },
  "mkesh": { src: clearbit("tmcel.mz") },
  "telebirr": { src: clearbit("ethiotelecom.et") },
  "cbe birr": { src: clearbit("cbe.com.et") },
  "visa / mastercard": { local: "/logos/operators/si-visa.svg", src: clearbit("visa.com"), fallback: clearbit("mastercard.com") },
  "visa": { local: "/logos/operators/si-visa.svg", src: clearbit("visa.com") },
  "mastercard": { local: "/logos/operators/si-mastercard.svg", src: clearbit("mastercard.com") },
  "usdt": { local: "/logos/operators/usdt.svg", src: TETHER },
  "tether": { local: "/logos/operators/tether.svg", src: TETHER },
  "usdt (trc20)": { local: "/logos/operators/usdt-trc20.svg", src: TETHER },
  "usdt (bep20)": { local: "/logos/operators/usdt-bep20.svg", src: TETHER },
  "usdt (erc20)": { local: "/logos/operators/usdt-erc20.svg", src: TETHER },
  "bitcoin": { local: "/logos/operators/bitcoin.svg", src: "https://cdn.simpleicons.org/bitcoin" },
  "tron (trx)": { src: "https://cdn.simpleicons.org/tron" },
  "bnb chain": { local: "/logos/operators/bnb-chain.svg", src: "https://cdn.simpleicons.org/bnbchain" },
  "ethereum": { src: "https://cdn.simpleicons.org/ethereum" },
};

export function logoFor(name: string): LogoEntry | null {
  const key = name.trim().toLowerCase();
  if (OPERATOR_LOGOS[key]) return OPERATOR_LOGOS[key];
  const stripped = key.replace(/\s(money|cash|momo)$/, "");
  if (OPERATOR_LOGOS[stripped]) return OPERATOR_LOGOS[stripped];
  return null;
}

/** Ordered URL chain for a name: local file -> remote -> remote fallback. */
export function logoChain(name: string): string[] {
  const e = logoFor(name);
  if (!e) return [];
  return [e.local, e.src, e.fallback].filter((u): u is string => !!u);
}
