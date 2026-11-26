"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Clock3, Copy, CreditCard, Phone, Search, Smartphone, X } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { CountryFlag } from "@/components/IconAssets";
import { BitcoinBadge, OperatorLogo, TronLogo, UsdtLogo } from "@/components/PaymentBrands";
import { formatCountdown, formatNumber, formatUsdt } from "@/lib/format";
import { topupCountries, topupOperators, type TopupCountry } from "@/lib/topup-countries";

const MOBILE_TOTAL_SECONDS = 7 * 60 + 48;
const CRYPTO_TOTAL_SECONDS = 5 * 60;

type Processing = { id: number; reference: string; expiresAt: string; amount: number; operator: string };
type CryptoRequest = {
  id: number;
  reference: string;
  expiresAt: string;
  amount: number;
  fee: number;
  net: number;
  depositAddress: string;
  network: string;
};

export function TopUpSection() {
  const { data, refresh, t } = useDashboard();
  const router = useRouter();
  const [tab, setTab] = useState<"mobile" | "crypto">("mobile");
  const [view, setView] = useState<"form" | "processing" | "cryptoPayment">("form");
  const [amount, setAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("1.00");
  const [country, setCountry] = useState<TopupCountry>(topupCountries[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [operator, setOperator] = useState("MTN Money");
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("USDT.TRC20");
  const [refundAddress, setRefundAddress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [processing, setProcessing] = useState<Processing | null>(null);
  const [cryptoRequest, setCryptoRequest] = useState<CryptoRequest | null>(null);
  const [remaining, setRemaining] = useState(MOBILE_TOTAL_SECONDS);
  const [cryptoRemaining, setCryptoRemaining] = useState(CRYPTO_TOTAL_SECONDS);
  const autoConfirmed = useRef(false);

  const filteredCountries = useMemo(
    () => topupCountries.filter((item) => `${item.name} ${item.englishName ?? ""} ${item.currency}`.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch],
  );

  useEffect(() => {
    if (!processing) return;
    const tick = () => {
      const seconds = Math.max(0, Math.floor((new Date(processing.expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds <= 0 && !autoConfirmed.current) {
        autoConfirmed.current = true;
        void completeMobileDeposit(processing.id);
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [processing]);

  useEffect(() => {
    if (!cryptoRequest) return;
    const tick = () => setCryptoRemaining(Math.max(0, Math.floor((new Date(cryptoRequest.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [cryptoRequest]);

  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  const gross = Number(amount) || 0;
  const fee = Math.round(gross * 0.04);
  const credited = gross - fee;
  const phoneValid = phone.replace(/\D/g, "").length >= 8;
  const canSubmitMobile = gross >= 100 && phoneValid;
  const cryptoGross = Number(cryptoAmount) || 0;
  const cryptoFee = cryptoGross * 0.025;
  const cryptoNet = cryptoGross - cryptoFee;
  const canGenerate = cryptoGross >= 1;
  const countryLabel = country.englishName ?? country.name;
  const networkLabel = network.includes("TRC") ? "Tron (TRX)" : network.includes("ERC") ? "Ethereum (ERC20)" : "BNB (BEP20)";

  function copy(text: string, key: string) {
    void navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  }

  function switchTab(next: "mobile" | "crypto") {
    setTab(next);
    setView("form");
    setConfirmOpen(false);
    setError("");
    setProcessing(null);
    setCryptoRequest(null);
    autoConfirmed.current = false;
    setCountry(next === "crypto" ? topupCountries.find((item) => item.code === "CM")! : topupCountries[0]);
  }

  async function startMobileDeposit() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: gross,
          operator,
          phone,
          countryCode: country.code,
          countryName: countryLabel,
          siteReference: `IB-TOPUP-${Date.now().toString(36).toUpperCase()}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible de lancer le dépôt"); return; }
      const record = json.transaction;
      setProcessing({
        id: record.id,
        reference: record.providerReference || record.reference,
        expiresAt: record.expiresAt,
        amount: gross,
        operator,
      });
      setRemaining(MOBILE_TOTAL_SECONDS);
      autoConfirmed.current = false;
      setView("processing");
      setConfirmOpen(false);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  async function completeMobileDeposit(depositId?: number) {
    const id = depositId ?? processing?.id;
    if (!id || busy) return;
    autoConfirmed.current = true;
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/deposits/${id}/confirm`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Confirmation impossible"); autoConfirmed.current = false; return; }
      await refresh();
      router.push(`/dashboard/transactions/${id}`);
    } catch {
      setError("Impossible de contacter le serveur");
      autoConfirmed.current = false;
    } finally {
      setBusy(false);
    }
  }

  async function generateCryptoAddress() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/crypto/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cryptoGross, network, refundAddress, countryCode: country.code, countryName: countryLabel }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible de générer l'adresse"); return; }
      const record = json.transaction;
      setCryptoRequest({
        id: record.id,
        reference: record.providerReference || record.reference,
        expiresAt: record.expiresAt,
        amount: json.amount,
        fee: json.fee,
        net: json.net,
        depositAddress: json.depositAddress,
        network,
      });
      setCryptoRemaining(CRYPTO_TOTAL_SECONDS);
      setView("cryptoPayment");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCryptoDeposit() {
    if (!cryptoRequest || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/crypto/deposits/${cryptoRequest.id}/confirm`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Confirmation impossible"); return; }
      await refresh();
      router.push(`/dashboard/transactions/${cryptoRequest.id}`);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  const confirmRows: { label: string; value: string; tone?: "red" | "green"; highlight?: boolean }[] = [
    { label: "Mobile Money number", value: phone },
    { label: "Country", value: countryLabel },
    { label: "Operator", value: operator },
    { label: "Amount entered", value: `${formatNumber(gross)} FCFA` },
    { label: "Fees (4%)", value: `- ${formatNumber(fee)} FCFA`, tone: "red" },
    { label: "Credited amount", value: `${formatNumber(credited)} FCFA`, tone: "green", highlight: true },
  ];

  const balanceCard = (
    <div className="mt-5 flex items-center gap-4 rounded-[18px] bg-[#1d2a77] px-5 py-6 text-white">
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-white/10">
        {tab === "mobile" ? <CreditCard size={28} /> : <span className="text-[28px] font-black text-[#ffd45c]">₿</span>}
      </span>
      <div>
        <p className="text-[15px] text-[#c3cdef]">{tab === "mobile" ? `Current balance (${country.currency})` : "Current USDT balance"}</p>
        <p className="font-display mt-1 text-[34px] font-extrabold leading-none">
          {tab === "mobile" ? `${formatNumber(data.user.balance)} FCFA` : `${formatUsdt(data.user.usdtBalance ?? 0, 4)} USDT`}
        </p>
      </div>
    </div>
  );

  const tabs = (
    <div className="mt-5 flex rounded-[16px] border border-[#dce5f3] bg-[#f4f7fd] p-1.5">
      <button onClick={() => switchTab("mobile")} className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[15px] font-bold transition ${tab === "mobile" ? "bg-white text-[#17213d] shadow-[0_3px_10px_rgba(25,38,80,.08)]" : "text-[#8b96b0]"}`}><Smartphone size={19} /> Mobile Money</button>
      <button onClick={() => switchTab("crypto")} className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[15px] font-bold transition ${tab === "crypto" ? "bg-white text-[#17213d] shadow-[0_3px_10px_rgba(25,38,80,.08)]" : "text-[#8b96b0]"}`}><span className="text-[19px]">₿</span> Crypto (USDT)</button>
    </div>
  );

  const countryDropdown = (
    <div className="relative mt-3">
      <button onClick={() => setCountryOpen(!countryOpen)} className="flex h-[64px] w-full items-center gap-3 rounded-[14px] border border-[#dce5f3] bg-white px-4 text-left">
        <CountryFlag code={country.code} size={40} square />
        <span className="text-[17px] font-bold text-[#17213d]">{countryLabel}</span>
        <span className="text-[15px] text-[#6d7d9e]">({country.currency})</span>
        <ChevronDown size={20} className="ml-auto text-[#5d6882]" />
      </button>
      {countryOpen && (
        <>
          <button className="fixed inset-0 z-20 cursor-default" onClick={() => setCountryOpen(false)} aria-label="Fermer" />
          <div className="animate-pop absolute left-0 right-0 top-[72px] z-30 rounded-[16px] border border-[#dce5f3] bg-white p-4 shadow-[0_18px_45px_rgba(20,35,70,.18)]">
            <div className="flex items-center gap-2 border-b border-[#e8edf6] pb-3"><Search size={18} className="text-[#8792ab]" /><input autoFocus value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Rechercher un pays..." className="w-full bg-transparent text-[15px] text-[#2b3855] outline-none placeholder:text-[#9aa5bd]" /></div>
            <div className="brand-scroll mt-2 max-h-[270px] overflow-y-auto pr-1">
              {filteredCountries.map((item) => (
                <button key={item.code} onClick={() => { setCountry(item); setCountryOpen(false); setCountrySearch(""); }} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] hover:bg-[#f3f7ff] ${item.code === country.code ? "bg-[#eaf1ff]" : ""}`}>
                  <span className="w-5 text-sm font-bold text-[#1b2742]">{item.code === country.code ? <Check size={16} /> : ""}</span>
                  <CountryFlag code={item.code} size={24} square />
                  <span className="font-bold text-[#1b2742]">{tab === "crypto" ? (item.englishName ?? item.name) : item.name}</span>
                  <span className="text-[#8994ab]">· {item.currency}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && <p className="py-6 text-center text-sm text-[#8994ab]">Aucun pays trouvé</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Top up my account</h1>
      {balanceCard}
      {tabs}

      {view === "processing" && processing && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-6 text-center sm:p-7">
          <div className="motion-float mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#fff7dc]">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-[#2a3a86] bg-white/40">
              <OperatorLogo name={processing.operator} size={70} />
            </div>
          </div>
          <h2 className="font-display mt-6 text-[25px] font-extrabold text-[#111b36]">Processing</h2>
          <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-[#6d7d9e]">Approve the request on your Mobile Money phone</p>
          <div className="mt-6 rounded-[16px] border border-[#f3d78a] bg-[#fff9e9] px-5 py-5">
            <p className="text-[28px] font-extrabold text-[#e5a300]">{formatNumber(processing.amount)} FCFA</p>
            <p className="mt-1 text-[13px] text-[#6d7d9e]">via {processing.operator}</p>
          </div>
          <div className="processing-dots mt-5 flex justify-center gap-2"><span className="motion-dot h-[9px] w-[9px] rounded-full bg-[#ffb800]" /><span className="motion-dot h-[9px] w-[9px] rounded-full bg-[#ffb800]" /><span className="motion-dot h-[9px] w-[9px] rounded-full bg-[#ffb800]" /></div>
          <div className="mt-6 flex items-center justify-between text-[12px] font-semibold text-[#6d7d9e]"><span className="flex items-center gap-2"><Clock3 size={16} /> Expiry</span><span>{formatCountdown(remaining)}</span></div>
          <div className="mt-2 h-[8px] w-full overflow-hidden rounded-full bg-[#f5df9d]"><div className="h-full rounded-full bg-[#ffb800] transition-all" style={{ width: `${Math.max(0, (remaining / MOBILE_TOTAL_SECONDS) * 100)}%` }} /></div>
          <div className="mt-5 rounded-[14px] bg-[#f7f9fd] p-4 text-left">
            <p className="text-[12px] font-semibold text-[#6d7d9e]">Reference</p>
            <div className="mt-1 flex items-center justify-between gap-3"><code className="break-all text-[15px] font-bold text-[#17213d]">{processing.reference}</code><button onClick={() => copy(processing.reference, "processing")} className="shrink-0 text-[#8b96b0]">{copied === "processing" ? <Check size={18} /> : <Copy size={18} />}</button></div>
          </div>
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
          <button onClick={() => void completeMobileDeposit()} disabled={busy} className="brand-btn mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] disabled:opacity-60"><CheckCircle2 size={19} /> {busy ? "..." : "I approved the request"}</button>
          <button onClick={() => { setView("form"); setProcessing(null); autoConfirmed.current = true; }} className="mt-3 text-[12px] font-bold text-[#8b96b0]">Cancel</button>
        </div>
      )}

      {view === "cryptoPayment" && cryptoRequest && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><BitcoinBadge size={44} /><div><h2 className="text-[18px] font-extrabold text-[#17213d]">{cryptoRequest.network}</h2><p className="mt-1 text-[13px] leading-relaxed text-[#6d7d9e]">Send exactly the crypto amount shown below.</p></div></div>
          <div className="qr-reveal mx-auto mt-6 flex w-full max-w-[330px] items-center justify-center rounded-[18px] border border-[#e3e9f4] bg-white p-4"><QRCodeSVG value={`tron:${cryptoRequest.depositAddress}?amount=${formatUsdt(cryptoRequest.amount, 4)}`} size={230} bgColor="#ffffff" fgColor="#000000" level="M" /></div>
          <p className="mt-6 text-[12px] font-extrabold tracking-[.13em] text-[#6d7d9e]">DEPOSIT ADDRESS</p>
          <div className="mt-2 flex items-center gap-3 rounded-[14px] border border-[#dce5f3] bg-[#fafcff] px-4 py-3"><code className="min-w-0 flex-1 break-all text-[14px] font-bold text-[#17213d]">{cryptoRequest.depositAddress}</code><button onClick={() => copy(cryptoRequest.depositAddress, "deposit")} className="shrink-0 text-[#8b96b0]">{copied === "deposit" ? <Check size={18} /> : <Copy size={18} />}</button></div>
          <div className="mt-5 divide-y divide-[#e5ebf5] rounded-[14px] bg-[#f7f9fd] px-4">
            <div className="flex items-center justify-between py-3"><span className="text-[14px] text-[#6d7d9e]">Send exactly</span><span className="text-[15px] font-bold text-[#17213d]">{formatUsdt(cryptoRequest.amount, 4)} USDT</span></div>
            <div className="flex items-center justify-between py-3"><span className="text-[14px] text-[#6d7d9e]">Total fees (2.5%)</span><span className="text-[15px] font-bold text-[#f04c5c]">-{formatUsdt(cryptoRequest.fee, 4)} USDT</span></div>
            <div className="flex items-center justify-between py-3"><span className="text-[14px] text-[#6d7d9e]">Net amount credited</span><span className="text-[15px] font-bold text-[#1aa85d]">{formatUsdt(cryptoRequest.net, 4)} USDT</span></div>
          </div>
          <div className="mt-5 rounded-[18px] border border-[#dce5f3] p-5">
            <div className="flex items-center gap-5">
              <svg width="92" height="92" viewBox="0 0 100 100" className="shrink-0">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e3f5f2" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#0bb7a0" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - cryptoRemaining / CRYPTO_TOTAL_SECONDS)} transform="rotate(-90 50 50)" />
              </svg>
              <div><p className="text-[11px] font-extrabold tracking-[.15em] text-[#6d7d9e]">TIME REMAINING</p><p className="font-display mt-1 text-[32px] font-extrabold text-[#0bb7a0]">{formatCountdown(cryptoRemaining, true)}</p></div>
            </div>
            <div className="my-4 h-px bg-[#e5ebf5]" />
            <p className="flex items-center gap-3 text-[15px] font-semibold text-[#25314d]"><span className="text-[22px] text-[#0bb7a0]">⏳</span> Verifying the blockchain transaction</p>
          </div>
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
          <button onClick={() => void confirmCryptoDeposit()} disabled={busy || cryptoRemaining <= 0} className="brand-btn mt-5 flex h-[60px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] disabled:opacity-60"><CheckCircle2 size={20} /> {busy ? "..." : "I sent the funds"}</button>
          <button onClick={() => { setView("form"); setCryptoRequest(null); }} className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-bold text-[#8b96b0]"><ArrowLeft size={15} /> Edit</button>
        </div>
      )}

      {view === "form" && tab === "mobile" && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3 border-b-2 border-[#ffd66b] pb-4">
            <span className="text-[28px] font-bold text-[#6d7d9e]">{country.currency}</span>
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" className="min-w-0 flex-1 bg-transparent text-right text-[52px] font-extrabold leading-none text-[#17213d] outline-none placeholder:text-[#d6dde9]" />
          </div>
          <p className="mt-2 text-right text-[11px] text-[#8b96b0]">Fees 4% · credited {formatNumber(Math.max(credited, 0))}</p>
          <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">CHOOSE COUNTRY</h2>
          {countryDropdown}
          <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">MOBILE MONEY OPERATOR</h2>
          <div className="brand-scroll mt-3 flex gap-3 overflow-x-auto pb-2">
            {topupOperators.map((item) => (
              <button key={item.name} onClick={() => setOperator(item.name)} className={`flex min-h-[128px] min-w-[140px] shrink-0 flex-col items-center justify-center gap-3 rounded-[16px] border-2 bg-white px-3 py-4 transition ${operator === item.name ? "border-[#ffb800] shadow-[0_6px_18px_rgba(255,184,0,.15)]" : "border-[#dce5f3]"}`}>
                <OperatorLogo name={item.name} size={56} />
                <span className="text-[13px] font-bold text-[#17213d]">{item.name}</span>
              </button>
            ))}
          </div>
          <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">MOBILE MONEY PHONE NUMBER</h2>
          <div className="relative mt-3"><Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792ab]" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="XXX XXX XXX" className="h-[60px] w-full rounded-[14px] border border-[#dce5f3] bg-white pl-12 pr-4 text-[16px] text-[#25314d] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" /></div>
          <button onClick={() => { setError(""); setConfirmOpen(true); }} disabled={!canSubmitMobile} className={`mt-7 flex h-[60px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold text-white transition ${canSubmitMobile ? "brand-btn" : "cursor-not-allowed bg-[#f7d477]"}`}><CreditCard size={20} /> Confirm</button>
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
        </div>
      )}

      {view === "form" && tab === "crypto" && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
          <h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">CHOOSE COUNTRY *</h2>
          {countryDropdown}
          <h2 className="mt-6 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">CRYPTOCURRENCY</h2>
          <div className="relative mt-3"><span className="absolute left-4 top-1/2 -translate-y-1/2"><UsdtLogo size={38} /></span><select defaultValue="USDT : USDT" className="h-[64px] w-full appearance-none rounded-[14px] border border-[#dce5f3] bg-white pl-16 pr-10 text-[17px] font-bold text-[#17213d] outline-none focus:border-[#ffb800]"><option>USDT : USDT</option></select><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d6882]">▼</span></div>
          <h2 className="mt-6 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">NETWORK</h2>
          <div className="relative mt-3"><span className="absolute left-4 top-1/2 -translate-y-1/2"><TronLogo size={38} /></span><select value={network} onChange={(e) => setNetwork(e.target.value)} className="h-[64px] w-full appearance-none rounded-[14px] border border-[#dce5f3] bg-white pl-16 pr-10 text-[17px] font-bold text-[#17213d] outline-none focus:border-[#ffb800]"><option value="USDT.TRC20">Tron (TRX)</option><option value="USDT.ERC20">Ethereum (ERC20)</option><option value="USDT.BEP20">BNB (BEP20)</option></select><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d6882]">▼</span></div>
          <h2 className="mt-6 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">AMOUNT (USDT)</h2>
          <div className="mt-3 flex h-[64px] overflow-hidden rounded-[14px] border-2 border-[#ffd66b] bg-white"><span className="flex w-[110px] items-center justify-center border-r border-[#e5ebf5] bg-[#f1f4fa] text-[18px] font-bold text-[#6d7d9e]">USDT</span><input value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="1.00" className="min-w-0 flex-1 bg-transparent px-4 text-[24px] font-bold text-[#17213d] outline-none placeholder:text-[#aeb8cc]" /></div>
          {cryptoGross > 0 && (
            <>
              <p className="mt-2 text-[14px] font-bold text-[#17213d]">≈ {formatUsdt(cryptoGross, 2)} USDT</p>
              <div className="mt-5 divide-y divide-[#e5ebf5] rounded-[14px] bg-[#f7f9fd] px-4">
                <div className="flex items-center justify-between py-3"><span className="text-[14px] text-[#6d7d9e]">Total fees (2.5%)</span><span className="text-[15px] font-bold text-[#f04c5c]">-{formatUsdt(cryptoFee, 4)} USDT</span></div>
                <div className="flex items-center justify-between py-3"><span className="text-[14px] text-[#6d7d9e]">Net amount credited</span><span className="text-[15px] font-bold text-[#1aa85d]">{formatUsdt(cryptoNet, 4)} USDT</span></div>
              </div>
            </>
          )}
          <details className="mt-5">
            <summary className="cursor-pointer text-[13px] font-bold text-[#6d7d9e]">▼ Refund address (optional)</summary>
            <input value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)} placeholder="Paste your refund wallet address" className="mt-3 h-[54px] w-full rounded-[14px] border border-[#dce5f3] bg-white px-4 text-[14px] outline-none focus:border-[#ffb800]" />
          </details>
          <button onClick={() => { setError(""); void generateCryptoAddress(); }} disabled={!canGenerate || busy} className={`mt-6 flex h-[60px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold text-white transition ${canGenerate ? "brand-btn" : "cursor-not-allowed bg-[#f7d477]"}`}><span className="text-[20px]">₿</span> {busy ? "..." : "Generate payment address"}</button>
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
          <p className="mt-3 text-center text-[11px] text-[#8b96b0]">{networkLabel} · {t("Frais de 2,5% appliqués", "2.5% fees applied")}</p>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45" onClick={() => setConfirmOpen(false)}>
          <div className="animate-pop w-full max-w-[560px] rounded-t-[24px] bg-white px-5 pb-6 pt-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-5 h-[5px] w-[54px] rounded-full bg-[#dfe5f0]" />
            <div className="flex items-center justify-between"><h3 className="flex-1 pl-6 text-center text-[20px] font-extrabold text-[#111b36]">Confirm deposit</h3><button onClick={() => setConfirmOpen(false)} className="text-[#ff4d5e]"><X size={23} /></button></div>
            <div className="mt-5 divide-y divide-[#e5ebf5] overflow-hidden rounded-[16px] border border-[#dce5f3]">
              {confirmRows.map((row) => (
                <div key={row.label} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${row.highlight ? "bg-[#f1fbf5]" : "bg-white"}`}>
                  <span className={`text-[14px] ${row.highlight ? "font-extrabold text-[#17213d]" : "text-[#6d7d9e]"}`}>{row.label}</span>
                  <span className={`break-all text-right text-[15px] font-bold ${row.tone === "red" ? "text-[#f04c5c]" : row.tone === "green" ? "text-[#1aa85d]" : "text-[#17213d]"}`}>{row.value}</span>
                </div>
              ))}
            </div>
            {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmOpen(false)} className="h-[56px] rounded-[14px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#25314d]">Back</button>
              <button onClick={() => void startMobileDeposit()} disabled={busy} className="brand-btn flex h-[56px] items-center justify-center gap-2 rounded-[14px] text-[16px] disabled:opacity-60"><CreditCard size={18} /> {busy ? "..." : "Confirm"}</button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#8b96b0]">{t("Frais transparents de 4% appliqués avant crédit du wallet.", "Transparent 4% fees applied before wallet credit.")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
