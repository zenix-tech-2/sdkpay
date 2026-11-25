"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Smartphone, Bitcoin, ChevronDown, Check, Search, Phone, Copy, Check as CheckIcon,
  Clock, Wallet, ArrowLeft, ShieldCheck, BadgePercent, Loader2, Hourglass, X,
} from "lucide-react";
import { toDataURL } from "qrcode";
import { COUNTRIES, flagUrl, type CountryEntry } from "@/lib/countries";
import { createDeposit } from "@/lib/actions";
import Link from "next/link";

const DIGIT = (n: number) => String(n).padStart(2, "0");

function useCountdown(total: number, active: boolean) {
  const [left, setLeft] = useState(total);
  useEffect(() => {
    if (!active) return;
    setLeft(total);
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [active, total]);
  return left;
}

const fmtMMSS = (s: number) => `${DIGIT(Math.floor(s / 60))}:${DIGIT(s % 60)}`;

function OperatorTile({ brand, text, name, selected, onSelect }: { brand: string; text: string; name: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex w-[7.2rem] shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 transition ${
        selected ? "border-gold bg-amber-50/40 ring-2 ring-gold/40" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {selected && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy2"><CheckIcon size={12} strokeWidth={4} /></span>}
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-[11px] font-black tracking-tight" style={{ backgroundColor: brand, color: text === "MTN" ? "#111" : "#fff" }}>
        <span className={`px-1 text-center leading-none ${text.length > 4 ? "text-[9px]" : "text-[12px]"}`}>{text}</span>
      </span>
      <span className="text-center text-[10.5px] font-bold leading-tight text-slate-700">{name}</span>
    </button>
  );
}

function CountryPicker({ value, onChange }: { value: CountryEntry; onChange: (c: CountryEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = useMemo(() => COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.currency.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex h-14 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 transition hover:border-slate-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={flagUrl(value.code)} alt="" className="h-6 w-9 rounded object-cover shadow-sm" />
        <span className="flex-1 text-left text-[15px] font-bold text-ink">{value.name} <span className="font-medium text-slate-400">· {value.currency}</span></span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un pays…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400" />
          </div>
          <div className="slim-scroll max-h-64 overflow-y-auto py-1">
            {list.map((c) => (
              <button key={c.currency} type="button" onClick={() => { onChange(c); setOpen(false); setQ(""); }} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] transition hover:bg-slate-50 ${c.currency === value.currency ? "bg-blue-50/60" : ""}`}>
                {c.currency === value.currency ? <CheckIcon size={16} className="text-blue-600" /> : <span className="w-4" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(c.code, 40)} alt="" className="h-4 w-6 rounded-[3px] object-cover" />
                <span className="font-semibold text-ink">{c.name}</span>
                <span className="text-slate-400">· {c.currency}</span>
              </button>
            ))}
            {list.length === 0 && <p className="px-3 py-4 text-center text-[12.5px] text-slate-400">No country found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepositFlow({ xafBalance, usdtBalance }: { xafBalance: number; usdtBalance: number }) {
  const [tab, setTab] = useState<"momo" | "crypto">("momo");
  const [country, setCountry] = useState<CountryEntry>(COUNTRIES.find((c) => c.code === "cm")!);
  const [operatorId, setOperatorId] = useState("MTN_MONEY");
  const [phone, setPhone] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [stage, setStage] = useState<"form" | "confirm" | "processing">("form");
  const [pendingRef, setPendingRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // crypto state
  const [cryptoStage, setCryptoStage] = useState<"form" | "address" | "sent">("form");
  const [usdtStr, setUsdtStr] = useState("");
  const [refund, setRefund] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [addrQr, setAddrQr] = useState<string | null>(null);
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);

  const amount = Number(amountStr) || 0;
  const fee = Math.round(amount * 0.04 * 100) / 100;
  const net = Math.max(0, amount - fee);
  const usdtAmount = Number(usdtStr) || 0;
  const usdtFee = Math.round(usdtAmount * 0.025 * 10000) / 10000;
  const usdtNet = Math.max(0, usdtAmount - usdtFee);

  const expiry = useCountdown(468, stage === "processing");
  const cryptoExpiry = useCountdown(300, cryptoStage === "address");

  useEffect(() => {
    if (address) toDataURL(address, { width: 220, margin: 1 }).then(setAddrQr).catch(() => setAddrQr(null));
  }, [address]);

  const operator = country.operators.find((o) => o.id === operatorId) ?? country.operators[0];
  const phoneValid = phone.replace(/\D/g, "").length >= 8;
  const canConfirm = amount > 0 && operator && phoneValid;

  const submitDeposit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await createDeposit({ amount, fee, net, currencyLabel: country.currency, country: country.name, operator: operator.id, phone, feePercent: 4 });
    setSubmitting(false);
    if (res.ok) { setPendingRef(res.ref ?? null); setStage("processing"); }
    else setError(res.error ?? "Something went wrong");
  };

  const generateAddress = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    let a = "T";
    for (let i = 0; i < 33; i++) a += chars[Math.floor(Math.random() * chars.length)];
    setAddress(a);
    setCryptoStage("address");
  };

  const submitCryptoDeposit = async () => {
    if (!address) return;
    setCryptoSubmitting(true);
    const res = await createDeposit({ amount: usdtAmount, fee: usdtFee, net: usdtNet, currencyLabel: "USDT", country: country.name, operator: "USDT · Tron (TRC20)", phone: address.slice(0, 12), feePercent: 2.5 });
    setCryptoSubmitting(false);
    if (res.ok) setCryptoStage("sent");
    else setError(res.error ?? "Something went wrong");
  };

  /* ---------------- processing screen ---------------- */
  if (stage === "processing" && pendingRef) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-amber-100 shadow-[0_0_0_12px_rgba(253,230,138,0.35)]">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffcb05] text-[17px] font-black text-slate-900 ring-4 ring-white">MTN</span>
        </div>
        <h2 className="mt-6 text-[22px] font-extrabold text-ink">Processing</h2>
        <p className="mt-1 text-[13px] text-slate-500">Approve the request on your Mobile Money phone</p>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-[26px] font-black text-gold2">{amount.toLocaleString("fr-FR")} FCFA</p>
          <p className="text-[12px] font-semibold text-amber-800/70">via {operator?.name}</p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => <span key={i} className="dot-blink h-3 w-3 rounded-full bg-gold" />)}
        </div>
        <div className="mt-5 flex items-center justify-between text-[12.5px] font-bold text-slate-500"><span className="flex items-center gap-1.5"><Clock size={14} /> Expiry</span><span className="font-mono">{fmtMMSS(expiry)}</span></div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-gold to-gold2 transition-all duration-1000" style={{ width: `${(expiry / 468) * 100}%` }} /></div>
        <div className="mt-5 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="min-w-0 text-left"><p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400">Reference</p><p className="truncate font-mono text-[12px] font-bold text-ink">{pendingRef}</p></div>
          <button onClick={() => navigator.clipboard.writeText(pendingRef)} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200" aria-label="Copy reference"><Copy size={17} /></button>
        </div>
        <Link href="/transactions" className="mt-5 block rounded-2xl border border-navy/20 bg-navy py-3.5 text-[14px] font-bold text-white transition hover:bg-navy3">Track this transaction</Link>
      </div>
    );
  }

  /* ---------------- main flow ---------------- */
  return (
    <div className="mx-auto max-w-2xl">
      {/* balance card */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-5 text-white shadow-lg">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">{tab === "momo" ? <Wallet size={26} /> : <Bitcoin size={26} />}</span>
        <div>
          <p className="text-[12px] font-medium text-white/65">{tab === "momo" ? `Current balance (${country.currency})` : "Current USDT balance"}</p>
          <p className="mt-0.5 text-[30px] font-extrabold tracking-tight">
            {tab === "momo" ? <>{xafBalance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} <span className="text-[16px] text-gold">FCFA</span></> : <>{usdtBalance.toFixed(4)} <span className="text-[16px] text-gold">USDT</span></>}
          </p>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1.5">
        <button onClick={() => setTab("momo")} className={`flex h-12 items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold transition ${tab === "momo" ? "bg-white text-ink shadow" : "text-slate-500"}`}><Smartphone size={17} /> Mobile Money</button>
        <button onClick={() => setTab("crypto")} className={`flex h-12 items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold transition ${tab === "crypto" ? "bg-white text-ink shadow" : "text-slate-500"}`}><Bitcoin size={17} /> Crypto (USDT)</button>
      </div>

      {/* ============ MOBILE MONEY ============ */}
      {tab === "momo" && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          {/* big amount */}
          <div className="flex items-end justify-between gap-3 border-b-2 border-gold/70 pb-3">
            <span className="pb-1.5 text-[20px] font-extrabold text-slate-400">{country.currency}</span>
            <input
              autoFocus
              type="number" min={0} inputMode="numeric" placeholder="0" value={amountStr} onChange={(e) => setAmountStr(e.target.value)}
              aria-label="Amount"
              className="w-full bg-transparent text-right text-[44px] font-light leading-none tracking-tight text-ink outline-none placeholder:text-slate-200"
            />
          </div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Choose country</p>
          <div className="mt-1.5"><CountryPicker value={country} onChange={(c) => { setCountry(c); setOperatorId(c.operators[0].id); }} /></div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Mobile Money operator</p>
          <div className="slim-scroll -mx-1 mt-1.5 flex gap-2.5 overflow-x-auto px-1 py-1">
            {country.operators.map((o) => (
              <OperatorTile key={o.id} brand={o.brand} text={o.text} name={o.name} selected={operator?.id === o.id} onSelect={() => setOperatorId(o.id)} />
            ))}
          </div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Mobile Money phone number</p>
          <div className="mt-1.5 flex h-13 items-center gap-2.5 rounded-2xl border border-slate-200 px-4 transition focus-within:border-gold">
            <Phone size={18} className="shrink-0 text-slate-400" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="XXX XXX XXX" inputMode="tel" className="h-12 w-full bg-transparent text-[16px] outline-none placeholder:tracking-[0.3em] placeholder:text-slate-300" />
          </div>

          {amount > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-[12.5px]">
              <span className="font-semibold text-slate-500">Fees (4%) · you receive</span>
              <span className="font-extrabold text-emerald-600">{net.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}
          {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-[12.5px] font-semibold text-red-600">{error}</p>}

          <button
            disabled={!canConfirm}
            onClick={() => setStage("confirm")}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wallet size={18} /> Continue
          </button>
        </div>
      )}

      {/* ============ CRYPTO ============ */}
      {tab === "crypto" && cryptoStage === "form" && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Choose country <span className="text-red-400">*</span></p>
          <div className="mt-1.5"><CountryPicker value={country} onChange={setCountry} /></div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Cryptocurrency</p>
          <div className="mt-1.5 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#26a17b] text-[13px] font-black text-white">₮</span>
            <span className="flex-1 text-[15px] font-bold text-ink">USDT : USDT</span>
            <ChevronDown size={18} className="text-slate-400" />
          </div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Network</p>
          <div className="mt-1.5 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eb0029] text-[13px] text-white">◆</span>
            <span className="flex-1 text-[15px] font-bold text-ink">Tron (TRX)</span>
            <ChevronDown size={18} className="text-slate-400" />
          </div>

          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Amount (USDT)</p>
          <div className="mt-1.5 flex h-14 overflow-hidden rounded-2xl border border-slate-200 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25">
            <span className="flex h-full items-center border-r border-slate-200 bg-slate-50 px-4 text-[14px] font-extrabold text-slate-500">USDT</span>
            <input type="number" min={0} step="0.01" inputMode="decimal" value={usdtStr} onChange={(e) => setUsdtStr(e.target.value)} placeholder="1.00" className="h-full w-full bg-transparent px-4 text-[17px] outline-none placeholder:text-slate-300" />
          </div>

          {usdtAmount > 0 && (
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Total fees (2.5%)</span><span className="font-bold text-red-500">-{usdtFee.toFixed(4)} USDT</span></div>
              <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Net amount credited</span><span className="font-extrabold text-emerald-600">{usdtNet.toFixed(4)} USDT</span></div>
            </div>
          )}

          <button type="button" onClick={() => setRefundOpen(!refundOpen)} className="mt-4 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-500 hover:text-ink">
            <ChevronDown size={15} className={`transition-transform ${refundOpen ? "rotate-180" : ""}`} /> Refund address (optional)
          </button>
          {refundOpen && <input value={refund} onChange={(e) => setRefund(e.target.value)} placeholder="T… (used only if the payment cannot be credited)" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono text-[12px] outline-none focus:border-gold" />}

          <button
            disabled={usdtAmount < 1}
            onClick={generateAddress}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Bitcoin size={19} /> Generate payment address
          </button>
        </div>
      )}

      {/* crypto address step */}
      {tab === "crypto" && cryptoStage === "address" && address && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-gold2"><Bitcoin size={22} /></span>
            <div>
              <p className="text-[15px] font-extrabold text-ink">USDT.TRC20</p>
              <p className="text-[12px] text-slate-500">Send exactly the crypto amount shown below.</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              {addrQr
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={addrQr} alt="Deposit address QR" className="h-44 w-44" />
                : <div className="flex h-44 w-44 items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={30} /></div>}
            </div>
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Deposit address</p>
          <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="min-w-0 flex-1 break-all font-mono text-[12.5px] font-semibold text-ink">{address}</p>
            <button onClick={() => navigator.clipboard.writeText(address)} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200" aria-label="Copy address"><Copy size={17} /></button>
          </div>
          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between px-4 py-2.5 text-[13.5px]"><span className="font-semibold text-slate-500">Send exactly</span><span className="font-extrabold text-ink">{usdtAmount.toFixed(4)} USDT</span></div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[13.5px]"><span className="font-semibold text-slate-500">Total fees (2.5%)</span><span className="font-bold text-red-500">-{usdtFee.toFixed(4)} USDT</span></div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[13.5px]"><span className="font-semibold text-slate-500">Net amount credited</span><span className="font-extrabold text-emerald-600">{usdtNet.toFixed(4)} USDT</span></div>
          </div>

          {/* countdown */}
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <svg viewBox="0 0 48 48" className="h-16 w-16 -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="5" fill="none" />
              <circle cx="24" cy="24" r="20" stroke="#14b8a6" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - cryptoExpiry / 300)} className="transition-all duration-1000" />
            </svg>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Time remaining</p>
              <p className="font-mono text-[24px] font-extrabold text-teal-600">00:{fmtMMSS(cryptoExpiry)}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 border-l border-slate-200 pl-4 text-[12px] font-semibold text-slate-500"><Hourglass size={16} className="shrink-0 text-teal-600" /> Verifying the blockchain transaction</div>
          </div>

          <button onClick={submitCryptoDeposit} disabled={cryptoSubmitting} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md transition enabled:hover:brightness-105 disabled:opacity-50">
            {cryptoSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckIcon size={19} strokeWidth={3} />} I sent the funds
          </button>
          <button onClick={() => { setCryptoStage("form"); setAddress(null); }} className="mx-auto mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 hover:text-ink"><ArrowLeft size={14} /> Edit</button>
        </div>
      )}

      {/* crypto sent */}
      {tab === "crypto" && cryptoStage === "sent" && (
        <div className="mx-auto mt-4 max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
          <ShieldCheck size={40} className="mx-auto text-emerald-500" />
          <h3 className="mt-3 text-[19px] font-extrabold text-emerald-800">Submitted for verification</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-700">We are watching the Tron network. Your USDT balance will update automatically after 1 network confirmation (~3 min).</p>
          <Link href="/transactions" className="mt-5 block rounded-2xl bg-navy py-3.5 text-[14px] font-bold text-white hover:bg-navy3">View transaction</Link>
        </div>
      )}

      {/* notice under momo button when 0 balance? keep minimal per screenshots */}

      {/* ============ CONFIRM BOTTOM SHEET ============ */}
      {stage === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-navy2/60 backdrop-blur-[2px]" onClick={() => setStage("form")} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-7 shadow-2xl sm:rounded-3xl">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
            <button onClick={() => setStage("form")} aria-label="Close" className="absolute right-4 top-4 text-red-500"><X size={24} strokeWidth={2.5} /></button>
            <h3 className="text-center text-[18px] font-extrabold text-ink">Confirm deposit</h3>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {[
                ["Mobile Money number", phone || "—"],
                ["Country", country.name],
                ["Operator", operator?.name ?? "—"],
                ["Amount entered", `${amount.toLocaleString("fr-FR")} FCFA`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-3"><span className="text-[13px] text-slate-500">{k}</span><span className="text-[13.5px] font-bold text-ink">{v}</span></div>
              ))}
              <div className="flex items-center justify-between px-4 py-3"><span className="text-[13px] text-slate-500">Fees (4%)</span><span className="text-[13.5px] font-bold text-red-500">-{fee.toLocaleString("fr-FR")} FCFA</span></div>
              <div className="flex items-center justify-between bg-emerald-50/60 px-4 py-3.5"><span className="text-[14px] font-bold text-ink">Credited amount</span><span className="text-[15px] font-extrabold text-emerald-600">{net.toLocaleString("fr-FR")} FCFA</span></div>
            </div>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-[12.5px] font-semibold text-red-600">{error}</p>}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setStage("form")} className="h-13 rounded-2xl border border-slate-200 py-3.5 text-[15px] font-bold text-slate-600 transition hover:border-slate-300">Back</button>
              <button onClick={submitDeposit} disabled={submitting} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition enabled:hover:brightness-105 disabled:opacity-60">
                {submitting ? <Loader2 size={17} className="animate-spin" /> : <Wallet size={17} />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
