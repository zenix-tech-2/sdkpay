// Generated from bundled open-source logo assets. See public/logos/CREDITS.md.

export type ProviderIconEntry = {
  name: string; slug: string; short: string; bg: string; color: string;
  category: "mobile_money" | "provider" | "card" | "wallet" | "crypto";
  countries: string[]; aliases: string[]; logo: string; fallback: string;
};

export type CountryIconEntry = { code: string; name: string; icon: string; flag: string };
export type RegionIconEntry = { code: string; country: string; name: string; icon: string };

export const providerCatalog: ProviderIconEntry[] = [
  {
    "name": "SDK Pay",
    "slug": "sdk-pay",
    "short": "SDK",
    "bg": "#1d2a77",
    "color": "#ffb800",
    "category": "provider",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "SDKPay",
      "SDK pay"
    ],
    "logo": "/logos/providers/generated/sdk-pay.svg",
    "fallback": "/logos/providers/generated/sdk-pay.svg"
  },
  {
    "name": "MTN Money",
    "slug": "mtn-money",
    "short": "MTN",
    "bg": "#ffcb05",
    "color": "#111827",
    "category": "mobile_money",
    "countries": [
      "CM",
      "GH",
      "UG",
      "RW",
      "ZM",
      "BJ",
      "CI",
      "NG"
    ],
    "aliases": [
      "MTN MoMo",
      "MTN Mobile Money",
      "MTN"
    ],
    "logo": "/logos/providers/mtn.svg",
    "fallback": "/logos/providers/generated/mtn-money.svg"
  },
  {
    "name": "Orange Money",
    "slug": "orange-money",
    "short": "OM",
    "bg": "#ff7900",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "CM",
      "CI",
      "SN",
      "BF",
      "MG",
      "KE"
    ],
    "aliases": [
      "Orange",
      "Orange Money CI"
    ],
    "logo": "/logos/providers/orange-money.svg",
    "fallback": "/logos/providers/generated/orange-money.svg"
  },
  {
    "name": "Wave",
    "slug": "wave",
    "short": "W",
    "bg": "#16b9e5",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "SN",
      "CI",
      "UG"
    ],
    "aliases": [
      "Wave Mobile Money"
    ],
    "logo": "/logos/providers/wave.svg",
    "fallback": "/logos/providers/generated/wave.svg"
  },
  {
    "name": "Moov Money",
    "slug": "moov-money",
    "short": "M",
    "bg": "#004a9f",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "BJ",
      "CI",
      "BF",
      "TG",
      "GA",
      "NE"
    ],
    "aliases": [
      "Moov Africa",
      "Moov"
    ],
    "logo": "/logos/providers/moov-money.svg",
    "fallback": "/logos/providers/generated/moov-money.svg"
  },
  {
    "name": "Airtel Money",
    "slug": "airtel-money",
    "short": "A",
    "bg": "#e5002b",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "NG",
      "UG",
      "KE",
      "TZ",
      "ZM",
      "MG",
      "TD",
      "GA",
      "CG",
      "CD"
    ],
    "aliases": [
      "Airtel",
      "AirtelTigo Money"
    ],
    "logo": "/logos/providers/airtel-money.svg",
    "fallback": "/logos/providers/generated/airtel-money.svg"
  },
  {
    "name": "M-Pesa",
    "slug": "m-pesa",
    "short": "M-P",
    "bg": "#0c9b4a",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "KE",
      "TZ",
      "CD",
      "MZ",
      "LS",
      "GH"
    ],
    "aliases": [
      "Safaricom M-Pesa",
      "Vodacom M-Pesa",
      "Mpesa"
    ],
    "logo": "/logos/providers/generated/m-pesa.svg",
    "fallback": "/logos/providers/generated/m-pesa.svg"
  },
  {
    "name": "Vodacom M-Pesa",
    "slug": "vodacom-m-pesa",
    "short": "VM",
    "bg": "#e60000",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "CD",
      "MZ",
      "TZ",
      "LS"
    ],
    "aliases": [
      "Vodacom"
    ],
    "logo": "/logos/providers/generated/vodacom-m-pesa.svg",
    "fallback": "/logos/providers/generated/vodacom-m-pesa.svg"
  },
  {
    "name": "Tigo Pesa",
    "slug": "tigo-pesa",
    "short": "TP",
    "bg": "#003b8e",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "TZ"
    ],
    "aliases": [
      "Tigo Cash",
      "Tigo"
    ],
    "logo": "/logos/providers/generated/tigo-pesa.svg",
    "fallback": "/logos/providers/generated/tigo-pesa.svg"
  },
  {
    "name": "AirtelTigo Money",
    "slug": "airteltigo-money",
    "short": "AT",
    "bg": "#e5002b",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "GH"
    ],
    "aliases": [
      "AirtelTigo"
    ],
    "logo": "/logos/providers/generated/airteltigo-money.svg",
    "fallback": "/logos/providers/generated/airteltigo-money.svg"
  },
  {
    "name": "Telecel Cash",
    "slug": "telecel-cash",
    "short": "TC",
    "bg": "#e30613",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "GH"
    ],
    "aliases": [
      "Telecel"
    ],
    "logo": "/logos/providers/generated/telecel-cash.svg",
    "fallback": "/logos/providers/generated/telecel-cash.svg"
  },
  {
    "name": "Free Money",
    "slug": "free-money",
    "short": "FREE",
    "bg": "#c8102e",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "SN"
    ],
    "aliases": [
      "Free"
    ],
    "logo": "/logos/providers/generated/free-money.svg",
    "fallback": "/logos/providers/generated/free-money.svg"
  },
  {
    "name": "Celtiis Money",
    "slug": "celtiis-money",
    "short": "CLT",
    "bg": "#101f4f",
    "color": "#ffd23f",
    "category": "mobile_money",
    "countries": [
      "BJ"
    ],
    "aliases": [
      "Celtiis"
    ],
    "logo": "/logos/providers/generated/celtiis-money.svg",
    "fallback": "/logos/providers/generated/celtiis-money.svg"
  },
  {
    "name": "Coris Money",
    "slug": "coris-money",
    "short": "COR",
    "bg": "#05a6e6",
    "color": "#ffe45c",
    "category": "mobile_money",
    "countries": [
      "BJ",
      "BF",
      "CI"
    ],
    "aliases": [
      "Coris"
    ],
    "logo": "/logos/providers/generated/coris-money.svg",
    "fallback": "/logos/providers/generated/coris-money.svg"
  },
  {
    "name": "Mascom MyZaka",
    "slug": "mascom-myzaka",
    "short": "MZ",
    "bg": "#0b5cab",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "BW"
    ],
    "aliases": [
      "Mascom"
    ],
    "logo": "/logos/providers/generated/mascom-myzaka.svg",
    "fallback": "/logos/providers/generated/mascom-myzaka.svg"
  },
  {
    "name": "BTC Smega",
    "slug": "btc-smega",
    "short": "SM",
    "bg": "#0a7a43",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "BW"
    ],
    "aliases": [
      "Smega"
    ],
    "logo": "/logos/providers/generated/btc-smega.svg",
    "fallback": "/logos/providers/generated/btc-smega.svg"
  },
  {
    "name": "Telebirr",
    "slug": "telebirr",
    "short": "TB",
    "bg": "#0e8a4f",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "ET"
    ],
    "aliases": [
      "Ethio Telecom"
    ],
    "logo": "/logos/providers/generated/telebirr.svg",
    "fallback": "/logos/providers/generated/telebirr.svg"
  },
  {
    "name": "MVola",
    "slug": "mvola",
    "short": "MV",
    "bg": "#e4002b",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "MG"
    ],
    "aliases": [
      "Mvola"
    ],
    "logo": "/logos/providers/generated/mvola.svg",
    "fallback": "/logos/providers/generated/mvola.svg"
  },
  {
    "name": "TNM Mpamba",
    "slug": "tnm-mpamba",
    "short": "MP",
    "bg": "#0057a8",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "MW"
    ],
    "aliases": [
      "Mpamba"
    ],
    "logo": "/logos/providers/generated/tnm-mpamba.svg",
    "fallback": "/logos/providers/generated/tnm-mpamba.svg"
  },
  {
    "name": "e-Mola",
    "slug": "e-mola",
    "short": "EM",
    "bg": "#f26522",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "MZ"
    ],
    "aliases": [
      "eMola"
    ],
    "logo": "/logos/providers/generated/e-mola.svg",
    "fallback": "/logos/providers/generated/e-mola.svg"
  },
  {
    "name": "mKesh",
    "slug": "mkesh",
    "short": "MK",
    "bg": "#7b2cbf",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "MZ"
    ],
    "aliases": [
      "Mkesh"
    ],
    "logo": "/logos/providers/generated/mkesh.svg",
    "fallback": "/logos/providers/generated/mkesh.svg"
  },
  {
    "name": "MTC Money",
    "slug": "mtc-money",
    "short": "MTC",
    "bg": "#d71920",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "NA"
    ],
    "aliases": [
      "MTC"
    ],
    "logo": "/logos/providers/generated/mtc-money.svg",
    "fallback": "/logos/providers/generated/mtc-money.svg"
  },
  {
    "name": "Africell Money",
    "slug": "africell-money",
    "short": "AFR",
    "bg": "#ed1c24",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "SL",
      "GM"
    ],
    "aliases": [
      "Africell"
    ],
    "logo": "/logos/providers/generated/africell-money.svg",
    "fallback": "/logos/providers/generated/africell-money.svg"
  },
  {
    "name": "Zamtel Kwacha",
    "slug": "zamtel-kwacha",
    "short": "ZK",
    "bg": "#009f4d",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "ZM"
    ],
    "aliases": [
      "Zamtel"
    ],
    "logo": "/logos/providers/generated/zamtel-kwacha.svg",
    "fallback": "/logos/providers/generated/zamtel-kwacha.svg"
  },
  {
    "name": "Halopesa",
    "slug": "halopesa",
    "short": "HAL",
    "bg": "#f7a600",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "TZ"
    ],
    "aliases": [
      "Halotel"
    ],
    "logo": "/logos/providers/generated/halopesa.svg",
    "fallback": "/logos/providers/generated/halopesa.svg"
  },
  {
    "name": "EcoCash",
    "slug": "ecocash",
    "short": "ECO",
    "bg": "#009c4a",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "ZW",
      "LS"
    ],
    "aliases": [
      "Econet"
    ],
    "logo": "/logos/providers/generated/ecocash.svg",
    "fallback": "/logos/providers/generated/ecocash.svg"
  },
  {
    "name": "T-Kash",
    "slug": "t-kash",
    "short": "TK",
    "bg": "#00a2e8",
    "color": "#ffffff",
    "category": "mobile_money",
    "countries": [
      "KE"
    ],
    "aliases": [
      "Telkom Kenya"
    ],
    "logo": "/logos/providers/generated/t-kash.svg",
    "fallback": "/logos/providers/generated/t-kash.svg"
  },
  {
    "name": "Ashtechpay",
    "slug": "ashtechpay",
    "short": "ASH",
    "bg": "#1d2a77",
    "color": "#ffb800",
    "category": "provider",
    "countries": [
      "CM",
      "CI",
      "SN",
      "BJ",
      "TG",
      "GH",
      "NG",
      "KE"
    ],
    "aliases": [
      "Ashtech Pay",
      "AshTechPay Direct API"
    ],
    "logo": "/logos/providers/generated/ashtechpay.svg",
    "fallback": "/logos/providers/generated/ashtechpay.svg"
  },
  {
    "name": "Saaspay.me",
    "slug": "saaspay-me",
    "short": "SAAS",
    "bg": "#0b7a75",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "BJ",
      "CI",
      "SN",
      "BF",
      "CM",
      "GA"
    ],
    "aliases": [
      "SasPay",
      "Saaspay"
    ],
    "logo": "/logos/providers/generated/saaspay-me.svg",
    "fallback": "/logos/providers/generated/saaspay-me.svg"
  },
  {
    "name": "Flutterwave",
    "slug": "flutterwave",
    "short": "FLW",
    "bg": "#f5a623",
    "color": "#17213d",
    "category": "provider",
    "countries": [
      "GH",
      "KE",
      "UG",
      "RW",
      "ZM",
      "TZ",
      "CM",
      "CI",
      "SN",
      "BF"
    ],
    "aliases": [
      "Flutterwave v3"
    ],
    "logo": "/logos/providers/generated/flutterwave.svg",
    "fallback": "/logos/providers/generated/flutterwave.svg"
  },
  {
    "name": "Paystack",
    "slug": "paystack",
    "short": "PS",
    "bg": "#00c3f7",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "NG",
      "GH",
      "ZA",
      "KE"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/paystack.svg",
    "fallback": "/logos/providers/generated/paystack.svg"
  },
  {
    "name": "PawaPay",
    "slug": "pawapay",
    "short": "PAWA",
    "bg": "#6b3df5",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "GH",
      "UG",
      "KE",
      "TZ",
      "ZM",
      "CM",
      "CI",
      "SN"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/pawapay.svg",
    "fallback": "/logos/providers/generated/pawapay.svg"
  },
  {
    "name": "Ting by Cellulant",
    "slug": "ting-by-cellulant",
    "short": "TING",
    "bg": "#e84c3d",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "KE",
      "UG",
      "TZ",
      "ZM",
      "GH",
      "NG"
    ],
    "aliases": [
      "Cellulant"
    ],
    "logo": "/logos/providers/generated/ting-by-cellulant.svg",
    "fallback": "/logos/providers/generated/ting-by-cellulant.svg"
  },
  {
    "name": "DPO Pay",
    "slug": "dpo-pay",
    "short": "DPO",
    "bg": "#0a4a8f",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "KE",
      "UG",
      "TZ",
      "ZM",
      "GH",
      "MW"
    ],
    "aliases": [
      "DPO Group"
    ],
    "logo": "/logos/providers/generated/dpo-pay.svg",
    "fallback": "/logos/providers/generated/dpo-pay.svg"
  },
  {
    "name": "Lenco",
    "slug": "lenco",
    "short": "LEN",
    "bg": "#1d4ed8",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "ZM",
      "MW"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/lenco.svg",
    "fallback": "/logos/providers/generated/lenco.svg"
  },
  {
    "name": "Lipila",
    "slug": "lipila",
    "short": "LIP",
    "bg": "#7c3aed",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "ZM"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/lipila.svg",
    "fallback": "/logos/providers/generated/lipila.svg"
  },
  {
    "name": "cGrate",
    "slug": "cgrate",
    "short": "CGR",
    "bg": "#f97316",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "ZM"
    ],
    "aliases": [
      "Konse Konse"
    ],
    "logo": "/logos/providers/generated/cgrate.svg",
    "fallback": "/logos/providers/generated/cgrate.svg"
  },
  {
    "name": "MobiPay",
    "slug": "mobipay",
    "short": "MOB",
    "bg": "#0f766e",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "MW"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/mobipay.svg",
    "fallback": "/logos/providers/generated/mobipay.svg"
  },
  {
    "name": "Kazang",
    "slug": "kazang",
    "short": "KAZ",
    "bg": "#ff6b00",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "ZM",
      "ZA",
      "NA",
      "BW"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/kazang.svg",
    "fallback": "/logos/providers/generated/kazang.svg"
  },
  {
    "name": "Smobilpay",
    "slug": "smobilpay",
    "short": "S3P",
    "bg": "#1e3a8a",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CM"
    ],
    "aliases": [
      "S3P"
    ],
    "logo": "/logos/providers/generated/smobilpay.svg",
    "fallback": "/logos/providers/generated/smobilpay.svg"
  },
  {
    "name": "GeniusPay",
    "slug": "geniuspay",
    "short": "GP",
    "bg": "#5b21b6",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CM",
      "CI",
      "SN"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/geniuspay.svg",
    "fallback": "/logos/providers/generated/geniuspay.svg"
  },
  {
    "name": "FedaPay",
    "slug": "fedapay",
    "short": "FEDA",
    "bg": "#0ea5e9",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "BJ",
      "TG",
      "CI"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/fedapay.svg",
    "fallback": "/logos/providers/generated/fedapay.svg"
  },
  {
    "name": "CinetPay",
    "slug": "cinetpay",
    "short": "CINE",
    "bg": "#e11d48",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CI",
      "CM",
      "SN",
      "BF"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/cinetpay.svg",
    "fallback": "/logos/providers/generated/cinetpay.svg"
  },
  {
    "name": "Monetbil",
    "slug": "monetbil",
    "short": "MB",
    "bg": "#f59e0b",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CM",
      "CI",
      "SN"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/monetbil.svg",
    "fallback": "/logos/providers/generated/monetbil.svg"
  },
  {
    "name": "NotchPay",
    "slug": "notchpay",
    "short": "NOTCH",
    "bg": "#111827",
    "color": "#ffb800",
    "category": "provider",
    "countries": [
      "CM",
      "SN",
      "CI"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/notchpay.svg",
    "fallback": "/logos/providers/generated/notchpay.svg"
  },
  {
    "name": "Kkiapay",
    "slug": "kkiapay",
    "short": "KK",
    "bg": "#12b76a",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "BJ",
      "CI",
      "SN",
      "TG"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/kkiapay.svg",
    "fallback": "/logos/providers/generated/kkiapay.svg"
  },
  {
    "name": "PayDunya",
    "slug": "paydunya",
    "short": "PD",
    "bg": "#0a7c42",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "SN",
      "CI",
      "BF",
      "ML"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/paydunya.svg",
    "fallback": "/logos/providers/generated/paydunya.svg"
  },
  {
    "name": "QosPay",
    "slug": "qospay",
    "short": "QOS",
    "bg": "#4338ca",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CM",
      "GA",
      "CG"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/qospay.svg",
    "fallback": "/logos/providers/generated/qospay.svg"
  },
  {
    "name": "Hub2",
    "slug": "hub2",
    "short": "H2",
    "bg": "#0891b2",
    "color": "#ffffff",
    "category": "provider",
    "countries": [
      "CI",
      "CM",
      "SN"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/hub2.svg",
    "fallback": "/logos/providers/generated/hub2.svg"
  },
  {
    "name": "MoneyUnify",
    "slug": "moneyunify",
    "short": "MU",
    "bg": "#1f2937",
    "color": "#ffb800",
    "category": "provider",
    "countries": [
      "CM",
      "CI",
      "SN",
      "BJ",
      "TG",
      "GH",
      "NG",
      "KE"
    ],
    "aliases": [],
    "logo": "/logos/providers/generated/moneyunify.svg",
    "fallback": "/logos/providers/generated/moneyunify.svg"
  },
  {
    "name": "Visa",
    "slug": "visa",
    "short": "VISA",
    "bg": "#1a1f71",
    "color": "#ffffff",
    "category": "card",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "Visa Card"
    ],
    "logo": "/logos/providers/visa.svg",
    "fallback": "/logos/providers/generated/visa.svg"
  },
  {
    "name": "Mastercard",
    "slug": "mastercard",
    "short": "MC",
    "bg": "#eb001b",
    "color": "#ffffff",
    "category": "card",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "MasterCard"
    ],
    "logo": "/logos/providers/mastercard.svg",
    "fallback": "/logos/providers/generated/mastercard.svg"
  },
  {
    "name": "American Express",
    "slug": "american-express",
    "short": "AMEX",
    "bg": "#2e77bc",
    "color": "#ffffff",
    "category": "card",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "Amex"
    ],
    "logo": "/logos/providers/generated/american-express.svg",
    "fallback": "/logos/providers/generated/american-express.svg"
  },
  {
    "name": "Apple Pay",
    "slug": "apple-pay",
    "short": "APPLE",
    "bg": "#111827",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/wallets-apple-pay.svg",
    "fallback": "/logos/providers/generated/apple-pay.svg"
  },
  {
    "name": "Google Pay",
    "slug": "google-pay",
    "short": "GPAY",
    "bg": "#ffffff",
    "color": "#4285f4",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "GooglePay"
    ],
    "logo": "/logos/providers/wallets-google-pay.svg",
    "fallback": "/logos/providers/generated/google-pay.svg"
  },
  {
    "name": "PayPal",
    "slug": "paypal",
    "short": "PP",
    "bg": "#003087",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/apm-paypal.svg",
    "fallback": "/logos/providers/generated/paypal.svg"
  },
  {
    "name": "Stripe",
    "slug": "stripe",
    "short": "STR",
    "bg": "#635bff",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/paybrand-stripe.svg",
    "fallback": "/logos/providers/generated/stripe.svg"
  },
  {
    "name": "Wise",
    "slug": "wise",
    "short": "WISE",
    "bg": "#163300",
    "color": "#9fe870",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/paybrand-wise.svg",
    "fallback": "/logos/providers/generated/wise.svg"
  },
  {
    "name": "Alipay",
    "slug": "alipay",
    "short": "ALI",
    "bg": "#1677ff",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/apm-alipay.svg",
    "fallback": "/logos/providers/generated/alipay.svg"
  },
  {
    "name": "WeChat Pay",
    "slug": "wechat-pay",
    "short": "WECHAT",
    "bg": "#07c160",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/apm-wechat-pay.svg",
    "fallback": "/logos/providers/generated/wechat-pay.svg"
  },
  {
    "name": "Samsung Pay",
    "slug": "samsung-pay",
    "short": "SAMS",
    "bg": "#1428a0",
    "color": "#ffffff",
    "category": "wallet",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/providers/apm-samsung-pay.svg",
    "fallback": "/logos/providers/generated/samsung-pay.svg"
  },
  {
    "name": "USDT",
    "slug": "usdt",
    "short": "₮",
    "bg": "#26a17b",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "Tether",
      "USDT TRC20"
    ],
    "logo": "/logos/crypto/usdt.svg",
    "fallback": "/logos/providers/generated/usdt.svg"
  },
  {
    "name": "Bitcoin",
    "slug": "bitcoin",
    "short": "₿",
    "bg": "#f7931a",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "BTC"
    ],
    "logo": "/logos/crypto/btc.svg",
    "fallback": "/logos/providers/generated/bitcoin.svg"
  },
  {
    "name": "Ethereum",
    "slug": "ethereum",
    "short": "Ξ",
    "bg": "#627eea",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "ETH"
    ],
    "logo": "/logos/crypto/eth.svg",
    "fallback": "/logos/providers/generated/ethereum.svg"
  },
  {
    "name": "Tron",
    "slug": "tron",
    "short": "TRX",
    "bg": "#eb0029",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [
      "TRON"
    ],
    "logo": "/logos/crypto/trx.svg",
    "fallback": "/logos/providers/generated/tron.svg"
  },
  {
    "name": "USDC",
    "slug": "usdc",
    "short": "USDC",
    "bg": "#2775ca",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/usdc.svg",
    "fallback": "/logos/providers/generated/usdc.svg"
  },
  {
    "name": "BNB",
    "slug": "bnb",
    "short": "BNB",
    "bg": "#f3ba2f",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/bnb.svg",
    "fallback": "/logos/providers/generated/bnb.svg"
  },
  {
    "name": "XRP",
    "slug": "xrp",
    "short": "XRP",
    "bg": "#23292f",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/xrp.svg",
    "fallback": "/logos/providers/generated/xrp.svg"
  },
  {
    "name": "Solana",
    "slug": "solana",
    "short": "SOL",
    "bg": "#14f195",
    "color": "#111827",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/sol.svg",
    "fallback": "/logos/providers/generated/solana.svg"
  },
  {
    "name": "Cardano",
    "slug": "cardano",
    "short": "ADA",
    "bg": "#0033ad",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/ada.svg",
    "fallback": "/logos/providers/generated/cardano.svg"
  },
  {
    "name": "Dogecoin",
    "slug": "dogecoin",
    "short": "DOGE",
    "bg": "#c2a633",
    "color": "#ffffff",
    "category": "crypto",
    "countries": [
      "GLOBAL"
    ],
    "aliases": [],
    "logo": "/logos/crypto/doge.svg",
    "fallback": "/logos/providers/generated/dogecoin.svg"
  }
];

