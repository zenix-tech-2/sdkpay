"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, ChevronDown, CreditCard, Globe2, Info, Search, Send, Users, Wallet } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { CountryFlag } from "@/components/IconAssets";
import { OperatorLogo, TronLogo } from "@/components/PaymentBrands";
import { formatNumber, formatUsdt } from "@/lib/format";
import { topupCountries, topupOperators, type TopupCountry } from "@/lib/topup-countries";

export function SendMoneySection() {
  const { data, refresh } = useDashboard();
  const router = useRouter();
  const [tab, setTab] = useState<"mobile" | "internal" | "crypto">("mobile");
  const [country, setCountry] = useState<TopupCountry>(topupCountries[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [operator, setOperator] = useState("Celtiis Money");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [internalRecipient, setInternalRecipient] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [network, setNetwork] = useState("USDT.TRC20");
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [feeDetailsOpen, setFeeDetailsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filteredCountries = useMemo(
    () => topupCountries.filter((item) => `${item.name} ${item.englishName ?? ""} ${item.currency}`.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch],
  );

  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  const usdtBalance = data.user.usdtBalance ?? 0;
  const numericAmount = Number(amount) || 0;
  const cryptoFee = 1;
  const debited = numericAmount + (feePayer === "you" ? cryptoFee : 0);
  const fee = tab === "mobile" ? Math.round(numericAmount * 0.04) : tab === "internal" ? 0 : cryptoFee;
  const recipientGets = tab === "crypto" ? Math.max(0, numericAmount - (feePayer === "recipient" ? cryptoFee : 0)) : Math.max(0, numericAmount - fee);
  const mobileValid = numericAmount >= 100 && recipientName.trim().length > 0 && phone.replace(/\D/g, "").length >= 8;
  const internalValid = numericAmount >= 100 && internalRecipient.trim().length > 0;
  const cryptoValid = numericAmount >= 1 && cryptoAddress.trim().length >= 10 && debited <= usdtBalance;
  const canSubmit = tab === "mobile" ? mobileValid : tab === "internal" ? internalValid : cryptoValid;
  const balanceText = tab === "crypto" ? `${formatUsdt(usdtBalance, 2)} USDT` : `${formatNumber(data.user.balance)} FCFA`;
  const currencyBadge = tab === "crypto" ? `₮ USDT ${formatUsdt(usdtBalance, 2)}` : `${country.flag} ${country.currency} ${formatNumber(data.user.balance)}`;

  function switchTab(next: "mobile" | "internal" | "crypto") {
    setTab(next);
    setAmount("");
    setError("");
    setCountryOpen(false);
    setCurrencyOpen(false);
    setFeeDetailsOpen(false);
    setFeePayer("you");
  }

  async function submit() {
    setBusy(true); setError("");
    let endpoint = "/api/transactions";
    let payload: Record<string, unknown>;
    if (tab === "mobile") {
      payload = {
        type: "send",
        amount: numericAmount,
        method: operator,
        counterparty: phone,
        note: `Mobile Money transfer to ${recipientName}`,
        countryCode: country.code,
        countryName: country.englishName ?? country.name,
        recipientName,
      };
    } else if (tab === "internal") {
      endpoint = "/api/transfers/internal";
      payload = { recipient: internalRecipient.trim(), amount: numericAmount };
    } else {
      endpoint = "/api/withdrawals";
      payload = { methodType: "crypto", amount: numericAmount, network, address: cryptoAddress, feePayer, countryCode: country.code, countryName: country.englishName ?? country.name };
    }
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible d'envoyer l'argent"); return; }
      await refresh();
      router.push(`/dashboard/transactions/${json.transaction.id}`);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  const countryDropdown = (
    <div className="relative mt-3">
      <button onClick={() => setCountryOpen(!countryOpen)} className="flex h-[64px] w-full items-center gap-3 rounded-[14px] border border-[#dce5f3] bg-white px-4 text-left">
        <CountryFlag code={country.code} size={40} square />
        <span><span className="block text-[17px] font-bold text-[#17213d]">{country.englishName ?? country.name}</span><span className="block text-[12px] font-semibold text-[#6d7d9e]">{country.currency}</span></span>
        <ChevronDown size={20} className="ml-auto text-[#5d6882]" />
      </button>
      {countryOpen && (
        <>
          <button className="fixed inset-0 z-20 cursor-default" onClick={() => setCountryOpen(false)} aria-label="Fermer" />
          <div className="animate-pop absolute left-0 right-0 top-[72px] z-30 rounded-[16px] border border-[#dce5f3] bg-white p-4 shadow-[0_18px_45px_rgba(20,35,70,.18)]">
            <div className="flex items-center gap-2 border-b border-[#e8edf6] pb-3"><Search size={18} className="text-[#8792ab]" /><input autoFocus value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Rechercher un pays..." className="w-full bg-transparent text-[15px] outline-none" /></div>
            <div className="brand-scroll mt-2 max-h-[230px] overflow-y-auto pr-1">
              {filteredCountries.map((item) => (
                <button key={item.code} onClick={() => { setCountry(item); setCountryOpen(false); setCountrySearch(""); }} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] hover:bg-[#f3f7ff] ${item.code === country.code ? "bg-[#eaf1ff]" : ""}`}>
                  <span className="w-5">{item.code === country.code ? <Check size={16} /> : ""}</span><CountryFlag code={item.code} size={24} square /><span className="font-bold text-[#1b2742]">{item.englishName ?? item.name}</span><span className="text-[#8994ab]">· {item.currency}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Send money</h1>
      <p className="mt-1 text-[15px] text-[#6d7d9e]">Instant transfer or via Mobile Money</p>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-[18px] bg-[#1d2a77] px-5 py-5 text-white">
        <div className="flex items-center gap-4"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-white/10"><Wallet size={26} /></span><div><p className="text-[14px] text-[#c3cdef]">Your balance</p><p className="font-display mt-1 text-[28px] font-extrabold leading-none">{balanceText}</p></div></div>
        <div className="relative">
          <button onClick={() => setCurrencyOpen(!currencyOpen)} className="flex h-[44px] items-center gap-2 rounded-[12px] border border-white/25 bg-white/10 px-3 text-[13px] font-bold"><span className="text-[17px]">{tab === "crypto" ? "₮" : country.flag}</span>{currencyBadge}<ChevronDown size={15} /></button>
          {currencyOpen && (
            <>
              <button className="fixed inset-0 z-20 cursor-default" onClick={() => setCurrencyOpen(false)} aria-label="Fermer" />
              <div className="animate-pop absolute right-0 top-12 z-30 w-[210px] rounded-[14px] border border-[#dce5f3] bg-white p-2 shadow-xl">
                {topupCountries.slice(0, 8).map((item) => <button key={item.code} onClick={() => { setCountry(item); setCurrencyOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] font-semibold text-[#25314d] hover:bg-[#f3f7ff]"><span className="text-lg">{item.flag}</span>{item.currency}</button>)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 flex rounded-[16px] bg-[#f4f7fd] p-1.5">
        <button onClick={() => switchTab("mobile")} className={`flex h-[62px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[14px] font-bold transition ${tab === "mobile" ? "bg-white text-[#17213d] shadow-[0_3px_10px_rgba(25,38,80,.08)]" : "text-[#8b96b0]"}`}><Globe2 size={18} /><span>Mobile<br />Money</span></button>
        <button onClick={() => switchTab("internal")} className={`flex h-[62px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[14px] font-bold transition ${tab === "internal" ? "bg-white text-[#17213d] shadow-[0_3px_10px_rgba(25,38,80,.08)]" : "text-[#8b96b0]"}`}><Users size={18} /> Internal</button>
        <button onClick={() => switchTab("crypto")} className={`flex h-[62px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[14px] font-bold transition ${tab === "crypto" ? "bg-white text-[#17213d] shadow-[0_3px_10px_rgba(25,38,80,.08)]" : "text-[#8b96b0]"}`}><Wallet size={18} /> Crypto</button>
      </div>

      {tab === "mobile" && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
          <h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">DESTINATION</h2>
          {countryDropdown}
          <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">OPERATOR</h2>
          <div className="brand-scroll mt-3 flex gap-3 overflow-x-auto pb-2">
            {topupOperators.slice(0, 5).map((item) => (
              <button key={item.name} onClick={() => setOperator(item.name)} className={`flex min-h-[120px] min-w-[140px] shrink-0 flex-col items-center justify-center gap-3 rounded-[16px] border-2 transition ${operator === item.name ? "border-[#ffb800] bg-[#fffaf0]" : "border-[#dce5f3] bg-white"}`}>
                <OperatorLogo name={item.name} size={54} />
                <span className="text-[13px] font-bold text-[#17213d]">{item.name}</span>
              </button>
            ))}
          </div>
          <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">AMOUNT TO SEND ({country.currency})</h2>
          <div className="mt-3 flex h-[64px] items-center rounded-[14px] border border-[#dce5f3] bg-white px-4"><span className="text-[20px] font-bold text-[#6d7d9e]">{country.currency}</span><input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="min-w-0 flex-1 bg-transparent pl-4 text-[28px] font-bold text-[#17213d] outline-none placeholder:text-[#c9d2e2]" /></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div><p className="text-[12px] font-extrabold tracking-[.12em] text-[#6d7d9e]">RECIPIENT NAME</p><input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jean Dupont" className="mt-2 h-[56px] w-full rounded-[14px] border border-[#dce5f3] px-3 text-[15px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" /></div>
            <div><p className="text-[12px] font-extrabold tracking-[.12em] text-[#6d7d9e]">PHONE NUMBER</p><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="XXXXXXXX" className="mt-2 h-[56px] w-full rounded-[14px] border border-[#dce5f3] px-3 text-[15px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" /></div>
          </div>
          {numericAmount > 0 && <div className="mt-5 rounded-[14px] bg-[#f7f9fd] px-4 py-3 text-[13px]"><div className="flex justify-between"><span className="text-[#6d7d9e]">Fees (4%)</span><strong className="text-[#f04c5c]">{formatNumber(fee)} FCFA</strong></div><div className="mt-2 flex justify-between"><span className="text-[#6d7d9e]">Recipient gets</span><strong className="text-[#1aa85d]">{formatNumber(recipientGets)} FCFA</strong></div></div>}
          <button onClick={() => void submit()} disabled={!canSubmit || busy} className={`mt-6 flex h-[60px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold transition ${canSubmit ? "brand-btn text-white" : "cursor-not-allowed bg-[#f7d477] text-white"}`}><CreditCard size={19} /> {busy ? "..." : "Continue"} <ArrowRight size={18} /></button>
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
        </div>
      )}

      {tab === "internal" && (
        <>
          <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
            <p className="flex items-center gap-3 text-[17px] font-extrabold text-[#12a150]"><CheckCircle2 size={24} /> Internal transfer with no fees</p>
            <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">EMAIL, PHONE OR USERNAME</h2>
            <input value={internalRecipient} onChange={(e) => setInternalRecipient(e.target.value)} placeholder="email / +237600000000 / @username" className="mt-3 h-[64px] w-full rounded-[14px] border border-[#dce5f3] px-4 text-[16px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" />
            <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">AMOUNT ({country.currency})</h2>
            <div className="mt-3 flex h-[72px] items-center rounded-[14px] border border-[#dce5f3] bg-white px-4"><span className="text-[22px] font-bold text-[#6d7d9e]">{country.currency}</span><input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="min-w-0 flex-1 bg-transparent pl-4 text-[34px] font-bold text-[#17213d] outline-none placeholder:text-[#c9d2e2]" /></div>
            <div className="mt-6 flex items-center justify-between rounded-[14px] border border-[#b7e8c8] bg-[#f1fcf5] px-4 py-4"><span className="text-[15px] text-[#5d6882]">Fees</span><span className="text-[17px] font-extrabold text-[#12a150]">Free</span></div>
            <button onClick={() => void submit()} disabled={!canSubmit || busy} className={`mt-5 flex h-[62px] w-full items-center justify-center gap-2 rounded-[14px] text-[18px] font-extrabold transition ${canSubmit ? "brand-btn text-white" : "cursor-not-allowed bg-[#f7d477] text-white"}`}><Send size={20} /> {busy ? "..." : "Send"}</button>
            {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
          </div>
          <div className="mt-5 overflow-hidden rounded-[18px] border border-[#b7e8c8] bg-[#effbf4]">
            {["No internal transfer fees", "Credit to the recipient's account", "Verified account"].map((item) => <p key={item} className="flex items-center gap-3 border-b border-[#c7ead4] px-5 py-4 text-[15px] font-semibold text-[#3f5a4c] last:border-b-0"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c6efd5] text-[#1e8b52]"><Check size={16} /></span>{item}</p>)}
          </div>
        </>
      )}

      {tab === "crypto" && (
        <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between rounded-[14px] bg-[#f4f7fd] px-4 py-4"><span className="flex items-center gap-3 text-[15px] font-semibold text-[#6d7d9e]"><Wallet size={20} /> USDT balance</span><span className="text-[17px] font-extrabold text-[#17213d]">{formatUsdt(usdtBalance, 2)} USDT</span></div>
          <h2 className="mt-6 text-[17px] font-bold text-[#17213d]">Network</h2>
          <div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2"><TronLogo size={38} /></span><select value={network} onChange={(e) => setNetwork(e.target.value)} className="h-[64px] w-full appearance-none rounded-[14px] border border-[#dce5f3] bg-white pl-16 pr-10 text-[16px] font-bold text-[#17213d] outline-none focus:border-[#ffb800]"><option value="USDT.TRC20">Tron (TRX) &nbsp; USDT.TRC20</option><option value="USDT.ERC20">Ethereum &nbsp; USDT.ERC20</option><option value="USDT.BEP20">BNB &nbsp; USDT.BEP20</option></select><ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d6882]" /></div>
          <h2 className="mt-6 text-[17px] font-bold text-[#17213d]">Destination address</h2>
          <input value={cryptoAddress} onChange={(e) => setCryptoAddress(e.target.value)} placeholder="Paste the wallet address" className="mt-2 h-[62px] w-full rounded-[14px] border border-[#dce5f3] px-4 text-[15px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" />
          <h2 className="mt-6 text-[17px] font-bold text-[#17213d]">Amount (USDT)</h2>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" className="mt-2 h-[62px] w-full rounded-[14px] border border-[#dce5f3] px-4 text-[17px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" />
          <h2 className="mt-6 text-[17px] font-extrabold text-[#17213d]">Who pays the SDK Pay fee?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setFeePayer("you")} className={`h-[56px] rounded-[12px] border text-[15px] font-bold transition ${feePayer === "you" ? "brand-btn border-transparent text-white" : "border-[#dce5f3] bg-white text-[#17213d]"}`}>You</button>
            <button onClick={() => setFeePayer("recipient")} className={`h-[56px] rounded-[12px] border text-[15px] font-bold transition ${feePayer === "recipient" ? "brand-btn border-transparent text-white" : "border-[#dce5f3] bg-white text-[#17213d]"}`}>Recipient</button>
          </div>
          <div className="mt-5 rounded-[16px] border border-[#dce5f3] bg-white p-4">
            <div className="flex items-center justify-between border-b border-[#edf1f8] pb-3"><span className="text-[14px] text-[#6d7d9e]">Fees</span><span className="text-[15px] font-bold text-[#17213d]">{formatUsdt(cryptoFee, 2)} USDT</span></div>
            <div className="flex items-center justify-between pt-3"><span className="text-[15px] font-extrabold text-[#17213d]">Debited</span><span className="text-[15px] font-extrabold text-[#17213d]">{formatUsdt(Math.max(0, debited), 2)} USDT</span></div>
            {numericAmount > 0 && <p className="mt-2 text-[12px] text-[#6d7d9e]">Recipient gets {formatUsdt(recipientGets, 2)} USDT</p>}
          </div>
          <button onClick={() => void submit()} disabled={!canSubmit || busy} className={`mt-5 flex h-[62px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold transition ${canSubmit ? "brand-btn text-white" : "cursor-not-allowed bg-[#f7d477] text-white"}`}><ArrowRight size={20} /> {busy ? "..." : "Continue"}</button>
          <button onClick={() => setFeeDetailsOpen(!feeDetailsOpen)} className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#6d7d9e]"><Info size={16} /> Fee details</button>
          {feeDetailsOpen && <p className="mt-3 rounded-[14px] bg-[#f7f9fd] p-4 text-[13px] leading-relaxed text-[#5d6882]">Flat network fee of 1.00 USDT. Choose whether you or the recipient pays it before continuing.</p>}
          {error && <p className="mt-3 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
        </div>
      )}
    </div>
  );
}
