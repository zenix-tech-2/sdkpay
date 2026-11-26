"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import CountryFlag from "@/components/CountryFlag";

export default function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (dial: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selected = COUNTRIES.find((c) => c.dial === value) ?? COUNTRIES[0];
  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.dial.includes(q)
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-2 rounded-xl border-2 bg-white px-3 py-[13px] text-left transition ${
          open ? "border-yellow-500 ring-4 ring-yellow-500/20" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <CountryFlag code={selected.code} emoji={selected.flag} size={22} />
        <span className="text-[15px] font-bold text-slate-800">{selected.dial}</span>
        <ChevronDown size={18} className="ml-auto text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-30 bottom-full mb-2 w-[300px] sm:w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full bg-transparent text-[14px] font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="max-h-[260px] overflow-y-auto p-2">
            {filtered.map((c) => {
              const active = c.dial === value;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.dial);
                    setOpen(false);
                    setQ("");
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 ${
                    active ? "bg-slate-100" : ""
                  }`}
                >
                  {active && <Check size={16} className="text-slate-800" strokeWidth={3} />}
                  <CountryFlag code={c.code} emoji={c.flag} size={22} />
                  <span className={`text-[15px] font-bold ${active ? "text-slate-900" : "text-slate-800"}`}>{c.name}</span>
                  <span className="text-[13px] font-medium text-slate-400">· {c.dial}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] font-semibold text-slate-400">Aucun pays trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