export const countryIcons: CountryIconEntry[] = [
  {
    "code": "AD",
    "name": "Andorra",
    "icon": "/logos/flags/1x1/ad.svg",
    "flag": "/logos/flags/4x3/ad.svg"
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "icon": "/logos/flags/1x1/ae.svg",
    "flag": "/logos/flags/4x3/ae.svg"
  },
  {
    "code": "AF",
    "name": "Afghanistan",
    "icon": "/logos/flags/1x1/af.svg",
    "flag": "/logos/flags/4x3/af.svg"
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda",
    "icon": "/logos/flags/1x1/ag.svg",
    "flag": "/logos/flags/4x3/ag.svg"
  },
  {
    "code": "AI",
    "name": "Anguilla",
    "icon": "/logos/flags/1x1/ai.svg",
    "flag": "/logos/flags/4x3/ai.svg"
  },
  {
    "code": "AL",
    "name": "Albania",
    "icon": "/logos/flags/1x1/al.svg",
    "flag": "/logos/flags/4x3/al.svg"
  },
  {
    "code": "AM",
    "name": "Armenia",
    "icon": "/logos/flags/1x1/am.svg",
    "flag": "/logos/flags/4x3/am.svg"
  },
  {
    "code": "AO",
    "name": "Angola",
    "icon": "/logos/flags/1x1/ao.svg",
    "flag": "/logos/flags/4x3/ao.svg"
  },
  {
    "code": "AQ",
    "name": "Antarctica",
    "icon": "/logos/flags/1x1/aq.svg",
    "flag": "/logos/flags/4x3/aq.svg"
  },
  {
    "code": "AR",
    "name": "Argentina",
    "icon": "/logos/flags/1x1/ar.svg",
    "flag": "/logos/flags/4x3/ar.svg"
  },
  {
    "code": "ARAB",
    "name": "League of Arab States",
    "icon": "/logos/flags/1x1/arab.svg",
    "flag": "/logos/flags/4x3/arab.svg"
  },
  {
    "code": "AS",
    "name": "American Samoa",
    "icon": "/logos/flags/1x1/as.svg",
    "flag": "/logos/flags/4x3/as.svg"
  },
  {
    "code": "ASEAN",
    "name": "Association of Southeast Asian Nations",
    "icon": "/logos/flags/1x1/asean.svg",
    "flag": "/logos/flags/4x3/asean.svg"
  },
  {
    "code": "AT",
    "name": "Austria",
    "icon": "/logos/flags/1x1/at.svg",
    "flag": "/logos/flags/4x3/at.svg"
  },
  {
    "code": "AU",
    "name": "Australia",
    "icon": "/logos/flags/1x1/au.svg",
    "flag": "/logos/flags/4x3/au.svg"
  },
  {
    "code": "AW",
    "name": "Aruba",
    "icon": "/logos/flags/1x1/aw.svg",
    "flag": "/logos/flags/4x3/aw.svg"
  },
  {
    "code": "AX",
    "name": "Aland Islands",
    "icon": "/logos/flags/1x1/ax.svg",
    "flag": "/logos/flags/4x3/ax.svg"
  },
  {
    "code": "AZ",
    "name": "Azerbaijan",
    "icon": "/logos/flags/1x1/az.svg",
    "flag": "/logos/flags/4x3/az.svg"
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "icon": "/logos/flags/1x1/ba.svg",
    "flag": "/logos/flags/4x3/ba.svg"
  },
  {
    "code": "BB",
    "name": "Barbados",
    "icon": "/logos/flags/1x1/bb.svg",
    "flag": "/logos/flags/4x3/bb.svg"
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "icon": "/logos/flags/1x1/bd.svg",
    "flag": "/logos/flags/4x3/bd.svg"
  },
  {
    "code": "BE",
    "name": "Belgium",
    "icon": "/logos/flags/1x1/be.svg",
    "flag": "/logos/flags/4x3/be.svg"
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "icon": "/logos/flags/1x1/bf.svg",
    "flag": "/logos/flags/4x3/bf.svg"
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "icon": "/logos/flags/1x1/bg.svg",
    "flag": "/logos/flags/4x3/bg.svg"
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "icon": "/logos/flags/1x1/bh.svg",
    "flag": "/logos/flags/4x3/bh.svg"
  },
  {
    "code": "BI",
    "name": "Burundi",
    "icon": "/logos/flags/1x1/bi.svg",
    "flag": "/logos/flags/4x3/bi.svg"
  },
  {
    "code": "BJ",
    "name": "Benin",
    "icon": "/logos/flags/1x1/bj.svg",
    "flag": "/logos/flags/4x3/bj.svg"
  },
  {
    "code": "BL",
    "name": "Saint Barthélemy",
    "icon": "/logos/flags/1x1/bl.svg",
    "flag": "/logos/flags/4x3/bl.svg"
  },
  {
    "code": "BM",
    "name": "Bermuda",
    "icon": "/logos/flags/1x1/bm.svg",
    "flag": "/logos/flags/4x3/bm.svg"
  },
  {
    "code": "BN",
    "name": "Brunei Darussalam",
    "icon": "/logos/flags/1x1/bn.svg",
    "flag": "/logos/flags/4x3/bn.svg"
  },
  {
    "code": "BO",
    "name": "Bolivia",
    "icon": "/logos/flags/1x1/bo.svg",
    "flag": "/logos/flags/4x3/bo.svg"
  },
  {
    "code": "BQ",
    "name": "Bonaire, Sint Eustatius and Saba",
    "icon": "/logos/flags/1x1/bq.svg",
    "flag": "/logos/flags/4x3/bq.svg"
  },
  {
    "code": "BR",
    "name": "Brazil",
    "icon": "/logos/flags/1x1/br.svg",
    "flag": "/logos/flags/4x3/br.svg"
  },
  {
    "code": "BS",
    "name": "Bahamas",
    "icon": "/logos/flags/1x1/bs.svg",
    "flag": "/logos/flags/4x3/bs.svg"
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "icon": "/logos/flags/1x1/bt.svg",
    "flag": "/logos/flags/4x3/bt.svg"
  },
  {
    "code": "BV",
    "name": "Bouvet Island",
    "icon": "/logos/flags/1x1/bv.svg",
    "flag": "/logos/flags/4x3/bv.svg"
  },
  {
    "code": "BW",
    "name": "Botswana",
    "icon": "/logos/flags/1x1/bw.svg",
    "flag": "/logos/flags/4x3/bw.svg"
  },
  {
    "code": "BY",
    "name": "Belarus",
    "icon": "/logos/flags/1x1/by.svg",
    "flag": "/logos/flags/4x3/by.svg"
  },
  {
    "code": "BZ",
    "name": "Belize",
    "icon": "/logos/flags/1x1/bz.svg",
    "flag": "/logos/flags/4x3/bz.svg"
  },
  {
    "code": "CA",
    "name": "Canada",
    "icon": "/logos/flags/1x1/ca.svg",
    "flag": "/logos/flags/4x3/ca.svg"
  },
  {
    "code": "CC",
    "name": "Cocos (Keeling) Islands",
    "icon": "/logos/flags/1x1/cc.svg",
    "flag": "/logos/flags/4x3/cc.svg"
  },
  {
    "code": "CD",
    "name": "Democratic Republic of the Congo",
    "icon": "/logos/flags/1x1/cd.svg",
    "flag": "/logos/flags/4x3/cd.svg"
  },
  {
    "code": "CEFTA",
    "name": "Central European Free Trade Agreement",
    "icon": "/logos/flags/1x1/cefta.svg",
    "flag": "/logos/flags/4x3/cefta.svg"
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "icon": "/logos/flags/1x1/cf.svg",
    "flag": "/logos/flags/4x3/cf.svg"
  },
  {
    "code": "CG",
    "name": "Republic of the Congo",
    "icon": "/logos/flags/1x1/cg.svg",
    "flag": "/logos/flags/4x3/cg.svg"
  },
  {
    "code": "CH",
    "name": "Switzerland",
    "icon": "/logos/flags/1x1/ch.svg",
    "flag": "/logos/flags/4x3/ch.svg"
  },
  {
    "code": "CI",
    "name": "Côte d'Ivoire",
    "icon": "/logos/flags/1x1/ci.svg",
    "flag": "/logos/flags/4x3/ci.svg"
  },
  {
    "code": "CK",
    "name": "Cook Islands",
    "icon": "/logos/flags/1x1/ck.svg",
    "flag": "/logos/flags/4x3/ck.svg"
  },
  {
    "code": "CL",
    "name": "Chile",
    "icon": "/logos/flags/1x1/cl.svg",
    "flag": "/logos/flags/4x3/cl.svg"
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "icon": "/logos/flags/1x1/cm.svg",
    "flag": "/logos/flags/4x3/cm.svg"
  },
  {
    "code": "CN",
    "name": "China",
    "icon": "/logos/flags/1x1/cn.svg",
    "flag": "/logos/flags/4x3/cn.svg"
  },
  {
    "code": "CO",
    "name": "Colombia",
    "icon": "/logos/flags/1x1/co.svg",
    "flag": "/logos/flags/4x3/co.svg"
  },
  {
    "code": "CP",
    "name": "Clipperton Island",
    "icon": "/logos/flags/1x1/cp.svg",
    "flag": "/logos/flags/4x3/cp.svg"
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "icon": "/logos/flags/1x1/cr.svg",
    "flag": "/logos/flags/4x3/cr.svg"
  },
  {
    "code": "CU",
    "name": "Cuba",
    "icon": "/logos/flags/1x1/cu.svg",
    "flag": "/logos/flags/4x3/cu.svg"
  },
  {
    "code": "CV",
    "name": "Cabo Verde",
    "icon": "/logos/flags/1x1/cv.svg",
    "flag": "/logos/flags/4x3/cv.svg"
  },
  {
    "code": "CW",
    "name": "Curaçao",
    "icon": "/logos/flags/1x1/cw.svg",
    "flag": "/logos/flags/4x3/cw.svg"
  },
  {
    "code": "CX",
    "name": "Christmas Island",
    "icon": "/logos/flags/1x1/cx.svg",
    "flag": "/logos/flags/4x3/cx.svg"
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "icon": "/logos/flags/1x1/cy.svg",
    "flag": "/logos/flags/4x3/cy.svg"
  },
  {
    "code": "CZ",
    "name": "Czech Republic",
    "icon": "/logos/flags/1x1/cz.svg",
    "flag": "/logos/flags/4x3/cz.svg"
  },
  {
    "code": "DE",
    "name": "Germany",
    "icon": "/logos/flags/1x1/de.svg",
    "flag": "/logos/flags/4x3/de.svg"
  },
  {
    "code": "DG",
    "name": "Diego Garcia",
    "icon": "/logos/flags/1x1/dg.svg",
    "flag": "/logos/flags/4x3/dg.svg"
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "icon": "/logos/flags/1x1/dj.svg",
    "flag": "/logos/flags/4x3/dj.svg"
  },
  {
    "code": "DK",
    "name": "Denmark",
    "icon": "/logos/flags/1x1/dk.svg",
    "flag": "/logos/flags/4x3/dk.svg"
  },
  {
    "code": "DM",
    "name": "Dominica",
    "icon": "/logos/flags/1x1/dm.svg",
    "flag": "/logos/flags/4x3/dm.svg"
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "icon": "/logos/flags/1x1/do.svg",
    "flag": "/logos/flags/4x3/do.svg"
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "icon": "/logos/flags/1x1/dz.svg",
    "flag": "/logos/flags/4x3/dz.svg"
  },
  {
    "code": "EAC",
    "name": "East African Community",
    "icon": "/logos/flags/1x1/eac.svg",
    "flag": "/logos/flags/4x3/eac.svg"
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "icon": "/logos/flags/1x1/ec.svg",
    "flag": "/logos/flags/4x3/ec.svg"
  },
  {
    "code": "EE",
    "name": "Estonia",
    "icon": "/logos/flags/1x1/ee.svg",
    "flag": "/logos/flags/4x3/ee.svg"
  },
  {
    "code": "EG",
    "name": "Egypt",
    "icon": "/logos/flags/1x1/eg.svg",
    "flag": "/logos/flags/4x3/eg.svg"
  },
  {
    "code": "EH",
    "name": "Western Sahara",
    "icon": "/logos/flags/1x1/eh.svg",
    "flag": "/logos/flags/4x3/eh.svg"
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "icon": "/logos/flags/1x1/er.svg",
    "flag": "/logos/flags/4x3/er.svg"
  },
  {
    "code": "ES",
    "name": "Spain",
    "icon": "/logos/flags/1x1/es.svg",
    "flag": "/logos/flags/4x3/es.svg"
  },
  {
    "code": "ES-CT",
    "name": "Catalonia",
    "icon": "/logos/flags/1x1/es-ct.svg",
    "flag": "/logos/flags/4x3/es-ct.svg"
  },
  {
    "code": "ES-GA",
    "name": "Galicia",
    "icon": "/logos/flags/1x1/es-ga.svg",
    "flag": "/logos/flags/4x3/es-ga.svg"
  },
  {
    "code": "ES-PV",
    "name": "Basque Country",
    "icon": "/logos/flags/1x1/es-pv.svg",
    "flag": "/logos/flags/4x3/es-pv.svg"
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "icon": "/logos/flags/1x1/et.svg",
    "flag": "/logos/flags/4x3/et.svg"
  },
  {
    "code": "EU",
    "name": "Europe",
    "icon": "/logos/flags/1x1/eu.svg",
    "flag": "/logos/flags/4x3/eu.svg"
  },
  {
    "code": "FI",
    "name": "Finland",
    "icon": "/logos/flags/1x1/fi.svg",
    "flag": "/logos/flags/4x3/fi.svg"
  },
  {
    "code": "FJ",
    "name": "Fiji",
    "icon": "/logos/flags/1x1/fj.svg",
    "flag": "/logos/flags/4x3/fj.svg"
  },
  {
    "code": "FK",
    "name": "Falkland Islands",
    "icon": "/logos/flags/1x1/fk.svg",
    "flag": "/logos/flags/4x3/fk.svg"
  },
  {
    "code": "FM",
    "name": "Federated States of Micronesia",
    "icon": "/logos/flags/1x1/fm.svg",
    "flag": "/logos/flags/4x3/fm.svg"
  },
  {
    "code": "FO",
    "name": "Faroe Islands",
    "icon": "/logos/flags/1x1/fo.svg",
    "flag": "/logos/flags/4x3/fo.svg"
  },
  {
    "code": "FR",
    "name": "France",
    "icon": "/logos/flags/1x1/fr.svg",
    "flag": "/logos/flags/4x3/fr.svg"
  },
  {
    "code": "GA",
    "name": "Gabon",
    "icon": "/logos/flags/1x1/ga.svg",
    "flag": "/logos/flags/4x3/ga.svg"
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "icon": "/logos/flags/1x1/gb.svg",
    "flag": "/logos/flags/4x3/gb.svg"
  },
  {
    "code": "GB-ENG",
    "name": "England",
    "icon": "/logos/flags/1x1/gb-eng.svg",
    "flag": "/logos/flags/4x3/gb-eng.svg"
  },
  {
    "code": "GB-NIR",
    "name": "Northern Ireland",
    "icon": "/logos/flags/1x1/gb-nir.svg",
    "flag": "/logos/flags/4x3/gb-nir.svg"
  },
  {
    "code": "GB-SCT",
    "name": "Scotland",
    "icon": "/logos/flags/1x1/gb-sct.svg",
    "flag": "/logos/flags/4x3/gb-sct.svg"
  },
  {
    "code": "GB-WLS",
    "name": "Wales",
    "icon": "/logos/flags/1x1/gb-wls.svg",
    "flag": "/logos/flags/4x3/gb-wls.svg"
  },
  {
    "code": "GD",
    "name": "Grenada",
    "icon": "/logos/flags/1x1/gd.svg",
    "flag": "/logos/flags/4x3/gd.svg"
  },
  {
    "code": "GE",
    "name": "Georgia",
    "icon": "/logos/flags/1x1/ge.svg",
    "flag": "/logos/flags/4x3/ge.svg"
  },
  {
    "code": "GF",
    "name": "French Guiana",
    "icon": "/logos/flags/1x1/gf.svg",
    "flag": "/logos/flags/4x3/gf.svg"
  },
  {
    "code": "GG",
    "name": "Guernsey",
    "icon": "/logos/flags/1x1/gg.svg",
    "flag": "/logos/flags/4x3/gg.svg"
  },
  {
    "code": "GH",
    "name": "Ghana",
    "icon": "/logos/flags/1x1/gh.svg",
    "flag": "/logos/flags/4x3/gh.svg"
  },
  {
    "code": "GI",
    "name": "Gibraltar",
    "icon": "/logos/flags/1x1/gi.svg",
    "flag": "/logos/flags/4x3/gi.svg"
  },
  {
    "code": "GL",
    "name": "Greenland",
    "icon": "/logos/flags/1x1/gl.svg",
    "flag": "/logos/flags/4x3/gl.svg"
  },
  {
    "code": "GM",
    "name": "Gambia",
    "icon": "/logos/flags/1x1/gm.svg",
    "flag": "/logos/flags/4x3/gm.svg"
  },
  {
    "code": "GN",
    "name": "Guinea",
    "icon": "/logos/flags/1x1/gn.svg",
    "flag": "/logos/flags/4x3/gn.svg"
  },
  {
    "code": "GP",
    "name": "Guadeloupe",
    "icon": "/logos/flags/1x1/gp.svg",
    "flag": "/logos/flags/4x3/gp.svg"
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea",
    "icon": "/logos/flags/1x1/gq.svg",
    "flag": "/logos/flags/4x3/gq.svg"
  },
  {
    "code": "GR",
    "name": "Greece",
    "icon": "/logos/flags/1x1/gr.svg",
    "flag": "/logos/flags/4x3/gr.svg"
  },
  {
    "code": "GS",
    "name": "South Georgia and the South Sandwich Islands",
    "icon": "/logos/flags/1x1/gs.svg",
    "flag": "/logos/flags/4x3/gs.svg"
  },
  {
    "code": "GT",
    "name": "Guatemala",
    "icon": "/logos/flags/1x1/gt.svg",
    "flag": "/logos/flags/4x3/gt.svg"
  },
  {
    "code": "GU",
    "name": "Guam",
    "icon": "/logos/flags/1x1/gu.svg",
    "flag": "/logos/flags/4x3/gu.svg"
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau",
    "icon": "/logos/flags/1x1/gw.svg",
    "flag": "/logos/flags/4x3/gw.svg"
  },
  {
    "code": "GY",
    "name": "Guyana",
    "icon": "/logos/flags/1x1/gy.svg",
    "flag": "/logos/flags/4x3/gy.svg"
  },
  {
    "code": "HK",
    "name": "Hong Kong",
    "icon": "/logos/flags/1x1/hk.svg",
    "flag": "/logos/flags/4x3/hk.svg"
  },
  {
    "code": "HM",
    "name": "Heard Island and McDonald Islands",
    "icon": "/logos/flags/1x1/hm.svg",
    "flag": "/logos/flags/4x3/hm.svg"
  },
  {
    "code": "HN",
    "name": "Honduras",
    "icon": "/logos/flags/1x1/hn.svg",
    "flag": "/logos/flags/4x3/hn.svg"
  },
  {
    "code": "HR",
    "name": "Croatia",
    "icon": "/logos/flags/1x1/hr.svg",
    "flag": "/logos/flags/4x3/hr.svg"
  },
  {
    "code": "HT",
    "name": "Haiti",
    "icon": "/logos/flags/1x1/ht.svg",
    "flag": "/logos/flags/4x3/ht.svg"
  },
  {
    "code": "HU",
    "name": "Hungary",
    "icon": "/logos/flags/1x1/hu.svg",
    "flag": "/logos/flags/4x3/hu.svg"
  },
  {
    "code": "IC",
    "name": "Canary Islands",
    "icon": "/logos/flags/1x1/ic.svg",
    "flag": "/logos/flags/4x3/ic.svg"
  },
  {
    "code": "ID",
    "name": "Indonesia",
    "icon": "/logos/flags/1x1/id.svg",
    "flag": "/logos/flags/4x3/id.svg"
  },
  {
    "code": "IE",
    "name": "Ireland",
    "icon": "/logos/flags/1x1/ie.svg",
    "flag": "/logos/flags/4x3/ie.svg"
  },
  {
    "code": "IL",
    "name": "Israel",
    "icon": "/logos/flags/1x1/il.svg",
    "flag": "/logos/flags/4x3/il.svg"
  },
  {
    "code": "IM",
    "name": "Isle of Man",
    "icon": "/logos/flags/1x1/im.svg",
    "flag": "/logos/flags/4x3/im.svg"
  },
  {
    "code": "IN",
    "name": "India",
    "icon": "/logos/flags/1x1/in.svg",
    "flag": "/logos/flags/4x3/in.svg"
  },
  {
    "code": "IO",
    "name": "British Indian Ocean Territory",
    "icon": "/logos/flags/1x1/io.svg",
    "flag": "/logos/flags/4x3/io.svg"
  },
  {
    "code": "IQ",
    "name": "Iraq",
    "icon": "/logos/flags/1x1/iq.svg",
    "flag": "/logos/flags/4x3/iq.svg"
  },
  {
    "code": "IR",
    "name": "Iran",
    "icon": "/logos/flags/1x1/ir.svg",
    "flag": "/logos/flags/4x3/ir.svg"
  },
  {
    "code": "IS",
    "name": "Iceland",
    "icon": "/logos/flags/1x1/is.svg",
    "flag": "/logos/flags/4x3/is.svg"
  },
  {
    "code": "IT",
    "name": "Italy",
    "icon": "/logos/flags/1x1/it.svg",
    "flag": "/logos/flags/4x3/it.svg"
  },
  {
    "code": "JE",
    "name": "Jersey",
    "icon": "/logos/flags/1x1/je.svg",
    "flag": "/logos/flags/4x3/je.svg"
  },
  {
    "code": "JM",
    "name": "Jamaica",
    "icon": "/logos/flags/1x1/jm.svg",
    "flag": "/logos/flags/4x3/jm.svg"
  },
  {
    "code": "JO",
    "name": "Jordan",
    "icon": "/logos/flags/1x1/jo.svg",
    "flag": "/logos/flags/4x3/jo.svg"
  },
  {
    "code": "JP",
    "name": "Japan",
    "icon": "/logos/flags/1x1/jp.svg",
    "flag": "/logos/flags/4x3/jp.svg"
  },
  {
    "code": "KE",
    "name": "Kenya",
    "icon": "/logos/flags/1x1/ke.svg",
    "flag": "/logos/flags/4x3/ke.svg"
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan",
    "icon": "/logos/flags/1x1/kg.svg",
    "flag": "/logos/flags/4x3/kg.svg"
  },
  {
    "code": "KH",
    "name": "Cambodia",
    "icon": "/logos/flags/1x1/kh.svg",
    "flag": "/logos/flags/4x3/kh.svg"
  },
  {
    "code": "KI",
    "name": "Kiribati",
    "icon": "/logos/flags/1x1/ki.svg",
    "flag": "/logos/flags/4x3/ki.svg"
  },
  {
    "code": "KM",
    "name": "Comoros",
    "icon": "/logos/flags/1x1/km.svg",
    "flag": "/logos/flags/4x3/km.svg"
  },
  {
    "code": "KN",
    "name": "Saint Kitts and Nevis",
    "icon": "/logos/flags/1x1/kn.svg",
    "flag": "/logos/flags/4x3/kn.svg"
  },
  {
    "code": "KP",
    "name": "North Korea",
    "icon": "/logos/flags/1x1/kp.svg",
    "flag": "/logos/flags/4x3/kp.svg"
  },
  {
    "code": "KR",
    "name": "South Korea",
    "icon": "/logos/flags/1x1/kr.svg",
    "flag": "/logos/flags/4x3/kr.svg"
  },
  {
    "code": "KW",
    "name": "Kuwait",
    "icon": "/logos/flags/1x1/kw.svg",
    "flag": "/logos/flags/4x3/kw.svg"
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "icon": "/logos/flags/1x1/ky.svg",
    "flag": "/logos/flags/4x3/ky.svg"
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "icon": "/logos/flags/1x1/kz.svg",
    "flag": "/logos/flags/4x3/kz.svg"
  },
  {
    "code": "LA",
    "name": "Laos",
    "icon": "/logos/flags/1x1/la.svg",
    "flag": "/logos/flags/4x3/la.svg"
  },
  {
    "code": "LB",
    "name": "Lebanon",
    "icon": "/logos/flags/1x1/lb.svg",
    "flag": "/logos/flags/4x3/lb.svg"
  },
  {
    "code": "LC",
    "name": "Saint Lucia",
    "icon": "/logos/flags/1x1/lc.svg",
    "flag": "/logos/flags/4x3/lc.svg"
  },
  {
    "code": "LI",
    "name": "Liechtenstein",
    "icon": "/logos/flags/1x1/li.svg",
    "flag": "/logos/flags/4x3/li.svg"
  },
  {
    "code": "LK",
    "name": "Sri Lanka",
    "icon": "/logos/flags/1x1/lk.svg",
    "flag": "/logos/flags/4x3/lk.svg"
  },
  {
    "code": "LR",
    "name": "Liberia",
    "icon": "/logos/flags/1x1/lr.svg",
    "flag": "/logos/flags/4x3/lr.svg"
  },
  {
    "code": "LS",
    "name": "Lesotho",
    "icon": "/logos/flags/1x1/ls.svg",
    "flag": "/logos/flags/4x3/ls.svg"
  },
  {
    "code": "LT",
    "name": "Lithuania",
    "icon": "/logos/flags/1x1/lt.svg",
    "flag": "/logos/flags/4x3/lt.svg"
  },
  {
    "code": "LU",
    "name": "Luxembourg",
    "icon": "/logos/flags/1x1/lu.svg",
    "flag": "/logos/flags/4x3/lu.svg"
  },
  {
    "code": "LV",
    "name": "Latvia",
    "icon": "/logos/flags/1x1/lv.svg",
    "flag": "/logos/flags/4x3/lv.svg"
  },
  {
    "code": "LY",
    "name": "Libya",
    "icon": "/logos/flags/1x1/ly.svg",
    "flag": "/logos/flags/4x3/ly.svg"
  },
  {
    "code": "MA",
    "name": "Morocco",
    "icon": "/logos/flags/1x1/ma.svg",
    "flag": "/logos/flags/4x3/ma.svg"
  },
  {
    "code": "MC",
    "name": "Monaco",
    "icon": "/logos/flags/1x1/mc.svg",
    "flag": "/logos/flags/4x3/mc.svg"
  },
  {
    "code": "MD",
    "name": "Moldova",
    "icon": "/logos/flags/1x1/md.svg",
    "flag": "/logos/flags/4x3/md.svg"
  },
  {
    "code": "ME",
    "name": "Montenegro",
    "icon": "/logos/flags/1x1/me.svg",
    "flag": "/logos/flags/4x3/me.svg"
  },
  {
    "code": "MF",
    "name": "Saint Martin",
    "icon": "/logos/flags/1x1/mf.svg",
    "flag": "/logos/flags/4x3/mf.svg"
  },
  {
    "code": "MG",
    "name": "Madagascar",
    "icon": "/logos/flags/1x1/mg.svg",
    "flag": "/logos/flags/4x3/mg.svg"
  },
  {
    "code": "MH",
    "name": "Marshall Islands",
    "icon": "/logos/flags/1x1/mh.svg",
    "flag": "/logos/flags/4x3/mh.svg"
  },
  {
    "code": "MK",
    "name": "North Macedonia",
    "icon": "/logos/flags/1x1/mk.svg",
    "flag": "/logos/flags/4x3/mk.svg"
  },
  {
    "code": "ML",
    "name": "Mali",
    "icon": "/logos/flags/1x1/ml.svg",
    "flag": "/logos/flags/4x3/ml.svg"
  },
  {
    "code": "MM",
    "name": "Myanmar",
    "icon": "/logos/flags/1x1/mm.svg",
    "flag": "/logos/flags/4x3/mm.svg"
  },
  {
    "code": "MN",
    "name": "Mongolia",
    "icon": "/logos/flags/1x1/mn.svg",
    "flag": "/logos/flags/4x3/mn.svg"
  },
  {
    "code": "MO",
    "name": "Macau",
    "icon": "/logos/flags/1x1/mo.svg",
    "flag": "/logos/flags/4x3/mo.svg"
  },
  {
    "code": "MP",
    "name": "Northern Mariana Islands",
    "icon": "/logos/flags/1x1/mp.svg",
    "flag": "/logos/flags/4x3/mp.svg"
  },
  {
    "code": "MQ",
    "name": "Martinique",
    "icon": "/logos/flags/1x1/mq.svg",
    "flag": "/logos/flags/4x3/mq.svg"
  },
  {
    "code": "MR",
    "name": "Mauritania",
    "icon": "/logos/flags/1x1/mr.svg",
    "flag": "/logos/flags/4x3/mr.svg"
  },
  {
    "code": "MS",
    "name": "Montserrat",
    "icon": "/logos/flags/1x1/ms.svg",
    "flag": "/logos/flags/4x3/ms.svg"
  },
  {
    "code": "MT",
    "name": "Malta",
    "icon": "/logos/flags/1x1/mt.svg",
    "flag": "/logos/flags/4x3/mt.svg"
  },
  {
    "code": "MU",
    "name": "Mauritius",
    "icon": "/logos/flags/1x1/mu.svg",
    "flag": "/logos/flags/4x3/mu.svg"
  },
  {
    "code": "MV",
    "name": "Maldives",
    "icon": "/logos/flags/1x1/mv.svg",
    "flag": "/logos/flags/4x3/mv.svg"
  },
  {
    "code": "MW",
    "name": "Malawi",
    "icon": "/logos/flags/1x1/mw.svg",
    "flag": "/logos/flags/4x3/mw.svg"
  },
  {
    "code": "MX",
    "name": "Mexico",
    "icon": "/logos/flags/1x1/mx.svg",
    "flag": "/logos/flags/4x3/mx.svg"
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "icon": "/logos/flags/1x1/my.svg",
    "flag": "/logos/flags/4x3/my.svg"
  },
  {
    "code": "MZ",
    "name": "Mozambique",
    "icon": "/logos/flags/1x1/mz.svg",
    "flag": "/logos/flags/4x3/mz.svg"
  },
  {
    "code": "NA",
    "name": "Namibia",
    "icon": "/logos/flags/1x1/na.svg",
    "flag": "/logos/flags/4x3/na.svg"
  },
  {
    "code": "NC",
    "name": "New Caledonia",
    "icon": "/logos/flags/1x1/nc.svg",
    "flag": "/logos/flags/4x3/nc.svg"
  },
  {
    "code": "NE",
    "name": "Niger",
    "icon": "/logos/flags/1x1/ne.svg",
    "flag": "/logos/flags/4x3/ne.svg"
  },
  {
    "code": "NF",
    "name": "Norfolk Island",
    "icon": "/logos/flags/1x1/nf.svg",
    "flag": "/logos/flags/4x3/nf.svg"
  },
  {
    "code": "NG",
    "name": "Nigeria",
    "icon": "/logos/flags/1x1/ng.svg",
    "flag": "/logos/flags/4x3/ng.svg"
  },
  {
    "code": "NI",
    "name": "Nicaragua",
    "icon": "/logos/flags/1x1/ni.svg",
    "flag": "/logos/flags/4x3/ni.svg"
  },
  {
    "code": "NL",
    "name": "Netherlands",
    "icon": "/logos/flags/1x1/nl.svg",
    "flag": "/logos/flags/4x3/nl.svg"
  },
  {
    "code": "NO",
    "name": "Norway",
    "icon": "/logos/flags/1x1/no.svg",
    "flag": "/logos/flags/4x3/no.svg"
  },
  {
    "code": "NP",
    "name": "Nepal",
    "icon": "/logos/flags/1x1/np.svg",
    "flag": "/logos/flags/4x3/np.svg"
  },
  {
    "code": "NR",
    "name": "Nauru",
    "icon": "/logos/flags/1x1/nr.svg",
    "flag": "/logos/flags/4x3/nr.svg"
  },
  {
    "code": "NU",
    "name": "Niue",
    "icon": "/logos/flags/1x1/nu.svg",
    "flag": "/logos/flags/4x3/nu.svg"
  },
  {
    "code": "NZ",
    "name": "New Zealand",
    "icon": "/logos/flags/1x1/nz.svg",
    "flag": "/logos/flags/4x3/nz.svg"
  },
  {
    "code": "OM",
    "name": "Oman",
    "icon": "/logos/flags/1x1/om.svg",
    "flag": "/logos/flags/4x3/om.svg"
  },
  {
    "code": "PA",
    "name": "Panama",
    "icon": "/logos/flags/1x1/pa.svg",
    "flag": "/logos/flags/4x3/pa.svg"
  },
  {
    "code": "PC",
    "name": "Pacific Community",
    "icon": "/logos/flags/1x1/pc.svg",
    "flag": "/logos/flags/4x3/pc.svg"
  },
  {
    "code": "PE",
    "name": "Peru",
    "icon": "/logos/flags/1x1/pe.svg",
    "flag": "/logos/flags/4x3/pe.svg"
  },
  {
    "code": "PF",
    "name": "French Polynesia",
    "icon": "/logos/flags/1x1/pf.svg",
    "flag": "/logos/flags/4x3/pf.svg"
  },
  {
    "code": "PG",
    "name": "Papua New Guinea",
    "icon": "/logos/flags/1x1/pg.svg",
    "flag": "/logos/flags/4x3/pg.svg"
  },
  {
    "code": "PH",
    "name": "Philippines",
    "icon": "/logos/flags/1x1/ph.svg",
    "flag": "/logos/flags/4x3/ph.svg"
  },
  {
    "code": "PK",
    "name": "Pakistan",
    "icon": "/logos/flags/1x1/pk.svg",
    "flag": "/logos/flags/4x3/pk.svg"
  },
  {
    "code": "PL",
    "name": "Poland",
    "icon": "/logos/flags/1x1/pl.svg",
    "flag": "/logos/flags/4x3/pl.svg"
  },
  {
    "code": "PM",
    "name": "Saint Pierre and Miquelon",
    "icon": "/logos/flags/1x1/pm.svg",
    "flag": "/logos/flags/4x3/pm.svg"
  },
  {
    "code": "PN",
    "name": "Pitcairn",
    "icon": "/logos/flags/1x1/pn.svg",
    "flag": "/logos/flags/4x3/pn.svg"
  },
  {
    "code": "PR",
    "name": "Puerto Rico",
    "icon": "/logos/flags/1x1/pr.svg",
    "flag": "/logos/flags/4x3/pr.svg"
  },
  {
    "code": "PS",
    "name": "State of Palestine",
    "icon": "/logos/flags/1x1/ps.svg",
    "flag": "/logos/flags/4x3/ps.svg"
  },
  {
    "code": "PT",
    "name": "Portugal",
    "icon": "/logos/flags/1x1/pt.svg",
    "flag": "/logos/flags/4x3/pt.svg"
  },
  {
    "code": "PW",
    "name": "Palau",
    "icon": "/logos/flags/1x1/pw.svg",
    "flag": "/logos/flags/4x3/pw.svg"
  },
  {
    "code": "PY",
    "name": "Paraguay",
    "icon": "/logos/flags/1x1/py.svg",
    "flag": "/logos/flags/4x3/py.svg"
  },
  {
    "code": "QA",
    "name": "Qatar",
    "icon": "/logos/flags/1x1/qa.svg",
    "flag": "/logos/flags/4x3/qa.svg"
  },
  {
    "code": "RE",
    "name": "Réunion",
    "icon": "/logos/flags/1x1/re.svg",
    "flag": "/logos/flags/4x3/re.svg"
  },
  {
    "code": "RO",
    "name": "Romania",
    "icon": "/logos/flags/1x1/ro.svg",
    "flag": "/logos/flags/4x3/ro.svg"
  },
  {
    "code": "RS",
    "name": "Serbia",
    "icon": "/logos/flags/1x1/rs.svg",
    "flag": "/logos/flags/4x3/rs.svg"
  },
  {
    "code": "RU",
    "name": "Russia",
    "icon": "/logos/flags/1x1/ru.svg",
    "flag": "/logos/flags/4x3/ru.svg"
  },
  {
    "code": "RW",
    "name": "Rwanda",
    "icon": "/logos/flags/1x1/rw.svg",
    "flag": "/logos/flags/4x3/rw.svg"
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "icon": "/logos/flags/1x1/sa.svg",
    "flag": "/logos/flags/4x3/sa.svg"
  },
  {
    "code": "SB",
    "name": "Solomon Islands",
    "icon": "/logos/flags/1x1/sb.svg",
    "flag": "/logos/flags/4x3/sb.svg"
  },
  {
    "code": "SC",
    "name": "Seychelles",
    "icon": "/logos/flags/1x1/sc.svg",
    "flag": "/logos/flags/4x3/sc.svg"
  },
  {
    "code": "SD",
    "name": "Sudan",
    "icon": "/logos/flags/1x1/sd.svg",
    "flag": "/logos/flags/4x3/sd.svg"
  },
  {
    "code": "SE",
    "name": "Sweden",
    "icon": "/logos/flags/1x1/se.svg",
    "flag": "/logos/flags/4x3/se.svg"
  },
  {
    "code": "SG",
    "name": "Singapore",
    "icon": "/logos/flags/1x1/sg.svg",
    "flag": "/logos/flags/4x3/sg.svg"
  },
  {
    "code": "SH",
    "name": "Saint Helena, Ascension and Tristan da Cunha",
    "icon": "/logos/flags/1x1/sh.svg",
    "flag": "/logos/flags/4x3/sh.svg"
  },
  {
    "code": "SH-AC",
    "name": "Ascension Island",
    "icon": "/logos/flags/1x1/sh-ac.svg",
    "flag": "/logos/flags/4x3/sh-ac.svg"
  },
  {
    "code": "SH-HL",
    "name": "Saint Helena",
    "icon": "/logos/flags/1x1/sh-hl.svg",
    "flag": "/logos/flags/4x3/sh-hl.svg"
  },
  {
    "code": "SH-TA",
    "name": "Tristan da Cunha",
    "icon": "/logos/flags/1x1/sh-ta.svg",
    "flag": "/logos/flags/4x3/sh-ta.svg"
  },
  {
    "code": "SI",
    "name": "Slovenia",
    "icon": "/logos/flags/1x1/si.svg",
    "flag": "/logos/flags/4x3/si.svg"
  },
  {
    "code": "SJ",
    "name": "Svalbard and Jan Mayen",
    "icon": "/logos/flags/1x1/sj.svg",
    "flag": "/logos/flags/4x3/sj.svg"
  },
  {
    "code": "SK",
    "name": "Slovakia",
    "icon": "/logos/flags/1x1/sk.svg",
    "flag": "/logos/flags/4x3/sk.svg"
  },
  {
    "code": "SL",
    "name": "Sierra Leone",
    "icon": "/logos/flags/1x1/sl.svg",
    "flag": "/logos/flags/4x3/sl.svg"
  },
  {
    "code": "SM",
    "name": "San Marino",
    "icon": "/logos/flags/1x1/sm.svg",
    "flag": "/logos/flags/4x3/sm.svg"
  },
  {
    "code": "SN",
    "name": "Senegal",
    "icon": "/logos/flags/1x1/sn.svg",
    "flag": "/logos/flags/4x3/sn.svg"
  },
  {
    "code": "SO",
    "name": "Somalia",
    "icon": "/logos/flags/1x1/so.svg",
    "flag": "/logos/flags/4x3/so.svg"
  },
  {
    "code": "SR",
    "name": "Suriname",
    "icon": "/logos/flags/1x1/sr.svg",
    "flag": "/logos/flags/4x3/sr.svg"
  },
  {
    "code": "SS",
    "name": "South Sudan",
    "icon": "/logos/flags/1x1/ss.svg",
    "flag": "/logos/flags/4x3/ss.svg"
  },
  {
    "code": "ST",
    "name": "Sao Tome and Principe",
    "icon": "/logos/flags/1x1/st.svg",
    "flag": "/logos/flags/4x3/st.svg"
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "icon": "/logos/flags/1x1/sv.svg",
    "flag": "/logos/flags/4x3/sv.svg"
  },
  {
    "code": "SX",
    "name": "Sint Maarten",
    "icon": "/logos/flags/1x1/sx.svg",
    "flag": "/logos/flags/4x3/sx.svg"
  },
  {
    "code": "SY",
    "name": "Syria",
    "icon": "/logos/flags/1x1/sy.svg",
    "flag": "/logos/flags/4x3/sy.svg"
  },
  {
    "code": "SZ",
    "name": "Eswatini",
    "icon": "/logos/flags/1x1/sz.svg",
    "flag": "/logos/flags/4x3/sz.svg"
  },
  {
    "code": "TC",
    "name": "Turks and Caicos Islands",
    "icon": "/logos/flags/1x1/tc.svg",
    "flag": "/logos/flags/4x3/tc.svg"
  },
  {
    "code": "TD",
    "name": "Chad",
    "icon": "/logos/flags/1x1/td.svg",
    "flag": "/logos/flags/4x3/td.svg"
  },
  {
    "code": "TF",
    "name": "French Southern Territories",
    "icon": "/logos/flags/1x1/tf.svg",
    "flag": "/logos/flags/4x3/tf.svg"
  },
  {
    "code": "TG",
    "name": "Togo",
    "icon": "/logos/flags/1x1/tg.svg",
    "flag": "/logos/flags/4x3/tg.svg"
  },
  {
    "code": "TH",
    "name": "Thailand",
    "icon": "/logos/flags/1x1/th.svg",
    "flag": "/logos/flags/4x3/th.svg"
  },
  {
    "code": "TJ",
    "name": "Tajikistan",
    "icon": "/logos/flags/1x1/tj.svg",
    "flag": "/logos/flags/4x3/tj.svg"
  },
  {
    "code": "TK",
    "name": "Tokelau",
    "icon": "/logos/flags/1x1/tk.svg",
    "flag": "/logos/flags/4x3/tk.svg"
  },
  {
    "code": "TL",
    "name": "Timor-Leste",
    "icon": "/logos/flags/1x1/tl.svg",
    "flag": "/logos/flags/4x3/tl.svg"
  },
  {
    "code": "TM",
    "name": "Turkmenistan",
    "icon": "/logos/flags/1x1/tm.svg",
    "flag": "/logos/flags/4x3/tm.svg"
  },
  {
    "code": "TN",
    "name": "Tunisia",
    "icon": "/logos/flags/1x1/tn.svg",
    "flag": "/logos/flags/4x3/tn.svg"
  },
  {
    "code": "TO",
    "name": "Tonga",
    "icon": "/logos/flags/1x1/to.svg",
    "flag": "/logos/flags/4x3/to.svg"
  },
  {
    "code": "TR",
    "name": "Türkiye",
    "icon": "/logos/flags/1x1/tr.svg",
    "flag": "/logos/flags/4x3/tr.svg"
  },
  {
    "code": "TT",
    "name": "Trinidad and Tobago",
    "icon": "/logos/flags/1x1/tt.svg",
    "flag": "/logos/flags/4x3/tt.svg"
  },
  {
    "code": "TV",
    "name": "Tuvalu",
    "icon": "/logos/flags/1x1/tv.svg",
    "flag": "/logos/flags/4x3/tv.svg"
  },
  {
    "code": "TW",
    "name": "Taiwan",
    "icon": "/logos/flags/1x1/tw.svg",
    "flag": "/logos/flags/4x3/tw.svg"
  },
  {
    "code": "TZ",
    "name": "Tanzania",
    "icon": "/logos/flags/1x1/tz.svg",
    "flag": "/logos/flags/4x3/tz.svg"
  },
  {
    "code": "UA",
    "name": "Ukraine",
    "icon": "/logos/flags/1x1/ua.svg",
    "flag": "/logos/flags/4x3/ua.svg"
  },
  {
    "code": "UG",
    "name": "Uganda",
    "icon": "/logos/flags/1x1/ug.svg",
    "flag": "/logos/flags/4x3/ug.svg"
  },
  {
    "code": "UM",
    "name": "United States Minor Outlying Islands",
    "icon": "/logos/flags/1x1/um.svg",
    "flag": "/logos/flags/4x3/um.svg"
  },
  {
    "code": "UN",
    "name": "United Nations",
    "icon": "/logos/flags/1x1/un.svg",
    "flag": "/logos/flags/4x3/un.svg"
  },
  {
    "code": "US",
    "name": "United States of America",
    "icon": "/logos/flags/1x1/us.svg",
    "flag": "/logos/flags/4x3/us.svg"
  },
  {
    "code": "UY",
    "name": "Uruguay",
    "icon": "/logos/flags/1x1/uy.svg",
    "flag": "/logos/flags/4x3/uy.svg"
  },
  {
    "code": "UZ",
    "name": "Uzbekistan",
    "icon": "/logos/flags/1x1/uz.svg",
    "flag": "/logos/flags/4x3/uz.svg"
  },
  {
    "code": "VA",
    "name": "Holy See",
    "icon": "/logos/flags/1x1/va.svg",
    "flag": "/logos/flags/4x3/va.svg"
  },
  {
    "code": "VC",
    "name": "Saint Vincent and the Grenadines",
    "icon": "/logos/flags/1x1/vc.svg",
    "flag": "/logos/flags/4x3/vc.svg"
  },
  {
    "code": "VE",
    "name": "Venezuela",
    "icon": "/logos/flags/1x1/ve.svg",
    "flag": "/logos/flags/4x3/ve.svg"
  },
  {
    "code": "VG",
    "name": "Virgin Islands (British)",
    "icon": "/logos/flags/1x1/vg.svg",
    "flag": "/logos/flags/4x3/vg.svg"
  },
  {
    "code": "VI",
    "name": "Virgin Islands (U.S.)",
    "icon": "/logos/flags/1x1/vi.svg",
    "flag": "/logos/flags/4x3/vi.svg"
  },
  {
    "code": "VN",
    "name": "Vietnam",
    "icon": "/logos/flags/1x1/vn.svg",
    "flag": "/logos/flags/4x3/vn.svg"
  },
  {
    "code": "VU",
    "name": "Vanuatu",
    "icon": "/logos/flags/1x1/vu.svg",
    "flag": "/logos/flags/4x3/vu.svg"
  },
  {
    "code": "WF",
    "name": "Wallis and Futuna",
    "icon": "/logos/flags/1x1/wf.svg",
    "flag": "/logos/flags/4x3/wf.svg"
  },
  {
    "code": "WS",
    "name": "Samoa",
    "icon": "/logos/flags/1x1/ws.svg",
    "flag": "/logos/flags/4x3/ws.svg"
  },
  {
    "code": "XK",
    "name": "Kosovo",
    "icon": "/logos/flags/1x1/xk.svg",
    "flag": "/logos/flags/4x3/xk.svg"
  },
  {
    "code": "XX",
    "name": "Unknown",
    "icon": "/logos/flags/1x1/xx.svg",
    "flag": "/logos/flags/4x3/xx.svg"
  },
  {
    "code": "YE",
    "name": "Yemen",
    "icon": "/logos/flags/1x1/ye.svg",
    "flag": "/logos/flags/4x3/ye.svg"
  },
  {
    "code": "YT",
    "name": "Mayotte",
    "icon": "/logos/flags/1x1/yt.svg",
    "flag": "/logos/flags/4x3/yt.svg"
  },
  {
    "code": "ZA",
    "name": "South Africa",
    "icon": "/logos/flags/1x1/za.svg",
    "flag": "/logos/flags/4x3/za.svg"
  },
  {
    "code": "ZM",
    "name": "Zambia",
    "icon": "/logos/flags/1x1/zm.svg",
    "flag": "/logos/flags/4x3/zm.svg"
  },
  {
    "code": "ZW",
    "name": "Zimbabwe",
    "icon": "/logos/flags/1x1/zw.svg",
    "flag": "/logos/flags/4x3/zw.svg"
  }
];

