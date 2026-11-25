import Link from "next/link";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
      {children}
    </p>
  );
}

export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-ink">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
      {label}
    </Link>
  );
}

export function KpiRow({ label, value, tone = "text-ink", valueClass = "" }: { label: string; value: React.ReactNode; tone?: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-[14px] text-slate-500">{label}</span>
      <span className={`text-right text-[14px] font-bold ${tone} ${valueClass}`}>{value}</span>
    </div>
  );
}
