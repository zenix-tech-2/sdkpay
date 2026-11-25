export type CountryEntry = {
  name: string;
  code: string; // flagcdn code
  currency: string; // wallet currency code shown in lists
  operators: { id: string; name: string; brand: string; text: string }[];
};

export const COUNTRIES: CountryEntry[] = [
  { name: "Bénin", code: "bj", currency: "XOFB", operators: [
    { id: "CELTIS_MONEY", name: "Celtiis Money", brand: "#1b3a6b", text: "celtiis" },
    { id: "CORIS_MONEY", name: "Coris Money", brand: "#0e9bd8", text: "coris" },
    { id: "MOOV_MONEY", name: "Moov Money", brand: "#0057a8", text: "moov" },
  ]},
  { name: "Burkina Faso", code: "bf", currency: "XOFF", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
    { id: "MOOV_MONEY", name: "Moov Money", brand: "#0057a8", text: "moov" },
  ]},
  { name: "Cameroun", code: "cm", currency: "XAF", operators: [
    { id: "MTN_MONEY", name: "MTN Money", brand: "#ffcb05", text: "MTN" },
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
  ]},
  { name: "Centrafrique", code: "cf", currency: "XAFCF", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
  ]},
  { name: "Congo", code: "cg", currency: "XAFC", operators: [
    { id: "AIRTEL_MONEY", name: "Airtel Money", brand: "#e40000", text: "airtel" },
  ]},
  { name: "Côte d'Ivoire", code: "ci", currency: "XOFC", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
    { id: "MTN_MONEY", name: "MTN Money", brand: "#ffcb05", text: "MTN" },
    { id: "WAVE", name: "Wave", brand: "#00aaff", text: "wave" },
  ]},
  { name: "Gabon", code: "ga", currency: "XAFG", operators: [
    { id: "AIRTEL_MONEY", name: "Airtel Money", brand: "#e40000", text: "airtel" },
  ]},
  { name: "Guinée-Bissau", code: "gw", currency: "XOFGW", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
  ]},
  { name: "Mali", code: "ml", currency: "XOFM", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
    { id: "MOOV_MONEY", name: "Moov Money", brand: "#0057a8", text: "moov" },
  ]},
  { name: "Niger", code: "ne", currency: "XOFN", operators: [
    { id: "AIRTEL_MONEY", name: "Airtel Money", brand: "#e40000", text: "airtel" },
    { id: "MOOV_MONEY", name: "Moov Money", brand: "#0057a8", text: "moov" },
  ]},
  { name: "RD Congo", code: "cd", currency: "CDF", operators: [
    { id: "MPESA", name: "M-Pesa", brand: "#4bb748", text: "M-Pesa" },
    { id: "AIRTEL_MONEY", name: "Airtel Money", brand: "#e40000", text: "airtel" },
  ]},
  { name: "Sénégal", code: "sn", currency: "XOFS", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
    { id: "WAVE", name: "Wave", brand: "#00aaff", text: "wave" },
  ]},
  { name: "Tchad", code: "td", currency: "XAFTD", operators: [
    { id: "AIRTEL_MONEY", name: "Airtel Money", brand: "#e40000", text: "airtel" },
  ]},
  { name: "Togo", code: "tg", currency: "XOFT", operators: [
    { id: "FLOOZ", name: "Flooz", brand: "#0057a8", text: "flooz" },
    { id: "TMONEY", name: "TMoney", brand: "#f47b20", text: "tmoney" },
  ]},
  { name: "Sierra Leone", code: "sl", currency: "SLE", operators: [
    { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
  ]},
  { name: "Zambie", code: "zm", currency: "ZMW", operators: [
    { id: "MTN_MONEY", name: "MTN Money", brand: "#ffcb05", text: "MTN" },
  ]},
  { name: "Inde", code: "in", currency: "INR", operators: [
    { id: "PAYTM", name: "Paytm", brand: "#00baf2", text: "paytm" },
  ]},
];

export const flagUrl = (code: string, size: 40 | 80 = 80) =>
  `https://flagcdn.com/w${size}/${code}.png`;

/** wallets offered in "Add account" including crypto */
export const WALLET_OPTIONS = [
  ...COUNTRIES.map((c) => ({ code: c.code, name: c.name, currency: c.currency, crypto: false })),
  { code: "us", name: "United States", currency: "USD", crypto: false },
  { code: "eu", name: "Zone Euro", currency: "EUR", crypto: false },
  { code: "gb", name: "Royaume-Uni", currency: "GBP", crypto: false },
  { code: "xx", name: "Crypto · Tron", currency: "USDT", crypto: true },
];
