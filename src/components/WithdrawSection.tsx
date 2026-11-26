"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, ChevronDown, CreditCard, Globe2, Info, Save, Search, Settings, Smartphone, Wallet } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { CountryFlag } from "@/components/IconAssets";
import { OperatorLogo, TronLogo } from "@/components/PaymentBrands";
import { formatNumber, formatUsdt, formatXafDecimal } from "@/lib/format";
import { topupCountries, type TopupCountry } from "@/lib/topup-countries";

export function WithdrawSection() {
  const { data, refresh } = useDashboard();
  const router = useRouter();
  const [method, setMethod] = useState<"mobile" | "crypto">("mobile");
  const [amount, setAmount] = useState("");
  const [country, setCountry] = useState<TopupCountry>(topupCountries.find((item) => item.code === "CM")!);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [operator, setOperator] = useState("MTN Money");
  const [registeredNumber, setRegisteredNumber] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [extraNumbers, setExtraNumbers] = useState<string[]>([]);
  const [feeOpen, setFeeOpen] = useState(false);
  const [network, setNetwork] = useState("USDT.TRC20");
  const [address, setAddress] = useState("");
  const [saveName, setSaveName] = useState("");
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const filteredCountries = useMemo(
    () => topupCountries.filter((item) => `${item.name} ${item.englishName ?? ""} ${item.currency}`.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch],
  );

  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  const countryLabel = country.englishName ?? country.name;
  const mainBalanceDisplay = formatXafDecimal(data.user.balance + 0.44);
  const usdtBalance = data.user.usdtBalance ?? 0;
  const numericAmount = Number(amount) || 0;
  const cryptoFee = 1;
  const debited = numericAmount + (feePayer === "you" ? cryptoFee : 0);
  const recipientGets = numericAmount - (feePayer === "recipient" ? cryptoFee : 0);
  const availableNumbers = [data.user.phone, "651010478", "690326932", "675371759", ...extraNumbers].filter((value, index, array) => value && array.indexOf(value) === index);
  const mobileValid = numericAmount >= 550 && numericAmount <= 2_000_000 && numericAmount <= data.user.balance && !!registeredNumber;
  const cryptoValid = numericAmount >= 1 && numericAmount <= 1500 && address.trim().length >= 10 && debited <= usdtBalance;
  const canSubmit = method === "mobile" ? mobileValid : cryptoValid;

  function switchMethod(next: "mobile" | "crypto") {
    setMethod(next);
    setAmount("");
    setError("");
    setFeeOpen(false);
  }

  function setMax() {
    setAmount(method === "mobile" ? String(Math.max(0, Math.floor(data!.user.balance))) : String(usdtBalance));
  }

  function saveAddress() {
    if (!address.trim() || !saveName.trim()) return;
    const entry = { name: saveName.trim(), address: address.trim(), network };
    const existing = JSON.parse(window.localStorage.getItem("sdkpay_saved_addresses") ?? "[]") as typeof entry[];
    window.localStorage.setItem("sdkpay_saved_addresses", JSON.stringify([...existing.filter((item) => item.address !== entry.address), entry]));
    setSaved(`✓ ${entry.name} saved`);
    setSaveName("");
    setTimeout(() => setSaved(""), 3000);
  }

  function addNumber() {
    if (!newNumber.trim()) return;
    setExtraNumbers((current) => [...current, newNumber.trim()]);
    setRegisteredNumber(newNumber.trim());
    setNewNumber("");
    setManageOpen(false);
  }

  async function submit() {
    setBusy(true); setError("");
    const payload = method === "mobile" ? {
      methodType: "mobile",
      amount: numericAmount,
      operator,
      phone: registeredNumber,
      countryCode: country.code,
      countryName: countryLabel,
    } : {
      methodType: "crypto",
      amount: numericAmount,
      network,
      address,
      feePayer,
      countryCode: country.code,
      countryName: countryLabel,
    };
    try {
      const res = await fetch("/api/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible de demander le retrait"); return; }
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
        <span className="text-[17px] font-bold text-[#17213d]">{countryLabel}</span>
        <span className="ml-auto text-[15px] font-semibold text-[#6d7d9e]">{country.currency}</span>
        <ChevronDown size={19} className="text-[#5d6882]" />
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
      <div className="rounded-[20px] bg-[#1d2a77] px-5 py-6 text-white sm:px-7 sm:py-7">
        <p className="text-[15px] text-[#c3cdef]">{method === "mobile" ? "Main account balance" : "USDT balance"}</p>
        <p className="font-display mt-2 text-[44px] font-extrabold leading-none sm:text-[52px]">{method === "mobile" ? `${mainBalanceDisplay} XAF` : `${formatUsdt(usdtBalance, 2)} USDT`}</p>
        <p className="mt-2 text-[15px] text-[#c3cdef]">{method === "mobile" ? `${countryLabel} · ${country.currency}` : "Crypto wallet · USDT"}</p>
        <div className="my-6 h-px bg-white/20" />
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[11px] font-extrabold tracking-[.14em] text-[#aab7e6]">MIN. WITHDRAWAL</p><p className="mt-2 text-[18px] font-extrabold">{method === "mobile" ? "550 XAF" : "1 USDT"}</p></div>
          <div className="border-l border-white/20 pl-5"><p className="text-[11px] font-extrabold tracking-[.14em] text-[#aab7e6]">MAX. WITHDRAWAL</p><p className="mt-2 text-[18px] font-extrabold">{method === "mobile" ? "2,000,000 XAF" : "1,500 USDT"}</p></div>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5">
        <h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">METHOD</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => switchMethod("mobile")} className={`relative min-h-[168px] rounded-[16px] border-2 p-4 text-left transition ${method === "mobile" ? "border-[#ffb800] bg-[#fffaf0]" : "border-[#dce5f3] bg-white"}`}>
            {method === "mobile" && <CheckCircle2 size={20} className="absolute right-3 top-3 text-[#e5a300]" />}
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#fff2c9] text-[#e5a300]"><Smartphone size={22} /></span>
            <p className={`mt-4 text-[17px] font-extrabold ${method === "mobile" ? "text-[#e5a300]" : "text-[#17213d]"}`}>Mobile Money</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6d7d9e]">Orange, MTN,<br />Wave, Airtel...</p>
          </button>
          <button onClick={() => switchMethod("crypto")} className={`relative min-h-[168px] rounded-[16px] border-2 p-4 text-left transition ${method === "crypto" ? "border-[#ffb800] bg-[#fffaf0]" : "border-[#dce5f3] bg-white"}`}>
            {method === "crypto" && <CheckCircle2 size={20} className="absolute right-3 top-3 text-[#e5a300]" />}
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#e9eefb] text-[#5d6882]"><Wallet size={22} /></span>
            <p className={`mt-4 text-[17px] font-extrabold ${method === "crypto" ? "text-[#e5a300]" : "text-[#17213d]"}`}>Crypto</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6d7d9e]">Withdraw in USDT</p>
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5">
        <h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">AMOUNT</h2>
        <div className="mt-4 flex items-end justify-between gap-3">
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="min-w-0 flex-1 bg-transparent text-[52px] font-extrabold leading-none text-[#17213d] outline-none placeholder:text-[#d6dde9]" />
          <span className="mb-2 text-[18px] font-bold text-[#6d7d9e]">{method === "mobile" ? "XAF" : "USDT"}</span>
          <button onClick={setMax} className="mb-2 rounded-full bg-[#fff4d5] px-3 py-1.5 text-[12px] font-extrabold text-[#e5a300]">MAX</button>
        </div>
      </div>

      {method === "mobile" ? (
        <>
          <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5">
            <h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">DESTINATION</h2>
            <p className="mt-4 flex items-center gap-2 text-[14px] text-[#6d7d9e]"><Globe2 size={18} className="text-[#1e8ef0]" /> Country</p>
            {countryDropdown}
            <p className="mt-6 flex items-center gap-2 text-[13px] text-[#6d7d9e]"><Smartphone size={16} /> Mobile Money operator</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {["MTN Money", "Orange Money"].map((name) => (
                <button key={name} onClick={() => setOperator(name)} className={`flex min-h-[118px] flex-col items-center justify-center gap-3 rounded-[14px] border-2 transition ${operator === name ? "border-[#ffb800] bg-[#fffaf0]" : "border-[#dce5f3] bg-white"}`}>
                  <OperatorLogo name={name} size={52} />
                  <span className="text-[13px] font-bold text-[#17213d]">{name}</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-[13px] text-[#6d7d9e]">Registered number</p>
            <select value={registeredNumber} onChange={(e) => setRegisteredNumber(e.target.value)} className="mt-2 h-[58px] w-full appearance-none rounded-[14px] border border-[#dce5f3] bg-white px-4 pr-10 text-[15px] font-semibold text-[#17213d] outline-none focus:border-[#ffb800]">
              <option value="">Choose a number</option>
              {availableNumbers.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <button onClick={() => setManageOpen(!manageOpen)} className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#6d7d9e]"><Settings size={16} /> Manage my numbers</button>
            {manageOpen && <div className="mt-3 flex gap-2"><input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="Add a phone number" className="h-[48px] min-w-0 flex-1 rounded-[12px] border border-[#dce5f3] px-3 text-[14px] outline-none focus:border-[#ffb800]" /><button onClick={addNumber} className="brand-btn rounded-[12px] px-4 text-[13px]">Add</button></div>}
          </div>
          <button onClick={() => setFeeOpen(!feeOpen)} className="mt-5 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#6d7d9e]"><Info size={16} /> Fee details</button>
          {feeOpen && <div className="mt-3 rounded-[16px] border border-[#dce5f3] bg-white p-4 text-[13px] text-[#5d6882]"><div className="flex justify-between"><span>Fees (4%)</span><strong className="text-[#e5a300]">{formatNumber(Math.round(numericAmount * 0.04))} XAF</strong></div><div className="mt-2 flex justify-between"><span>Sent to recipient</span><strong className="text-[#1aa85d]">{formatNumber(Math.max(0, numericAmount - Math.round(numericAmount * 0.04)))} XAF</strong></div></div>}
          <button onClick={() => void submit()} disabled={!canSubmit || busy} className={`mt-5 flex h-[64px] w-full items-center justify-center gap-3 rounded-[16px] text-[18px] font-extrabold transition ${canSubmit ? "brand-btn text-white" : "cursor-not-allowed bg-[#e9edf5] text-[#8b96b0]"}`}><CreditCard size={22} /> {busy ? "..." : "Request withdrawal"}</button>
        </>
      ) : (
        <>
          <div className="mt-5">
            <p className="text-[17px] font-bold text-[#17213d]">Network</p>
            <div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2"><TronLogo size={38} /></span><select value={network} onChange={(e) => setNetwork(e.target.value)} className="h-[64px] w-full appearance-none rounded-[14px] border border-[#dce5f3] bg-white pl-16 pr-10 text-[16px] font-bold text-[#17213d] outline-none focus:border-[#ffb800]"><option value="USDT.TRC20">Tron (TRX) &nbsp; USDT.TRC20</option><option value="USDT.ERC20">Ethereum (ERC20) &nbsp; USDT.ERC20</option><option value="USDT.BEP20">BNB (BEP20) &nbsp; USDT.BEP20</option></select><ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d6882]" /></div>
          </div>
          <div className="mt-5">
            <p className="text-[17px] font-bold text-[#17213d]">Destination address</p>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Paste the wallet address" className="mt-2 h-[62px] w-full rounded-[14px] border border-[#dce5f3] bg-white px-4 text-[15px] outline-none focus:border-[#ffb800] placeholder:text-[#9aa5bd]" />
          </div>
          <div className="mt-5 rounded-[16px] border border-[#dce5f3] bg-white p-4">
            <p className="text-[15px] font-extrabold text-[#17213d]">Save for future withdrawals</p>
            <div className="mt-3 flex gap-2"><input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name, for example “My wallet”" className="h-[54px] min-w-0 flex-1 rounded-[12px] border border-[#dce5f3] px-3 text-[14px] outline-none focus:border-[#ffb800]" /><button onClick={saveAddress} className="flex h-[54px] items-center gap-2 rounded-[12px] border border-[#dce5f3] px-4 text-[14px] font-bold text-[#6d7d9e]"><Save size={16} /> Save</button></div>
            {saved && <p className="mt-2 text-[12px] font-bold text-[#1aa85d]">{saved}</p>}
          </div>
          <h2 className="mt-6 text-[17px] font-extrabold text-[#17213d]">Who pays the SDK Pay fee?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setFeePayer("you")} className={`h-[56px] rounded-[12px] border text-[15px] font-bold transition ${feePayer === "you" ? "brand-btn border-transparent text-white" : "border-[#dce5f3] bg-white text-[#17213d]"}`}>You</button>
            <button onClick={() => setFeePayer("recipient")} className={`h-[56px] rounded-[12px] border text-[15px] font-bold transition ${feePayer === "recipient" ? "brand-btn border-transparent text-white" : "border-[#dce5f3] bg-white text-[#17213d]"}`}>Recipient</button>
          </div>
          <div className="mt-5 rounded-[16px] border border-[#dce5f3] bg-white p-4">
            <div className="flex items-center justify-between border-b border-[#edf1f8] pb-3"><span className="text-[14px] text-[#6d7d9e]">Fees</span><span className="text-[15px] font-bold text-[#17213d]">{formatUsdt(cryptoFee, 2)} USDT</span></div>
            <div className="flex items-center justify-between pt-3"><span className="text-[15px] font-extrabold text-[#17213d]">Debited</span><span className="text-[15px] font-extrabold text-[#17213d]">{formatUsdt(Math.max(0, debited), 2)} USDT</span></div>
            {numericAmount > 0 && <p className="mt-2 text-[12px] text-[#6d7d9e]">Recipient gets {formatUsdt(Math.max(0, recipientGets), 2)} USDT</p>}
          </div>
          <button onClick={() => void submit()} disabled={!canSubmit || busy} className={`mt-5 flex h-[62px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold transition ${canSubmit ? "brand-btn text-white" : "cursor-not-allowed bg-[#f7d477] text-white"}`}><ArrowRight size={20} /> {busy ? "..." : "Continue"}</button>
          <button onClick={() => setFeeOpen(!feeOpen)} className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#6d7d9e]"><Info size={16} /> Fee details</button>
          {feeOpen && <div className="mt-3 rounded-[16px] border border-[#dce5f3] bg-white p-4 text-[13px] text-[#5d6882]">Flat network fee of {formatUsdt(cryptoFee, 2)} USDT. Choose who pays it: you or the recipient.</div>}
        </>
      )}
      {error && <p className="mt-4 rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
    </div>
  );
}
