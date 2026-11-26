"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Plus, Wallet, X, ChevronRight, Search, Check, Trash2, Loader2, ArrowRight } from "lucide-react";
import { WALLET_CATALOG, isoForWallet } from "@/lib/wallets";
import CountryFlag from "@/components/CountryFlag";

const GOLD = "#f0a500";

interface Rule {
  id: string;
  sources: string;
  destination: string;
  threshold: number;
  isActive: boolean;
  createdAt: string;
}

export default function AutoConversionPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [dest, setDest] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const r = await fetch("/api/conversion-rules");
    const d = await r.json();
    setRules(d.rules ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = WALLET_CATALOG.filter(
    (c) => c.code.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase())
  );

  function toggleSource(code: string) {
    setSources((s) => (s.includes(code) ? s.filter((x) => x !== code) : [...s, code]));
  }

  async function activate() {
    setErr("");
    if (!sources.length || !dest) return;
    setSaving(true);
    try {
      const r = await fetch("/api/conversion-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, destination: dest }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      setSources([]);
      setDest("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: Rule) {
    await fetch("/api/conversion-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this conversion rule?")) return;
    await fetch(`/api/conversion-rules?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/settings" className="flex items-center gap-1.5 text-[16px] font-medium text-slate-500">
        <ArrowLeft size={18} />
      </Link>
      <h1 className="mt-1 flex items-center gap-2.5 text-[26.5px] font-extrabold tracking-tight">
        <Zap size={26} className="text-[#f0a500]" fill="currentColor" /> Automatic conversion
      </h1>

      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
        <p className="text-[16px] font-medium leading-relaxed text-slate-500">
          Conversion starts when the available source wallet balance reaches at least the equivalent of{" "}
          <span className="font-extrabold text-slate-900">500 FCFA</span>. Smaller credits accumulate until
          this threshold is reached.
        </p>
      </div>

      {/* existing rules */}
      {rules.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {rules.map((r) => (
            <div key={r.id} className={`rounded-[22px] border bg-white p-4 ${r.isActive ? "border-yellow-300" : "border-slate-200 opacity-70"}`}>
              <div className="flex items-center gap-2">
                <Zap size={16} className={r.isActive ? "text-[#f0a500]" : "text-slate-300"} fill="currentColor" />
                <p className="flex-1 truncate text-[13px] font-extrabold">
                  {r.sources} <ArrowRight size={12} className="inline text-slate-400" /> {r.destination}
                </p>
                <button
                  onClick={() => toggleRule(r)}
                  className={`relative h-[24.5px] w-[44px] shrink-0 rounded-full ${r.isActive ? "bg-[#f0a500]" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-[3px] h-[19.5px] w-[19.5px] rounded-full bg-white shadow transition-all ${r.isActive ? "right-[3px]" : "left-[3px]"}`} />
                </button>
                <button onClick={() => remove(r.id)} className="shrink-0 rounded-xl bg-red-50 p-2 text-red-500">
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="mt-1 pl-7 text-[11px] font-semibold text-slate-400">
                Threshold {r.threshold} FCFA equiv. • {r.isActive ? "Active" : "Paused"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* new rule */}
      <div className="mt-4 rounded-[26px] border border-yellow-200 bg-white p-6">
        <p className="flex items-center gap-2 text-[18.5px] font-bold">
          <Plus size={19} className="text-[#f0a500]" strokeWidth={2.6} /> New conversion rule
        </p>
        {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-bold text-red-600">{err}</p>}

        <p className="mt-5 text-[12.5px] font-bold tracking-[0.12em] text-slate-500">SOURCE WALLETS: INCOMING FUNDS</p>
        <button
          onClick={() => setPickerOpen(true)}
          className="mt-2.5 flex w-full items-center gap-3 rounded-[20px] border-2 border-yellow-400 px-5 py-4"
        >
          <Wallet size={19} className="shrink-0 text-slate-400" />
          <span className="flex-1 text-left text-[16.5px] font-medium text-slate-900">
            {sources.length ? sources.join(", ") : "Choose source wallets..."}
          </span>
          {sources.length > 0 && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0a500] text-[13px] font-extrabold text-white">
              {sources.length}
            </span>
          )}
          <ChevronRight size={18} className="text-slate-400" />
        </button>
        {sources.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {sources.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3.5 py-1.5 text-[14px] font-extrabold text-[#f0a500]">
                <CountryFlag code={isoForWallet(s)} size={18} /> {s}
                <button onClick={() => toggleSource(s)} className="ml-0.5 font-extrabold text-red-500" aria-label={`remove ${s}`}>
                  <X size={14} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="my-5 flex items-center gap-3 text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="flex items-center gap-1.5 text-[14px] font-medium">
            <ArrowRight size={15} className="text-[#f0a500]" /> converted to
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-[12.5px] font-bold tracking-[0.12em] text-slate-500">DESTINATION WALLET</p>
        <div className="relative mt-2.5">
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full appearance-none rounded-[20px] border-[2.5px] border-yellow-400 bg-white px-5 py-4 text-center text-[16.5px] font-medium text-slate-500 focus:outline-none"
          >
            <option value="">Choose the destination...</option>
            <option value="XAF">XAF — Franc CFA (CEMAC)</option>
            <option value="XOF">XOF — Franc CFA (UEMOA)</option>
            <option value="USDT">USDT — Crypto wallet</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1.4fr] gap-3">
          <Link
            href="/dashboard/settings"
            className="rounded-[16px] border border-slate-300 bg-white py-3.5 text-center text-[16.5px] font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={activate}
            disabled={saving || !sources.length || !dest}
            className="flex items-center justify-center gap-2 rounded-[16px] py-3.5 text-[16.5px] font-bold text-white disabled:opacity-50"
            style={{ background: GOLD }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
            Activate ({sources.length})
          </button>
        </div>
      </div>

      {/* source picker */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPickerOpen(false)} />
          <div className="relative max-h-[80vh] w-full overflow-hidden rounded-t-[28px] bg-white sm:max-w-md sm:rounded-[28px]">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                <Search size={17} className="text-slate-500" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search wallets..."
                  className="w-full bg-transparent text-[14px] font-medium focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.map((c) => {
                const active = sources.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleSource(c.code)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 ${active ? "bg-yellow-50" : "hover:bg-slate-50"}`}
                  >
                    <CountryFlag code={c.iso} emoji={c.flag} size={25} />
                    <span className="flex-1 text-left">
                      <span className="block text-[15px] font-extrabold">{c.code}</span>
                      <span className="block text-[11.5px] font-medium text-slate-500">{c.country}</span>
                    </span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 ${active ? "border-[#f0a500] bg-[#f0a500] text-white" : "border-slate-200 text-transparent"}`}>
                      <Check size={14} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-200 p-4">
              <button
                onClick={() => setPickerOpen(false)}
                className="w-full rounded-full py-3.5 text-[14px] font-extrabold text-white"
                style={{ background: GOLD }}
              >
                Done ({sources.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
