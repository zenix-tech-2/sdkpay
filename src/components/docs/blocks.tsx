"use client";

import { useState } from "react";
import { Check, Copy, Info, AlertTriangle, Zap } from "lucide-react";

/* ---------- section anchor ---------- */
export function Section({ id, eyebrow, title, children }: { id: string; eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-slate-100 pt-8 first:border-t-0 first:pt-0">
      {eyebrow && <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-600">{eyebrow}</p>}
      <h2 className="mt-1.5 text-[26px] font-extrabold tracking-tight text-[#141B3D]">{title}</h2>
      <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-1 text-[16px] font-extrabold tracking-tight text-[#141B3D]">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="ml-1 space-y-2">{children}</ul>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
      <span>{children}</span>
    </li>
  );
}

/* ---------- code blocks with copy ---------- */
export function Code({ title, code, lang }: { title?: string; code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1b2140] bg-[#0B1029] shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          {title && <span className="ml-3 font-mono text-[10.5px] font-semibold text-white/40">{title}</span>}
        </span>
        <button
          onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10.5px] font-bold text-white/55 transition hover:border-white/25 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="slim-scroll overflow-x-auto p-4 font-mono text-[11px] leading-[1.75] text-sky-100"><code>{code}</code></pre>
    </div>
  );
}

/* ---------- callouts ---------- */
export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn" | "tip"; title?: string; children: React.ReactNode }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    tip: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone];
  const Icon = tone === "warn" ? AlertTriangle : tone === "tip" ? Zap : Info;
  return (
    <div className={`flex gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed ${styles}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <div>{title && <p className="mb-1 font-extrabold">{title}</p>}{children}</div>
    </div>
  );
}

/* ---------- table ---------- */
export function DocTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[640px] text-left text-[12.5px]">
        <thead>
          <tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            {head.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i} className="bg-white">{r.map((cell, j) => <td key={j} className="px-4 py-3 align-top text-slate-600">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- key/value card row ---------- */
export function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-[12px] font-semibold text-slate-500">{k}</span>
      <span className="text-right text-[12.5px] font-bold text-[#141B3D]">{v}</span>
    </div>
  );
}
