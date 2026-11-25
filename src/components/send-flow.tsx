"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Globe, CreditCard, Wallet, Bitcoin, CheckCircle2, ChevronDown, Check, SendHorizontal,
  Loader2, CircleCheck, Users, ShieldCheck, HandCoins,
} from "lucide-react";
import { COUNTRIES, flagUrl } from "@/lib/countries";
import { createInternalTransfer, createMobileSend, createCryptoSend } from "@/lib/actions";

export type SendWallet = { currency: string; balance: number; countryCode: string; country: string };

export default function SendFlow({ wallets }: { wallets: SendWallet[] }) {
  const [tab, setTab] = useState<"momo" | "internal" | "crypto">("momo");
  const [walletIdx, setWalletIdx] = useState(0);
  const wallet = wallets[walletIdx] ?? { currency: "XAF", balance: 0, countryCode: "cm", country: "Cameroun" };

  // internal
  const [query, setQuery] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [internalResult, setInternalResult] = useState<{ ok: boolean; ref?: string; error?: string } | null>(null);
  const [internalPending, startInternal] = useTransition();

  // momo
  const [countryCode, setCountryCode] = useState("bj");
  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const [operatorId, setOperatorId] = useState(country.operators[0].id);
  const [momoName, setMomoName] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoAmount, setMomoAmount] = useState("");
  const [momoResult, setMomoResult] = useState<{ ok: boolean; ref?: string; error?: string } | null>(null);

  // crypto
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [feePayer, setFeePayer] = useState<"you" | "recipient">("you");
  const [cryptoResult, setCryptoResult] = useState<{ ok: boolean; ref?: string; error?: string } | null>(null);
  const [sendPending, startSend] = useTransition();

  const usdt = wallets.find((w) => w.currency === "USDT");
  const usdtBalance = usdt?.balance ?? 0;
  const internalAmount = Number(amountStr) || 0;
  const operator = country.operators.find((o) => o.id === operatorId) ?? country.operators[0];

  const resultPanel = (res: { ok: boolean; ref?: string; error?: string } | null, title: string, onReset: () => void) =>
    res?.ok ? (
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
        <CheckCircle2 size={42} className="mx-auto text-emerald-500" />
        <h3 className="mt-3 text-[18px] font-extrabold text-emerald-800">{title}</h3>
        {res.ref && <p className="mt-2 font-mono text-[12px] font-bold text-emerald-700">Ref: {res.ref}</p>}
        <p className="mt-2 text-[12.5px] text-emerald-700">You will receive an SMS and an in-app notification on every status change.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/transactions" className="rounded-xl border border-emerald-300 bg-white py-3 text-[13px] font-bold text-emerald-800">View transactions</Link>
          <button onClick={onReset} className="rounded-xl bg-emerald-600 py-3 text-[13px] font-bold text-white">Send again</button>
        </div>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* balance hero */}
      <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Wallet size={26} /></span>
          <div>
            <p className="text-[12px] font-medium text-white/65">Your balance</p>
            <p className="mt-0.5 text-[28px] font-extrabold tracking-tight">{wallet.balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} <span className="text-[15px] text-gold">FCFA</span></p>
          </div>
        </div>
        <div className="relative">
          <select
            value={walletIdx}
            onChange={(e) => setWalletIdx(Number(e.target.value))}
            aria-label="Select wallet"
            className="appearance-none rounded-xl border border-white/20 bg-white/10 py-2.5 pl-3 pr-8 text-[13px] font-bold text-white outline-none"
          >
            {wallets.map((w, i) => (
              <option key={i} value={i} className="text-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {w.countryCode.toUpperCase()} {w.currency} · {w.balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70" />
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1.5 text-[12.5px] font-bold">
        {([
          { id: "momo", label: "Mobile Money", icon: Globe },
          { id: "internal", label: "Internal", icon: HandCoins },
          { id: "crypto", label: "Crypto", icon: CreditCard },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex h-12 items-center justify-center gap-1.5 rounded-xl transition ${tab === t.id ? "bg-white text-ink shadow" : "text-slate-500"}`}>
              <Icon size={16} /> <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============ MOBILE MONEY ============ */}
      {tab === "momo" && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {resultPanel(momoResult, "Transfer submitted", () => setMomoResult(null)) ?? (
            <>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Destination</p>
              <div className="relative mt-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(country.code, 40)} alt="" className="pointer-events-none absolute left-4 top-3 h-8 w-12 rounded object-cover" />
                <select value={countryCode} onChange={(e) => { const c = COUNTRIES.find((x) => x.code === e.target.value)!; setCountryCode(c.code); setOperatorId(c.operators[0].id); }} className="h-16 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-[4.5rem] pr-10 outline-none focus:border-gold">
                  {COUNTRIES.slice(0, 14).map((c) => <option key={c.code} value={c.code}>{c.name} · {c.currency}</option>)}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Operator</p>
              <div className="slim-scroll -mx-1 mt-1.5 flex gap-2.5 overflow-x-auto px-1 py-1">
                {country.operators.map((o) => {
                  const active = operator?.id === o.id;
                  return (
                    <button key={o.id} onClick={() => setOperatorId(o.id)} className={`relative flex w-[6.8rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${active ? "border-gold bg-amber-50/40 ring-2 ring-gold/40" : "border-slate-200"}`}>
                      {active && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy2"><Check size={12} strokeWidth={4} /></span>}
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-[10px] font-black" style={{ backgroundColor: o.brand, color: o.text === "MTN" ? "#111" : "#fff" }}>{o.text}</span>
                      <span className="text-[10px] font-bold text-slate-600">{o.name}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Amount to send ({country.currency})</p>
              <div className="mt-1.5 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-4 focus-within:border-gold">
                <span className="text-[14px] font-extrabold text-slate-400">{country.currency}</span>
                <input type="number" min={0} value={momoAmount} onChange={(e) => setMomoAmount(e.target.value)} placeholder="0" className="h-full w-full bg-transparent text-[17px] outline-none placeholder:text-slate-300" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">Recipient name</label>
                  <input value={momoName} onChange={(e) => setMomoName(e.target.value)} placeholder="Jean Dupont" className="mt-1 h-12 w-full rounded-2xl border border-slate-200 px-4 text-[14px] outline-none placeholder:text-slate-300 focus:border-gold" />
                </div>
                <div>
                  <label className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">Phone number</label>
                  <input value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} placeholder="XXXXXXXXX" inputMode="tel" className="mt-1 h-12 w-full rounded-2xl border border-slate-200 px-4 text-[14px] outline-none placeholder:text-slate-300 focus:border-gold" />
                </div>
              </div>

              <button
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={sendPending || !(Number(momoAmount) > 0) || momoPhone.replace(/\D/g, "").length < 8}
                onClick={() => startSend(async () => {
                  const fd = new FormData();
                  fd.set("amount", momoAmount); fd.set("phone", momoPhone); fd.set("name", momoName);
                  fd.set("operator", operator?.id ?? ""); fd.set("country", country.name);
                  setMomoResult(await createMobileSend(fd));
                })}
              >
                {sendPending ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={18} />} Send
              </button>
            </>
          )}
        </div>
      )}

      {/* ============ INTERNAL ============ */}
      {tab === "internal" && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {resultPanel(internalResult, "Transfer complete", () => setInternalResult(null)) ?? (
            <>
              <p className="flex items-center gap-2 text-[14.5px] font-extrabold text-emerald-600"><CircleCheck size={19} /> Internal transfer with no fees</p>
              <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Email, phone or username</p>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="email / +237600000000 / @username" autoCapitalize="off" className="mt-1.5 h-13 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none placeholder:text-slate-300 focus:border-gold" />
              <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Amount ({wallet.currency})</p>
              <div className="mt-1.5 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-4 focus-within:border-gold">
                <span className="text-[14px] font-extrabold text-slate-400">{wallet.currency}</span>
                <input type="number" min={0} value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="0" className="h-full w-full bg-transparent text-[17px] outline-none placeholder:text-slate-300" />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-600">Fees</span><span className="font-extrabold text-emerald-600">Free</span></div>
              {internalResult?.error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12.5px] font-semibold text-red-600">{internalResult.error}</p>}
              <button
                disabled={internalPending || internalAmount <= 0 || !query.trim() || internalAmount > wallet.balance}
                onClick={() => startInternal(async () => {
                  const fd = new FormData();
                  fd.set("query", query); fd.set("amount", String(internalAmount)); fd.set("currency", wallet.currency);
                  setInternalResult(await createInternalTransfer(fd));
                })}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {internalPending ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={18} />} Send
              </button>
              {internalAmount > wallet.balance && <p className="mt-2 text-center text-[11.5px] font-semibold text-amber-700">Insufficient balance in this wallet — switch wallet above.</p>}
              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                {["No internal transfer fees", "Credit to the recipient's account", "Verified account"].map((t) => (
                  <p key={t} className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-600"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100"><Check size={14} strokeWidth={3.5} className="text-emerald-600" /></span>{t}</p>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============ CRYPTO ============ */}
      {tab === "crypto" && (
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {resultPanel(cryptoResult, "USDT sent", () => setCryptoResult(null)) ?? (
            <>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 text-[13.5px] font-bold text-slate-600"><Wallet size={16} /> USDT balance</span>
                <span className="text-[15px] font-extrabold text-ink">{usdtBalance.toFixed(2)} USDT</span>
              </div>

              <p className="mt-4 text-[12px] font-bold text-slate-500">Network</p>
              <div className="mt-1.5 flex h-13 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eb0029] text-[12px] text-white">◆</span>
                <span className="text-[14.5px] font-bold text-ink">Tron (TRX) <span className="font-medium text-slate-400">USDT.TRC20</span></span>
                <ChevronDown size={17} className="ml-auto text-slate-400" />
              </div>

              <p className="mt-4 text-[12px] font-bold text-slate-500">Destination address</p>
              <input value={cryptoAddress} onChange={(e) => setCryptoAddress(e.target.value)} placeholder="Paste the wallet address" spellCheck={false} className="mt-1.5 h-13 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-mono text-[12.5px] outline-none placeholder:font-sans focus:border-gold" />

              <p className="mt-4 text-[12px] font-bold text-slate-500">Amount (USDT)</p>
              <input type="number" min={0} step="0.01" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} placeholder="0.00" className="mt-1.5 h-13 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[17px] outline-none placeholder:text-slate-300 focus:border-gold" />

              <p className="mt-4 text-[12px] font-bold text-slate-500">Who pays the SDK Pay fee?</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {([["you", "You"], ["recipient", "Recipient"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFeePayer(v)} className={`h-12 rounded-xl text-[14px] font-extrabold transition ${feePayer === v ? "bg-gold text-navy2 shadow" : "border border-slate-200 text-slate-600"}`}>{l}</button>
                ))}
              </div>
              <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Fees</span><span className="font-bold text-ink">1.00 USDT</span></div>
                <div className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="font-semibold text-slate-500">Debited</span><span className="font-extrabold text-ink">{(Number(cryptoAmount) || 0).toFixed(2)} USDT</span></div>
              </div>
              {cryptoResult?.error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12.5px] font-semibold text-red-600">{cryptoResult.error}</p>}
              <button
                disabled={sendPending || !(Number(cryptoAmount) >= 1) || cryptoAddress.length < 20}
                onClick={() => startSend(async () => {
                  const fd = new FormData();
                  fd.set("amount", cryptoAmount); fd.set("address", cryptoAddress);
                  setCryptoResult(await createCryptoSend(fd));
                })}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sendPending ? <Loader2 size={17} className="animate-spin" /> : <Bitcoin size={18} />} Continue
              </button>
            </>
          )}
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400"><ShieldCheck size={13} className="text-emerald-500" /> Every transfer is screened for fraud and signed with your PIN.</p>
    </div>
  );
}
