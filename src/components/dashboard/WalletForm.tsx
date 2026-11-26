"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { COUNTRIES } from "@/data/countries";

export function OperatorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ops = ["MTN MoMo", "Orange Money", "Wave", "Airtel Money", "Moov Money", "Free Money", "M-Pesa", "VISA / Mastercard"];
  return (
    <div className="grid grid-cols-2 gap-2">
      {ops.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onChange(op)}
          className={`rounded-2xl border-2 px-3 py-3 text-[13px] font-extrabold transition ${
            value === op ? "border-yellow-400 bg-yellow-50 text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {op}
        </button>
      ))}
    </div>
  );
}

export function CurrencyTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["XAF", "XOF"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`rounded-2xl border-2 py-3 text-[14px] font-extrabold ${value === c ? "border-yellow-400 bg-yellow-50" : "border-slate-200 bg-white text-slate-500"}`}
        >
          {c} {c === "XAF" ? "🇨🇲" : "🇸🇳"}
        </button>
      ))}
    </div>
  );
}

export function ResultCard({ title, detail, reference, onReset }: { title: string; detail: string; reference: string; onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
      <CheckCircle2 size={52} className="mx-auto text-green-500" />
      <h3 className="mt-3 text-[19px] font-extrabold text-green-800">{title}</h3>
      <p className="mt-1 text-[13.5px] font-semibold text-green-700">{detail}</p>
      <p className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 font-mono text-[12.5px] font-bold text-slate-700">Réf : {reference}</p>
      <div>
        <button onClick={onReset} className="mt-4 rounded-full bg-slate-900 px-6 py-2.5 text-[13.5px] font-extrabold text-white">
          Nouvelle opération
        </button>
      </div>
    </div>
  );
}

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-4 text-[15px] font-extrabold text-slate-900 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 disabled:opacity-60"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {loading ? "Traitement..." : label}
    </button>
  );
}

export function CountryDialHint() {
  return (
    <p className="text-[11.5px] font-semibold text-slate-400">
      {COUNTRIES.length} pays supportés • MTN, Orange, Wave, Airtel, Moov, M-Pesa...
    </p>
  );
}
