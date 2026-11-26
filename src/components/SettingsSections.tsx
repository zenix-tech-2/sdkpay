"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Copy, ExternalLink, FileText, KeyRound, Lock, MessageSquare, Send, ShieldCheck, Wallet } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatDate } from "@/lib/format";

const fieldClass = "h-[50px] w-full rounded-[12px] border border-[#dce5f3] bg-white px-3.5 text-[14px] text-[#25314d] outline-none focus:border-[#ffb800]";

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[16px] border border-[#e3e9f4] bg-white p-5 shadow-[0_5px_18px_rgba(25,38,80,.035)] ${className}`}>{children}</div>;
}

export function KycSection() {
  const { data, t } = useDashboard();
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">KYC</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Vérification d'identité de votre compte marchand.", "Identity verification for your merchant account.")}</p>
      <Panel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3f6eb] text-[#2e9e63]"><ShieldCheck size={24} /></span><div><p className="text-[18px] font-extrabold text-[#17213d]">Identity verification</p><p className="text-[12px] text-[#8b96b0]">{data?.user.fullName}</p></div></div><span className="rounded-full bg-[#12b76a] px-4 py-2 text-[13px] font-extrabold text-white">Verified</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[t("Pièce d'identité validée", "ID document approved"), t("Numéro de téléphone confirmé", "Phone number confirmed"), t("Compte bancaire / wallet vérifié", "Bank or wallet verified")].map((item) => <p key={item} className="flex items-center gap-2 rounded-xl bg-[#f5f8ff] p-3 text-[12px] font-semibold text-[#3c4966]"><CheckCircle2 size={16} className="text-[#2e9e63]" />{item}</p>)}
        </div>
      </Panel>
      <Panel className="mt-4"><p className="text-[13px] font-bold text-[#17213d]">{t("Informations vérifiées", "Verified information")}</p><div className="mt-3 space-y-2 text-[12px] text-[#5d6882]">{[["Email", data?.user.email], [t("Téléphone", "Phone"), `${data?.user.dialCode} ${data?.user.phone}`], [t("Date de création", "Created"), data ? formatDate(data.user.createdAt) : ""]].map(([k, v]) => <div key={k} className="flex justify-between border-b border-[#f0f3f9] pb-2"><span>{k}</span><strong className="text-[#25314d]">{v}</strong></div>)}</div></Panel>
    </div>
  );
}

export function SupportSection() {
  const { data, t } = useDashboard();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => { if (data?.user.email) setEmail(data.user.email); }, [data?.user.email]);
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, message }) });
    if (res.ok) { setSent(true); setMessage(""); }
  }
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Support</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Notre équipe est disponible 24/7.", "Our team is available 24/7.")}</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel><h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#17213d]"><MessageSquare size={17} className="text-[#e5a300]" /> {t("Envoyer un message", "Send a message")}</h2><form onSubmit={send} className="mt-4 space-y-3"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={fieldClass} /><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("Décrivez votre problème...", "Describe your issue...")} className="h-32 w-full rounded-[12px] border border-[#dce5f3] p-3 text-[13px] outline-none focus:border-[#ffb800]" /><button className="brand-btn flex h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[14px]"><Send size={15} /> {t("Envoyer", "Send")}</button>{sent && <p className="text-[12px] font-bold text-[#2e9e63]">✓ {t("Message envoyé", "Message sent")}</p>}</form></Panel>
        <Panel><h2 className="text-[16px] font-extrabold text-[#17213d]">FAQ</h2><div className="mt-4 space-y-3">{[[t("Comment créer un lien ?", "How do I create a link?"), t("Depuis My links → New link, suivez les 4 étapes.", "Go to My links → New link and follow the 4 steps.")], [t("Quand sont les retraits ?", "When are withdrawals processed?"), t("Les retraits sont traités immédiatement avec 4% de frais.", "Withdrawals are instant with a 4% fee.")], [t("Comment utiliser l'API ?", "How do I use the API?"), t("Consultez la documentation API et utilisez votre clé Bearer.", "Read the API docs and use your Bearer key.")]].map(([q, a]) => <details key={q} className="rounded-xl bg-[#f5f8ff] p-3 text-[13px]"><summary className="cursor-pointer font-bold text-[#25314d]">{q}</summary><p className="mt-2 text-[#6c7892]">{a}</p></details>)}</div><p className="mt-4 text-[12px] text-[#6c7892]">support@sdkpay.com · +237 6 83 07 79 72</p></Panel>
      </div>
    </div>
  );
}

