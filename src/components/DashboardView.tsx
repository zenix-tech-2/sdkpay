"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Copy, CreditCard,
  ExternalLink, Filter, Link2, Lock, Plus, RefreshCw, ShieldCheck, Users, Wallet, X,
} from "lucide-react";
import { DashboardShell, useDashboard } from "@/components/DashboardShell";
import { MyLinksSection } from "@/components/MyLinksSection";
import { TransactionsSection } from "@/components/TransactionsSection";
import { TransactionDetailSection } from "@/components/TransactionDetailSection";
import { TopUpSection } from "@/components/TopUpSection";
import { WithdrawSection } from "@/components/WithdrawSection";
import { SendMoneySection } from "@/components/SendMoneySection";
import { NewLinkWizard } from "@/components/NewLinkWizard";
import { MyAccountsSection, AddAccountSection, ReferralsPage } from "@/components/AccountSections";
import { KycVerifiedSection, SupportHubSection } from "@/components/SupportKycSections";
import { ApiHubSection, DirectApiSection } from "@/components/ApiSections";
import { SettingsHubSection, AutomaticConversionSection, UpdatesSection, WithdrawalNumbersSection, NotificationsPage } from "@/components/SettingsHub";
import { FeesSection } from "@/components/SettingsSections";
import { IconGallerySection } from "@/components/IconAssets";
import { formatDate, formatNumber } from "@/lib/format";
import type { DashboardTransaction } from "@/lib/dashboard-types";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[16px] border border-[#e3e9f4] bg-white shadow-[0_5px_18px_rgba(25,38,80,.035)] ${className}`}>{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-[13px] font-bold text-[#25314d]">{children}</label>;
}

const inputClass = "h-[48px] w-full rounded-[10px] border border-[#dce5f3] bg-white px-3.5 text-[14px] text-[#1c2741] outline-none transition focus:border-[#ffb800] focus:ring-[3px] focus:ring-[#ffb800]/15";

function Skeleton() {
  return <div className="animate-pulse space-y-5 py-6"><div className="h-10 w-52 rounded-lg bg-[#e6ecf7]" /><div className="h-44 rounded-2xl bg-[#dde5f4]" /><div className="grid grid-cols-2 gap-4"><div className="h-36 rounded-2xl bg-[#e6ecf7]" /><div className="h-36 rounded-2xl bg-[#e6ecf7]" /></div></div>;
}

