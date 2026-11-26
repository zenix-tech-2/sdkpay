"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { AdminDate } from "@/lib/admin-types";

export function money(value: number, currency = "XAF") {
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency === "XAF" ? "XAF" : currency}`;
}

export function adminDate(value: AdminDate | null | undefined, withTime = true) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
    timeZone: "UTC",
  }).format(date);
}

export function relativeDate(value: AdminDate | null | undefined) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return adminDate(value, false);
}

export function statusTone(status: string) {
  const value = status.toLowerCase();
  if (["approved", "successful", "active", "published", "delivered", "online", "operational", "processed", "paid"].includes(value)) return "green";
  if (["failed", "rejected", "suspended", "revoked", "hidden", "unreachable", "open", "high"].includes(value)) return "red";
  if (["pending", "draft", "paused", "investigating", "normal", "low"].includes(value)) return "yellow";
  return "blue";
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <span className={`admin-pill ${statusTone(status)}`}>{label ?? status}</span>;
}

export function PageHeader({ title, subtitle, kicker, actions }: { title: string; subtitle?: string; kicker?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>{kicker && <p className="admin-kicker mb-1">{kicker}</p>}<h1 className="font-display text-[28px] font-extrabold text-[#111b36] sm:text-[34px]">{title}</h1>{subtitle && <p className="mt-1 text-[13px] text-[#71809b]">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`admin-card ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f8] px-5 py-4"><div><h2 className="text-[15px] font-extrabold text-[#17213d]">{title}</h2>{subtitle && <p className="mt-0.5 text-[11px] text-[#8b96b0]">{subtitle}</p>}</div>{actions}</div>;
}

export function Table({ headers, children, empty }: { headers: string[]; children: ReactNode; empty?: boolean }) {
  return <div className="admin-scroll overflow-x-auto"><table className="admin-table"><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{empty ? <tr><td colSpan={headers.length} className="py-10 text-center text-[12px] text-[#8b96b0]">No records yet.</td></tr> : children}</tbody></table></div>;
}

export function MetricCard({ label, value, note, tone = "navy", icon }: { label: string; value: ReactNode; note?: string; tone?: "navy" | "green" | "red" | "yellow" | "blue"; icon?: ReactNode }) {
  const colors: Record<string, string> = { navy: "#1d2a77", green: "#17854d", red: "#d43c4c", yellow: "#c28a05", blue: "#1d63b8" };
  return <div className="admin-card admin-grid-card p-5"><div className="flex items-start justify-between"><div><p className="admin-mini-label">{label}</p><p className="admin-stat-number mt-3" style={{ color: colors[tone] }}>{value}</p>{note && <p className="mt-2 text-[11px] text-[#8b96b0]">{note}</p>}</div>{icon && <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f2f6fd] text-[#5d6882]">{icon}</span>}</div></div>;
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="relative min-w-[220px] flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="admin-input pl-11" /></div>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4" onClick={onClose}><div className="motion-pop w-full max-w-[480px] rounded-[20px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="text-[19px] font-extrabold text-[#17213d]">{title}</h2><button onClick={onClose}><X size={19} /></button></div>{children}</div></div>;
}

export function useQueryId() {
  const router = useRouter();
  const pathname = usePathname();
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("id");
    setId(value ? Number(value) : null);
  }, [pathname]);
  const setQueryId = (next: number | null) => {
    setId(next);
    router.push(next ? `${pathname}?id=${next}` : pathname);
  };
  return { id, setQueryId };
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