export function ApiSection() {
  const { data, t } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const key = data?.user.apiKey ?? "";
  function copy() { void navigator.clipboard?.writeText(key); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">API</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Intégrez les paiements SDK Pay dans votre application.", "Integrate SDK Pay payments into your application.")}</p>
      <Panel className="mt-6"><h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#17213d]"><KeyRound size={17} className="text-[#e5a300]" /> {t("Votre clé API", "Your API key")}</h2><div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f5f8ff] p-3"><code className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#25314d]">{revealed ? key : "sk_test_••••••••••••••••"}</code><button onClick={() => setRevealed(!revealed)} className="text-[11px] font-bold text-[#e5a300]">{revealed ? "Hide" : "Show"}</button><button onClick={copy} className="text-[#5d6882]">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><Link href="/docs" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#e5a300]">Documentation API <ExternalLink size={12} /></Link></Panel>
      <Panel className="mt-4"><h2 className="text-[16px] font-extrabold text-[#17213d]">Endpoints</h2><div className="mt-3 space-y-2 text-[12px] text-[#3c4966]">{[["POST", "/api/v1/collect", "Collecter un paiement"], ["POST", "/api/links", "Créer un payment link"], ["GET", "/api/transactions", "Lister les transactions"], ["GET", "/api/dashboard", "Solde et statistiques"]].map(([method, path, label]) => <div key={path} className="flex flex-wrap items-center gap-2 rounded-lg bg-[#f5f8ff] px-3 py-2"><span className="rounded bg-[#1d2a77] px-2 py-0.5 text-[10px] font-bold text-white">{method}</span><code>{path}</code><span className="ml-auto text-[#8b96b0]">{label}</span></div>)}</div></Panel>
    </div>
  );
}

export function SettingsSection() {
  const { data, refresh, t, lang, setLang } = useDashboard();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState(true);
  useEffect(() => { if (data) { setFullName(data.user.fullName); setEmail(data.user.email); setPhone(data.user.phone); } }, [data]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email, phone }) });
    const json = await res.json();
    setMessage(res.ok ? t("Profil mis à jour ✓", "Profile updated ✓") : json.error);
    if (res.ok) await refresh();
  }
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Settings</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Gérez votre profil et vos préférences.", "Manage your profile and preferences.")}</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel><h2 className="text-[16px] font-extrabold text-[#17213d]">{t("Profil", "Profile")}</h2><form onSubmit={save} className="mt-4 space-y-3"><label className="text-[12px] font-bold text-[#5d6882]">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${fieldClass} mt-2`} /></label><label className="text-[12px] font-bold text-[#5d6882]">Email<input value={email} onChange={(e) => setEmail(e.target.value)} className={`${fieldClass} mt-2`} /></label><label className="text-[12px] font-bold text-[#5d6882]">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${fieldClass} mt-2`} /></label><button className="brand-btn h-[48px] w-full rounded-xl text-[14px]">{t("Enregistrer", "Save changes")}</button>{message && <p className="text-[12px] font-bold text-[#2e9e63]">{message}</p>}</form></Panel>
        <div className="space-y-5"><Panel><h2 className="text-[16px] font-extrabold text-[#17213d]">{t("Préférences", "Preferences")}</h2><div className="mt-4 flex items-center justify-between"><span className="text-[13px] font-semibold text-[#3c4966]">Language</span><div className="flex gap-2">{(["fr", "en"] as const).map((code) => <button key={code} onClick={() => setLang(code)} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${lang === code ? "bg-[#ffb800] text-white" : "bg-[#f0f3f9] text-[#5d6882]"}`}>{code.toUpperCase()}</button>)}</div></div><div className="mt-4 flex items-center justify-between"><span className="text-[13px] font-semibold text-[#3c4966]">Notifications</span><button onClick={() => setNotifications(!notifications)} className={`relative h-[30px] w-[54px] rounded-full ${notifications ? "bg-[#ffb800]" : "bg-[#d7e0ef]"}`}><span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white transition-all ${notifications ? "left-[26px]" : "left-[3px]"}`} /></button></div></Panel><Panel><h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#17213d]"><Lock size={17} className="text-[#e5a300]" /> {t("Sécurité", "Security")}</h2><p className="mt-2 text-[12px] leading-relaxed text-[#6c7892]">{t("Votre session est chiffrée et votre mot de passe est haché. Compte KYC vérifié.", "Your session is encrypted and your password is hashed. KYC verified.")}</p><span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e3f6eb] px-3 py-1.5 text-[11px] font-bold text-[#218c55]"><CheckCircle2 size={14} /> Verified</span></Panel></div>
      </div>
    </div>
  );
}

