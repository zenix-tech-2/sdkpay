"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type DashLang = "fr" | "en";

const dict = {
  fr: {
    dashboard: "Tableau de bord",
    myLinks: "Mes liens",
    transactions: "Transactions",
    deposit: "Dépôt",
    withdraw: "Retrait",
    send: "Envoyer",
    accounts: "Comptes",
    referrals: "Parrainage & gains",
    mainMenu: "MENU PRINCIPAL",
    availableBalance: "Solde disponible",
    mainBalance: "Solde principal",
    conversion: "Conversion",
    quickActions: "ACTIONS RAPIDES",
    paymentLink: "Lien de paiement",
    referralsBanner: "Parrainage et récompenses : invitez vos amis",
    allLinks: "Tous les liens",
    thisMonth: "Ce mois-ci",
    logout: "Déconnexion",
    recentTx: "Transactions récentes",
    recentLinks: "Liens récents",
    seeAll: "Tout voir",
    noTx: "Aucune transaction pour le moment.",
    noLinks: "Aucun lien de paiement. Créez votre premier lien !",
    totalCollected: "Total collecté",
    activeLinks: "Liens actifs",
    kyc: "KYC",
    support: "Support",
    api: "API",
    settings: "Paramètres",
    fees: "Frais",
    settingsSupport: "PARAMÈTRES & SUPPORT",
  },
  en: {
    dashboard: "Dashboard",
    myLinks: "My links",
    transactions: "Transactions",
    deposit: "Deposit",
    withdraw: "Withdraw",
    send: "Send",
    accounts: "Accounts",
    referrals: "Referrals & earnings",
    mainMenu: "MAIN MENU",
    availableBalance: "Available balance",
    mainBalance: "Main Balance",
    conversion: "Conversion",
    quickActions: "QUICK ACTIONS",
    paymentLink: "Payment link",
    referralsBanner: "Referrals and rewards: invite your friends",
    allLinks: "All links",
    thisMonth: "This month",
    logout: "Log out",
    recentTx: "Recent transactions",
    recentLinks: "Recent links",
    seeAll: "See all",
    noTx: "No transactions yet.",
    noLinks: "No payment links. Create your first link!",
    totalCollected: "Total collected",
    activeLinks: "Active links",
    kyc: "KYC",
    support: "Support",
    api: "API",
    settings: "Settings",
    fees: "Fees",
    settingsSupport: "SETTINGS & SUPPORT",
  },
} as const;

type Dict = Record<string, string>;

const Ctx = createContext<{ lang: DashLang; setLang: (l: DashLang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: dict.en as unknown as Dict,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<DashLang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("sdkpay-dash-lang") as DashLang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const change = (l: DashLang) => {
    setLang(l);
    localStorage.setItem("sdkpay-dash-lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang: change, t: dict[lang] as unknown as Dict }}>{children}</Ctx.Provider>;
}

export function useDashLang() {
  return useContext(Ctx);
}
