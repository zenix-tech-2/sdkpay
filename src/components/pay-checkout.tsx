"use client";

import { useEffect, useState, useTransition } from "react";
import { Lock, BadgeCheck, ShieldCheck, Store, Loader2, CheckCircle2, Check, ChevronRight } from "lucide-react";
import { submitPublicPayment, trackLinkClick } from "@/lib/actions";
import { fmtAmount } from "@/lib/format";

const OPERATORS = [
  { id: "ORANGE_MONEY", name: "Orange Money", brand: "#ff7900", text: "OM" },
  { id: "MTN_MONEY", name: "MTN Money", brand: "#ffcb05", text: "MTN" },
  { id: "WAVE", name: "Wave", brand: "#00aaff", text: "wave" },
] as const;

export default function PayCheckout({
  slug, title, description, amount, currency, redirectUrl,
}: {
  slug: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string;
  redirectUrl: string | null;
}) {
  const [operator, setOperator] = useState<string>("ORANGE_MONEY");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState(amount !== null ? String(amount) : "");
  const [result, setResult] = useState<{ ok: boolean; ref?: string; error?: string } | null>(null);
  const [pending, start] = useTransition();

  // track a single click per mount
  useEffect(() => {
    trackLinkClick(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const payerAmount = amount !== null ? amount : Number(amountStr) || 0;
  const phoneValid = phone.replace(/\D/g, "").length >= 8;
  const canPay = payerAmount > 0 && phoneValid;

  const pay = () =>
    start(async () => {
      setResult(await submitPublicPayment({ slug, amount: payerAmount, operator, phone, payerName: name }));
    });

  /* ---------- success ---------- */
  if (result?.ok) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_12px_rgba(16,185,129,0.18)]">
          <CheckCircle2 size={48} className="text-white" strokeWidth={2} />
        </span>
        <h1 className="mt-6 text-[26px] font-black tracking-tight text-ink">Payment successful</h1>
        <p className="mt-1 text-[13px] text-slate-500">A confirmation was sent to <b>{phone}</b> via SMS and to your wallet app.</p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Amount paid</p>
          <p className="mt-1 text-[34px] font-black text-navy2">{fmtAmount(payerAmount)} FCFA</p>
          <p className="mt-2 border-t border-slate-100 pt-2 font-mono text-[12px] font-bold text-slate-500">Ref: {result.ref}</p>
        </div>
        {redirectUrl && (
          <a href={redirectUrl} className="mt-5 flex h-13 items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-[15px] font-bold text-white transition hover:bg-navy3">Continue <ChevronRight size={17} /></a>
        )}
        <p className="mt-4 text-[11px] text-slate-400">Powered by <b>SDK Pay</b> · You may close this window</p>
      </div>
    );
  }

  /* ---------- checkout form ---------- */
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        {/* merchant header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold shadow-inner"><Store size={26} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-extrabold text-ink">{title}</p>
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600"><BadgeCheck size={13} /> Verified SDK Pay merchant</p>
          </div>
        </div>

        <div className="p-5">
          {description && <p className="text-[13px] leading-snug text-slate-500">{description}</p>}

          {amount !== null ? (
            <div className="mt-4 text-center">
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Amount due</p>
              <p className="mt-1 text-[40px] font-black tracking-tight text-ink">{fmtAmount(amount)} <span className="text-[18px] text-slate-400">FCFA</span></p>
            </div>
          ) : (
            <div className="mt-4">
              <label htmlFor="pay-amount" className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Your amount (XAF)</label>
              <div className="mt-1.5 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-4 focus-within:border-gold">
                <span className="text-[15px] font-extrabold text-slate-400">FCFA</span>
                <input id="pay-amount" autoFocus type="number" min={100} inputMode="numeric" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="0" className="h-full w-full bg-transparent text-[22px] font-extrabold outline-none placeholder:text-slate-200" />
              </div>
            </div>
          )}

          <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Pay with</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {OPERATORS.map((o) => {
              const active = operator === o.id;
              return (
                <button key={o.id} onClick={() => setOperator(o.id)} aria-pressed={active} className={`relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${active ? "border-gold bg-amber-50/50 ring-2 ring-gold/40" : "border-slate-200 hover:border-slate-300"}`}>
                  {active && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy2"><Check size={12} strokeWidth={4} /></span>}
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl text-[11px] font-black" style={{ backgroundColor: o.brand, color: o.text === "MTN" ? "#111" : "#fff" }}>{o.text}</span>
                  <span className="text-[10px] font-bold text-slate-600">{o.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex h-13 overflow-hidden rounded-2xl border border-slate-200 transition focus-within:border-gold">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-[15px] font-extrabold text-slate-500">+237</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="6XX XXX XXX" aria-label="Mobile Money number" className="h-12 w-full bg-transparent px-4 text-[17px] font-bold outline-none placeholder:text-slate-300" />
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" aria-label="Your name" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-[14px] outline-none placeholder:text-slate-300 focus:border-gold" />

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400"><ShieldCheck size={13} className="text-emerald-500" /> No fees for you — the merchant covers them.</p>

          {result?.error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] font-semibold text-red-600">{result.error}</p>}

          <button disabled={!canPay || pending} onClick={pay} className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[16px] font-extrabold text-navy2 shadow-md shadow-gold/30 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
            {pending ? <Loader2 size={19} className="animate-spin" /> : <Lock size={17} strokeWidth={2.4} />} Pay {payerAmount > 0 ? `${fmtAmount(payerAmount)} FCFA` : "now"}
          </button>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
        <Lock size={12} /> Secured by <b className="text-slate-600">SDK&nbsp;Pay</b> · 256-bit SSL · PCI-DSS Level 1
      </p>
    </div>
  );
}
