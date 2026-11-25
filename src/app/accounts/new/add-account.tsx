"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Plus, Check, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { WALLET_OPTIONS, flagUrl } from "@/lib/countries";
import { createWallet } from "@/lib/actions";

export default function AddAccountPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof WALLET_OPTIONS)[number] | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const list = useMemo(
    () => WALLET_OPTIONS.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()) || o.currency.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
        <Link href="/accounts" className="flex items-center gap-1 transition hover:text-ink"><ChevronLeft size={16} /> My Accounts</Link>
      </div>

      <div className="mt-3 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-gold2"><Plus size={26} strokeWidth={2.5} /></span>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Add account</h1>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">Open a new account in another currency. The account will be initialized with a balance of 0.</p>
        </div>
      </div>

      {/* search */}
      <div className="mt-5 flex h-14 items-center gap-2.5 rounded-2xl border-2 border-gold bg-white px-4 shadow-sm">
        <Search size={19} className="shrink-0 text-slate-400" />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a country or currency…" className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400" />
      </div>

      {/* list */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="slim-scroll max-h-[26rem] divide-y divide-slate-100 overflow-y-auto">
          {list.map((o) => {
            const active = selected?.currency === o.currency;
            return (
              <button key={o.currency + o.code} onClick={() => setSelected(o)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-slate-50">
                <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {o.crypto ? (
                    <span className="flex h-full w-full items-center justify-center bg-[#26a17b] text-[19px] font-black text-white">₮</span>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={flagUrl(o.code)} alt={o.name} className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-extrabold tracking-wide text-ink">{o.currency}</span>
                  <span className="block truncate text-[12.5px] text-slate-500">{o.name}</span>
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${active ? "border-gold bg-gold text-navy2" : "border-slate-200 text-transparent"}`}>
                  <Check size={16} strokeWidth={4} />
                </span>
              </button>
            );
          })}
          {list.length === 0 && (
            <p className="flex items-center justify-center gap-2 px-4 py-8 text-[13px] text-slate-400"><Globe size={17} /> No result for “{query}”</p>
          )}
        </div>

        {/* footer */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
          <button onClick={() => router.back()} className="rounded-2xl border border-slate-200 py-3.5 text-[15px] font-bold text-slate-600 transition hover:border-slate-300">Cancel</button>
          <button
            disabled={!selected || pending}
            onClick={() => selected && start(() => createWallet({ code: selected.code, name: selected.name, currency: selected.currency }))}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? <Loader2 size={17} className="animate-spin" /> : null} Create
          </button>
        </div>
      </div>
    </div>
  );
}
