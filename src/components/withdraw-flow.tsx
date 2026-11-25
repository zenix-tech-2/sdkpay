"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Nfc, Coins, Check, Globe, Smartphone, Info, ChevronDown, Save, ShieldCheck, Loader2, CheckCircle2, ArrowLeft, Settings2,
} from "lucide-react";
import { createWithdrawal, saveCryptoAddress } from "@/lib/actions";
import { COUNTRIES, flagUrl } from "@/lib/countries";
import type { FeeSettings } from "@/lib/settings";

export type PayoutMethod = { id: string; operator: string; phone: string; label: string | null };

export default function WithdrawFlow({
  xafBalance, usdtBalance, methods, fees,
}: { xafBalance: number; usdtBalance: number; methods: PayoutMethod[]; fees: FeeSettings }) {
  const [method, setMethod] = useState<"momo" | "crypto">("momo");
  const [countryCode, setCountryCode] = useState("cm");
  const [operatorId, setOperatorId] = useState("MTN_MONEY");
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [amountStr, setAmountStr] = useState("");
  const [address, setAddress] = useState("");
  const [addrLabel, setAddrLabel] = useState("");
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const operators = country.operators.slice(0, 3);
  const amount = Number(amountStr) || 0;
  const momoFee = Math.round(((amount * fees.withdrawal_percent) / 100) * 100) / 100;
  const cryptoFee = fees.crypto_withdrawal_fixed;
  const net = method === "momo" ? Math.max(0, amount - momoFee) : Math.max(0, amount - (feePayer === "you" ? cryptoFee : 0));
  const balance = method === "momo" ? xafBalance : usdtBalance;
  const currency = method === "momo" ? "XAF" : "USDT";
  const min = method === "momo" ? fees.min_withdrawal : fees.usdt_min;
  const valid = amount >= min && amount <= balance;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createWithdrawal(
        method === "momo"
          ? { amount, fee: momoFee, net, method: "mobile_money", operator: operators.find((o) => o.id === operatorId)?.name ?? operatorId, phone: methods.find((m) => m.id === methodId)?.phone, country: country.name, countryCode }
          : { amount, fee: cryptoFee, net, method: "crypto", address, country: "Crypto · Tron" }
      );
      if (res.ok) setDone(true);
      else setError(res.error ?? "Unable to process withdrawal");
    });
  };

  const saveAddr = () => {
    startTransition(async () => {
      const res = await saveCryptoAddress(addrLabel, address);
      if (res.ok) { setSavedFlash(true); setAddrLabel(""); setTimeout(() => setSavedFlash(false), 1600); }
      else setError(res.error ?? "Could not save address");
    });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
        <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
        <h3 className="mt-3 text-[19px] font-extrabold text-emerald-800">Withdrawal requested</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-700">Your withdrawal of <b>{amount.toLocaleString("fr-FR")} {currency}</b> is being verified. You will receive an SMS as soon as it is processed.</p>
        <Link href="/transactions" className="mt-5 block rounded-2xl bg-navy py-3.5 text-[14px] font-bold text-white hover:bg-navy3">Track in Transactions</Link>
        <button onClick={() => { setDone(false); setAmountStr(""); }} className="mx-auto mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={14} /> Make another withdrawal</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* balance card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-6 text-white shadow-lg">
        <p className="text-[13px] font-medium text-white/65">{method === "momo" ? "Main account balance" : "USDT balance"}</p>
        <p className="mt-1.5 text-[40px] font-black tracking-tight">
          {method === "momo" ? <>{xafBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} <span className="text-[22px] text-gold">XAF</span></> : <>{usdtBalance.toFixed(2)} <span className="text-[22px] text-gold">USDT</span></>}
        </p>
        <p className="text-[12px] text-white/55">{method === "momo" ? "Cameroon · XAF" : "Crypto wallet · USDT"}</p>
        <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-4">
          <div className="pr-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">Min. withdrawal</p>
            <p className="mt-0.5 text-[16px] font-extrabold text-gold">{method === "momo" ? `${fees.min_withdrawal.toLocaleString("fr-FR")} XAF` : `${fees.usdt_min} USDT`}</p>
          </div>
          <div className="pl-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">Max. withdrawal</p>
            <p className="mt-0.5 text-[16px] font-extrabold text-gold">{method === "momo" ? `${fees.max_withdrawal.toLocaleString("en-US")} XAF` : `${fees.usdt_max.toLocaleString("en-US")} USDT`}</p>
          </div>
        </div>
      </div>

      {/* method */}
      <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Method</p>
      <div className="mt-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "momo", icon: Nfc, title: "Mobile Money", sub: "Orange, MTN, Wave, Airtel…" },
            { id: "crypto", icon: Coins, title: "Crypto", sub: "Withdraw in USDT" },
          ] as const).map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button key={m.id} onClick={() => { setMethod(m.id); setError(null); }} className={`relative rounded-2xl border p-4 text-left transition ${active ? "border-gold bg-amber-50/50 ring-2 ring-gold/40" : "border-slate-200 hover:border-slate-300"}`}>
                {active && <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold bg-amber-50 text-gold2"><Check size={14} strokeWidth={4} /></span>}
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-amber-100 text-gold2" : "bg-slate-100 text-slate-500"}`}><Icon size={21} /></span>
                <span className={`mt-2.5 block text-[15px] font-extrabold ${active ? "text-gold2" : "text-ink"}`}>{m.title}</span>
                <span className="mt-0.5 block text-[10.5px] leading-snug text-slate-500">{m.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* amount */}
      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Amount</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <input
            autoFocus type="number" min={0} inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="0" aria-label="Amount"
            className="w-full bg-transparent text-[42px] font-light leading-none text-ink outline-none placeholder:text-slate-200"
          />
          <div className="flex shrink-0 items-center gap-2 pb-1">
            <span className="text-[16px] font-extrabold text-slate-400">{currency}</span>
            <button onClick={() => setAmountStr(String(balance))} className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-extrabold text-amber-700 transition hover:bg-amber-200">MAX</button>
          </div>
        </div>
        <p className="mt-2 text-[11.5px] text-slate-400">Available: <b className="text-slate-600">{balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {currency}</b>{method === "momo" && amount > 0 && <> · Recipient receives <b className="text-emerald-600">{net.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} FCFA</b> after {fees.withdrawal_percent}% fee</>}{method === "crypto" && amount > 0 && <> · Recipient receives <b className="text-emerald-600">{net.toFixed(4)} USDT</b>{feePayer === "recipient" ? " (1.00 USDT fee deducted)" : ""}</>}</p>
      </div>

      {/* destination */}
      {method === "momo" ? (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Destination</p>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><Globe size={14} className="text-sky-500" /> Country</p>
          <div className="relative mt-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(country.code, 40)} alt="" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-7 -translate-y-1/2 rounded-sm object-cover" />
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-14 pr-10 text-[15px] font-bold text-ink outline-none focus:border-gold">
              {COUNTRIES.slice(0, 14).map((c) => <option key={c.code} value={c.code}>{c.name} — {c.currency}</option>)}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><Smartphone size={14} /> Mobile Money operator</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {operators.map((o) => {
              const active = operatorId === o.id;
              return (
                <button key={o.id} onClick={() => setOperatorId(o.id)} className={`rounded-2xl border p-3 transition ${active ? "border-gold bg-amber-50/50 ring-2 ring-gold/40" : "border-slate-200"}`}>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-[11px] font-black" style={{ backgroundColor: o.brand, color: o.text === "MTN" ? "#111" : "#fff" }}>{o.text}</span>
                  <span className="mt-1.5 block text-center text-[12px] font-bold text-slate-700">{o.name}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[12px] font-bold text-slate-500">Registered number</p>
          <div className="relative mt-1.5">
            <select value={methodId} onChange={(e) => setMethodId(e.target.value)} className="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[14.5px] font-semibold text-ink outline-none focus:border-gold">
              {methods.length === 0 && <option value="">No registered numbers</option>}
              {methods.map((m) => <option key={m.id} value={m.id}>{m.operator === "MTN_MONEY" ? "MTN Money" : m.operator === "ORANGE_MONEY" ? "Orange Money" : m.operator} · {m.phone}{m.label ? ` (${m.label})` : ""}</option>)}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <Link href="/settings#payout-numbers" className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 transition hover:text-navy2"><Settings2 size={13} /> Manage my numbers</Link>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[12px] font-bold text-slate-500">Network</p>
          <div className="mt-1.5 flex h-13 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eb0029] text-white">◆</span>
            <span className="text-[14.5px] font-bold text-ink">Tron (TRX) <span className="font-medium text-slate-400">USDT.TRC20</span></span>
            <ChevronDown size={17} className="ml-auto text-slate-400" />
          </div>

          <p className="mt-4 text-[12px] font-bold text-slate-500">Destination address</p>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Paste the wallet address" spellCheck={false} className="mt-1.5 h-13 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-mono text-[13px] outline-none transition placeholder:font-sans focus:border-gold" />

          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[12.5px] font-bold text-ink">Save for future withdrawals</p>
            <div className="mt-1.5 flex gap-2">
              <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder='Name, for example "My cold wallet"' className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-gold" />
              <button onClick={saveAddr} className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 transition hover:border-gold">{savedFlash ? <Check size={15} className="text-emerald-600" /> : <Save size={15} />} {savedFlash ? "Saved" : "Save"}</button>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-bold text-slate-500">Who pays the SDK Pay fee?</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {([["you", "You"], ["recipient", "Recipient"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFeePayer(v)} className={`h-12 rounded-xl text-[14px] font-extrabold transition ${feePayer === v ? "bg-gold text-navy2 shadow" : "border border-slate-200 text-slate-600"}`}>{l}</button>
            ))}
          </div>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Fees</span><span className="font-bold text-ink">{fees.crypto_withdrawal_fixed.toFixed(2)} USDT</span></div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Debited</span><span className="font-extrabold text-ink">{(feePayer === "you" ? amount : amount + fees.crypto_withdrawal_fixed).toFixed(2)} USDT</span></div>
          </div>
        </div>
      )}

      <Link href="/fees" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 transition hover:text-ink"><Info size={15} /> Fee details</Link>

      {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}
      {amount > 0 && amount < min && <p className="mt-3 text-[12px] font-semibold text-amber-700">Minimum for this method is {min === fees.usdt_min ? `${fees.usdt_min} USDT` : `${fees.min_withdrawal} XAF`}.</p>}

      <button
        disabled={!valid || pending || (method === "crypto" && (!address || address.length < 20))}
        onClick={submit}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={19} />} Request withdrawal
      </button>
    </div>
  );
}
