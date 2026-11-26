"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Smartphone,
  Bitcoin,
  ChevronDown,
  Search,
  Check,
  Phone,
  X,
  Loader2,
  Copy,
  Clock,
  Hourglass,
  CircleCheck,
} from "lucide-react";
import { COUNTRIES, baseWallet, type Country } from "@/data/countries";
import { qrDataUrl } from "@/lib/qr";
import { mmss, hhmmss, CRYPTO_DEPOSIT_FEE, CRYPTO_NETWORKS } from "@/lib/crypto";
import OperatorLogo from "@/components/dashboard/OperatorLogo";
import CountryFlag from "@/components/CountryFlag";

const GOLD = "#f0a500";
const NAVY = "#26247e";
const FEE_RATE = 0.04;
const MOMO_EXPIRY = 8 * 60;
const CRYPTO_EXPIRY = 5 * 60;

interface PendingMomo {
  id: string;
  reference: string;
  amount: number;
  operator: string;
  phone: string;
  country: string;
  currency: string;
  startedAt: number;
}

interface CryptoOrder {
  id: string;
  reference: string;
  address: string;
  qr: string;
  amountUsdt: number;
  feeUsdt: number;
  netUsdt: number;
  network: string;
  startedAt: number;
}

export default function DepositPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"momo" | "crypto">("momo");
  // momo form
  const [amount, setAmount] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[2]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQ, setCountryQ] = useState("");
  const [operator, setOperator] = useState(COUNTRIES[2].operators[0]);
  const [phone, setPhone] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState<PendingMomo | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(MOMO_EXPIRY);
  // crypto form
  const [cryptoCountry, setCryptoCountry] = useState<Country>(COUNTRIES[2]);
  const [cryptoCountryOpen, setCryptoCountryOpen] = useState(false);
  const [cryptoQ, setCryptoQ] = useState("");
  const [network, setNetwork] = useState(CRYPTO_NETWORKS[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [usdt, setUsdt] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refund, setRefund] = useState("");
  const [order, setOrder] = useState<CryptoOrder | null>(null);
  const [cryptoLeft, setCryptoLeft] = useState(CRYPTO_EXPIRY);
  // shared
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [reduced, setReduced] = useState(false);
  const [balances, setBalances] = useState({ xaf: 0, xof: 0, usdt: 0 });
  const [copied, setCopied] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const cryptoDropRef = useRef<HTMLDivElement>(null);
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
            setCryptoCountry(match);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (cryptoDropRef.current && !cryptoDropRef.current.contains(e.target as Node)) setCryptoCountryOpen(false);
      if (netRef.current && !netRef.current.contains(e.target as Node)) setNetworkOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // momo processing: countdown + polling
  useEffect(() => {
    if (!processing) return;
    const tick = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round(MOMO_EXPIRY - (Date.now() - processing.startedAt) / 1000)));
    }, 1000);
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`/api/wallet/deposit-status?id=${processing.id}`);
        const d = await r.json();
        if (d.status === "success") {
          clearInterval(poll);
          clearInterval(tick);
          router.push(`/dashboard/transactions/${processing.id}`);
        } else if (d.status === "failed") {
          clearInterval(poll);
          clearInterval(tick);
          setProcessing(null);
          setErr("Deposit failed or expired. No amount was debited. Please try again.");
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [processing, router]);

  // crypto countdown
  useEffect(() => {
    if (!order) return;
    const tick = setInterval(() => {
      setCryptoLeft(Math.max(0, Math.round(CRYPTO_EXPIRY - (Date.now() - order.startedAt) / 1000)));
    }, 1000);
    return () => clearInterval(tick);
  }, [order]);

  const base = baseWallet(country.wallet);
  const balance = base === "XAF" ? balances.xaf : balances.xof;
  const amt = Number(amount || 0);
  const rate = reduced ? FEE_RATE / 2 : FEE_RATE;
  const feeLabel = reduced ? "2%" : "4%";
  const fee = Math.round(amt * rate);
  const credited = amt - fee;
  const usdtAmt = Number(usdt || 0);
  const usdtFee = usdtAmt * CRYPTO_DEPOSIT_FEE;
  const usdtNet = usdtAmt - usdtFee;

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.wallet.toLowerCase().includes(countryQ.toLowerCase())
  );
  const filteredCryptoCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(cryptoQ.toLowerCase()) || c.wallet.toLowerCase().includes(cryptoQ.toLowerCase())
  );

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  async function submitMomo() {
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          operator,
          phone: `${country.dial} ${phone}`.trim(),
          currency: base,
          country: country.name,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      if (d.checkoutUrl) {
        // Provider-hosted approval (e.g. SasPay redirect flow)
        window.location.href = d.checkoutUrl;
        return;
      }
      setProcessing({
        id: d.id,
        reference: d.reference,
        amount: amt,
        operator,
        phone: `${country.dial} ${phone}`.trim(),
        country: country.name,
        currency: base,
        startedAt: Date.now(),
      });
      setSecondsLeft(MOMO_EXPIRY);
    } catch {
      setErr("Network error.");
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function cancelMomo() {
    if (!processing) return;
    await fetch("/api/wallet/deposit-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: processing.id }),
    });
    setProcessing(null);
  }

  async function generateAddress() {
    setErr("");
    if (usdtAmt < 1) {
      setErr("Minimum deposit: 1 USDT.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/crypto-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsdt: usdtAmt, network: network.id, country: cryptoCountry.name, refundAddress: refund }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      const qr = await qrDataUrl(d.address, 480);
      setOrder({
        id: d.id,
        reference: d.reference,
        address: d.address,
        qr,
        amountUsdt: usdtAmt,
        feeUsdt: d.feeMicro / 10000,
        netUsdt: d.netMicro / 10000,
        network: network.id,
        startedAt: Date.now(),
      });
      setCryptoLeft(CRYPTO_EXPIRY);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCrypto() {
    if (!order) return;
    setLoading(true);
    try {
      const r = await fetch("/api/wallet/crypto-deposit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      router.push(`/dashboard/transactions/${order.id}`);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const canMomo = amt >= 100 && phone.trim().length >= 4;

  function CountryDropdown({
    value,
    onPick,
    open,
    setOpen,
    q,
    setQ,
    list,
    dropRefProp,
  }: {
    value: Country;
    onPick: (c: Country) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
    q: string;
    setQ: (v: string) => void;
    list: Country[];
    dropRefProp: React.RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div ref={dropRefProp} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-3 rounded-[22px] border border-slate-300 bg-white px-5 py-4"
        >
          <CountryFlag code={value.code} emoji={value.flag} size={35.1} circle />
          <span className="text-[15px] font-bold text-slate-900">{value.name}</span>
          <span className="text-[14.5px] font-medium text-slate-500">({value.wallet})</span>
          <ChevronDown size={17.1} className="ml-auto text-slate-500" />
        </button>
        {open && (
          <div className="absolute z-30 mt-2 max-h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 px-2">
                <Search size={16.2} className="text-slate-500" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher un pays..."
                  className="w-full bg-transparent py-1.5 text-[14.5px] font-medium placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="max-h-[240px] overflow-y-auto p-2">
              {list.map((c) => {
                const active = c.code === value.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onPick(c);
                      setOpen(false);
                      setQ("");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left ${active ? "bg-slate-100" : "hover:bg-slate-50"}`}
                  >
                    {active && <Check size={16.2} strokeWidth={2.6} className="text-slate-900" />}
                    <CountryFlag code={c.code} emoji={c.flag} size={18.9} />
                    <span className="text-[15px] font-bold text-slate-900">{c.name}</span>
                    <span className="text-[12.5px] font-medium text-slate-500">· {c.wallet}</span>
                  </button>
                );
              })}
              {list.length === 0 && (
                <p className="px-3 py-6 text-center text-[11px] font-semibold text-slate-400">No country found</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900">Top up my account</h1>

      {/* balance card */}
      <div className="mt-4 flex items-center gap-4 rounded-[24px] p-5" style={{ background: NAVY }}>
        <span className="flex h-[47.5px] w-[47.5px] items-center justify-center rounded-2xl bg-white/10 text-white">
          {tab === "crypto" ? <Bitcoin size={23.4} /> : <CreditCard size={23.4} />}
        </span>
        <div>
          {tab === "crypto" ? (
            <>
              <p className="text-[15px] font-medium text-white/80">Current USDT balance</p>
              <p className="text-[24px] font-extrabold text-white">{(balances.usdt / 10000).toFixed(4)} USDT</p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-medium text-white/80">Current balance ({country.wallet})</p>
              <p className="text-[24px] font-extrabold text-white">{balance.toLocaleString("fr-FR")} FCFA</p>
            </>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 flex rounded-[20px] border border-slate-300 bg-slate-50 p-1.5">
        <button
          onClick={() => setTab("momo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14.5px] font-bold ${tab === "momo" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
        >
          <Smartphone size={17.1} /> Mobile Money
        </button>
        <button
          onClick={() => setTab("crypto")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14.5px] font-bold ${tab === "crypto" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
        >
          <Bitcoin size={17.1} /> Crypto (USDT)
        </button>
      </div>

      {tab === "momo" ? (
        processing ? (
          /* PROCESSING STATE */
          <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-[103px] w-[103px] items-center justify-center rounded-full bg-yellow-50">
              <OperatorLogo name={processing.operator} size={66.6} />
            </div>
            <h2 className="mt-4 text-[20.5px] font-extrabold text-slate-900">Processing</h2>
            <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] font-medium text-slate-500">
              Approve the request on your Mobile Money phone
            </p>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
              <p className="text-[24px] font-extrabold" style={{ color: GOLD }}>
                {processing.amount.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-[12.5px] font-medium text-slate-500">via {processing.operator}</p>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-3.5 w-3.5 animate-bounce rounded-full"
                  style={{ background: GOLD, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between text-[12.5px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14.4} /> Expiry
              </span>
              <span className="font-bold text-slate-700">{mmss(secondsLeft)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(secondsLeft / MOMO_EXPIRY) * 100}%`, background: GOLD }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-left">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500">Reference</p>
                <p className="truncate text-[14.5px] font-extrabold text-slate-900">{processing.reference}</p>
              </div>
              <button onClick={() => copy(processing.reference, "ref")} className="shrink-0 text-slate-400 hover:text-slate-700">
                {copied === "ref" ? <Check size={17.1} className="text-green-500" /> : <Copy size={17.1} />}
              </button>
            </div>
            <button onClick={cancelMomo} className="mt-4 text-[11px] font-bold text-slate-400 hover:text-red-500">
              Cancel request
            </button>
          </div>
        ) : (
          /* MOMO FORM */
          <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-6">
            {err && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-bold text-red-600">{err}</p>
            )}
            <div className="flex items-center gap-3 border-b-2 border-b-yellow-200/70 pb-4">
              <span className="text-[24px] font-bold text-slate-500">{country.wallet}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="0"
                className="w-full bg-transparent text-right text-[41.5px] font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />
            </div>
            {amt > 0 && (
              <p className="mt-2 text-right text-[10.5px] font-bold text-slate-400">
                Fees ({feeLabel}) : -{fee.toLocaleString("fr-FR")} • You receive :{" "}
                <span className="text-green-600">{credited.toLocaleString("fr-FR")} FCFA</span>
              </p>
            )}

            <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-slate-500">CHOOSE COUNTRY</p>
            <div className="mt-2.5">
              <CountryDropdown
                value={country}
                onPick={(c) => {
                  setCountry(c);
                  setOperator(c.operators[0]);
                }}
                open={countryOpen}
                setOpen={setCountryOpen}
                q={countryQ}
                setQ={setCountryQ}
                list={filteredCountries}
                dropRefProp={dropRef}
              />
            </div>

            <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-slate-500">MOBILE MONEY OPERATOR</p>
            <div className="no-scrollbar -mx-6 mt-2.5 flex gap-3.5 overflow-x-auto px-6 pb-1">
              {country.operators.map((op) => {
                const active = operator === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`w-[117px] shrink-0 rounded-[22px] border-2 p-4 ${active ? "border-yellow-400 bg-yellow-50/50" : "border-slate-200 bg-white"}`}
                  >
                    <span className="mx-auto flex justify-center">
                      <OperatorLogo name={op} size={49.5} />
                    </span>
                    <span className="mt-2.5 block text-center text-[12.5px] font-bold leading-tight text-slate-900">{op}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-slate-500">MOBILE MONEY PHONE NUMBER</p>
            <div className="relative mt-2.5">
              <Phone size={17.1} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
              <span className="absolute left-14 top-1/2 -translate-y-1/2 text-[14.5px] font-bold text-slate-700">{country.dial}</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                inputMode="tel"
                placeholder="XXX XXX XXX"
                className="w-full rounded-[22px] border border-slate-300 bg-white py-[14.5px] pl-28 pr-5 text-[15px] font-medium placeholder:text-slate-500 focus:border-yellow-500"
              />
            </div>

            <button
              onClick={() => {
                setErr("");
                if (!canMomo) {
                  setErr(amt < 100 ? "Minimum amount: 100." : "Please enter a valid phone number.");
                  return;
                }
                setConfirmOpen(true);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[14.5px] text-[16px] font-bold text-white"
              style={{ background: GOLD }}
            >
              <CreditCard size={17.1} /> Confirm
            </button>
            <p className="mt-2.5 text-center text-[10px] font-medium text-slate-400">
              Settled in {base} wallet • Demo: approve simulated on your phone.
            </p>
          </div>
        )
      ) : order ? (
        /* CRYPTO PAYMENT STEP */
        <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-6">
          {err && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-bold text-red-600">{err}</p>
          )}
          <div className="flex items-start gap-3.5">
            <span className="flex h-[47.5px] w-[47.5px] shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
              <Bitcoin size={23.4} />
            </span>
            <div>
              <p className="text-[17.5px] font-extrabold text-slate-900">USDT.{order.network}</p>
              <p className="text-[12.5px] font-medium text-slate-500">Send exactly the crypto amount shown below.</p>
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-[300px] rounded-[24px] border border-slate-200 p-4">
            <img src={order.qr} alt="Deposit address QR" className="w-full rounded-xl" />
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-slate-500">DEPOSIT ADDRESS</p>
          <div className="mt-2 flex items-center gap-2 rounded-[20px] border border-slate-300 px-4 py-3.5">
            <span className="min-w-0 flex-1 break-all font-mono text-[11.5px] font-bold text-slate-800">{order.address}</span>
            <button onClick={() => copy(order.address, "addr")} className="shrink-0 rounded-xl bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100">
              {copied === "addr" ? <Check size={16.2} className="text-green-600" /> : <Copy size={16.2} />}
            </button>
          </div>

          <div className="mt-4 rounded-[20px] bg-slate-50 px-5 py-2">
            <div className="flex items-center justify-between border-b border-slate-200 py-3">
              <span className="text-[13.5px] font-medium text-slate-500">Send exactly</span>
              <span className="text-[14.5px] font-bold text-slate-900">{order.amountUsdt.toFixed(4)} USDT</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 py-3">
              <span className="text-[13.5px] font-medium text-slate-500">Total fees (2.5%)</span>
              <span className="text-[14.5px] font-bold text-red-500">-{order.feeUsdt.toFixed(4)} USDT</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13.5px] font-medium text-slate-500">Net amount credited</span>
              <span className="text-[15px] font-extrabold text-green-500">{order.netUsdt.toFixed(4)} USDT</span>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <span className="relative flex h-[57px] w-[57px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="36" cy="36" r="32" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="36" cy="36" r="32" fill="none" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - cryptoLeft / CRYPTO_EXPIRY)}
                  />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500">TIME REMAINING</p>
                <p className="text-[27px] font-extrabold text-teal-500">{hhmmss(cryptoLeft)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
              <Hourglass size={20.7} className="shrink-0 text-teal-500" />
              <p className="text-[14.5px] font-medium text-slate-800">Verifying the blockchain transaction</p>
            </div>
          </div>

          <button
            onClick={confirmCrypto}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[14.5px] text-[16px] font-bold text-white disabled:opacity-60"
            style={{ background: GOLD }}
          >
            {loading ? <Loader2 size={17.1} className="animate-spin" /> : <CircleCheck size={17.1} />}
            {loading ? "Verifying..." : "I sent the funds"}
          </button>
          <button onClick={() => setOrder(null)} className="mt-3 w-full text-center text-[12.5px] font-medium text-slate-500">
            ← Edit
          </button>
        </div>
      ) : (
        /* CRYPTO FORM */
        <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-6">
          {err && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-bold text-red-600">{err}</p>
          )}
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500">CHOOSE COUNTRY *</p>
          <div className="mt-2.5">
            <CountryDropdown
              value={cryptoCountry}
              onPick={setCryptoCountry}
              open={cryptoCountryOpen}
              setOpen={setCryptoCountryOpen}
              q={cryptoQ}
              setQ={setCryptoQ}
              list={filteredCryptoCountries}
              dropRefProp={cryptoDropRef}
            />
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-slate-500">CRYPTOCURRENCY</p>
          <div className="mt-2.5 flex items-center gap-3 rounded-[22px] border border-slate-300 bg-white px-5 py-4">
            <OperatorLogo name="USDT" size={31.5} radius={999} />
            <span className="text-[15px] font-bold text-slate-900">USDT : USDT</span>
            <span className="ml-auto text-[12.5px] text-slate-500">▼</span>
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-slate-500">NETWORK</p>
          <div ref={netRef} className="relative mt-2.5">
            <button
              type="button"
              onClick={() => setNetworkOpen(!networkOpen)}
              className="flex w-full items-center gap-3 rounded-[22px] border border-slate-300 bg-white px-5 py-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[14.5px] font-extrabold text-white" style={{ background: network.iconBg }}>
                {network.iconText}
              </span>
              <span className="text-[15px] font-bold text-slate-900">{network.label}</span>
              <span className="ml-auto text-[12.5px] text-slate-500">▼</span>
            </button>
            {networkOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                {CRYPTO_NETWORKS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setNetwork(n);
                      setNetworkOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[12.5px] font-extrabold text-white" style={{ background: n.iconBg }}>
                      {n.iconText}
                    </span>
                    <span className="text-[13.5px] font-bold">{n.label}</span>
                    <span className="text-[11px] font-medium text-slate-400">{n.short}</span>
                    {n.id === network.id && <Check size={14.4} className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-slate-500">AMOUNT (USDT)</p>
          <div className={`mt-2.5 flex overflow-hidden rounded-[22px] border-2 ${usdt ? "border-yellow-300" : "border-slate-300"}`}>
            <span className="flex items-center border-r border-slate-200 bg-slate-100 px-5 text-[14.5px] font-extrabold text-slate-500">USDT</span>
            <input
              value={usdt}
              onChange={(e) => setUsdt(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="1.00"
              className="w-full px-5 py-[14.5px] text-[16px] font-bold placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          {usdtAmt > 0 && (
            <>
              <p className="mt-2 text-[13.5px] font-medium text-slate-500">
                ≈ <span className="font-bold text-slate-900">{usdtAmt.toFixed(2)} USDT</span>
              </p>
              <div className="mt-2.5 rounded-[20px] bg-slate-50 px-5 py-2">
                <div className="flex items-center justify-between border-y border-slate-200 py-2.5">
                  <span className="text-[12.5px] font-medium text-slate-500">Total fees (2.5%)</span>
                  <span className="text-[13.5px] font-bold text-red-500">-{usdtFee.toFixed(4)} USDT</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[13.5px] font-medium text-slate-500">Net amount credited</span>
                  <span className="text-[15px] font-extrabold text-green-500">{usdtNet.toFixed(4)} USDT</span>
                </div>
              </div>
            </>
          )}

          <button type="button" onClick={() => setRefundOpen(!refundOpen)} className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500">
            <span className={`text-[10.5px] transition-transform ${refundOpen ? "rotate-180" : ""}`}>▼</span> Refund address (optional)
          </button>
          {refundOpen && (
            <input
              value={refund}
              onChange={(e) => setRefund(e.target.value)}
              placeholder="Address for refunds"
              className="mt-2 w-full rounded-[20px] border border-slate-300 px-5 py-3.5 font-mono text-[11px] font-bold"
            />
          )}

          <button
            onClick={generateAddress}
            disabled={loading || usdtAmt < 1}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[20px] py-[14.5px] text-[16px] font-bold text-white disabled:opacity-50"
            style={{ background: GOLD }}
          >
            {loading ? <Loader2 size={17.1} className="animate-spin" /> : <Bitcoin size={17.1} />}
            {loading ? "Generating..." : "Generate payment address"}
          </button>
        </div>
      )}

      {/* momo confirm sheet */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setConfirmOpen(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-white px-5 pt-3 pb-6 animate-fade-up">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
            <button onClick={() => !loading && setConfirmOpen(false)} className="absolute right-5 top-4 text-red-500" aria-label="close">
              <X size={20.7} strokeWidth={3} />
            </button>
            <h3 className="mt-2 text-center text-[19px] font-extrabold text-slate-900">Confirm deposit</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-300">
              {[
                ["Mobile Money number", `${country.dial} ${phone}`.trim(), "text-slate-900"],
                ["Country", country.name, "text-slate-900"],
                ["Operator", operator, "text-slate-900"],
                ["Amount entered", `${amt.toLocaleString("fr-FR")} FCFA`, "text-slate-900"],
                [`Fees (${feeLabel})`, `-${fee.toLocaleString("fr-FR")} FCFA`, "text-red-500"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-[13.5px]">
                  <span className="text-[13.5px] font-medium text-slate-500">{k}</span>
                  <span className={`text-right text-[14.5px] font-bold ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-green-50/70 px-5 py-[15px]">
                <span className="text-[14.5px] font-bold text-slate-900">Credited amount</span>
                <span className="text-[16px] font-extrabold text-green-500">{credited.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmOpen(false)} disabled={loading} className="rounded-2xl border border-slate-300 bg-white py-4 text-[15px] font-medium text-slate-900">
                Back
              </button>
              <button
                onClick={submitMomo}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ background: GOLD }}
              >
                {loading ? <Loader2 size={16.2} className="animate-spin" /> : <CreditCard size={16.2} />}
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
