"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Zap, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { createConversionRule, toggleConversionRule, deleteConversionRule } from "@/lib/actions";
import { flagUrl } from "@/lib/countries";

export type SourceOption = { code: string; name: string; flag: string };
export type RuleRow = { id: string; sources: string[]; destination: string; active: boolean };

const ALL_SOURCES: SourceOption[] = [
  { code: "USD", name: "US Dollar", flag: "us" },
  { code: "EUR", name: "Euro", flag: "eu" },
  { code: "XOF", name: "CFA Franc BCEAO", flag: "sn" },
  { code: "GBP", name: "British Pound", flag: "gb" },
  { code: "NGN", name: "Nigerian Naira", flag: "ng" },
  { code: "GHS", name: "Ghanaian Cedi", flag: "gh" },
  { code: "KES", name: "Kenyan Shilling", flag: "ke" },
];

export default function ConversionManager({
  rules,
  wallets,
}: {
  rules: RuleRow[];
  wallets: { currency: string; country: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(["USD", "EUR", "XOF", "GBP"]);
  const [destination, setDestination] = useState(wallets[0]?.currency ?? "XAF");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const toggle = (code: string) => setSelected((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]));

  const activate = () =>
    start(async () => {
      setError(null);
      const res = await createConversionRule(selected, destination);
      if (res.ok) {
        setSavedFlash(true);
        setTimeout(() => router.refresh(), 250);
        setTimeout(() => setSavedFlash(false), 1600);
      } else setError(res.error ?? "Could not create rule");
    });

  return (
    <div className="space-y-5">
      {/* new rule */}
      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50/60 px-5 py-4">
          <p className="flex items-center gap-2 text-[15px] font-extrabold text-amber-900"><Zap size={17} /> New conversion rule</p>
          <p className="mt-0.5 text-[11.5px] text-amber-800/70">Conversion starts when the available balance in a source wallet reaches the equivalent of <b>500 FCFA</b>. Smaller credits accumulate until the threshold is reached.</p>
        </div>
        <div className="p-5">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Source wallets · incoming funds</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {ALL_SOURCES.map((s) => {
              const active = selected.includes(s.code);
              return (
                <button
                  key={s.code}
                  onClick={() => toggle(s.code)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5 text-[12px] font-bold transition ${
                    active ? "border-gold bg-amber-50 text-amber-800 ring-2 ring-gold/40" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(s.flag, 40)} alt="" className="h-3.5 w-5 rounded-[3px] object-cover" />
                  {s.code}
                  {active && <X size={12} strokeWidth={3.5} />}
                </button>
              );
            })}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gold text-[12px] font-extrabold text-navy2">{selected.length}</span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> converted to <span className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-3 text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Destination wallet</p>
          <div className="relative mt-1.5">
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="h-13 w-full appearance-none rounded-2xl border border-gold bg-white px-4 py-4 text-[14px] font-bold text-ink outline-none">
              {wallets.map((w) => <option key={w.currency} value={w.currency}>{w.currency} — {w.country}</option>)}
            </select>
          </div>

          {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-semibold text-red-600">{error}</p>}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={() => setSelected([])} className="h-12 rounded-2xl border border-slate-200 px-6 text-[14px] font-bold text-slate-500 transition hover:border-slate-300">Clear</button>
            <button disabled={pending || selected.length === 0} onClick={activate} className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 px-6 text-[14px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
              {pending ? <Loader2 size={16} className="animate-spin" /> : savedFlash ? <Check size={16} strokeWidth={3} /> : <Zap size={16} fill="currentColor" />} Activate ({selected.length})
            </button>
          </div>
        </div>
      </div>

      {/* existing rules */}
      <div>
        <p className="mb-2 text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Active rules ({rules.filter((r) => r.active).length})</p>
        <div className="space-y-2.5">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-gold2"><Zap size={19} /></span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-ink">
                  {rule.sources.map((s) => <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-mono text-slate-600">{s}</span>)}
                  <ArrowRight size={13} className="text-slate-400" />
                  <span className="text-[13px] font-extrabold text-navy2">{rule.destination}</span>
                </p>
                <p className="mt-0.5 text-[10.5px] text-slate-400">{rule.active ? "Converts automatically when the 500 FCFA threshold is reached" : "Paused"}</p>
              </div>
              <button onClick={() => start(() => toggleConversionRule(rule.id))} role="switch" aria-checked={rule.active} aria-label="Toggle rule" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${rule.active ? "bg-gold" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${rule.active ? "left-[22px]" : "left-0.5"}`} />
              </button>
              <button onClick={() => { if (confirm("Delete this conversion rule?")) start(() => deleteConversionRule(rule.id)); }} aria-label="Delete rule" className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={17} /></button>
            </div>
          ))}
          {rules.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center text-[12.5px] text-slate-400">No conversion rules yet — activate your first one above.</p>}
        </div>
      </div>
    </div>
  );
}
