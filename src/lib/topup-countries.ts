import { getCountryFlag, providerCatalog } from "@/lib/icon-catalog";

export type TopupCountry = {
  name: string;
  englishName?: string;
  flag: string;
  flagIcon: string;
  flagSquare: string;
  currency: string;
  code: string;
  dial: string;
};

const rawCountries: Array<Omit<TopupCountry, "flagIcon" | "flagSquare">> = [
  { name: "Bénin", englishName: "Benin", flag: "🇧🇯", currency: "XOFB", code: "BJ", dial: "+229" },
  { name: "Burkina Faso", flag: "🇧🇫", currency: "XOFF", code: "BF", dial: "+226" },
  { name: "Cameroun", englishName: "Cameroon", flag: "🇨🇲", currency: "XAF", code: "CM", dial: "+237" },
  { name: "Centrafrique", englishName: "Central African Republic", flag: "🇨🇫", currency: "XAFCF", code: "CF", dial: "+236" },
  { name: "Congo", englishName: "Congo", flag: "🇨🇬", currency: "XAFC", code: "CG", dial: "+242" },
  { name: "Côte d'Ivoire", englishName: "Ivory Coast", flag: "🇨🇮", currency: "XOFC", code: "CI", dial: "+225" },
  { name: "Gabon", flag: "🇬🇦", currency: "XAFG", code: "GA", dial: "+241" },
  { name: "Guinée", englishName: "Guinea", flag: "🇬🇳", currency: "XOFG", code: "GN", dial: "+224" },
  { name: "Guinée-Bissau", englishName: "Guinea-Bissau", flag: "🇬🇼", currency: "XOFGW", code: "GW", dial: "+245" },
  { name: "Mali", flag: "🇲🇱", currency: "XOFM", code: "ML", dial: "+223" },
  { name: "Niger", flag: "🇳🇪", currency: "XOFN", code: "NE", dial: "+227" },
  { name: "RD Congo", englishName: "DR Congo", flag: "🇨🇩", currency: "CDF", code: "CD", dial: "+243" },
  { name: "Sénégal", englishName: "Senegal", flag: "🇸🇳", currency: "XOFS", code: "SN", dial: "+221" },
  { name: "Tchad", englishName: "Chad", flag: "🇹🇩", currency: "XAFTD", code: "TD", dial: "+235" },
  { name: "Togo", flag: "🇹🇬", currency: "XOFT", code: "TG", dial: "+228" },
  { name: "Algérie", englishName: "Algeria", flag: "🇩🇿", currency: "DZD", code: "DZ", dial: "+213" },
  { name: "Angola", flag: "🇦🇴", currency: "AOA", code: "AO", dial: "+244" },
  { name: "Botswana", flag: "🇧🇼", currency: "BWP", code: "BW", dial: "+267" },
  { name: "Burundi", flag: "🇧🇮", currency: "BIF", code: "BI", dial: "+257" },
  { name: "Cap-Vert", englishName: "Cabo Verde", flag: "🇨🇻", currency: "CVE", code: "CV", dial: "+238" },
  { name: "Djibouti", flag: "🇩🇯", currency: "DJF", code: "DJ", dial: "+253" },
  { name: "Égypte", englishName: "Egypt", flag: "🇪🇬", currency: "EGP", code: "EG", dial: "+20" },
  { name: "Éthiopie", englishName: "Ethiopia", flag: "🇪🇹", currency: "ETB", code: "ET", dial: "+251" },
  { name: "Gambie", englishName: "Gambia", flag: "🇬🇲", currency: "GMD", code: "GM", dial: "+220" },
  { name: "Ghana", flag: "🇬🇭", currency: "GHS", code: "GH", dial: "+233" },
  { name: "Kenya", flag: "🇰🇪", currency: "KES", code: "KE", dial: "+254" },
  { name: "Lesotho", flag: "🇱🇸", currency: "LSL", code: "LS", dial: "+266" },
  { name: "Libéria", englishName: "Liberia", flag: "🇱🇷", currency: "LRD", code: "LR", dial: "+231" },
  { name: "Madagascar", flag: "🇲🇬", currency: "MGA", code: "MG", dial: "+261" },
  { name: "Malawi", flag: "🇲🇼", currency: "MWK", code: "MW", dial: "+265" },
  { name: "Mauritanie", englishName: "Mauritania", flag: "🇲🇷", currency: "MRU", code: "MR", dial: "+222" },
  { name: "Maroc", englishName: "Morocco", flag: "🇲🇦", currency: "MAD", code: "MA", dial: "+212" },
  { name: "Mozambique", flag: "🇲🇿", currency: "MZN", code: "MZ", dial: "+258" },
  { name: "Namibie", englishName: "Namibia", flag: "🇳🇦", currency: "NAD", code: "NA", dial: "+264" },
  { name: "Nigeria", flag: "🇳🇬", currency: "NGN", code: "NG", dial: "+234" },
  { name: "Rwanda", flag: "🇷🇼", currency: "RWF", code: "RW", dial: "+250" },
  { name: "Sierra Leone", flag: "🇸🇱", currency: "SLE", code: "SL", dial: "+232" },
  { name: "Afrique du Sud", englishName: "South Africa", flag: "🇿🇦", currency: "ZAR", code: "ZA", dial: "+27" },
  { name: "Tanzanie", englishName: "Tanzania", flag: "🇹🇿", currency: "TZS", code: "TZ", dial: "+255" },
  { name: "Tunisie", englishName: "Tunisia", flag: "🇹🇳", currency: "TND", code: "TN", dial: "+216" },
  { name: "Ouganda", englishName: "Uganda", flag: "🇺🇬", currency: "UGX", code: "UG", dial: "+256" },
  { name: "Zambie", englishName: "Zambia", flag: "🇿🇲", currency: "ZMW", code: "ZM", dial: "+260" },
  { name: "Zimbabwe", flag: "🇿🇼", currency: "ZWL", code: "ZW", dial: "+263" },
];

export const topupCountries: TopupCountry[] = rawCountries.map((country) => ({
  ...country,
  flagIcon: getCountryFlag(country.code, false),
  flagSquare: getCountryFlag(country.code, true),
}));

export type TopupOperator = {
  name: string;
  short: string;
  bg: string;
  color: string;
  logo: string;
  countries: string[];
};

export const topupOperators: TopupOperator[] = providerCatalog
  .filter((entry) => entry.category === "mobile_money")
  .map((entry) => ({ name: entry.name, short: entry.short, bg: entry.bg, color: entry.color, logo: entry.logo, countries: entry.countries }));
