"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Nfc,
  Coins,
  Check,
  ChevronDown,
  Search,
  Globe,
  Smartphone,
  CreditCard,
  Settings2,
  Info,
  X,
  Loader2,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { COUNTRIES, baseWallet, type Country } from "@/data/countries";
import { CRYPTO_NETWORKS, microToUsdt } from "@/lib/crypto";
import OperatorLogo from "@/components/dashboard/OperatorLogo";
import CountryFlag from "@/components/CountryFlag";

const GOLD = "#f0a500";
const NAVY = "#1e1b6e";
const FEE_RATE = 0.04;
const MIN_MOMO = 550;
const MAX_MOMO = 2000000;
const MIN_CRYPTO = 1;
const MAX_CRYPTO = 1500;
const CRYPTO_FLAT_FEE = 1;

interface SavedNumber {
  id: string;
  kind: string;
  label: string | null;
  phone: string | null;
  address: string | null;
  operator: string | null;
  network: string | null;
  country: string | null;
}

export default function WithdrawPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"momo" | "crypto">("momo");
  // momo
  const [amount, setAmount] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[2]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQ, setCountryQ] = useState("");
  const [operator, setOperator] = useState(COUNTRIES[2].operators[0]);
  const [numbers, setNumbers] = useState<SavedNumber[]>([]);
  const [numberId, setNumberId] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [savePhone, setSavePhone] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [addPhone, setAddPhone] = useState("");
  const [addLabel, setAddLabel] = useState("");
  const [feeOpen, setFeeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // crypto
  const [usdt, setUsdt] = useState("");
  const [network, setNetwork] = useState(CRYPTO_NETWORKS[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [addrName, setAddrName] = useState("");
  const [addrSaved, setAddrSaved] = useState(false);
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [cryptoFeeOpen, setCryptoFeeOpen] = useState(false);
  const [cryptoConfirm, setCryptoConfirm] = useState(false);
  // shared
  const [balances, setBalances] = useState({ xaf: 0, xof: 0, usdt: 0 });
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [reduced, setReduced] = useState(false);
  const [userCountry, setUserCountry] = useState("Cameroun");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setBalances({ xaf: d.user.balanceXaf ?? 0, xof: d.user.balanceXof ?? 0, usdt: d.user.balanceUsdt ?? 0 });
          setReduced(!!d.user.reducedFeeUntil && new Date(d.user.reducedFeeUntil).getTime() > Date.now());
          setUserCountry(d.user.country);
          const match = COUNTRIES.find((c) => c.name === d.user.country);
          if (match) {
            setCountry(match);
            setOperator(match.operators[0]);
          }
        }
      })
      .catch(() => {});
    fetch("/api/numbers")
      .then((r) => r.json())
      .then((d) => setNumbers(d.numbers ?? []))
      .catch(() => {});
    fetch("/api/user/pin")
      .then((r) => r.json())
      .then((d) => setPinRequired(!!d.configured))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (netRef.current && !netRef.current.contains(e.target as Node)) setNetworkOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const base = baseWallet(country.wallet);
  const balance = base === "XAF" ? balances.xaf : balances.xof;
  const amt = Number(amount || 0);
  const rate = reduced ? FEE_RATE / 2 : FEE_RATE;
  const feeLabel = reduced ? "2% 🎉" : "4%";
  const fee = Math.round(amt * rate);
  const net = amt - fee;
  const momoNumbers = numbers.filter((n) => n.kind === "momo");
  const cryptoAddrs = numbers.filter((n) => n.kind === "crypto");
  const selectedNumber = momoNumbers.find((n) => n.id === numberId);
  const destPhone = numberId === "__new__" ? `${country.dial} ${newPhone}`.trim() : selectedNumber?.phone || "";

  const usdtAmt = Number(usdt || 0);
  const debitedUsdt = feePayer === "you" ? usdtAmt + CRYPTO_FLAT_FEE : usdtAmt;
  const netUsdt = feePayer === "you" ? usdtAmt : usdtAmt - CRYPTO_FLAT_FEE;

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.wallet.toLowerCase().includes(countryQ.toLowerCase())
  );

  const momoValid =
    amt >= MIN_MOMO && amt <= MAX_MOMO && amt + fee <= balance && destPhone.trim().length >= 4;
  const cryptoValid =
    usdtAmt >= MIN_CRYPTO && usdtAmt <= MAX_CRYPTO && debitedUsdt <= microToUsdt(balances.usdt) && address.trim().length >= 10;

  function maxMomo() {
    setAmount(String(Math.max(0, Math.floor(balance / (1 + rate)))));
  }

  function maxCrypto() {
    const avail = microToUsdt(balances.usdt);
    setUsdt(String(Math.max(0, feePayer === "you" ? avail - CRYPTO_FLAT_FEE : avail)));
  }

  async function reloadNumbers() {
    const r = await fetch("/api/numbers");
    const d = await r.json();
    setNumbers(d.numbers ?? []);
  }

  async function saveNumber() {
    if (addPhone.trim().length < 4) return;
    const r = await fetch("/api/numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "momo", label: addLabel, phone: `${country.dial} ${addPhone}`.trim(), operator, country: country.name }),
    });
    if (r.ok) {
      setAddPhone("");
      setAddLabel("");
      reloadNumbers();
    }
  }

  async function deleteNumber(id: string) {
    await fetch(`/api/numbers?id=${id}`, { method: "DELETE" });
    if (numberId === id) setNumberId("");
    reloadNumbers();
  }

  async function saveAddress() {
    if (address.trim().length < 10) return;
    const r = await fetch("/api/numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "crypto", label: addrName || "My wallet", address: address.trim(), network: network.id }),
    });
    if (r.ok) {
      setAddrSaved(true);
      setAddrName("");
      reloadNumbers();
      setTimeout(() => setAddrSaved(false), 2000);
    }
  }

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
    if (numberId === "__new__" && savePhone && newPhone.trim()) {
      await fetch("/api/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "momo", phone: `${country.dial} ${newPhone}`.trim(), operator, country: country.name }),
      });
    }
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, operator, phone: destPhone, currency: base, country: country.name }),
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

  async function submitCrypto() {
    setErr("");
    if (!(await verifyPin())) return;
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/crypto-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsdt: usdtAmt, network: network.id, address: address.trim(), feePayer }),
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

  return (
    <div className="mx-auto max-w-xl">
      {/* balance card */}
      <div className="rounded-[26px] p-6 text-white" style={{ background: NAVY }}>
        {method === "momo" ? (
          <>
            <p className="text-[16.5px] font-medium text-white/85">Main account balance</p>
            <p className="mt-1 text-[40.5px] font-extrabold leading-none">{balance.toLocaleString("fr-FR")} {base}</p>
            <p className="mt-2 text-[16.5px] font-medium text-white/80">{userCountry} · {base}</p>
          </>
        ) : (
          <>
            <p className="text-[16.5px] font-medium text-white/85">USDT balance</p>
            <p className="mt-1 text-[40.5px] font-extrabold leading-none">{microToUsdt(balances.usdt).toFixed(2)} USDT</p>
            <p className="mt-2 text-[16.5px] font-medium text-white/80">Crypto wallet · USDT</p>
          </>
        )}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
          <div className="border-r border-white/20">
            <p className="text-[11.5px] font-bold tracking-[0.12em] text-white/60">MIN. WITHDRAWAL</p>
            <p className="mt-1 text-[18.5px] font-extrabold">{method === "momo" ? `${MIN_MOMO} ${base}` : `${MIN_CRYPTO} USDT`}</p>
          </div>
          <div>
            <p className="text-[11.5px] font-bold tracking-[0.12em] text-white/60">MAX. WITHDRAWAL</p>
            <p className="mt-1 text-[18.5px] font-extrabold">{method === "momo" ? `${MAX_MOMO.toLocaleString("en-US")} ${base}` : `${MAX_CRYPTO.toLocaleString("en-US")} USDT`}</p>
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-600">{err}</p>
      )}

      {/* method */}
      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
        <p className="text-[12.5px] font-bold tracking-[0.14em] text-slate-500">METHOD</p>
        <div className="mt-3 grid grid-cols-2 gap-3.5">
          <button
            onClick={() => setMethod("momo")}
            className={`relative rounded-[20px] border-[2.5px] p-4 text-left ${method === "momo" ? "border-yellow-400 bg-yellow-50/40" : "border-slate-200 bg-white"}`}
          >
            {method === "momo" && (
              <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-400 text-yellow-500">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <span className={`flex h-[46px] w-[46px] items-center justify-center rounded-2xl ${method === "momo" ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 text-slate-500"}`}>
              <Nfc size={23} />
            </span>
            <span className={`mt-3 block text-[17.5px] font-extrabold ${method === "momo" ? "text-[#f0a500]" : "text-slate-900"}`}>Mobile Money</span>
            <span className="mt-0.5 block text-[13px] font-medium leading-snug text-slate-500">Orange, MTN, Wave, Airtel...</span>
          </button>
          <button
            onClick={() => setMethod("crypto")}
            className={`relative rounded-[20px] border-[2.5px] p-4 text-left ${method === "crypto" ? "border-yellow-400 bg-yellow-50/40" : "border-slate-200 bg-white"}`}
          >
            {method === "crypto" && (
              <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-400 text-yellow-500">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <span className={`flex h-[46px] w-[46px] items-center justify-center rounded-2xl ${method === "crypto" ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 text-slate-500"}`}>
              <Coins size={23} />
            </span>
            <span className={`mt-3 block text-[17.5px] font-extrabold ${method === "crypto" ? "text-[#f0a500]" : "text-slate-900"}`}>Crypto</span>
            <span className="mt-0.5 block text-[13px] font-medium leading-snug text-slate-500">Withdraw in USDT</span>
          </button>
        </div>
      </div>

      {method === "momo" ? (
        <>
          {/* amount */}
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-slate-500">AMOUNT</p>
            <div className="mt-1 flex items-center gap-3">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="0"
                className="w-full bg-transparent text-[46px] font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />
              <span className="shrink-0 text-[17.5px] font-bold text-slate-500">{base}</span>
              <button onClick={maxMomo} className="shrink-0 rounded-full bg-yellow-100 px-4 py-1.5 text-[14px] font-extrabold text-[#f0a500]">
                MAX
              </button>
            </div>
          </div>

          {/* destination */}
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-slate-500">DESTINATION</p>
            <p className="mt-4 flex items-center gap-2 text-[15px] font-medium text-slate-500">
              <Globe size={19} className="text-sky-500" /> Country
            </p>
            <div ref={dropRef} className="relative mt-2">
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="flex w-full items-center gap-3 rounded-[22px] border border-slate-300 bg-white px-5 py-4"
              >
                <CountryFlag code={country.code} emoji={country.flag} size={26} />
                <span className="text-[16.5px] font-bold text-slate-900">{country.name}</span>
                <span className="ml-auto text-[15px] font-medium text-slate-500">{country.wallet}</span>
              </button>
              {countryOpen && (
                <div className="absolute z-30 mt-2 max-h-[300px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-200 p-3">
                    <div className="flex items-center gap-2 px-2">
                      <Search size={18} className="text-slate-500" />
                      <input
                        autoFocus
                        value={countryQ}
                        onChange={(e) => setCountryQ(e.target.value)}
                        placeholder="Rechercher un pays..."
                        className="w-full bg-transparent py-1.5 text-[15px] font-medium placeholder:text-slate-500"
                      />
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
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                      >
                        <CountryFlag code={c.code} emoji={c.flag} size={21} />
                        <span className="text-[16px] font-bold">{c.name}</span>
                        <span className="text-[13px] font-medium text-slate-500">· {c.wallet}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-5 flex items-center gap-2 text-[15px] font-medium text-slate-500">
              <Smartphone size={18} /> Mobile Money operator
            </p>
            <div className="no-scrollbar -mx-5 mt-2.5 flex gap-3 overflow-x-auto px-5 pb-1">
              {country.operators.map((op) => {
                const active = operator === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`w-[132px] shrink-0 rounded-[20px] border-2 p-4 ${active ? "border-yellow-400 bg-yellow-50/50" : "border-slate-200 bg-white"}`}
                  >
                    <span className="mx-auto flex justify-center">
                      <OperatorLogo name={op} size={51} />
                    </span>
                    <span className="mt-2 block text-center text-[14px] font-bold leading-tight">{op}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-[15px] font-medium text-slate-500">Registered number</p>
            <div className="relative mt-2">
              <select
                value={numberId}
                onChange={(e) => setNumberId(e.target.value)}
                className="w-full appearance-none rounded-[22px] border border-slate-300 bg-white px-5 py-[16px] text-[16.5px] font-medium text-slate-500 focus:border-yellow-500"
              >
                <option value="">Choose a number</option>
                {momoNumbers.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label ? `${n.label} — ` : ""}{n.phone} {n.operator ? `(${n.operator})` : ""}
                  </option>
                ))}
                <option value="__new__">+ New number...</option>
              </select>
              <ChevronDown size={19} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {numberId === "__new__" && (
              <div className="mt-2.5">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-slate-700">{country.dial}</span>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                    placeholder="XXX XXX XXX"
                    className="w-full rounded-[22px] border border-slate-300 py-[14px] pl-20 pr-5 text-[16px] font-medium"
                  />
                </div>
                <label className="mt-2.5 flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                  <input type="checkbox" checked={savePhone} onChange={(e) => setSavePhone(e.target.checked)} className="h-4 w-4 accent-yellow-500" />
                  Save this number for future withdrawals
                </label>
              </div>
            )}
            <button onClick={() => setManageOpen(true)} className="mt-3 flex items-center gap-1.5 text-[14px] font-medium text-slate-500">
              <Settings2 size={16} /> Manage my numbers
            </button>
          </div>

          <button onClick={() => setFeeOpen(!feeOpen)} className="mx-auto mt-4 flex items-center gap-1.5 text-[14px] font-medium text-slate-500">
            <Info size={16} /> Fee details
          </button>
          {feeOpen && (
            <div className="mt-2 rounded-[20px] bg-slate-50 px-5 py-2">
              <div className="flex justify-between border-b border-slate-200 py-2.5 text-[13px]"><span className="font-medium text-slate-500">Amount</span><span className="font-bold">{amt.toLocaleString("fr-FR")} {base}</span></div>
              <div className="flex justify-between border-b border-slate-200 py-2.5 text-[13px]"><span className="font-medium text-slate-500">Fees ({feeLabel})</span><span className="font-bold text-red-500">-{fee.toLocaleString("fr-FR")} {base}</span></div>
              <div className="flex justify-between py-2.5 text-[13px]"><span className="font-medium text-slate-500">Recipient gets</span><span className="font-extrabold text-green-600">{net.toLocaleString("fr-FR")} {base}</span></div>
            </div>
          )}

          <button
            onClick={() => momoValid && setConfirmOpen(true)}
            className={`mt-3 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[16px] text-[17.5px] font-bold ${momoValid ? "text-white" : "bg-slate-100 text-slate-400"}`}
            style={momoValid ? { background: GOLD } : {}}
          >
            <CreditCard size={19} /> Request withdrawal
          </button>
        </>
      ) : (
        <>
          {/* crypto amount */}
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-slate-500">AMOUNT</p>
            <div className="mt-1 flex items-center gap-3">
              <input
                value={usdt}
                onChange={(e) => setUsdt(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                className="w-full bg-transparent text-[46px] font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />
              <span className="shrink-0 text-[17.5px] font-bold text-slate-500">USDT</span>
              <button onClick={maxCrypto} className="shrink-0 rounded-full bg-yellow-100 px-4 py-1.5 text-[14px] font-extrabold text-[#f0a500]">
                MAX
              </button>
            </div>
          </div>

          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Network</p>
          <div ref={netRef} className="relative mt-2">
            <button
              type="button"
              onClick={() => setNetworkOpen(!networkOpen)}
              className="flex w-full items-center gap-3 rounded-[18px] border border-slate-300 bg-white px-5 py-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-extrabold text-white" style={{ background: network.iconBg }}>
                {network.iconText}
              </span>
              <span className="text-[16.5px] font-bold">{network.label}</span>
              <span className="text-[14px] font-medium text-slate-500">{network.short}</span>
              <ChevronDown size={19} className="ml-auto text-slate-400" />
            </button>
            {networkOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                {CRYPTO_NETWORKS.map((n) => (
                  <button key={n.id} type="button" onClick={() => { setNetwork(n); setNetworkOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-extrabold text-white" style={{ background: n.iconBg }}>{n.iconText}</span>
                    <span className="text-[15px] font-bold">{n.label}</span>
                    <span className="text-[12.5px] text-slate-400">{n.short}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Destination address</p>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste the wallet address"
            className="mt-2 w-full rounded-[18px] border border-slate-300 px-5 py-4 font-mono text-[14px] font-bold placeholder:font-sans placeholder:font-medium placeholder:text-slate-400"
          />
          {cryptoAddrs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {cryptoAddrs.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAddress(a.address || "")}
                  className="max-w-full truncate rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-600 hover:border-yellow-400"
                >
                  {a.label || a.address?.slice(0, 14) + "..."}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-5">
            <p className="text-[16px] font-medium text-slate-900">Save for future withdrawals</p>
            <div className="mt-2.5 flex gap-2.5">
              <input
                value={addrName}
                onChange={(e) => setAddrName(e.target.value)}
                placeholder='Name, for example "My'
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3.5 text-[15px] font-medium placeholder:text-slate-400"
              />
              <button onClick={saveAddress} className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-[15px] font-medium text-slate-500">
                <Save size={17} /> {addrSaved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          <p className="mt-5 text-[16.5px] font-medium text-slate-900">Who pays the SDKPay fee?</p>
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setFeePayer("you")}
              className={`rounded-[16px] py-3.5 text-[16.5px] font-medium ${feePayer === "you" ? "text-white" : "border border-slate-300 bg-white text-slate-900"}`}
              style={feePayer === "you" ? { background: GOLD } : {}}
            >
              You
            </button>
            <button
              onClick={() => setFeePayer("recipient")}
              className={`rounded-[16px] py-3.5 text-[16.5px] font-medium ${feePayer === "recipient" ? "text-white" : "border border-slate-300 bg-white text-slate-900"}`}
              style={feePayer === "recipient" ? { background: GOLD } : {}}
            >
              Recipient
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-200 bg-white px-5 py-4">
            <div className="flex justify-between py-1.5">
              <span className="text-[16px] font-medium text-slate-500">Fees</span>
              <span className="text-[16.5px] font-medium text-slate-900">{CRYPTO_FLAT_FEE.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[16.5px] font-bold text-slate-900">Debited</span>
              <span className="text-[16.5px] font-bold text-slate-900">{debitedUsdt.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[16px] font-medium text-slate-500">Recipient gets</span>
              <span className="text-[16.5px] font-extrabold text-green-500">{Math.max(0, netUsdt).toFixed(2)} USDT</span>
            </div>
          </div>

          <button
            onClick={() => cryptoValid && setCryptoConfirm(true)}
            className={`mt-4 flex w-full items-center justify-center gap-2.5 rounded-[18px] py-[14px] text-[17.5px] font-bold ${cryptoValid ? "text-white" : "bg-yellow-200/70 text-white"}`}
            style={cryptoValid ? { background: GOLD } : {}}
          >
            → Continue
          </button>
          <button onClick={() => setCryptoFeeOpen(!cryptoFeeOpen)} className="mx-auto mt-3 flex items-center gap-1.5 text-[14px] font-medium text-slate-500">
            <Info size={16} /> Fee details
          </button>
          {cryptoFeeOpen && (
            <p className="mt-2 rounded-[18px] bg-slate-50 px-5 py-3.5 text-center text-[12px] font-medium text-slate-500">
              Flat network fee of 1.00 USDT per withdrawal. {feePayer === "you" ? "You pay the fee: it is added to your debit." : "The recipient pays the fee: it is deducted from the amount sent."}
            </p>
          )}
        </>
      )}

      {/* manage numbers modal */}
      {manageOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setManageOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-md sm:rounded-[28px]">
            <div className="flex items-center justify-between">
              <h3 className="text-[17.5px] font-extrabold">My numbers</h3>
              <button onClick={() => setManageOpen(false)} className="text-slate-400"><X size={19} /></button>
            </div>
            <div className="mt-3 space-y-2">
              {momoNumbers.length === 0 && (
                <p className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-[12px] font-semibold text-slate-400">No saved numbers yet.</p>
              )}
              {momoNumbers.map((n) => (
                <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold">{n.phone}</p>
                    <p className="text-[10.5px] font-semibold text-slate-400">{n.label || n.operator || ""} {n.country ? `• ${n.country}` : ""}</p>
                  </div>
                  <button onClick={() => deleteNumber(n.id)} className="rounded-xl bg-red-50 p-2.5 text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5 rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-extrabold"><Plus size={14} /> Add a number ({country.dial})</p>
              <input value={addPhone} onChange={(e) => setAddPhone(e.target.value.replace(/[^0-9\s]/g, ""))} placeholder="XXX XXX XXX" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[12.5px] font-bold" />
              <input value={addLabel} onChange={(e) => setAddLabel(e.target.value)} placeholder="Label (optional): ex. My MTN" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[12.5px] font-medium" />
              <button onClick={saveNumber} className="w-full rounded-full bg-slate-900 py-3 text-[12.5px] font-extrabold text-white">Add number</button>
            </div>
          </div>
        </div>
      )}

      {/* momo confirm sheet */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setConfirmOpen(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-[28px] bg-white px-5 pt-3 pb-6 sm:rounded-[28px]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
            <button onClick={() => !loading && setConfirmOpen(false)} className="absolute right-5 top-4 text-red-500"><X size={23} strokeWidth={3} /></button>
            <h3 className="mt-2 text-center text-[21px] font-extrabold">Confirm withdrawal</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-300">
              {[
                ["Destination", destPhone, "text-slate-900"],
                ["Country", country.name, "text-slate-900"],
                ["Operator", operator, "text-slate-900"],
                ["Amount", `${amt.toLocaleString("fr-FR")} FCFA`, "text-slate-900"],
                [`Fees (${feeLabel})`, `-${fee.toLocaleString("fr-FR")} FCFA`, "text-red-500"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-[15px]">
                  <span className="text-[15px] font-medium text-slate-500">{k}</span>
                  <span className={`text-right text-[16px] font-bold ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-green-50/70 px-5 py-[16.5px]">
                <span className="text-[16px] font-bold">Recipient gets</span>
                <span className="text-[17.5px] font-extrabold text-green-500">{net.toLocaleString("fr-FR")} FCFA</span>
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

      {/* crypto confirm sheet */}
      {cryptoConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setCryptoConfirm(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-[28px] bg-white px-5 pt-3 pb-6 sm:rounded-[28px]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
            <button onClick={() => !loading && setCryptoConfirm(false)} className="absolute right-5 top-4 text-red-500"><X size={23} strokeWidth={3} /></button>
            <h3 className="mt-2 text-center text-[21px] font-extrabold">Confirm withdrawal</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-300">
              <div className="border-b border-slate-200 bg-white px-5 py-[15px]">
                <p className="text-[13px] font-medium text-slate-500">Destination ({network.short})</p>
                <p className="mt-1 break-all font-mono text-[12.5px] font-bold">{address}</p>
              </div>
              {[
                ["Amount", `${usdtAmt.toFixed(4)} USDT`, "text-slate-900"],
                ["Fee", `1.0000 USDT (${feePayer === "you" ? "you pay" : "recipient pays"})`, "text-red-500"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-[15px]">
                  <span className="text-[15px] font-medium text-slate-500">{k}</span>
                  <span className={`text-right text-[16px] font-bold ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-green-50/70 px-5 py-[16.5px]">
                <span className="text-[16px] font-bold">Debited</span>
                <span className="text-[17.5px] font-extrabold text-slate-900">{debitedUsdt.toFixed(4)} USDT</span>
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
