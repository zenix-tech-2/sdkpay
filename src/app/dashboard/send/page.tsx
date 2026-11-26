"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Globe,
  ChevronDown,
  Search,
  Check,
  X,
  Loader2,
  CreditCard,
  Bitcoin,
  Send as SendIcon,
} from "lucide-react";
import { COUNTRIES, baseWallet, type Country } from "@/data/countries";
import { CRYPTO_NETWORKS, microToUsdt } from "@/lib/crypto";
import OperatorLogo from "@/components/dashboard/OperatorLogo";
import CountryFlag from "@/components/CountryFlag";

const GOLD = "#f0a500";
const NAVY = "#26247e";
const MOMO_FEE = 0.04;

export default function SendPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"momo" | "internal" | "crypto">("momo");
  const [currency, setCurrency] = useState<"XAF" | "XOF">("XAF");
  const [walletOpen, setWalletOpen] = useState(false);
  // momo
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQ, setCountryQ] = useState("");
  const [operator, setOperator] = useState(COUNTRIES[0].operators[0]);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  // internal
  const [recipient, setRecipient] = useState("");
  const [intAmount, setIntAmount] = useState("");
  const [note, setNote] = useState("");
  // crypto
  const [network, setNetwork] = useState(CRYPTO_NETWORKS[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [usdt, setUsdt] = useState("");
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [cryptoConfirm, setCryptoConfirm] = useState(false);
  // shared
  const [reduced, setReduced] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [balances, setBalances] = useState({ xaf: 0, xof: 0, usdt: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const walletRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setBalances({ xaf: d.user.balanceXaf ?? 0, xof: d.user.balanceXof ?? 0, usdt: d.user.balanceUsdt ?? 0 });
          setReduced(!!d.user.reducedFeeUntil && new Date(d.user.reducedFeeUntil).getTime() > Date.now());
          const match = COUNTRIES.find((c) => c.name === d.user.country);
          if (match) {
            setCountry(match);
            setOperator(match.operators[0]);
            setCurrency(baseWallet(match.wallet));
          }
        }
      })
      .catch(() => {});
    fetch("/api/user/pin")
      .then((r) => r.json())
      .then((d) => setPinRequired(!!d.configured))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (netRef.current && !netRef.current.contains(e.target as Node)) setNetworkOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const base = baseWallet(country.wallet);
  const momoBalance = base === "XAF" ? balances.xaf : balances.xof;
  const amt = Number(amount || 0);
  const rate = reduced ? MOMO_FEE / 2 : MOMO_FEE;
  const feeLabel = reduced ? "2%" : "4%";
  const fee = Math.round(amt * rate);
  const intAmt = Number(intAmount || 0);
  const intBalance = currency === "XAF" ? balances.xaf : balances.xof;
  const usdtAmt = Number(usdt || 0);
  const cryptoFee = 1;
  const cryptoDebited = feePayer === "you" ? usdtAmt + cryptoFee : usdtAmt;

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.wallet.toLowerCase().includes(countryQ.toLowerCase())
  );

  const momoValid = amt >= 100 && amt + fee <= momoBalance && phone.trim().length >= 4 && operator;
  const intValid = intAmt >= 100 && intAmt <= intBalance && recipient.trim().length >= 3;
  const cryptoValid = usdtAmt >= 1 && cryptoDebited <= microToUsdt(balances.usdt) && address.trim().length >= 10;

  async function verifyPin() {
    if (!pinRequired) return true;
    setPinErr("");
    const r = await fetch("/api/user/pin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const d = await r.json();
    if (!d.ok) {
      setPinErr("Incorrect PIN.");
      return false;
    }
    return true;
  }

  async function submitMomo() {
    setErr("");
    if (!(await verifyPin())) return;
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "momo", name, phone: `${country.dial} ${phone}`.trim(), operator, country: country.name, amount: amt, currency: base }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        setConfirmOpen(false);
        return;
      }
      router.push(`/dashboard/transactions/${d.id}`);
    } catch {
      setErr("Network error.");
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function submitInternal(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "internal", recipient, amount: intAmt, currency, note }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      router.push(`/dashboard/transactions/${d.id}`);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCrypto() {
    setErr("");
    if (!(await verifyPin())) return;
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "crypto", address: address.trim(), network: network.id, amountUsdt: usdtAmt, feePayer }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        setCryptoConfirm(false);
        return;
      }
      router.push(`/dashboard/transactions/${d.id}`);
    } catch {
      setErr("Network error.");
      setCryptoConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  const shownBalance = tab === "crypto" ? `${microToUsdt(balances.usdt).toFixed(4)} USDT` : tab === "momo"
    ? `${momoBalance.toLocaleString("fr-FR")} FCFA`
    : `${intBalance.toLocaleString("fr-FR")} FCFA`;
  const shownWallet = tab === "crypto" ? "USDT" : tab === "momo" ? country.wallet : currency;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[26.5px] font-extrabold tracking-tight text-slate-900">Send money</h1>
      <p className="text-[15px] font-medium text-slate-500">Instant transfer or via Mobile Money</p>

      {/* balance card */}
      <div className="mt-4 flex items-center gap-3.5 rounded-[24px] p-5" style={{ background: NAVY }}>
        <span className="flex h-[49.5px] w-[49.5px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <Wallet size={23} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-white/80">Your balance</p>
          <p className="truncate text-[23px] font-extrabold text-white">{shownBalance}</p>
        </div>
        <div ref={walletRef} className="relative ml-auto shrink-0">
          <button
            onClick={() => setWalletOpen(!walletOpen)}
            className="flex items-center gap-1.5 rounded-full border border-white/40 px-3.5 py-2 text-white"
          >
            {tab === "crypto" ? (
              <CountryFlag code="usdt" size={18} />
            ) : (
              <CountryFlag code={country.code} emoji={country.flag} size={18} />
            )}
            <span className="text-[14px] font-extrabold">{shownWallet}</span>
            <span className="text-[13px] font-bold text-white/70">
              {tab === "crypto" ? microToUsdt(balances.usdt).toFixed(2) : (tab === "momo" ? momoBalance : intBalance).toLocaleString("fr-FR")}
            </span>
            <ChevronDown size={15} />
          </button>
          {walletOpen && (
            <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
              {[
                { code: "XAF" as const, iso: "cm", flag: "🇨🇲", bal: `${balances.xaf.toLocaleString("fr-FR")} FCFA` },
                { code: "XOF" as const, iso: "sn", flag: "🇸🇳", bal: `${balances.xof.toLocaleString("fr-FR")} FCFA` },
              ].map((w) => (
                <button
                  key={w.code}
                  onClick={() => {
                    setCurrency(w.code);
                    if (tab === "crypto") setTab("momo");
                    setWalletOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <CountryFlag code={w.iso} emoji={w.flag} size={18} />
                  <span className="text-[13px] font-extrabold">{w.code}</span>
                  <span className="ml-auto text-[11px] font-bold text-slate-400">{w.bal}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setTab("crypto");
                  setWalletOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-slate-50"
              >
                <span className="text-[17.5px]">₮</span>
                <span className="text-[13px] font-extrabold">USDT</span>
                <span className="ml-auto text-[11px] font-bold text-slate-400">{microToUsdt(balances.usdt).toFixed(4)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 flex items-center gap-1 rounded-[20px] bg-slate-100/80 p-1.5">
        <button
          onClick={() => setTab("momo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-2 py-3 text-[15px] font-bold ${tab === "momo" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
        >
          <Globe size={18} /> Mobile Money
        </button>
        <button
          onClick={() => setTab("internal")}
          className={`flex-1 rounded-2xl px-2 py-3 text-[15px] font-bold ${tab === "internal" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
        >
          Internal
        </button>
        <button
          onClick={() => setTab("crypto")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-2 py-3 text-[15px] font-bold ${tab === "crypto" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
        >
          <Wallet size={17} /> Crypto
        </button>
      </div>

      {err && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-600">{err}</p>
      )}

      {tab === "momo" && (
        <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
          <p className="text-[12.5px] font-bold tracking-[0.14em] text-slate-500">DESTINATION</p>
          <div ref={dropRef} className="relative mt-2.5">
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="flex w-full items-center gap-3 rounded-[22px] border border-slate-300 bg-white px-5 py-3.5"
            >
              <CountryFlag code={country.code} emoji={country.flag} size={42} circle />
              <span className="text-left">
                <span className="block text-[16.5px] font-bold leading-tight">{country.name}</span>
                <span className="block text-[14px] font-medium text-slate-500">{country.wallet}</span>
              </span>
              <ChevronDown size={19} className="ml-auto text-slate-400" />
            </button>
            {countryOpen && (
              <div className="absolute z-30 mt-2 max-h-[300px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 p-3">
                  <div className="flex items-center gap-2 px-2">
                    <Search size={18} className="text-slate-500" />
                    <input autoFocus value={countryQ} onChange={(e) => setCountryQ(e.target.value)} placeholder="Rechercher un pays..." className="w-full bg-transparent py-1.5 text-[15px] font-medium placeholder:text-slate-500" />
                  </div>
                </div>
                <div className="max-h-[220px] overflow-y-auto p-2">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setOperator(c.operators[0]);
                        setCountryOpen(false);
                        setCountryQ("");
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 ${c.code === country.code ? "bg-slate-100" : "hover:bg-slate-50"}`}
                    >
                      {c.code === country.code && <Check size={17} strokeWidth={2.6} />}
                      <CountryFlag code={c.code} emoji={c.flag} size={21} />
                      <span className="text-[16px] font-bold">{c.name}</span>
                      <span className="text-[13px] text-slate-500">· {c.wallet}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-[12.5px] font-bold tracking-[0.14em] text-slate-500">OPERATOR</p>
          <div className="no-scrollbar -mx-6 mt-2.5 flex gap-3.5 overflow-x-auto px-6 pb-1">
            {country.operators.map((op) => {
              const active = operator === op;
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`w-[130px] shrink-0 rounded-[22px] border-2 p-4 ${active ? "border-yellow-400 bg-yellow-50/50" : "border-slate-200 bg-white"}`}
                >
                  <span className="mx-auto flex justify-center">
                    <OperatorLogo name={op} size={55} />
                  </span>
                  <span className="mt-2.5 block text-center text-[14px] font-bold leading-tight">{op}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-[12.5px] font-bold tracking-[0.14em] text-slate-500">AMOUNT TO SEND ({country.wallet})</p>
          <div className="mt-2.5 flex items-center gap-3 rounded-[22px] border border-slate-300 px-5 py-[16px]">
            <span className="text-[16.5px] font-extrabold text-slate-500">{country.wallet}</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="0"
              className="w-full bg-transparent text-[23px] font-extrabold placeholder:text-slate-300 focus:outline-none"
            />
          </div>
          {amt > 0 && (
            <p className="mt-2 text-right text-[11.5px] font-bold text-slate-400">
              Fee ({feeLabel}): -{fee.toLocaleString("fr-FR")} • Total: {(amt + fee).toLocaleString("fr-FR")} {base}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3.5">
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.1em] text-slate-500">RECIPIENT NAME</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className="mt-2 w-full rounded-[20px] border border-slate-300 px-4 py-[14px] text-[15px] font-medium placeholder:text-slate-400" />
            </div>
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.1em] text-slate-500">PHONE NUMBER</p>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-500">{country.dial}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))} placeholder="XXXXXXXXXX" className="w-full rounded-[20px] border border-slate-300 py-[14px] pl-[70px] pr-4 text-[15px] font-medium placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setErr("");
              if (!momoValid) {
                setErr("Check the amount, balance and phone number.");
                return;
              }
              setConfirmOpen(true);
            }}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[16px] text-[17.5px] font-bold text-white"
            style={{ background: GOLD }}
          >
            <SendIcon size={18} /> Send {amt > 0 ? `${amt.toLocaleString("fr-FR")} ${base}` : "money"}
          </button>
        </div>
      )}

      {tab === "internal" && (
        <>
          <form onSubmit={submitInternal} className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
            <p className="flex items-center gap-2 text-[16.5px] font-bold text-green-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-500">
                <Check size={13} strokeWidth={3} />
              </span>
              Internal transfer with no fees
            </p>
            <p className="mt-5 text-[12.5px] font-bold tracking-[0.12em] text-slate-500">EMAIL, PHONE OR USERNAME</p>
            <input required value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="email / +23760000000 / @username" className="mt-2 w-full rounded-[20px] border border-slate-300 px-5 py-[14px] text-[16px] font-medium placeholder:text-slate-400 focus:border-yellow-500" />
            <p className="mt-5 text-[12.5px] font-bold tracking-[0.12em] text-slate-500">AMOUNT ({currency})</p>
            <div className="mt-2 flex items-center gap-3 rounded-[20px] border border-slate-300 px-5 py-[14px]">
              <span className="text-[16.5px] font-extrabold text-slate-500">{currency}</span>
              <input required value={intAmount} onChange={(e) => setIntAmount(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="0" className="w-full bg-transparent text-[21px] font-extrabold placeholder:text-slate-300 focus:outline-none" />
            </div>
            <p className="mt-1.5 text-right text-[10.5px] font-bold text-slate-400">Available: {intBalance.toLocaleString("fr-FR")} {currency}</p>
            <div className="mt-3 flex items-center justify-between rounded-[20px] border border-green-200 bg-green-50/60 px-5 py-4">
              <span className="text-[16px] font-medium text-slate-500">Fees</span>
              <span className="text-[16.5px] font-extrabold text-green-500">Free</span>
            </div>
            <button
              disabled={loading || !intValid}
              className={`mt-4 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[14px] text-[17.5px] font-bold ${intValid ? "text-white" : "bg-yellow-200/70 text-slate-700"}`}
              style={intValid ? { background: GOLD } : {}}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <SendIcon size={18} />}
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
          <div className="mt-4 overflow-hidden rounded-[22px] border border-green-200 bg-green-50/50">
            {["No internal transfer fees", "Credit to the recipient's account", "Instant and secure"].map((t, i) => (
              <p key={t} className={`flex items-center gap-3 px-5 py-4 text-[16px] font-medium text-slate-500 ${i > 0 ? "border-t border-green-200/70" : ""}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-200/70 text-green-600">
                  <Check size={14} strokeWidth={3} />
                </span>
                {t}
              </p>
            ))}
          </div>
        </>
      )}

      {tab === "crypto" && (
        <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between rounded-[18px] bg-slate-100/80 px-5 py-4">
            <span className="flex items-center gap-2 text-[16px] font-medium text-slate-500">
              <Wallet size={18} /> USDT balance
            </span>
            <span className="text-[16.5px] font-extrabold text-slate-900">{microToUsdt(balances.usdt).toFixed(2)} USDT</span>
          </div>
          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Network</p>
          <div ref={netRef} className="relative mt-2">
            <button type="button" onClick={() => setNetworkOpen(!networkOpen)} className="flex w-full items-center gap-3 rounded-[18px] border border-slate-300 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-extrabold text-white" style={{ background: network.iconBg }}>{network.iconText}</span>
              <span className="text-[16.5px] font-bold">{network.label}</span>
              <span className="text-[14px] font-medium text-slate-500">{network.short}</span>
              <ChevronDown size={18} className="ml-auto text-slate-400" />
            </button>
            {networkOpen && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                {CRYPTO_NETWORKS.map((n) => (
                  <button key={n.id} type="button" onClick={() => { setNetwork(n); setNetworkOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-extrabold text-white" style={{ background: n.iconBg }}>{n.iconText}</span>
                    <span className="text-[15px] font-bold">{n.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Destination address</p>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Paste the wallet address" className="mt-2 w-full rounded-[18px] border border-slate-300 px-5 py-4 text-[16px] font-medium placeholder:text-slate-400" />
          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Amount (USDT)</p>
          <input value={usdt} onChange={(e) => setUsdt(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0.00" className="mt-2 w-full rounded-[18px] border border-slate-300 px-5 py-4 text-[16.5px] font-bold placeholder:text-slate-400 placeholder:font-medium" />
          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Who pays the SDKPay fee?</p>
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFeePayer("you")}
              className={`rounded-[16px] py-3.5 text-[16.5px] font-medium ${feePayer === "you" ? "text-white" : "border border-slate-300 bg-white text-slate-900"}`}
              style={feePayer === "you" ? { background: GOLD } : {}}
            >
              You
            </button>
            <button
              type="button"
              onClick={() => setFeePayer("recipient")}
              className={`rounded-[16px] py-3.5 text-[16.5px] font-medium ${feePayer === "recipient" ? "text-white" : "border border-slate-300 bg-white text-slate-900"}`}
              style={feePayer === "recipient" ? { background: GOLD } : {}}
            >
              Recipient
            </button>
          </div>
          <div className="mt-4 rounded-[20px] border border-slate-200 px-5 py-4">
            <div className="flex justify-between py-1.5">
              <span className="text-[16px] font-medium text-slate-500">Fees</span>
              <span className="text-[16.5px] font-medium text-slate-900">1.00 USDT</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[16.5px] font-bold text-slate-900">Debited</span>
              <span className="text-[16.5px] font-bold text-slate-900">{cryptoDebited.toFixed(2)} USDT</span>
            </div>
          </div>
          <button
            onClick={() => {
              setErr("");
              if (!cryptoValid) {
                setErr("Check the amount, balance and address.");
                return;
              }
              setCryptoConfirm(true);
            }}
            className={`mt-4 flex w-full items-center justify-center gap-2.5 rounded-[18px] py-[14px] text-[17.5px] font-bold ${cryptoValid ? "text-white" : "bg-yellow-200/70 text-white"}`}
            style={cryptoValid ? { background: GOLD } : {}}
          >
            → Continue
          </button>
        </div>
      )}

      {/* momo confirm */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setConfirmOpen(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-[28px] bg-white px-5 pt-3 pb-6 sm:rounded-[28px]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
            <button onClick={() => !loading && setConfirmOpen(false)} className="absolute right-5 top-4 text-red-500"><X size={23} strokeWidth={3} /></button>
            <h3 className="mt-2 text-center text-[21px] font-extrabold">Confirm transfer</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-300">
              {[
                ["Recipient", `${name || "—"} · ${country.dial} ${phone}`.trim(), "text-slate-900"],
                ["Country", country.name, "text-slate-900"],
                ["Operator", operator, "text-slate-900"],
                ["Amount", `${amt.toLocaleString("fr-FR")} ${base}`, "text-slate-900"],
                [`Fees (${feeLabel})`, `-${fee.toLocaleString("fr-FR")} ${base}`, "text-red-500"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-[15px]">
                  <span className="shrink-0 text-[15px] font-medium text-slate-500">{k}</span>
                  <span className={`text-right text-[15px] font-bold ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-amber-50/70 px-5 py-[16.5px]">
                <span className="text-[16px] font-bold">Total debited</span>
                <span className="text-[17.5px] font-extrabold">{(amt + fee).toLocaleString("fr-FR")} {base}</span>
              </div>
            </div>
            {pinRequired && (
              <div className="mt-4 text-center">
                <p className="text-[12.5px] font-extrabold">Enter your transaction PIN</p>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder="••••"
                  className="mx-auto mt-2 block w-44 rounded-2xl border border-slate-300 py-3 text-center text-[21px] font-extrabold tracking-[0.4em]"
                />
                {pinErr && <p className="mt-1.5 text-[11.5px] font-bold text-red-500">{pinErr}</p>}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmOpen(false)} disabled={loading} className="rounded-2xl border border-slate-300 py-4 text-[16.5px] font-medium">Back</button>
              <button onClick={submitMomo} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl py-4 text-[16.5px] font-bold text-white disabled:opacity-60" style={{ background: GOLD }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* crypto confirm */}
      {cryptoConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setCryptoConfirm(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-[28px] bg-white px-5 pt-3 pb-6 sm:rounded-[28px]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
            <button onClick={() => !loading && setCryptoConfirm(false)} className="absolute right-5 top-4 text-red-500"><X size={23} strokeWidth={3} /></button>
            <h3 className="mt-2 text-center text-[21px] font-extrabold">Confirm transfer</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-300">
              <div className="border-b border-slate-200 bg-white px-5 py-[13px]">
                <p className="text-[13px] font-medium text-slate-500">Destination ({network.short})</p>
                <p className="mt-1 break-all font-mono text-[12px] font-bold">{address}</p>
              </div>
              {[
                ["Amount", `${usdtAmt.toFixed(4)} USDT`, "text-slate-900"],
                ["Fee", "1.0000 USDT", "text-red-500"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-[15px]">
                  <span className="text-[15px] font-medium text-slate-500">{k}</span>
                  <span className={`text-[16px] font-bold ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-amber-50/70 px-5 py-[16.5px]">
                <span className="text-[16px] font-bold">Total debited</span>
                <span className="text-[17.5px] font-extrabold">{cryptoDebited.toFixed(4)} USDT</span>
              </div>
            </div>
            {pinRequired && (
              <div className="mt-4 text-center">
                <p className="text-[12.5px] font-extrabold">Enter your transaction PIN</p>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder="••••"
                  className="mx-auto mt-2 block w-44 rounded-2xl border border-slate-300 py-3 text-center text-[21px] font-extrabold tracking-[0.4em]"
                />
                {pinErr && <p className="mt-1.5 text-[11.5px] font-bold text-red-500">{pinErr}</p>}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setCryptoConfirm(false)} disabled={loading} className="rounded-2xl border border-slate-300 py-4 text-[16.5px] font-medium">Back</button>
              <button onClick={submitCrypto} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl py-4 text-[16.5px] font-bold text-white disabled:opacity-60" style={{ background: GOLD }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Bitcoin size={18} />}
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