export const regionIcons: RegionIconEntry[] = [
  {
    "code": "AE-AJ",
    "country": "AE",
    "name": "AE · AJ",
    "icon": "/logos/regions/AE-AJ.svg"
  },
  {
    "code": "AE-AZ",
    "country": "AE",
    "name": "AE · AZ",
    "icon": "/logos/regions/AE-AZ.svg"
  },
  {
    "code": "AE-DU",
    "country": "AE",
    "name": "AE · DU",
    "icon": "/logos/regions/AE-DU.svg"
  },
  {
    "code": "AE-FU",
    "country": "AE",
    "name": "AE · FU",
    "icon": "/logos/regions/AE-FU.svg"
  },
  {
    "code": "AE-SH",
    "country": "AE",
    "name": "AE · SH",
    "icon": "/logos/regions/AE-SH.svg"
  },
  {
    "code": "AE-UQ",
    "country": "AE",
    "name": "AE · UQ",
    "icon": "/logos/regions/AE-UQ.svg"
  },
  {
    "code": "AR-A",
    "country": "AR",
    "name": "AR · A",
    "icon": "/logos/regions/AR-A.svg"
  },
  {
    "code": "AR-B",
    "country": "AR",
    "name": "AR · B",
    "icon": "/logos/regions/AR-B.svg"
  },
  {
    "code": "AR-C",
    "country": "AR",
    "name": "AR · C",
    "icon": "/logos/regions/AR-C.svg"
  },
  {
    "code": "AR-D",
    "country": "AR",
    "name": "AR · D",
    "icon": "/logos/regions/AR-D.svg"
  },
  {
    "code": "AR-E",
    "country": "AR",
    "name": "AR · E",
    "icon": "/logos/regions/AR-E.svg"
  },
  {
    "code": "AR-F",
    "country": "AR",
    "name": "AR · F",
    "icon": "/logos/regions/AR-F.svg"
  },
  {
    "code": "AR-G",
    "country": "AR",
    "name": "AR · G",
    "icon": "/logos/regions/AR-G.svg"
  },
  {
    "code": "AR-H",
    "country": "AR",
    "name": "AR · H",
    "icon": "/logos/regions/AR-H.svg"
  },
  {
    "code": "AU-ACT",
    "country": "AU",
    "name": "AU · ACT",
    "icon": "/logos/regions/AU-ACT.svg"
  },
  {
    "code": "AU-NSW",
    "country": "AU",
    "name": "AU · NSW",
    "icon": "/logos/regions/AU-NSW.svg"
  },
  {
    "code": "AU-NT",
    "country": "AU",
    "name": "AU · NT",
    "icon": "/logos/regions/AU-NT.svg"
  },
  {
    "code": "AU-QLD",
    "country": "AU",
    "name": "AU · QLD",
    "icon": "/logos/regions/AU-QLD.svg"
  },
  {
    "code": "AU-SA",
    "country": "AU",
    "name": "AU · SA",
    "icon": "/logos/regions/AU-SA.svg"
  },
  {
    "code": "AU-TAS",
    "country": "AU",
    "name": "AU · TAS",
    "icon": "/logos/regions/AU-TAS.svg"
  },
  {
    "code": "AU-VIC",
    "country": "AU",
    "name": "AU · VIC",
    "icon": "/logos/regions/AU-VIC.svg"
  },
  {
    "code": "AU-WA",
    "country": "AU",
    "name": "AU · WA",
    "icon": "/logos/regions/AU-WA.svg"
  },
  {
    "code": "BE-BRU",
    "country": "BE",
    "name": "BE · BRU",
    "icon": "/logos/regions/BE-BRU.svg"
  },
  {
    "code": "BE-VAN",
    "country": "BE",
    "name": "BE · VAN",
    "icon": "/logos/regions/BE-VAN.svg"
  },
  {
    "code": "BE-VBR",
    "country": "BE",
    "name": "BE · VBR",
    "icon": "/logos/regions/BE-VBR.svg"
  },
  {
    "code": "BE-VLG",
    "country": "BE",
    "name": "BE · VLG",
    "icon": "/logos/regions/BE-VLG.svg"
  },
  {
    "code": "BE-VLI",
    "country": "BE",
    "name": "BE · VLI",
    "icon": "/logos/regions/BE-VLI.svg"
  },
  {
    "code": "BE-VOV",
    "country": "BE",
    "name": "BE · VOV",
    "icon": "/logos/regions/BE-VOV.svg"
  },
  {
    "code": "BE-VWV",
    "country": "BE",
    "name": "BE · VWV",
    "icon": "/logos/regions/BE-VWV.svg"
  },
  {
    "code": "BE-WAL",
    "country": "BE",
    "name": "BE · WAL",
    "icon": "/logos/regions/BE-WAL.svg"
  },
  {
    "code": "BF-BC",
    "country": "BF",
    "name": "BF · Boucle du Mouhoun",
    "icon": "/logos/regions/BF-BC.svg"
  },
  {
    "code": "BF-CE",
    "country": "BF",
    "name": "BF · Centre",
    "icon": "/logos/regions/BF-CE.svg"
  },
  {
    "code": "BF-CS",
    "country": "BF",
    "name": "BF · Cascades",
    "icon": "/logos/regions/BF-CS.svg"
  },
  {
    "code": "BF-ES",
    "country": "BF",
    "name": "BF · Centre-Est",
    "icon": "/logos/regions/BF-ES.svg"
  },
  {
    "code": "BF-HB",
    "country": "BF",
    "name": "BF · Hauts-Bassins",
    "icon": "/logos/regions/BF-HB.svg"
  },
  {
    "code": "BF-NO",
    "country": "BF",
    "name": "BF · Centre-Nord",
    "icon": "/logos/regions/BF-NO.svg"
  },
  {
    "code": "BF-OU",
    "country": "BF",
    "name": "BF · Centre-Ouest",
    "icon": "/logos/regions/BF-OU.svg"
  },
  {
    "code": "BF-PC",
    "country": "BF",
    "name": "BF · Plateau-Central",
    "icon": "/logos/regions/BF-PC.svg"
  },
  {
    "code": "BF-SA",
    "country": "BF",
    "name": "BF · Sahel",
    "icon": "/logos/regions/BF-SA.svg"
  },
  {
    "code": "BF-SO",
    "country": "BF",
    "name": "BF · Sud-Ouest",
    "icon": "/logos/regions/BF-SO.svg"
  },
  {
    "code": "BF-SU",
    "country": "BF",
    "name": "BF · Centre-Sud",
    "icon": "/logos/regions/BF-SU.svg"
  },
  {
    "code": "BJ-AK",
    "country": "BJ",
    "name": "BJ · Atacora",
    "icon": "/logos/regions/BJ-AK.svg"
  },
  {
    "code": "BJ-AL",
    "country": "BJ",
    "name": "BJ · Alibori",
    "icon": "/logos/regions/BJ-AL.svg"
  },
  {
    "code": "BJ-AQ",
    "country": "BJ",
    "name": "BJ · Atlantique",
    "icon": "/logos/regions/BJ-AQ.svg"
  },
  {
    "code": "BJ-BO",
    "country": "BJ",
    "name": "BJ · Borgou",
    "icon": "/logos/regions/BJ-BO.svg"
  },
  {
    "code": "BJ-CO",
    "country": "BJ",
    "name": "BJ · Collines",
    "icon": "/logos/regions/BJ-CO.svg"
  },
  {
    "code": "BJ-DO",
    "country": "BJ",
    "name": "BJ · Donga",
    "icon": "/logos/regions/BJ-DO.svg"
  },
  {
    "code": "BJ-KO",
    "country": "BJ",
    "name": "BJ · Couffo",
    "icon": "/logos/regions/BJ-KO.svg"
  },
  {
    "code": "BJ-LI",
    "country": "BJ",
    "name": "BJ · Littoral",
    "icon": "/logos/regions/BJ-LI.svg"
  },
  {
    "code": "BJ-MO",
    "country": "BJ",
    "name": "BJ · Mono",
    "icon": "/logos/regions/BJ-MO.svg"
  },
  {
    "code": "BJ-OU",
    "country": "BJ",
    "name": "BJ · Ouémé",
    "icon": "/logos/regions/BJ-OU.svg"
  },
  {
    "code": "BJ-PL",
    "country": "BJ",
    "name": "BJ · Plateau",
    "icon": "/logos/regions/BJ-PL.svg"
  },
  {
    "code": "BJ-ZO",
    "country": "BJ",
    "name": "BJ · Zou",
    "icon": "/logos/regions/BJ-ZO.svg"
  },
  {
    "code": "BR-AC",
    "country": "BR",
    "name": "BR · AC",
    "icon": "/logos/regions/BR-AC.svg"
  },
  {
    "code": "BR-AL",
    "country": "BR",
    "name": "BR · AL",
    "icon": "/logos/regions/BR-AL.svg"
  },
  {
    "code": "BR-AM",
    "country": "BR",
    "name": "BR · AM",
    "icon": "/logos/regions/BR-AM.svg"
  },
  {
    "code": "BR-AP",
    "country": "BR",
    "name": "BR · AP",
    "icon": "/logos/regions/BR-AP.svg"
  },
  {
    "code": "BR-BA",
    "country": "BR",
    "name": "BR · BA",
    "icon": "/logos/regions/BR-BA.svg"
  },
  {
    "code": "BR-CE",
    "country": "BR",
    "name": "BR · CE",
    "icon": "/logos/regions/BR-CE.svg"
  },
  {
    "code": "BR-DF",
    "country": "BR",
    "name": "BR · DF",
    "icon": "/logos/regions/BR-DF.svg"
  },
  {
    "code": "BR-ES",
    "country": "BR",
    "name": "BR · ES",
    "icon": "/logos/regions/BR-ES.svg"
  },
  {
    "code": "BW-GA",
    "country": "BW",
    "name": "BW · GA",
    "icon": "/logos/regions/BW-GA.svg"
  },
  {
    "code": "CA-AB",
    "country": "CA",
    "name": "CA · AB",
    "icon": "/logos/regions/CA-AB.svg"
  },
  {
    "code": "CA-BC",
    "country": "CA",
    "name": "CA · BC",
    "icon": "/logos/regions/CA-BC.svg"
  },
  {
    "code": "CA-MB",
    "country": "CA",
    "name": "CA · MB",
    "icon": "/logos/regions/CA-MB.svg"
  },
  {
    "code": "CA-NB",
    "country": "CA",
    "name": "CA · NB",
    "icon": "/logos/regions/CA-NB.svg"
  },
  {
    "code": "CA-NL",
    "country": "CA",
    "name": "CA · NL",
    "icon": "/logos/regions/CA-NL.svg"
  },
  {
    "code": "CA-NS",
    "country": "CA",
    "name": "CA · NS",
    "icon": "/logos/regions/CA-NS.svg"
  },
  {
    "code": "CA-NT",
    "country": "CA",
    "name": "CA · NT",
    "icon": "/logos/regions/CA-NT.svg"
  },
  {
    "code": "CA-NU",
    "country": "CA",
    "name": "CA · NU",
    "icon": "/logos/regions/CA-NU.svg"
  },
  {
    "code": "CD-BC",
    "country": "CD",
    "name": "CD · Bas-Congo",
    "icon": "/logos/regions/CD-BC.svg"
  },
  {
    "code": "CD-BW",
    "country": "CD",
    "name": "CD · Bandundu",
    "icon": "/logos/regions/CD-BW.svg"
  },
  {
    "code": "CD-EQ",
    "country": "CD",
    "name": "CD · Équateur",
    "icon": "/logos/regions/CD-EQ.svg"
  },
  {
    "code": "CD-KN",
    "country": "CD",
    "name": "CD · KN",
    "icon": "/logos/regions/CD-KN.svg"
  },
  {
    "code": "CD-KS",
    "country": "CD",
    "name": "CD · Kasaï-Oriental",
    "icon": "/logos/regions/CD-KS.svg"
  },
  {
    "code": "CD-KT",
    "country": "CD",
    "name": "CD · Katanga",
    "icon": "/logos/regions/CD-KT.svg"
  },
  {
    "code": "CD-KW",
    "country": "CD",
    "name": "CD · Kasaï-Occidental",
    "icon": "/logos/regions/CD-KW.svg"
  },
  {
    "code": "CD-MA",
    "country": "CD",
    "name": "CD · Maniema",
    "icon": "/logos/regions/CD-MA.svg"
  },
  {
    "code": "CD-NK",
    "country": "CD",
    "name": "CD · Nord-Kivu",
    "icon": "/logos/regions/CD-NK.svg"
  },
  {
    "code": "CD-OR",
    "country": "CD",
    "name": "CD · Orientale",
    "icon": "/logos/regions/CD-OR.svg"
  },
  {
    "code": "CD-SA",
    "country": "CD",
    "name": "CD · SA",
    "icon": "/logos/regions/CD-SA.svg"
  },
  {
    "code": "CD-SK",
    "country": "CD",
    "name": "CD · Sud-Kivu",
    "icon": "/logos/regions/CD-SK.svg"
  },
  {
    "code": "CG-16",
    "country": "CG",
    "name": "CG · 16",
    "icon": "/logos/regions/CG-16.svg"
  },
  {
    "code": "CG-BR",
    "country": "CG",
    "name": "CG · Brazzaville",
    "icon": "/logos/regions/CG-BR.svg"
  },
  {
    "code": "CG-BZ",
    "country": "CG",
    "name": "CG · Bouenza",
    "icon": "/logos/regions/CG-BZ.svg"
  },
  {
    "code": "CG-CU",
    "country": "CG",
    "name": "CG · Cuvette",
    "icon": "/logos/regions/CG-CU.svg"
  },
  {
    "code": "CG-CUO",
    "country": "CG",
    "name": "CG · Cuvette-Ouest",
    "icon": "/logos/regions/CG-CUO.svg"
  },
  {
    "code": "CG-KO",
    "country": "CG",
    "name": "CG · Kouilou",
    "icon": "/logos/regions/CG-KO.svg"
  },
  {
    "code": "CG-LE",
    "country": "CG",
    "name": "CG · Lékoumou",
    "icon": "/logos/regions/CG-LE.svg"
  },
  {
    "code": "CG-LI",
    "country": "CG",
    "name": "CG · Likouala",
    "icon": "/logos/regions/CG-LI.svg"
  },
  {
    "code": "CG-NI",
    "country": "CG",
    "name": "CG · Niari",
    "icon": "/logos/regions/CG-NI.svg"
  },
  {
    "code": "CG-PL",
    "country": "CG",
    "name": "CG · Plateaux",
    "icon": "/logos/regions/CG-PL.svg"
  },
  {
    "code": "CG-PO",
    "country": "CG",
    "name": "CG · Pointe-Noire",
    "icon": "/logos/regions/CG-PO.svg"
  },
  {
    "code": "CH-AG",
    "country": "CH",
    "name": "CH · AG",
    "icon": "/logos/regions/CH-AG.svg"
  },
  {
    "code": "CH-AI",
    "country": "CH",
    "name": "CH · AI",
    "icon": "/logos/regions/CH-AI.svg"
  },
  {
    "code": "CH-AR",
    "country": "CH",
    "name": "CH · AR",
    "icon": "/logos/regions/CH-AR.svg"
  },
  {
    "code": "CH-BE",
    "country": "CH",
    "name": "CH · BE",
    "icon": "/logos/regions/CH-BE.svg"
  },
  {
    "code": "CH-BL",
    "country": "CH",
    "name": "CH · BL",
    "icon": "/logos/regions/CH-BL.svg"
  },
  {
    "code": "CH-BS",
    "country": "CH",
    "name": "CH · BS",
    "icon": "/logos/regions/CH-BS.svg"
  },
  {
    "code": "CH-FR",
    "country": "CH",
    "name": "CH · FR",
    "icon": "/logos/regions/CH-FR.svg"
  },
  {
    "code": "CH-GE",
    "country": "CH",
    "name": "CH · GE",
    "icon": "/logos/regions/CH-GE.svg"
  },
  {
    "code": "CI-AB",
    "country": "CI",
    "name": "CI · Abidjan",
    "icon": "/logos/regions/CI-AB.svg"
  },
  {
    "code": "CI-BS",
    "country": "CI",
    "name": "CI · Bas-Sassandra",
    "icon": "/logos/regions/CI-BS.svg"
  },
  {
    "code": "CI-CM",
    "country": "CI",
    "name": "CI · Comoé",
    "icon": "/logos/regions/CI-CM.svg"
  },
  {
    "code": "CI-DN",
    "country": "CI",
    "name": "CI · Denguélé",
    "icon": "/logos/regions/CI-DN.svg"
  },
  {
    "code": "CI-GB",
    "country": "CI",
    "name": "CI · Gôh-Djiboua",
    "icon": "/logos/regions/CI-GB.svg"
  },
  {
    "code": "CI-LC",
    "country": "CI",
    "name": "CI · Lacs",
    "icon": "/logos/regions/CI-LC.svg"
  },
  {
    "code": "CI-LG",
    "country": "CI",
    "name": "CI · Lagunes",
    "icon": "/logos/regions/CI-LG.svg"
  },
  {
    "code": "CI-MG",
    "country": "CI",
    "name": "CI · Montagnes",
    "icon": "/logos/regions/CI-MG.svg"
  },
  {
    "code": "CI-SV",
    "country": "CI",
    "name": "CI · Sassandra-Marahoué",
    "icon": "/logos/regions/CI-SV.svg"
  },
  {
    "code": "CI-SZ",
    "country": "CI",
    "name": "CI · Savanes",
    "icon": "/logos/regions/CI-SZ.svg"
  },
  {
    "code": "CI-VB",
    "country": "CI",
    "name": "CI · Vallée du Bandama",
    "icon": "/logos/regions/CI-VB.svg"
  },
  {
    "code": "CI-WR",
    "country": "CI",
    "name": "CI · Woroba",
    "icon": "/logos/regions/CI-WR.svg"
  },
  {
    "code": "CI-YM",
    "country": "CI",
    "name": "CI · Yamoussoukro",
    "icon": "/logos/regions/CI-YM.svg"
  },
  {
    "code": "CM-AD",
    "country": "CM",
    "name": "CM · Adamaoua",
    "icon": "/logos/regions/CM-AD.svg"
  },
  {
    "code": "CM-CE",
    "country": "CM",
    "name": "CM · Centre",
    "icon": "/logos/regions/CM-CE.svg"
  },
  {
    "code": "CM-EN",
    "country": "CM",
    "name": "CM · Extrême-Nord",
    "icon": "/logos/regions/CM-EN.svg"
  },
  {
    "code": "CM-ES",
    "country": "CM",
    "name": "CM · Est",
    "icon": "/logos/regions/CM-ES.svg"
  },
  {
    "code": "CM-LT",
    "country": "CM",
    "name": "CM · Littoral",
    "icon": "/logos/regions/CM-LT.svg"
  },
  {
    "code": "CM-NO",
    "country": "CM",
    "name": "CM · Nord",
    "icon": "/logos/regions/CM-NO.svg"
  },
  {
    "code": "CM-NW",
    "country": "CM",
    "name": "CM · Nord-Ouest",
    "icon": "/logos/regions/CM-NW.svg"
  },
  {
    "code": "CM-OU",
    "country": "CM",
    "name": "CM · Ouest",
    "icon": "/logos/regions/CM-OU.svg"
  },
  {
    "code": "CM-SU",
    "country": "CM",
    "name": "CM · Sud",
    "icon": "/logos/regions/CM-SU.svg"
  },
  {
    "code": "CM-SW",
    "country": "CM",
    "name": "CM · Sud-Ouest",
    "icon": "/logos/regions/CM-SW.svg"
  },
  {
    "code": "CN-HK",
    "country": "CN",
    "name": "CN · HK",
    "icon": "/logos/regions/CN-HK.svg"
  },
  {
    "code": "CN-MO",
    "country": "CN",
    "name": "CN · MO",
    "icon": "/logos/regions/CN-MO.svg"
  },
  {
    "code": "CV-MO",
    "country": "CV",
    "name": "CV · MO",
    "icon": "/logos/regions/CV-MO.svg"
  },
  {
    "code": "CV-PR",
    "country": "CV",
    "name": "CV · PR",
    "icon": "/logos/regions/CV-PR.svg"
  },
  {
    "code": "CV-SM",
    "country": "CV",
    "name": "CV · SM",
    "icon": "/logos/regions/CV-SM.svg"
  },
  {
    "code": "DE-BB",
    "country": "DE",
    "name": "DE · BB",
    "icon": "/logos/regions/DE-BB.svg"
  },
  {
    "code": "DE-BE",
    "country": "DE",
    "name": "DE · BE",
    "icon": "/logos/regions/DE-BE.svg"
  },
  {
    "code": "DE-BW",
    "country": "DE",
    "name": "DE · BW",
    "icon": "/logos/regions/DE-BW.svg"
  },
  {
    "code": "DE-BY",
    "country": "DE",
    "name": "DE · BY",
    "icon": "/logos/regions/DE-BY.svg"
  },
  {
    "code": "DE-HB",
    "country": "DE",
    "name": "DE · HB",
    "icon": "/logos/regions/DE-HB.svg"
  },
  {
    "code": "DE-HE",
    "country": "DE",
    "name": "DE · HE",
    "icon": "/logos/regions/DE-HE.svg"
  },
  {
    "code": "DE-HH",
    "country": "DE",
    "name": "DE · HH",
    "icon": "/logos/regions/DE-HH.svg"
  },
  {
    "code": "DE-MV",
    "country": "DE",
    "name": "DE · MV",
    "icon": "/logos/regions/DE-MV.svg"
  },
  {
    "code": "DZ-01",
    "country": "DZ",
    "name": "DZ · Adrar",
    "icon": "/logos/regions/DZ-01.svg"
  },
  {
    "code": "DZ-02",
    "country": "DZ",
    "name": "DZ · Chlef",
    "icon": "/logos/regions/DZ-02.svg"
  },
  {
    "code": "DZ-03",
    "country": "DZ",
    "name": "DZ · Laghouat",
    "icon": "/logos/regions/DZ-03.svg"
  },
  {
    "code": "DZ-04",
    "country": "DZ",
    "name": "DZ · Oum El Bouaghi",
    "icon": "/logos/regions/DZ-04.svg"
  },
  {
    "code": "DZ-05",
    "country": "DZ",
    "name": "DZ · Batna",
    "icon": "/logos/regions/DZ-05.svg"
  },
  {
    "code": "DZ-06",
    "country": "DZ",
    "name": "DZ · Béjaïa",
    "icon": "/logos/regions/DZ-06.svg"
  },
  {
    "code": "DZ-07",
    "country": "DZ",
    "name": "DZ · Biskra",
    "icon": "/logos/regions/DZ-07.svg"
  },
  {
    "code": "DZ-08",
    "country": "DZ",
    "name": "DZ · Béchar",
    "icon": "/logos/regions/DZ-08.svg"
  },
  {
    "code": "DZ-09",
    "country": "DZ",
    "name": "DZ · Blida",
    "icon": "/logos/regions/DZ-09.svg"
  },
  {
    "code": "DZ-10",
    "country": "DZ",
    "name": "DZ · Bouira",
    "icon": "/logos/regions/DZ-10.svg"
  },
  {
    "code": "DZ-11",
    "country": "DZ",
    "name": "DZ · Tamanrasset",
    "icon": "/logos/regions/DZ-11.svg"
  },
  {
    "code": "DZ-12",
    "country": "DZ",
    "name": "DZ · Tébessa",
    "icon": "/logos/regions/DZ-12.svg"
  },
  {
    "code": "DZ-13",
    "country": "DZ",
    "name": "DZ · Tlemcen",
    "icon": "/logos/regions/DZ-13.svg"
  },
  {
    "code": "DZ-14",
    "country": "DZ",
    "name": "DZ · Tiaret",
    "icon": "/logos/regions/DZ-14.svg"
  },
  {
    "code": "DZ-15",
    "country": "DZ",
    "name": "DZ · Tizi Ouzou",
    "icon": "/logos/regions/DZ-15.svg"
  },
  {
    "code": "DZ-16",
    "country": "DZ",
    "name": "DZ · Alger",
    "icon": "/logos/regions/DZ-16.svg"
  },
  {
    "code": "DZ-17",
    "country": "DZ",
    "name": "DZ · Djelfa",
    "icon": "/logos/regions/DZ-17.svg"
  },
  {
    "code": "DZ-18",
    "country": "DZ",
    "name": "DZ · Jijel",
    "icon": "/logos/regions/DZ-18.svg"
  },
  {
    "code": "DZ-19",
    "country": "DZ",
    "name": "DZ · Sétif",
    "icon": "/logos/regions/DZ-19.svg"
  },
  {
    "code": "DZ-20",
    "country": "DZ",
    "name": "DZ · Saïda",
    "icon": "/logos/regions/DZ-20.svg"
  },
  {
    "code": "DZ-21",
    "country": "DZ",
    "name": "DZ · Skikda",
    "icon": "/logos/regions/DZ-21.svg"
  },
  {
    "code": "DZ-22",
    "country": "DZ",
    "name": "DZ · Sidi Bel Abbès",
    "icon": "/logos/regions/DZ-22.svg"
  },
  {
    "code": "DZ-23",
    "country": "DZ",
    "name": "DZ · Annaba",
    "icon": "/logos/regions/DZ-23.svg"
  },
  {
    "code": "DZ-24",
    "country": "DZ",
    "name": "DZ · Guelma",
    "icon": "/logos/regions/DZ-24.svg"
  },
  {
    "code": "DZ-25",
    "country": "DZ",
    "name": "DZ · Constantine",
    "icon": "/logos/regions/DZ-25.svg"
  },
  {
    "code": "DZ-26",
    "country": "DZ",
    "name": "DZ · Médéa",
    "icon": "/logos/regions/DZ-26.svg"
  },
  {
    "code": "DZ-27",
    "country": "DZ",
    "name": "DZ · Mostaganem",
    "icon": "/logos/regions/DZ-27.svg"
  },
  {
    "code": "DZ-28",
    "country": "DZ",
    "name": "DZ · M’Sila",
    "icon": "/logos/regions/DZ-28.svg"
  },
  {
    "code": "DZ-29",
    "country": "DZ",
    "name": "DZ · Mascara",
    "icon": "/logos/regions/DZ-29.svg"
  },
  {
    "code": "DZ-30",
    "country": "DZ",
    "name": "DZ · Ouargla",
    "icon": "/logos/regions/DZ-30.svg"
  },
  {
    "code": "DZ-31",
    "country": "DZ",
    "name": "DZ · Oran",
    "icon": "/logos/regions/DZ-31.svg"
  },
  {
    "code": "EG-ALX",
    "country": "EG",
    "name": "EG · ALX",
    "icon": "/logos/regions/EG-ALX.svg"
  },
  {
    "code": "EG-ASN",
    "country": "EG",
    "name": "EG · ASN",
    "icon": "/logos/regions/EG-ASN.svg"
  },
  {
    "code": "EG-BH",
    "country": "EG",
    "name": "EG · BH",
    "icon": "/logos/regions/EG-BH.svg"
  },
  {
    "code": "EG-BNS",
    "country": "EG",
    "name": "EG · BNS",
    "icon": "/logos/regions/EG-BNS.svg"
  },
  {
    "code": "EG-DK",
    "country": "EG",
    "name": "EG · DK",
    "icon": "/logos/regions/EG-DK.svg"
  },
  {
    "code": "EG-DT",
    "country": "EG",
    "name": "EG · DT",
    "icon": "/logos/regions/EG-DT.svg"
  },
  {
    "code": "EG-JS",
    "country": "EG",
    "name": "EG · JS",
    "icon": "/logos/regions/EG-JS.svg"
  },
  {
    "code": "EG-KFS",
    "country": "EG",
    "name": "EG · KFS",
    "icon": "/logos/regions/EG-KFS.svg"
  },
  {
    "code": "ES-A",
    "country": "ES",
    "name": "ES · A",
    "icon": "/logos/regions/ES-A.svg"
  },
  {
    "code": "ES-AB",
    "country": "ES",
    "name": "ES · AB",
    "icon": "/logos/regions/ES-AB.svg"
  },
  {
    "code": "ES-AL",
    "country": "ES",
    "name": "ES · AL",
    "icon": "/logos/regions/ES-AL.svg"
  },
  {
    "code": "ES-AN",
    "country": "ES",
    "name": "ES · AN",
    "icon": "/logos/regions/ES-AN.svg"
  },
  {
    "code": "ES-AR",
    "country": "ES",
    "name": "ES · AR",
    "icon": "/logos/regions/ES-AR.svg"
  },
  {
    "code": "ES-AS",
    "country": "ES",
    "name": "ES · AS",
    "icon": "/logos/regions/ES-AS.svg"
  },
  {
    "code": "ES-AV",
    "country": "ES",
    "name": "ES · AV",
    "icon": "/logos/regions/ES-AV.svg"
  },
  {
    "code": "ES-B",
    "country": "ES",
    "name": "ES · B",
    "icon": "/logos/regions/ES-B.svg"
  },
  {
    "code": "ET-AA",
    "country": "ET",
    "name": "ET · AA",
    "icon": "/logos/regions/ET-AA.svg"
  },
  {
    "code": "ET-AF",
    "country": "ET",
    "name": "ET · AF",
    "icon": "/logos/regions/ET-AF.svg"
  },
  {
    "code": "ET-AM",
    "country": "ET",
    "name": "ET · AM",
    "icon": "/logos/regions/ET-AM.svg"
  },
  {
    "code": "ET-BE",
    "country": "ET",
    "name": "ET · BE",
    "icon": "/logos/regions/ET-BE.svg"
  },
  {
    "code": "ET-GA",
    "country": "ET",
    "name": "ET · GA",
    "icon": "/logos/regions/ET-GA.svg"
  },
  {
    "code": "ET-HA",
    "country": "ET",
    "name": "ET · HA",
    "icon": "/logos/regions/ET-HA.svg"
  },
  {
    "code": "ET-OR",
    "country": "ET",
    "name": "ET · OR",
    "icon": "/logos/regions/ET-OR.svg"
  },
  {
    "code": "ET-SI",
    "country": "ET",
    "name": "ET · SI",
    "icon": "/logos/regions/ET-SI.svg"
  },
  {
    "code": "FR-01",
    "country": "FR",
    "name": "FR · 01",
    "icon": "/logos/regions/FR-01.svg"
  },
  {
    "code": "FR-02",
    "country": "FR",
    "name": "FR · 02",
    "icon": "/logos/regions/FR-02.svg"
  },
  {
    "code": "FR-03",
    "country": "FR",
    "name": "FR · 03",
    "icon": "/logos/regions/FR-03.svg"
  },
  {
    "code": "FR-04",
    "country": "FR",
    "name": "FR · 04",
    "icon": "/logos/regions/FR-04.svg"
  },
  {
    "code": "FR-05",
    "country": "FR",
    "name": "FR · 05",
    "icon": "/logos/regions/FR-05.svg"
  },
  {
    "code": "FR-06",
    "country": "FR",
    "name": "FR · 06",
    "icon": "/logos/regions/FR-06.svg"
  },
  {
    "code": "FR-07",
    "country": "FR",
    "name": "FR · 07",
    "icon": "/logos/regions/FR-07.svg"
  },
  {
    "code": "FR-08",
    "country": "FR",
    "name": "FR · 08",
    "icon": "/logos/regions/FR-08.svg"
  },
  {
    "code": "GA-1",
    "country": "GA",
    "name": "GA · 1",
    "icon": "/logos/regions/GA-1.svg"
  },
  {
    "code": "GA-2",
    "country": "GA",
    "name": "GA · 2",
    "icon": "/logos/regions/GA-2.svg"
  },
  {
    "code": "GA-3",
    "country": "GA",
    "name": "GA · 3",
    "icon": "/logos/regions/GA-3.svg"
  },
  {
    "code": "GA-4",
    "country": "GA",
    "name": "GA · 4",
    "icon": "/logos/regions/GA-4.svg"
  },
  {
    "code": "GA-5",
    "country": "GA",
    "name": "GA · 5",
    "icon": "/logos/regions/GA-5.svg"
  },
  {
    "code": "GA-6",
    "country": "GA",
    "name": "GA · 6",
    "icon": "/logos/regions/GA-6.svg"
  },
  {
    "code": "GA-7",
    "country": "GA",
    "name": "GA · 7",
    "icon": "/logos/regions/GA-7.svg"
  },
  {
    "code": "GA-8",
    "country": "GA",
    "name": "GA · 8",
    "icon": "/logos/regions/GA-8.svg"
  },
  {
    "code": "GA-ES",
    "country": "GA",
    "name": "GA · Estuaire",
    "icon": "/logos/regions/GA-ES.svg"
  },
  {
    "code": "GA-HA",
    "country": "GA",
    "name": "GA · Haut-Ogooué",
    "icon": "/logos/regions/GA-HA.svg"
  },
  {
    "code": "GA-MO",
    "country": "GA",
    "name": "GA · Moyen-Ogooué",
    "icon": "/logos/regions/GA-MO.svg"
  },
  {
    "code": "GA-NG",
    "country": "GA",
    "name": "GA · Ngounié",
    "icon": "/logos/regions/GA-NG.svg"
  },
  {
    "code": "GA-NY",
    "country": "GA",
    "name": "GA · Nyanga",
    "icon": "/logos/regions/GA-NY.svg"
  },
  {
    "code": "GA-OI",
    "country": "GA",
    "name": "GA · Ogooué-Ivindo",
    "icon": "/logos/regions/GA-OI.svg"
  },
  {
    "code": "GA-OL",
    "country": "GA",
    "name": "GA · Ogooué-Lolo",
    "icon": "/logos/regions/GA-OL.svg"
  },
  {
    "code": "GA-OM",
    "country": "GA",
    "name": "GA · Ogooué-Maritime",
    "icon": "/logos/regions/GA-OM.svg"
  },
  {
    "code": "GA-WN",
    "country": "GA",
    "name": "GA · Woleu-Ntem",
    "icon": "/logos/regions/GA-WN.svg"
  },
  {
    "code": "GB-ABD",
    "country": "GB",
    "name": "GB · ABD",
    "icon": "/logos/regions/GB-ABD.svg"
  },
  {
    "code": "GB-ABE",
    "country": "GB",
    "name": "GB · ABE",
    "icon": "/logos/regions/GB-ABE.svg"
  },
  {
    "code": "GB-AGY",
    "country": "GB",
    "name": "GB · AGY",
    "icon": "/logos/regions/GB-AGY.svg"
  },
  {
    "code": "GB-ANN",
    "country": "GB",
    "name": "GB · ANN",
    "icon": "/logos/regions/GB-ANN.svg"
  },
  {
    "code": "GB-BDF",
    "country": "GB",
    "name": "GB · BDF",
    "icon": "/logos/regions/GB-BDF.svg"
  },
  {
    "code": "GB-BIR",
    "country": "GB",
    "name": "GB · BIR",
    "icon": "/logos/regions/GB-BIR.svg"
  },
  {
    "code": "GB-BKM",
    "country": "GB",
    "name": "GB · BKM",
    "icon": "/logos/regions/GB-BKM.svg"
  },
  {
    "code": "GB-BNS",
    "country": "GB",
    "name": "GB · BNS",
    "icon": "/logos/regions/GB-BNS.svg"
  },
  {
    "code": "GH-AA",
    "country": "GH",
    "name": "GH · AA",
    "icon": "/logos/regions/GH-AA.svg"
  },
  {
    "code": "GH-AH",
    "country": "GH",
    "name": "GH · AH",
    "icon": "/logos/regions/GH-AH.svg"
  },
  {
    "code": "GH-AS",
    "country": "GH",
    "name": "GH · Ashanti",
    "icon": "/logos/regions/GH-AS.svg"
  },
  {
    "code": "GH-BE",
    "country": "GH",
    "name": "GH · Bono East",
    "icon": "/logos/regions/GH-BE.svg"
  },
  {
    "code": "GH-BO",
    "country": "GH",
    "name": "GH · Bono",
    "icon": "/logos/regions/GH-BO.svg"
  },
  {
    "code": "GH-CR",
    "country": "GH",
    "name": "GH · Central",
    "icon": "/logos/regions/GH-CR.svg"
  },
  {
    "code": "GH-EP",
    "country": "GH",
    "name": "GH · EP",
    "icon": "/logos/regions/GH-EP.svg"
  },
  {
    "code": "GH-ER",
    "country": "GH",
    "name": "GH · Eastern",
    "icon": "/logos/regions/GH-ER.svg"
  },
  {
    "code": "GH-GA",
    "country": "GH",
    "name": "GH · Greater Accra",
    "icon": "/logos/regions/GH-GA.svg"
  },
  {
    "code": "GH-NE",
    "country": "GH",
    "name": "GH · North East",
    "icon": "/logos/regions/GH-NE.svg"
  },
  {
    "code": "GH-NR",
    "country": "GH",
    "name": "GH · Northern",
    "icon": "/logos/regions/GH-NR.svg"
  },
  {
    "code": "GH-OT",
    "country": "GH",
    "name": "GH · Oti",
    "icon": "/logos/regions/GH-OT.svg"
  },
  {
    "code": "GH-SR",
    "country": "GH",
    "name": "GH · Savannah",
    "icon": "/logos/regions/GH-SR.svg"
  },
  {
    "code": "GH-UE",
    "country": "GH",
    "name": "GH · Upper East",
    "icon": "/logos/regions/GH-UE.svg"
  },
  {
    "code": "GH-UW",
    "country": "GH",
    "name": "GH · Upper West",
    "icon": "/logos/regions/GH-UW.svg"
  },
  {
    "code": "GH-VO",
    "country": "GH",
    "name": "GH · Volta",
    "icon": "/logos/regions/GH-VO.svg"
  },
  {
    "code": "GH-WE",
    "country": "GH",
    "name": "GH · Western",
    "icon": "/logos/regions/GH-WE.svg"
  },
  {
    "code": "GH-WN",
    "country": "GH",
    "name": "GH · Western North",
    "icon": "/logos/regions/GH-WN.svg"
  },
  {
    "code": "GM-B",
    "country": "GM",
    "name": "GM · B",
    "icon": "/logos/regions/GM-B.svg"
  },
  {
    "code": "IT-21",
    "country": "IT",
    "name": "IT · 21",
    "icon": "/logos/regions/IT-21.svg"
  },
  {
    "code": "IT-23",
    "country": "IT",
    "name": "IT · 23",
    "icon": "/logos/regions/IT-23.svg"
  },
  {
    "code": "IT-25",
    "country": "IT",
    "name": "IT · 25",
    "icon": "/logos/regions/IT-25.svg"
  },
  {
    "code": "IT-32",
    "country": "IT",
    "name": "IT · 32",
    "icon": "/logos/regions/IT-32.svg"
  },
  {
    "code": "IT-34",
    "country": "IT",
    "name": "IT · 34",
    "icon": "/logos/regions/IT-34.svg"
  },
  {
    "code": "IT-36",
    "country": "IT",
    "name": "IT · 36",
    "icon": "/logos/regions/IT-36.svg"
  },
  {
    "code": "IT-42",
    "country": "IT",
    "name": "IT · 42",
    "icon": "/logos/regions/IT-42.svg"
  },
  {
    "code": "IT-45",
    "country": "IT",
    "name": "IT · 45",
    "icon": "/logos/regions/IT-45.svg"
  },
  {
    "code": "JP-01",
    "country": "JP",
    "name": "JP · 01",
    "icon": "/logos/regions/JP-01.svg"
  },
  {
    "code": "JP-02",
    "country": "JP",
    "name": "JP · 02",
    "icon": "/logos/regions/JP-02.svg"
  },
  {
    "code": "JP-03",
    "country": "JP",
    "name": "JP · 03",
    "icon": "/logos/regions/JP-03.svg"
  },
  {
    "code": "JP-04",
    "country": "JP",
    "name": "JP · 04",
    "icon": "/logos/regions/JP-04.svg"
  },
  {
    "code": "JP-05",
    "country": "JP",
    "name": "JP · 05",
    "icon": "/logos/regions/JP-05.svg"
  },
  {
    "code": "JP-06",
    "country": "JP",
    "name": "JP · 06",
    "icon": "/logos/regions/JP-06.svg"
  },
  {
    "code": "JP-07",
    "country": "JP",
    "name": "JP · 07",
    "icon": "/logos/regions/JP-07.svg"
  },
  {
    "code": "JP-08",
    "country": "JP",
    "name": "JP · 08",
    "icon": "/logos/regions/JP-08.svg"
  },
  {
    "code": "KE-001",
    "country": "KE",
    "name": "KE · Mombasa",
    "icon": "/logos/regions/KE-001.svg"
  },
  {
    "code": "KE-002",
    "country": "KE",
    "name": "KE · Kwale",
    "icon": "/logos/regions/KE-002.svg"
  },
  {
    "code": "KE-003",
    "country": "KE",
    "name": "KE · Kilifi",
    "icon": "/logos/regions/KE-003.svg"
  },
  {
    "code": "KE-004",
    "country": "KE",
    "name": "KE · Tana River",
    "icon": "/logos/regions/KE-004.svg"
  },
  {
    "code": "KE-005",
    "country": "KE",
    "name": "KE · Lamu",
    "icon": "/logos/regions/KE-005.svg"
  },
  {
    "code": "KE-006",
    "country": "KE",
    "name": "KE · Taita Taveta",
    "icon": "/logos/regions/KE-006.svg"
  },
  {
    "code": "KE-007",
    "country": "KE",
    "name": "KE · Garissa",
    "icon": "/logos/regions/KE-007.svg"
  },
  {
    "code": "KE-008",
    "country": "KE",
    "name": "KE · Wajir",
    "icon": "/logos/regions/KE-008.svg"
  },
  {
    "code": "KE-009",
    "country": "KE",
    "name": "KE · Mandera",
    "icon": "/logos/regions/KE-009.svg"
  },
  {
    "code": "KE-010",
    "country": "KE",
    "name": "KE · Marsabit",
    "icon": "/logos/regions/KE-010.svg"
  },
  {
    "code": "KE-011",
    "country": "KE",
    "name": "KE · Isiolo",
    "icon": "/logos/regions/KE-011.svg"
  },
  {
    "code": "KE-012",
    "country": "KE",
    "name": "KE · Meru",
    "icon": "/logos/regions/KE-012.svg"
  },
  {
    "code": "KE-013",
    "country": "KE",
    "name": "KE · Tharaka Nithi",
    "icon": "/logos/regions/KE-013.svg"
  },
  {
    "code": "KE-014",
    "country": "KE",
    "name": "KE · Embu",
    "icon": "/logos/regions/KE-014.svg"
  },
  {
    "code": "KE-015",
    "country": "KE",
    "name": "KE · Kitui",
    "icon": "/logos/regions/KE-015.svg"
  },
  {
    "code": "KE-016",
    "country": "KE",
    "name": "KE · Machakos",
    "icon": "/logos/regions/KE-016.svg"
  },
  {
    "code": "KE-017",
    "country": "KE",
    "name": "KE · Makueni",
    "icon": "/logos/regions/KE-017.svg"
  },
  {
    "code": "KE-018",
    "country": "KE",
    "name": "KE · Nyandarua",
    "icon": "/logos/regions/KE-018.svg"
  },
  {
    "code": "KE-019",
    "country": "KE",
    "name": "KE · Nyeri",
    "icon": "/logos/regions/KE-019.svg"
  },
  {
    "code": "KE-020",
    "country": "KE",
    "name": "KE · Kirinyaga",
    "icon": "/logos/regions/KE-020.svg"
  },
  {
    "code": "KE-021",
    "country": "KE",
    "name": "KE · Murang’a",
    "icon": "/logos/regions/KE-021.svg"
  },
  {
    "code": "KE-022",
    "country": "KE",
    "name": "KE · Kiambu",
    "icon": "/logos/regions/KE-022.svg"
  },
  {
    "code": "KE-023",
    "country": "KE",
    "name": "KE · Turkana",
    "icon": "/logos/regions/KE-023.svg"
  },
  {
    "code": "KE-024",
    "country": "KE",
    "name": "KE · West Pokot",
    "icon": "/logos/regions/KE-024.svg"
  },
  {
    "code": "KE-025",
    "country": "KE",
    "name": "KE · Samburu",
    "icon": "/logos/regions/KE-025.svg"
  },
  {
    "code": "KE-026",
    "country": "KE",
    "name": "KE · Trans Nzoia",
    "icon": "/logos/regions/KE-026.svg"
  },
  {
    "code": "KE-027",
    "country": "KE",
    "name": "KE · Uasin Gishu",
    "icon": "/logos/regions/KE-027.svg"
  },
  {
    "code": "KE-028",
    "country": "KE",
    "name": "KE · Elgeyo Marakwet",
    "icon": "/logos/regions/KE-028.svg"
  },
  {
    "code": "KE-029",
    "country": "KE",
    "name": "KE · Nandi",
    "icon": "/logos/regions/KE-029.svg"
  },
  {
    "code": "KE-030",
    "country": "KE",
    "name": "KE · Baringo",
    "icon": "/logos/regions/KE-030.svg"
  },
  {
    "code": "KE-031",
    "country": "KE",
    "name": "KE · Laikipia",
    "icon": "/logos/regions/KE-031.svg"
  },
  {
    "code": "KE-032",
    "country": "KE",
    "name": "KE · Nakuru",
    "icon": "/logos/regions/KE-032.svg"
  },
  {
    "code": "KE-033",
    "country": "KE",
    "name": "KE · Narok",
    "icon": "/logos/regions/KE-033.svg"
  },
  {
    "code": "KE-034",
    "country": "KE",
    "name": "KE · Kajiado",
    "icon": "/logos/regions/KE-034.svg"
  },
  {
    "code": "KE-035",
    "country": "KE",
    "name": "KE · Kericho",
    "icon": "/logos/regions/KE-035.svg"
  },
  {
    "code": "KE-036",
    "country": "KE",
    "name": "KE · Bomet",
    "icon": "/logos/regions/KE-036.svg"
  },
  {
    "code": "KE-037",
    "country": "KE",
    "name": "KE · Kakamega",
    "icon": "/logos/regions/KE-037.svg"
  },
  {
    "code": "KE-038",
    "country": "KE",
    "name": "KE · Vihiga",
    "icon": "/logos/regions/KE-038.svg"
  },
  {
    "code": "KE-039",
    "country": "KE",
    "name": "KE · Bungoma",
    "icon": "/logos/regions/KE-039.svg"
  },
  {
    "code": "KE-04",
    "country": "KE",
    "name": "KE · 04",
    "icon": "/logos/regions/KE-04.svg"
  },
  {
    "code": "KE-040",
    "country": "KE",
    "name": "KE · Busia",
    "icon": "/logos/regions/KE-040.svg"
  },
  {
    "code": "KE-041",
    "country": "KE",
    "name": "KE · Siaya",
    "icon": "/logos/regions/KE-041.svg"
  },
  {
    "code": "KE-042",
    "country": "KE",
    "name": "KE · Kisumu",
    "icon": "/logos/regions/KE-042.svg"
  },
  {
    "code": "KE-043",
    "country": "KE",
    "name": "KE · Homa Bay",
    "icon": "/logos/regions/KE-043.svg"
  },
  {
    "code": "KE-044",
    "country": "KE",
    "name": "KE · Migori",
    "icon": "/logos/regions/KE-044.svg"
  },
  {
    "code": "KE-045",
    "country": "KE",
    "name": "KE · Kisii",
    "icon": "/logos/regions/KE-045.svg"
  },
  {
    "code": "KE-046",
    "country": "KE",
    "name": "KE · Nyamira",
    "icon": "/logos/regions/KE-046.svg"
  },
  {
    "code": "KE-047",
    "country": "KE",
    "name": "KE · Nairobi",
    "icon": "/logos/regions/KE-047.svg"
  },
  {
    "code": "KE-13",
    "country": "KE",
    "name": "KE · 13",
    "icon": "/logos/regions/KE-13.svg"
  },
  {
    "code": "KE-19",
    "country": "KE",
    "name": "KE · 19",
    "icon": "/logos/regions/KE-19.svg"
  },
  {
    "code": "KE-24",
    "country": "KE",
    "name": "KE · 24",
    "icon": "/logos/regions/KE-24.svg"
  },
  {
    "code": "KE-28",
    "country": "KE",
    "name": "KE · 28",
    "icon": "/logos/regions/KE-28.svg"
  },
  {
    "code": "KE-30",
    "country": "KE",
    "name": "KE · 30",
    "icon": "/logos/regions/KE-30.svg"
  },
  {
    "code": "KE-45",
    "country": "KE",
    "name": "KE · 45",
    "icon": "/logos/regions/KE-45.svg"
  },
  {
    "code": "KE-46",
    "country": "KE",
    "name": "KE · 46",
    "icon": "/logos/regions/KE-46.svg"
  },
  {
    "code": "LR-BG",
    "country": "LR",
    "name": "LR · BG",
    "icon": "/logos/regions/LR-BG.svg"
  },
  {
    "code": "LR-BM",
    "country": "LR",
    "name": "LR · BM",
    "icon": "/logos/regions/LR-BM.svg"
  },
  {
    "code": "LR-CM",
    "country": "LR",
    "name": "LR · CM",
    "icon": "/logos/regions/LR-CM.svg"
  },
  {
    "code": "LR-GB",
    "country": "LR",
    "name": "LR · GB",
    "icon": "/logos/regions/LR-GB.svg"
  },
  {
    "code": "LR-GG",
    "country": "LR",
    "name": "LR · GG",
    "icon": "/logos/regions/LR-GG.svg"
  },
  {
    "code": "LR-GK",
    "country": "LR",
    "name": "LR · GK",
    "icon": "/logos/regions/LR-GK.svg"
  },
  {
    "code": "LR-GP",
    "country": "LR",
    "name": "LR · GP",
    "icon": "/logos/regions/LR-GP.svg"
  },
  {
    "code": "LR-LO",
    "country": "LR",
    "name": "LR · LO",
    "icon": "/logos/regions/LR-LO.svg"
  },
  {
    "code": "MA-07",
    "country": "MA",
    "name": "MA · 07",
    "icon": "/logos/regions/MA-07.svg"
  },
  {
    "code": "MA-BS",
    "country": "MA",
    "name": "MA · Béni Mellal-Khénifra",
    "icon": "/logos/regions/MA-BS.svg"
  },
  {
    "code": "MA-CS",
    "country": "MA",
    "name": "MA · Casablanca-Settat",
    "icon": "/logos/regions/MA-CS.svg"
  },
  {
    "code": "MA-DA",
    "country": "MA",
    "name": "MA · Dakhla-Oued Ed Dahab",
    "icon": "/logos/regions/MA-DA.svg"
  },
  {
    "code": "MA-DR",
    "country": "MA",
    "name": "MA · Drâa-Tafilalet",
    "icon": "/logos/regions/MA-DR.svg"
  },
  {
    "code": "MA-FS",
    "country": "MA",
    "name": "MA · Fès-Meknès",
    "icon": "/logos/regions/MA-FS.svg"
  },
  {
    "code": "MA-GD",
    "country": "MA",
    "name": "MA · Guelmim-Oued Noun",
    "icon": "/logos/regions/MA-GD.svg"
  },
  {
    "code": "MA-LC",
    "country": "MA",
    "name": "MA · Laâyoune-Sakia El Hamra",
    "icon": "/logos/regions/MA-LC.svg"
  },
  {
    "code": "MA-MG",
    "country": "MA",
    "name": "MA · Marrakech-Safi",
    "icon": "/logos/regions/MA-MG.svg"
  },
  {
    "code": "MA-OR",
    "country": "MA",
    "name": "MA · Oriental",
    "icon": "/logos/regions/MA-OR.svg"
  },
  {
    "code": "MA-RS",
    "country": "MA",
    "name": "MA · Rabat-Salé-Kénitra",
    "icon": "/logos/regions/MA-RS.svg"
  },
  {
    "code": "MA-SG",
    "country": "MA",
    "name": "MA · Souss-Massa",
    "icon": "/logos/regions/MA-SG.svg"
  },
  {
    "code": "MA-TK",
    "country": "MA",
    "name": "MA · Tanger-Tétouan-Al Hoceïma",
    "icon": "/logos/regions/MA-TK.svg"
  },
  {
    "code": "MX-AGU",
    "country": "MX",
    "name": "MX · AGU",
    "icon": "/logos/regions/MX-AGU.svg"
  },
  {
    "code": "MX-BCN",
    "country": "MX",
    "name": "MX · BCN",
    "icon": "/logos/regions/MX-BCN.svg"
  },
  {
    "code": "MX-BCS",
    "country": "MX",
    "name": "MX · BCS",
    "icon": "/logos/regions/MX-BCS.svg"
  },
  {
    "code": "MX-CAM",
    "country": "MX",
    "name": "MX · CAM",
    "icon": "/logos/regions/MX-CAM.svg"
  },
  {
    "code": "MX-CHH",
    "country": "MX",
    "name": "MX · CHH",
    "icon": "/logos/regions/MX-CHH.svg"
  },
  {
    "code": "MX-CHP",
    "country": "MX",
    "name": "MX · CHP",
    "icon": "/logos/regions/MX-CHP.svg"
  },
  {
    "code": "MX-COA",
    "country": "MX",
    "name": "MX · COA",
    "icon": "/logos/regions/MX-COA.svg"
  },
  {
    "code": "MX-COL",
    "country": "MX",
    "name": "MX · COL",
    "icon": "/logos/regions/MX-COL.svg"
  },
  {
    "code": "NG-AB",
    "country": "NG",
    "name": "NG · Abia",
    "icon": "/logos/regions/NG-AB.svg"
  },
  {
    "code": "NG-AD",
    "country": "NG",
    "name": "NG · Adamawa",
    "icon": "/logos/regions/NG-AD.svg"
  },
  {
    "code": "NG-AK",
    "country": "NG",
    "name": "NG · AK",
    "icon": "/logos/regions/NG-AK.svg"
  },
  {
    "code": "NG-AN",
    "country": "NG",
    "name": "NG · Anambra",
    "icon": "/logos/regions/NG-AN.svg"
  },
  {
    "code": "NG-BA",
    "country": "NG",
    "name": "NG · Bauchi",
    "icon": "/logos/regions/NG-BA.svg"
  },
  {
    "code": "NG-BE",
    "country": "NG",
    "name": "NG · Benue",
    "icon": "/logos/regions/NG-BE.svg"
  },
  {
    "code": "NG-BO",
    "country": "NG",
    "name": "NG · Borno",
    "icon": "/logos/regions/NG-BO.svg"
  },
  {
    "code": "NG-BY",
    "country": "NG",
    "name": "NG · BY",
    "icon": "/logos/regions/NG-BY.svg"
  },
  {
    "code": "NG-CR",
    "country": "NG",
    "name": "NG · Cross River",
    "icon": "/logos/regions/NG-CR.svg"
  },
  {
    "code": "NG-DE",
    "country": "NG",
    "name": "NG · Delta",
    "icon": "/logos/regions/NG-DE.svg"
  },
  {
    "code": "NG-EB",
    "country": "NG",
    "name": "NG · Ebonyi",
    "icon": "/logos/regions/NG-EB.svg"
  },
  {
    "code": "NG-ED",
    "country": "NG",
    "name": "NG · Edo",
    "icon": "/logos/regions/NG-ED.svg"
  },
  {
    "code": "NG-EK",
    "country": "NG",
    "name": "NG · Ekiti",
    "icon": "/logos/regions/NG-EK.svg"
  },
  {
    "code": "NG-EN",
    "country": "NG",
    "name": "NG · Enugu",
    "icon": "/logos/regions/NG-EN.svg"
  },
  {
    "code": "NG-FC",
    "country": "NG",
    "name": "NG · FC",
    "icon": "/logos/regions/NG-FC.svg"
  },
  {
    "code": "NG-GO",
    "country": "NG",
    "name": "NG · GO",
    "icon": "/logos/regions/NG-GO.svg"
  },
  {
    "code": "NG-IM",
    "country": "NG",
    "name": "NG · Imo",
    "icon": "/logos/regions/NG-IM.svg"
  },
  {
    "code": "NG-JI",
    "country": "NG",
    "name": "NG · Jigawa",
    "icon": "/logos/regions/NG-JI.svg"
  },
  {
    "code": "NG-KD",
    "country": "NG",
    "name": "NG · Kaduna",
    "icon": "/logos/regions/NG-KD.svg"
  },
  {
    "code": "NG-KE",
    "country": "NG",
    "name": "NG · Kebbi",
    "icon": "/logos/regions/NG-KE.svg"
  },
  {
    "code": "NG-KN",
    "country": "NG",
    "name": "NG · Kano",
    "icon": "/logos/regions/NG-KN.svg"
  },
  {
    "code": "NG-KO",
    "country": "NG",
    "name": "NG · Kogi",
    "icon": "/logos/regions/NG-KO.svg"
  },
  {
    "code": "NG-KT",
    "country": "NG",
    "name": "NG · KT",
    "icon": "/logos/regions/NG-KT.svg"
  },
  {
    "code": "NG-KW",
    "country": "NG",
    "name": "NG · Kwara",
    "icon": "/logos/regions/NG-KW.svg"
  },
  {
    "code": "NG-LA",
    "country": "NG",
    "name": "NG · LA",
    "icon": "/logos/regions/NG-LA.svg"
  },
  {
    "code": "NG-NA",
    "country": "NG",
    "name": "NG · Nasarawa",
    "icon": "/logos/regions/NG-NA.svg"
  },
  {
    "code": "NG-NI",
    "country": "NG",
    "name": "NG · Niger",
    "icon": "/logos/regions/NG-NI.svg"
  },
  {
    "code": "NG-OG",
    "country": "NG",
    "name": "NG · Ogun",
    "icon": "/logos/regions/NG-OG.svg"
  },
  {
    "code": "NG-ON",
    "country": "NG",
    "name": "NG · Ondo",
    "icon": "/logos/regions/NG-ON.svg"
  },
  {
    "code": "NG-OS",
    "country": "NG",
    "name": "NG · OS",
    "icon": "/logos/regions/NG-OS.svg"
  },
  {
    "code": "NG-OY",
    "country": "NG",
    "name": "NG · OY",
    "icon": "/logos/regions/NG-OY.svg"
  },
  {
    "code": "NG-PL",
    "country": "NG",
    "name": "NG · Plateau",
    "icon": "/logos/regions/NG-PL.svg"
  },
  {
    "code": "NG-RI",
    "country": "NG",
    "name": "NG · Rivers",
    "icon": "/logos/regions/NG-RI.svg"
  },
  {
    "code": "NG-SO",
    "country": "NG",
    "name": "NG · Sokoto",
    "icon": "/logos/regions/NG-SO.svg"
  },
  {
    "code": "NG-TA",
    "country": "NG",
    "name": "NG · Taraba",
    "icon": "/logos/regions/NG-TA.svg"
  },
  {
    "code": "NG-YO",
    "country": "NG",
    "name": "NG · Yobe",
    "icon": "/logos/regions/NG-YO.svg"
  },
  {
    "code": "NG-ZA",
    "country": "NG",
    "name": "NG · Zamfara",
    "icon": "/logos/regions/NG-ZA.svg"
  },
  {
    "code": "PT-11",
    "country": "PT",
    "name": "PT · 11",
    "icon": "/logos/regions/PT-11.svg"
  },
  {
    "code": "PT-20",
    "country": "PT",
    "name": "PT · 20",
    "icon": "/logos/regions/PT-20.svg"
  },
  {
    "code": "PT-30",
    "country": "PT",
    "name": "PT · 30",
    "icon": "/logos/regions/PT-30.svg"
  },
  {
    "code": "RW-01",
    "country": "RW",
    "name": "RW · Kigali",
    "icon": "/logos/regions/RW-01.svg"
  },
  {
    "code": "RW-02",
    "country": "RW",
    "name": "RW · Eastern",
    "icon": "/logos/regions/RW-02.svg"
  },
  {
    "code": "RW-03",
    "country": "RW",
    "name": "RW · Northern",
    "icon": "/logos/regions/RW-03.svg"
  },
  {
    "code": "RW-04",
    "country": "RW",
    "name": "RW · Western",
    "icon": "/logos/regions/RW-04.svg"
  },
  {
    "code": "RW-05",
    "country": "RW",
    "name": "RW · Southern",
    "icon": "/logos/regions/RW-05.svg"
  },
  {
    "code": "SN-DB",
    "country": "SN",
    "name": "SN · Diourbel",
    "icon": "/logos/regions/SN-DB.svg"
  },
  {
    "code": "SN-DK",
    "country": "SN",
    "name": "SN · Dakar",
    "icon": "/logos/regions/SN-DK.svg"
  },
  {
    "code": "SN-FK",
    "country": "SN",
    "name": "SN · Fatick",
    "icon": "/logos/regions/SN-FK.svg"
  },
  {
    "code": "SN-KA",
    "country": "SN",
    "name": "SN · Kaffrine",
    "icon": "/logos/regions/SN-KA.svg"
  },
  {
    "code": "SN-KD",
    "country": "SN",
    "name": "SN · Kolda",
    "icon": "/logos/regions/SN-KD.svg"
  },
  {
    "code": "SN-KE",
    "country": "SN",
    "name": "SN · Kédougou",
    "icon": "/logos/regions/SN-KE.svg"
  },
  {
    "code": "SN-KL",
    "country": "SN",
    "name": "SN · Kaolack",
    "icon": "/logos/regions/SN-KL.svg"
  },
  {
    "code": "SN-LG",
    "country": "SN",
    "name": "SN · Louga",
    "icon": "/logos/regions/SN-LG.svg"
  },
  {
    "code": "SN-MT",
    "country": "SN",
    "name": "SN · Matam",
    "icon": "/logos/regions/SN-MT.svg"
  },
  {
    "code": "SN-SE",
    "country": "SN",
    "name": "SN · Sédhiou",
    "icon": "/logos/regions/SN-SE.svg"
  },
  {
    "code": "SN-SL",
    "country": "SN",
    "name": "SN · Saint-Louis",
    "icon": "/logos/regions/SN-SL.svg"
  },
  {
    "code": "SN-TC",
    "country": "SN",
    "name": "SN · Tambacounda",
    "icon": "/logos/regions/SN-TC.svg"
  },
  {
    "code": "SN-TH",
    "country": "SN",
    "name": "SN · Thiès",
    "icon": "/logos/regions/SN-TH.svg"
  },
  {
    "code": "SN-ZG",
    "country": "SN",
    "name": "SN · Ziguinchor",
    "icon": "/logos/regions/SN-ZG.svg"
  },
  {
    "code": "SO-BK",
    "country": "SO",
    "name": "SO · BK",
    "icon": "/logos/regions/SO-BK.svg"
  },
  {
    "code": "SO-BN",
    "country": "SO",
    "name": "SO · BN",
    "icon": "/logos/regions/SO-BN.svg"
  },
  {
    "code": "SO-BR",
    "country": "SO",
    "name": "SO · BR",
    "icon": "/logos/regions/SO-BR.svg"
  },
  {
    "code": "SO-BY",
    "country": "SO",
    "name": "SO · BY",
    "icon": "/logos/regions/SO-BY.svg"
  },
  {
    "code": "SO-GA",
    "country": "SO",
    "name": "SO · GA",
    "icon": "/logos/regions/SO-GA.svg"
  },
  {
    "code": "SO-HI",
    "country": "SO",
    "name": "SO · HI",
    "icon": "/logos/regions/SO-HI.svg"
  },
  {
    "code": "SO-JD",
    "country": "SO",
    "name": "SO · JD",
    "icon": "/logos/regions/SO-JD.svg"
  },
  {
    "code": "SO-JH",
    "country": "SO",
    "name": "SO · JH",
    "icon": "/logos/regions/SO-JH.svg"
  },
  {
    "code": "TG-CE",
    "country": "TG",
    "name": "TG · Centrale",
    "icon": "/logos/regions/TG-CE.svg"
  },
  {
    "code": "TG-KA",
    "country": "TG",
    "name": "TG · Kara",
    "icon": "/logos/regions/TG-KA.svg"
  },
  {
    "code": "TG-MA",
    "country": "TG",
    "name": "TG · Maritime",
    "icon": "/logos/regions/TG-MA.svg"
  },
  {
    "code": "TG-PL",
    "country": "TG",
    "name": "TG · Plateaux",
    "icon": "/logos/regions/TG-PL.svg"
  },
  {
    "code": "TG-SA",
    "country": "TG",
    "name": "TG · Savanes",
    "icon": "/logos/regions/TG-SA.svg"
  },
  {
    "code": "TN-AR",
    "country": "TN",
    "name": "TN · Ariana",
    "icon": "/logos/regions/TN-AR.svg"
  },
  {
    "code": "TN-BA",
    "country": "TN",
    "name": "TN · Ben Arous",
    "icon": "/logos/regions/TN-BA.svg"
  },
  {
    "code": "TN-BE",
    "country": "TN",
    "name": "TN · Béja",
    "icon": "/logos/regions/TN-BE.svg"
  },
  {
    "code": "TN-BI",
    "country": "TN",
    "name": "TN · Bizerte",
    "icon": "/logos/regions/TN-BI.svg"
  },
  {
    "code": "TN-GB",
    "country": "TN",
    "name": "TN · Gabès",
    "icon": "/logos/regions/TN-GB.svg"
  },
  {
    "code": "TN-GF",
    "country": "TN",
    "name": "TN · Gafsa",
    "icon": "/logos/regions/TN-GF.svg"
  },
  {
    "code": "TN-JE",
    "country": "TN",
    "name": "TN · Jendouba",
    "icon": "/logos/regions/TN-JE.svg"
  },
  {
    "code": "TN-KA",
    "country": "TN",
    "name": "TN · Kairouan",
    "icon": "/logos/regions/TN-KA.svg"
  },
  {
    "code": "TN-KB",
    "country": "TN",
    "name": "TN · Kasserine",
    "icon": "/logos/regions/TN-KB.svg"
  },
  {
    "code": "TN-KE",
    "country": "TN",
    "name": "TN · Kébili",
    "icon": "/logos/regions/TN-KE.svg"
  },
  {
    "code": "TN-KF",
    "country": "TN",
    "name": "TN · Le Kef",
    "icon": "/logos/regions/TN-KF.svg"
  },
  {
    "code": "TN-MA",
    "country": "TN",
    "name": "TN · Mahdia",
    "icon": "/logos/regions/TN-MA.svg"
  },
  {
    "code": "TN-ME",
    "country": "TN",
    "name": "TN · Médenine",
    "icon": "/logos/regions/TN-ME.svg"
  },
  {
    "code": "TN-MN",
    "country": "TN",
    "name": "TN · Manouba",
    "icon": "/logos/regions/TN-MN.svg"
  },
  {
    "code": "TN-MO",
    "country": "TN",
    "name": "TN · Monastir",
    "icon": "/logos/regions/TN-MO.svg"
  },
  {
    "code": "TN-NA",
    "country": "TN",
    "name": "TN · Nabeul",
    "icon": "/logos/regions/TN-NA.svg"
  },
  {
    "code": "TN-SF",
    "country": "TN",
    "name": "TN · Sfax",
    "icon": "/logos/regions/TN-SF.svg"
  },
  {
    "code": "TN-SI",
    "country": "TN",
    "name": "TN · Sidi Bouzid",
    "icon": "/logos/regions/TN-SI.svg"
  },
  {
    "code": "TN-SO",
    "country": "TN",
    "name": "TN · Sousse",
    "icon": "/logos/regions/TN-SO.svg"
  },
  {
    "code": "TN-TA",
    "country": "TN",
    "name": "TN · Tataouine",
    "icon": "/logos/regions/TN-TA.svg"
  },
  {
    "code": "TN-TU",
    "country": "TN",
    "name": "TN · Tunis",
    "icon": "/logos/regions/TN-TU.svg"
  },
  {
    "code": "TN-TZ",
    "country": "TN",
    "name": "TN · Tozeur",
    "icon": "/logos/regions/TN-TZ.svg"
  },
  {
    "code": "TN-ZA",
    "country": "TN",
    "name": "TN · Zaghouan",
    "icon": "/logos/regions/TN-ZA.svg"
  },
  {
    "code": "TZ-AR",
    "country": "TZ",
    "name": "TZ · Arusha",
    "icon": "/logos/regions/TZ-AR.svg"
  },
  {
    "code": "TZ-DO",
    "country": "TZ",
    "name": "TZ · Dodoma",
    "icon": "/logos/regions/TZ-DO.svg"
  },
  {
    "code": "TZ-DS",
    "country": "TZ",
    "name": "TZ · Dar es Salaam",
    "icon": "/logos/regions/TZ-DS.svg"
  },
  {
    "code": "TZ-GE",
    "country": "TZ",
    "name": "TZ · Geita",
    "icon": "/logos/regions/TZ-GE.svg"
  },
  {
    "code": "TZ-IR",
    "country": "TZ",
    "name": "TZ · Iringa",
    "icon": "/logos/regions/TZ-IR.svg"
  },
  {
    "code": "TZ-KA",
    "country": "TZ",
    "name": "TZ · Kagera",
    "icon": "/logos/regions/TZ-KA.svg"
  },
  {
    "code": "TZ-KI",
    "country": "TZ",
    "name": "TZ · Kigoma",
    "icon": "/logos/regions/TZ-KI.svg"
  },
  {
    "code": "TZ-KL",
    "country": "TZ",
    "name": "TZ · Kilimanjaro",
    "icon": "/logos/regions/TZ-KL.svg"
  },
  {
    "code": "TZ-KT",
    "country": "TZ",
    "name": "TZ · Katavi",
    "icon": "/logos/regions/TZ-KT.svg"
  },
  {
    "code": "TZ-LI",
    "country": "TZ",
    "name": "TZ · Lindi",
    "icon": "/logos/regions/TZ-LI.svg"
  },
  {
    "code": "TZ-MB",
    "country": "TZ",
    "name": "TZ · Mbeya",
    "icon": "/logos/regions/TZ-MB.svg"
  },
  {
    "code": "TZ-MC",
    "country": "TZ",
    "name": "TZ · Morogoro",
    "icon": "/logos/regions/TZ-MC.svg"
  },
  {
    "code": "TZ-MT",
    "country": "TZ",
    "name": "TZ · Mtwara",
    "icon": "/logos/regions/TZ-MT.svg"
  },
  {
    "code": "TZ-MW",
    "country": "TZ",
    "name": "TZ · Mwanza",
    "icon": "/logos/regions/TZ-MW.svg"
  },
  {
    "code": "TZ-MY",
    "country": "TZ",
    "name": "TZ · Manyara",
    "icon": "/logos/regions/TZ-MY.svg"
  },
  {
    "code": "TZ-NJ",
    "country": "TZ",
    "name": "TZ · Njombe",
    "icon": "/logos/regions/TZ-NJ.svg"
  },
  {
    "code": "TZ-PW",
    "country": "TZ",
    "name": "TZ · Pwani",
    "icon": "/logos/regions/TZ-PW.svg"
  },
  {
    "code": "TZ-RU",
    "country": "TZ",
    "name": "TZ · Rukwa",
    "icon": "/logos/regions/TZ-RU.svg"
  },
  {
    "code": "TZ-RV",
    "country": "TZ",
    "name": "TZ · Ruvuma",
    "icon": "/logos/regions/TZ-RV.svg"
  },
  {
    "code": "TZ-SH",
    "country": "TZ",
    "name": "TZ · Shinyanga",
    "icon": "/logos/regions/TZ-SH.svg"
  },
  {
    "code": "TZ-SI",
    "country": "TZ",
    "name": "TZ · Simiyu",
    "icon": "/logos/regions/TZ-SI.svg"
  },
  {
    "code": "TZ-TA",
    "country": "TZ",
    "name": "TZ · Tabora",
    "icon": "/logos/regions/TZ-TA.svg"
  },
  {
    "code": "UG-A",
    "country": "UG",
    "name": "UG · Acholi",
    "icon": "/logos/regions/UG-A.svg"
  },
  {
    "code": "UG-B",
    "country": "UG",
    "name": "UG · Buganda",
    "icon": "/logos/regions/UG-B.svg"
  },
  {
    "code": "UG-C",
    "country": "UG",
    "name": "UG · Central",
    "icon": "/logos/regions/UG-C.svg"
  },
  {
    "code": "UG-E",
    "country": "UG",
    "name": "UG · Eastern",
    "icon": "/logos/regions/UG-E.svg"
  },
  {
    "code": "UG-K",
    "country": "UG",
    "name": "UG · Kampala",
    "icon": "/logos/regions/UG-K.svg"
  },
  {
    "code": "UG-L",
    "country": "UG",
    "name": "UG · Lango",
    "icon": "/logos/regions/UG-L.svg"
  },
  {
    "code": "UG-N",
    "country": "UG",
    "name": "UG · Northern",
    "icon": "/logos/regions/UG-N.svg"
  },
  {
    "code": "UG-R",
    "country": "UG",
    "name": "UG · Ankole",
    "icon": "/logos/regions/UG-R.svg"
  },
  {
    "code": "UG-T",
    "country": "UG",
    "name": "UG · Teso",
    "icon": "/logos/regions/UG-T.svg"
  },
  {
    "code": "UG-W",
    "country": "UG",
    "name": "UG · Western",
    "icon": "/logos/regions/UG-W.svg"
  },
  {
    "code": "US-AK",
    "country": "US",
    "name": "US · AK",
    "icon": "/logos/regions/US-AK.svg"
  },
  {
    "code": "US-AL",
    "country": "US",
    "name": "US · AL",
    "icon": "/logos/regions/US-AL.svg"
  },
  {
    "code": "US-AR",
    "country": "US",
    "name": "US · AR",
    "icon": "/logos/regions/US-AR.svg"
  },
  {
    "code": "US-AS",
    "country": "US",
    "name": "US · AS",
    "icon": "/logos/regions/US-AS.svg"
  },
  {
    "code": "US-AZ",
    "country": "US",
    "name": "US · AZ",
    "icon": "/logos/regions/US-AZ.svg"
  },
  {
    "code": "US-CA",
    "country": "US",
    "name": "US · CA",
    "icon": "/logos/regions/US-CA.svg"
  },
  {
    "code": "US-CO",
    "country": "US",
    "name": "US · CO",
    "icon": "/logos/regions/US-CO.svg"
  },
  {
    "code": "US-CT",
    "country": "US",
    "name": "US · CT",
    "icon": "/logos/regions/US-CT.svg"
  },
  {
    "code": "ZA-MP",
    "country": "ZA",
    "name": "ZA · MP",
    "icon": "/logos/regions/ZA-MP.svg"
  },
  {
    "code": "ZM-01",
    "country": "ZM",
    "name": "ZM · 01",
    "icon": "/logos/regions/ZM-01.svg"
  },
  {
    "code": "ZM-02",
    "country": "ZM",
    "name": "ZM · 02",
    "icon": "/logos/regions/ZM-02.svg"
  },
  {
    "code": "ZM-03",
    "country": "ZM",
    "name": "ZM · 03",
    "icon": "/logos/regions/ZM-03.svg"
  },
  {
    "code": "ZM-04",
    "country": "ZM",
    "name": "ZM · 04",
    "icon": "/logos/regions/ZM-04.svg"
  },
  {
    "code": "ZM-05",
    "country": "ZM",
    "name": "ZM · 05",
    "icon": "/logos/regions/ZM-05.svg"
  },
  {
    "code": "ZM-06",
    "country": "ZM",
    "name": "ZM · 06",
    "icon": "/logos/regions/ZM-06.svg"
  },
  {
    "code": "ZM-07",
    "country": "ZM",
    "name": "ZM · 07",
    "icon": "/logos/regions/ZM-07.svg"
  },
  {
    "code": "ZM-08",
    "country": "ZM",
    "name": "ZM · Southern",
    "icon": "/logos/regions/ZM-08.svg"
  },
  {
    "code": "ZM-09",
    "country": "ZM",
    "name": "ZM · Western",
    "icon": "/logos/regions/ZM-09.svg"
  },
  {
    "code": "ZM-10",
    "country": "ZM",
    "name": "ZM · 10",
    "icon": "/logos/regions/ZM-10.svg"
  }
];



export function resolveProvider(name: string) {
  const needle = name.trim().toLowerCase();
  return providerCatalog.find((entry) => entry.name.toLowerCase() === needle)
    ?? providerCatalog.find((entry) => entry.aliases.some((alias) => alias.toLowerCase() === needle))
    ?? providerCatalog.find((entry) => needle.includes(entry.name.toLowerCase()) || entry.name.toLowerCase().includes(needle))
    ?? providerCatalog.find((entry) => entry.aliases.some((alias) => needle.includes(alias.toLowerCase())));
}

export function getProviderLogo(name: string) {
  return resolveProvider(name)?.logo ?? "/logos/providers/generated/sdk-pay.svg";
}

export function getCountryFlag(code: string, square = false) {
  const normalized = code.toLowerCase();
  return square ? `/logos/flags/1x1/${normalized}.svg` : `/logos/flags/4x3/${normalized}.svg`;
}

export function getRegionIcon(code: string) {
  const clean = code.toUpperCase().replace(/\.SVG$/i, "");
  return `/logos/regions/${clean}.svg`;
}
