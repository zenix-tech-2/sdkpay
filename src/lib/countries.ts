export type Country = { name: string; flag: string; dial: string; code: string };

export const countries: Country[] = [
  { name: "Algérie", flag: "🇩🇿", dial: "+213", code: "DZ" },
  { name: "Bénin", flag: "🇧🇯", dial: "+229", code: "BJ" },
  { name: "Burkina Faso", flag: "🇧🇫", dial: "+226", code: "BF" },
  { name: "Cameroun", flag: "🇨🇲", dial: "+237", code: "CM" },
  { name: "Centrafrique", flag: "🇨🇫", dial: "+236", code: "CF" },
  { name: "Congo", flag: "🇨🇬", dial: "+242", code: "CG" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225", code: "CI" },
  { name: "Gabon", flag: "🇬🇦", dial: "+241", code: "GA" },
  { name: "Ghana", flag: "🇬🇭", dial: "+233", code: "GH" },
  { name: "Guinée", flag: "🇬🇳", dial: "+224", code: "GN" },
  { name: "Kenya", flag: "🇰🇪", dial: "+254", code: "KE" },
  { name: "Madagascar", flag: "🇲🇬", dial: "+261", code: "MG" },
  { name: "Mali", flag: "🇲🇱", dial: "+223", code: "ML" },
  { name: "Maroc", flag: "🇲🇦", dial: "+212", code: "MA" },
  { name: "Nigeria", flag: "🇳🇬", dial: "+234", code: "NG" },
  { name: "RDC", flag: "🇨🇩", dial: "+243", code: "CD" },
  { name: "Rwanda", flag: "🇷🇼", dial: "+250", code: "RW" },
  { name: "Sénégal", flag: "🇸🇳", dial: "+221", code: "SN" },
  { name: "Tchad", flag: "🇹🇩", dial: "+235", code: "TD" },
  { name: "Togo", flag: "🇹🇬", dial: "+228", code: "TG" },
  { name: "Tunisie", flag: "🇹🇳", dial: "+216", code: "TN" },
  { name: "Ouganda", flag: "🇺🇬", dial: "+256", code: "UG" },
];

export const landingCountries = ["Tchad", "Madagascar", "Maroc", "Tunisie", "Algérie", "Cameroun", "Sénégal"]
  .map((name) => countries.find((c) => c.name === name)!);