function HomeSection() {
  const { data, refresh, t } = useDashboard();
  const [linkFilter, setLinkFilter] = useState("all");
  const [period, setPeriod] = useState("month");
  const [conversionOpen, setConversionOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [showConverting, setShowConverting] = useState(false);
  if (!data) return <Skeleton />;

  const quick = [
    { href: "/dashboard/deposit", emoji: "💳", fr: "Deposit", en: "Deposit", bg: "#dff3ea" },
    { href: "/dashboard/send", emoji: "💰", fr: "Send", en: "Send", bg: "#e7edfb" },
    { href: "/dashboard/withdraw", emoji: "🧮", fr: "Withdraw", en: "Withdraw", bg: "#fdeadd" },
    { href: "/dashboard/links", emoji: "👛", fr: "Payment link", en: "Payment link", bg: "#f0e5fb" },
  ];

  const now = Date.now();
  const items = data.transactions.filter((tx) => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 100000;
    return now - new Date(tx.createdAt).getTime() < days * 86400000;
  });
  const links = data.links.filter((link) => linkFilter === "all" || link.status === linkFilter);

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold text-[#111b36] sm:text-[42px]">Dashboard</h1>
      <div className="relative mt-5 overflow-hidden rounded-[20px] bg-[#1d2a77] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[14px] font-medium text-[#c3cdef] sm:text-[17px]">Main Balance (XAF)</p>
          <button onClick={() => setConversionOpen(true)} className="flex items-center gap-2 rounded-xl border border-[#ffb800] bg-[#263484] px-3 py-2 text-[13px] font-extrabold text-[#ffc233] sm:px-5 sm:py-3 sm:text-[17px]">
            <span className="text-base">💱</span> Conversion
          </button>
        </div>
        <p className="font-display mt-5 text-[52px] font-extrabold leading-none sm:text-[66px]">{formatNumber(data.user.balance)}</p>
        <p className="mt-3 text-[11px] text-[#aebbea]">{t("Solde disponible sur votre wallet SDK Pay", "Available balance in your SDK Pay wallet")}</p>
      </div>

      <h2 className="mt-8 text-[12px] font-extrabold tracking-[.16em] text-[#8b96b0]">QUICK ACTIONS</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {quick.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-[165px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e3e9f4] bg-white text-[#111b36] shadow-[0_5px_18px_rgba(25,38,80,.035)] transition hover:-translate-y-1 hover:border-[#ffb800] sm:min-h-[190px]">
            <span className="flex h-[82px] w-[82px] items-center justify-center rounded-full text-[44px]" style={{ background: item.bg }}>{item.emoji}</span>
            <span className="text-[17px] font-extrabold">{t(item.fr, item.en)}</span>
          </Link>
        ))}
      </div>

      <Link href="/dashboard/referrals" className="mt-6 flex items-center justify-between rounded-[12px] border border-[#e3e9f4] bg-white px-4 py-4 text-[15px] font-bold text-[#1b2742] hover:border-[#ffb800] sm:px-5 sm:text-[18px]">
        <span>{t("Referrals and rewards: invite your friends", "Referrals and rewards: invite your friends")}</span><ArrowRight size={19} />
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[#8b96b0]"><Filter size={19} /></div>
        <select value={linkFilter} onChange={(e) => setLinkFilter(e.target.value)} className="h-[46px] min-w-[200px] rounded-[10px] border border-[#dce5f3] bg-white px-3 text-[14px] font-semibold text-[#25314d] outline-none">
          <option value="all">{t("All links", "All links")}</option><option value="active">{t("Liens actifs", "Active links")}</option><option value="disabled">{t("Liens désactivés", "Disabled links")}</option>
        </select>
        <div className="flex items-center gap-2 text-[#8b96b0]"><CalendarDays size={19} /></div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-[46px] min-w-[200px] rounded-[10px] border border-[#dce5f3] bg-white px-3 text-[14px] font-semibold text-[#25314d] outline-none">
          <option value="month">{t("This month", "This month")}</option><option value="week">{t("Cette semaine", "This week")}</option><option value="all">{t("Toutes les périodes", "All time")}</option>
        </select>
        <button onClick={() => void refresh()} className="ml-auto flex h-[46px] items-center gap-2 rounded-[10px] border border-[#dce5f3] bg-white px-3 text-[13px] font-bold text-[#5d6882]"><RefreshCw size={14} /> {t("Actualiser", "Refresh")}</button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-[#8b96b0]">{t("Encaissements", "Money in")}</p><p className="mt-2 text-[24px] font-extrabold text-[#2e9e63]">{formatNumber(data.stats.totalIn)} FCFA</p><p className="mt-1 text-[11px] text-[#8b96b0]">{data.stats.paymentsCount} {t("paiements", "payments")}</p></Card>
        <Card className="p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-[#8b96b0]">{t("Décaissements", "Money out")}</p><p className="mt-2 text-[24px] font-extrabold text-[#e35b5b]">{formatNumber(data.stats.totalOut)} FCFA</p><p className="mt-1 text-[11px] text-[#8b96b0]">{data.stats.linksCount} {t("liens de paiement", "payment links")}</p></Card>
        <Card className="p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-[#8b96b0]">{t("Vues des liens", "Link views")}</p><p className="mt-2 text-[24px] font-extrabold text-[#1d2a77]">{formatNumber(data.stats.views)}</p><p className="mt-1 text-[11px] text-[#8b96b0]">{data.stats.referralCount} {t("filleuls", "referrals")}</p></Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4"><h3 className="text-[15px] font-extrabold text-[#17213d]">{t("Activité récente", "Recent activity")}</h3><Link href="/dashboard/transactions" className="text-[12px] font-bold text-[#e5a300]">{t("Voir tout", "View all")} →</Link></div>
        {items.length === 0 ? <p className="px-5 py-9 text-center text-[13px] text-[#8b96b0]">{t("Aucune transaction sur cette période.", "No transactions in this period.")}</p> : (
          <div className="divide-y divide-[#f0f3f9]">{items.slice(0, 6).map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>
        )}
        <p className="border-t border-[#edf1f8] px-5 py-3 text-[11px] text-[#8b96b0]">{links.length} {t("liens affichés", "links shown")}</p>
      </Card>

      {conversionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setConversionOpen(false)}>
          <div className="w-full max-w-[390px] rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-[18px] font-extrabold text-[#17213d]">💱 Conversion</h3><button onClick={() => setConversionOpen(false)}><X size={18} /></button></div>
            <p className="mt-2 text-[12px] text-[#7c87a1]">{t("Convertissez vos FCFA en devises (taux indicatifs).", "Convert your FCFA to other currencies (indicative rates).")}</p>
            <div className="mt-4"><FieldLabel>Montant (FCFA)</FieldLabel><input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className={inputClass} /></div>
            <button onClick={() => setShowConverting(true)} className="brand-btn mt-4 h-[46px] w-full rounded-xl text-[14px]">{t("Convertir", "Convert")}</button>
            {showConverting && (
              <div className="mt-4 space-y-2 rounded-xl bg-[#f5f8ff] p-4 text-[13px] font-semibold text-[#25314d]">
                {([["EUR", 0.00152], ["USD", 0.00165], ["USDT", 0.00165]] as [string, number][]).map(([currency, rate]) => (
                  <div key={currency} className="flex justify-between"><span>{currency}</span><span>{((Number(convertAmount) || 0) * rate).toFixed(3)}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx }: { tx: DashboardTransaction }) {
  const incoming = tx.direction === "in";
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${incoming ? "bg-[#e3f6eb] text-[#2e9e63]" : "bg-[#ffeaec] text-[#e35b5b]"}`}>{incoming ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
      <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-[#1c2741]">{tx.note || tx.type}</p><p className="text-[10px] text-[#8b96b0]">{formatDate(tx.createdAt)} · {tx.method} · {tx.reference}</p></div>
      <div className="text-right"><p className={`text-[13px] font-extrabold ${incoming ? "text-[#2e9e63]" : "text-[#e35b5b]"}`}>{incoming ? "+" : "-"}{formatNumber(tx.amount)} FCFA</p><span className="text-[10px] font-semibold text-[#8b96b0]">{tx.status}</span></div>
    </div>
  );
}

const actionConfig = {
  deposit: { title: "Deposit", emoji: "💳", fr: "Déposer des fonds", en: "Add funds", cta: { fr: "Déposer", en: "Deposit" }, party: { fr: "Numéro Mobile Money", en: "Mobile Money number" } },
  withdraw: { title: "Withdraw", emoji: "🧮", fr: "Retirer des fonds", en: "Withdraw funds", cta: { fr: "Retirer", en: "Withdraw" }, party: { fr: "Compte / numéro de retrait", en: "Withdrawal account / number" } },
  send: { title: "Send", emoji: "💰", fr: "Envoyer de l'argent", en: "Send money", cta: { fr: "Envoyer", en: "Send" }, party: { fr: "Destinataire", en: "Recipient" } },
} as const;

function MoneyActionSection({ kind }: { kind: keyof typeof actionConfig }) {
  const { data, refresh, t } = useDashboard();
  const config = actionConfig[kind];
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("MTN Money");
  const [counterparty, setCounterparty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  if (!data) return <Skeleton />;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setOk(false);
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: kind, amount, method, counterparty, note }) });
    const json = await res.json();
    if (res.ok) { setOk(true); setMessage(`${t("Opération réussie", "Operation successful")} · ${json.transaction.reference}`); setAmount(""); setCounterparty(""); setNote(""); await refresh(); }
    else { setOk(false); setMessage(json.error ?? "Erreur"); }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-[620px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">{config.title}</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t(config.fr, config.en)} · {t("Solde disponible", "Available balance")} : <strong className="text-[#1d2a77]">{formatNumber(data.user.balance)} FCFA</strong></p>
      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f8ff] text-[34px]">{config.emoji}</span><div><p className="text-[15px] font-extrabold text-[#17213d]">{t("Opération sécurisée", "Secure operation")}</p><p className="text-[11px] text-[#8b96b0]">{kind === "withdraw" ? t("Frais : 4% du montant", "Fee: 4% of amount") : t("Frais : 4% du montant", "Fee: 4% of amount")}</p></div></div>
        <form onSubmit={submit} className="space-y-4">
          <div><FieldLabel>{t("Montant (FCFA)", "Amount (FCFA)")}</FieldLabel><input required type="number" min={100} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2500" className={inputClass} /></div>
          <div><FieldLabel>{t("Moyen de paiement", "Payment method")}</FieldLabel><select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>{["MTN Money", "Orange Money", "Airtel Money", "Wave", "Moov Money", "Banque", "USDT"].map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><FieldLabel>{t(config.party.fr, config.party.en)}</FieldLabel><input required value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder={kind === "send" ? "Nom ou numéro du bénéficiaire" : "+237 6XX XXX XXX"} className={inputClass} /></div>
          <div><FieldLabel>{t("Note (facultatif)", "Note (optional)")}</FieldLabel><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Motif de l'opération", "Operation description")} className={inputClass} /></div>
          <button disabled={busy} className="brand-btn h-[50px] w-full rounded-xl text-[15px] disabled:opacity-60">{busy ? "..." : t(config.cta.fr, config.cta.en)}</button>
          {message && <p className={`rounded-lg px-3 py-2.5 text-[12px] font-semibold ${ok ? "bg-[#e3f6eb] text-[#2e9e63]" : "bg-[#fff0f0] text-[#c83c3c]"}`}>{message}</p>}
        </form>
      </Card>
      <Card className="mt-5 flex items-start gap-3 p-4 text-[11px] leading-relaxed text-[#7c87a1]"><ShieldCheck size={18} className="shrink-0 text-[#e5a300]" />{t("Cette démonstration simule une opération de paiement. Les montants sont immédiatement reflétés dans votre wallet SDK Pay.", "This demo simulates a payment operation. Amounts are immediately reflected in your SDK Pay wallet.")}</Card>
    </div>
  );
}

function AccountsSection() {
  const { data, t } = useDashboard();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!data) return <Skeleton />;
  const user = data.user;
  function copyKey() { void navigator.clipboard?.writeText(user.apiKey); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Accounts</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Vos informations de compte et vos clés d'intégration.", "Your account information and integration keys.")}</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf75] to-[#f09c37] text-2xl">🙂</span><div><p className="text-[17px] font-extrabold text-[#17213d]">{user.fullName}</p><p className="text-[12px] text-[#8b96b0]">@{user.username}</p></div></div>
          <div className="mt-6 space-y-3 text-[13px]">
            {[["Email", user.email], [t("Téléphone", "Phone"), `${user.dialCode} ${user.phone}`], [t("Pays", "Country"), user.countryCode], ["Wallet", `${formatNumber(user.balance)} FCFA`], [t("Membre depuis", "Member since"), formatDate(user.createdAt)]].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-[#f0f3f9] pb-2.5"><span className="font-semibold text-[#8b96b0]">{label}</span><span className="text-right font-bold text-[#25314d]">{value}</span></div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#17213d]"><Lock size={17} /> {t("Clé API", "API key")}</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-[#7c87a1]">{t("Utilisez cette clé pour authentifier vos requêtes sur /api/v1/collect.", "Use this key to authenticate your requests to /api/v1/collect.")}</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f5f8ff] p-3"><code className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#25314d]">{revealed ? user.apiKey : "sk_test_••••••••••••••••"}</code><button onClick={() => setRevealed(!revealed)} className="text-[11px] font-bold text-[#e5a300]">{revealed ? t("Masquer", "Hide") : t("Afficher", "Show")}</button><button onClick={copyKey} className="text-[#5d6882]">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
            <Link href="/docs" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#e5a300]">{t("Documentation API", "API documentation")} <ExternalLink size={12} /></Link>
          </Card>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#17213d]"><Wallet size={17} /> {t("Sécurité du compte", "Account security")}</h2>
            <div className="mt-4 space-y-3 text-[12px] font-semibold text-[#3c4966]">
              {[t("Connexion par session chiffrée", "Encrypted session login"), t("Vérification KYC disponible", "KYC verification available"), t("Historique des opérations complet", "Full operation history")].map((item) => <p key={item} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e3f6eb] text-[#2e9e63]"><Check size={12} /></span>{item}</p>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReferralsSection() {
  const { data, t } = useDashboard();
  const [copied, setCopied] = useState("");
  if (!data) return <Skeleton />;
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${data.user.referralCode}`;
  function copy(text: string, key: string) { void navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1800); }
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Referrals &amp; earnings</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Invitez vos amis et développez votre réseau de marchands.", "Invite your friends and grow your merchant network.")}</p>
      <Card className="mt-6 overflow-hidden">
        <div className="bg-[#1d2a77] px-6 py-7 text-white"><p className="text-[12px] font-semibold text-[#c3cdef]">{t("Votre code de parrainage", "Your referral code")}</p><p className="font-display mt-2 text-[34px] font-extrabold tracking-wide">{data.user.referralCode}</p><button onClick={() => copy(data.user.referralCode, "code")} className="mt-3 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-[12px] font-bold">{copied === "code" ? <Check size={14} /> : <Copy size={14} />}{t("Copier le code", "Copy code")}</button></div>
        <div className="p-6"><p className="text-[12px] font-bold text-[#25314d]">{t("Lien d'invitation", "Invitation link")}</p><div className="mt-2 flex flex-wrap gap-2"><input readOnly value={link} className="min-w-0 flex-1 rounded-lg border border-[#dce5f3] px-3 py-2.5 text-[12px] text-[#5d6882]" /><button onClick={() => copy(link, "link")} className="brand-btn flex items-center gap-2 rounded-lg px-4 text-[12px]">{copied === "link" ? <Check size={14} /> : <Link2 size={14} />}{t("Copier", "Copy")}</button></div></div>
      </Card>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><Users size={18} className="text-[#e5a300]" /><p className="mt-3 text-[24px] font-extrabold text-[#17213d]">{data.stats.referralCount}</p><p className="text-[11px] text-[#8b96b0]">{t("Filleuls", "Referrals")}</p></Card>
        <Card className="p-5"><CreditCard size={18} className="text-[#e5a300]" /><p className="mt-3 text-[24px] font-extrabold text-[#17213d]">{formatNumber(data.stats.referralCount * 500)}</p><p className="text-[11px] text-[#8b96b0]">{t("Récompenses estimées (FCFA)", "Estimated rewards (FCFA)")}</p></Card>
        <Card className="p-5"><Wallet size={18} className="text-[#e5a300]" /><p className="mt-3 text-[24px] font-extrabold text-[#17213d]">{formatNumber(data.user.balance)}</p><p className="text-[11px] text-[#8b96b0]">{t("Solde actuel (FCFA)", "Current balance (FCFA)")}</p></Card>
      </div>
      <Card className="mt-5 overflow-hidden"><div className="border-b border-[#edf1f8] px-5 py-4 text-[15px] font-extrabold text-[#17213d]">{t("Vos filleuls", "Your referrals")}</div>{data.referrals.length === 0 ? <p className="px-5 py-10 text-center text-[13px] text-[#8b96b0]">{t("Aucun filleul pour le moment. Partagez votre lien !", "No referrals yet. Share your link!")}</p> : <div className="divide-y divide-[#f0f3f9]">{data.referrals.map((r) => <div key={r.id} className="flex items-center justify-between px-5 py-3.5 text-[13px]"><span className="font-bold text-[#25314d]">🙂 {r.fullName}</span><span className="text-[11px] text-[#8b96b0]">{formatDate(r.createdAt)}</span></div>)}</div>}</Card>
    </div>
  );
}

function SectionRouter() {
  const pathname = usePathname();
  const parts = useMemo(() => pathname.replace("/dashboard", "").split("/").filter(Boolean), [pathname]);
  const key = parts[0] ?? "";
  if (key === "links" && parts[1] === "new") return <NewLinkWizard />;
  if (key === "links") return <MyLinksSection />;
  if (key === "transactions" && parts[1] && /^\d+$/.test(parts[1])) return <TransactionDetailSection />;
  if (key === "transactions") return <TransactionsSection />;
  if (key === "deposit") return <TopUpSection />;
  if (key === "withdraw") return <WithdrawSection />;
  if (key === "send") return <SendMoneySection />;
  if (key === "accounts" && parts[1] === "add") return <AddAccountSection />;
  if (key === "accounts") return <MyAccountsSection />;
  if (key === "referrals") return <ReferralsPage />;
  if (key === "kyc") return <KycVerifiedSection />;
  if (key === "support") return <SupportHubSection />;
  if (key === "api" && parts[1] === "direct") return <DirectApiSection />;
  if (key === "api") return <ApiHubSection />;
  if (key === "settings" && parts[1] === "conversion") return <AutomaticConversionSection />;
  if (key === "settings" && parts[1] === "updates") return <UpdatesSection />;
  if (key === "settings" && parts[1] === "withdrawal-numbers") return <WithdrawalNumbersSection />;
  if (key === "settings") return <SettingsHubSection />;
  if (key === "notifications") return <NotificationsPage />;
  if (key === "icons") return <IconGallerySection />;
  if (key === "fees") return <FeesSection />;
  return <HomeSection />;
}

export default function DashboardView() {
  return <DashboardShell><SectionRouter /></DashboardShell>;
}