export function FeesSection() {
  const { t } = useDashboard();
  const rows = [
    { icon: <Wallet size={17} />, label: t("Dépôt Mobile Money", "Mobile Money deposit"), value: "4%", note: t("Prélevés sur le montant saisi", "Deducted from the entered amount") },
    { icon: <FileText size={17} />, label: t("Retrait Mobile Money", "Mobile Money withdrawal"), value: "4%", note: t("Calculé sur le montant débité", "Calculated on the debited amount") },
    { icon: <ExternalLink size={17} />, label: t("Paiement par lien", "Payment link"), value: "4%", note: t("Facturé uniquement sur paiement réussi", "Charged only on successful payments") },
    { icon: <KeyRound size={17} />, label: t("Collecte API", "API collection"), value: "4%", note: t("Webhooks inclus", "Webhooks included") },
    { icon: <Send size={17} />, label: t("Transfert interne", "Internal transfer"), value: "Free", note: t("Aucun frais entre comptes vérifiés", "No fees between verified accounts") },
    { icon: <Wallet size={17} />, label: t("Dépôt crypto (USDT)", "Crypto deposit (USDT)"), value: "2,5%", note: t("Adresse et QR code générés", "Address and QR code generated") },
    { icon: <ExternalLink size={17} />, label: t("Retrait crypto (USDT)", "Crypto withdrawal (USDT)"), value: "1 USDT", note: t("Frais réseau fixes", "Flat network fee") },
  ];
  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Fees</h1>
      <p className="mt-1 text-[13px] text-[#7c87a1]">{t("Aucun frais caché. Vous savez exactement ce que vous payez.", "No hidden fees. You always know exactly what you pay.")}</p>
      <Panel className="mt-6 overflow-hidden p-0"><div className="border-b border-[#edf1f8] px-5 py-4 text-[15px] font-extrabold text-[#17213d]">{t("Grille tarifaire", "Pricing table")}</div><div className="divide-y divide-[#f0f3f9]">{rows.map((row) => <div key={row.label} className="flex items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5d9] text-[#e5a300]">{row.icon}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#25314d]">{row.label}</p><p className="text-[11px] text-[#8b96b0]">{row.note}</p></div><span className="text-[16px] font-extrabold text-[#1d2a77]">{row.value}</span></div>)}</div></Panel>
      <Panel className="mt-4 flex items-start gap-3 text-[12px] leading-relaxed text-[#6c7892]"><ShieldCheck size={18} className="shrink-0 text-[#e5a300]" />{t("Les frais sont affichés avant chaque opération et détaillés dans l'historique des transactions.", "Fees are displayed before each operation and detailed in your transaction history.")}</Panel>
    </div>
  );
}
