export type WalletCurrency = {
  code: string;
  name: string;
  flag: string;
  isCrypto?: boolean;
};

export const walletCurrencies: WalletCurrency[] = [
  { code: "SLE", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "ZMW", name: "Zambie", flag: "🌍" },
  { code: "XAFCF", name: "Centrafrique", flag: "🇨🇫" },
  { code: "XAFTD", name: "Tchad", flag: "🇹🇩" },
  { code: "XOFGW", name: "Guinée-Bissau", flag: "🇬🇼" },
  { code: "CDF", name: "République démocratique du Congo", flag: "🇨🇩" },
  { code: "INR", name: "Inde", flag: "🇮🇳" },
  { code: "USDT", name: "Crypto · Tron", flag: "₮", isCrypto: true },
  { code: "XOFB", name: "Bénin", flag: "🇧🇯" },
  { code: "XOFF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "XAF", name: "Cameroun", flag: "🇨🇲" },
  { code: "XAFC", name: "Congo", flag: "🇨🇬" },
  { code: "XOFC", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "XAFG", name: "Gabon", flag: "🇬🇦" },
  { code: "XOFG", name: "Guinée", flag: "🇬🇳" },
  { code: "XOFM", name: "Mali", flag: "🇲🇱" },
  { code: "XOFN", name: "Niger", flag: "🇳🇪" },
  { code: "XOFS", name: "Sénégal", flag: "🇸🇳" },
  { code: "XOFT", name: "Togo", flag: "🇹🇬" },
  { code: "XOF", name: "BCEAO", flag: "🌍" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "USD", name: "United States Dollar", flag: "🇺🇸" },
];
