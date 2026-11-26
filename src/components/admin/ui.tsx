import type { ReactNode } from "react";

const PILL_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-rose-100 text-rose-600",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-sky-100 text-sky-700",
  gray: "bg-slate-100 text-slate-500",
  navy: "bg-[#10132e] text-white",
};

export function Pill({ color = "gray", children }: { color?: keyof typeof PILL_COLORS | string; children: ReactNode }) {
  return (
    <span className={`inline-block rounded-lg px-2.5 py-1 text-[10.5px] font-bold ${PILL_COLORS[color as string] || PILL_COLORS.gray}`}>
      {children}
    </span>
  );
}

export function statusPill(status: string) {
  const s = status.toLowerCase();
  if (["success", "successful", "completed", "approved", "active", "verified", "published"].includes(s))
    return <Pill color="green">{status}</Pill>;
  if (["failed", "rejected", "suspended", "hidden"].includes(s)) return <Pill color="red">{status}</Pill>;
  if (["pending", "review", "open"].includes(s)) return <Pill color="yellow">{status}</Pill>;
  if (["answered", "paid", "live"].includes(s)) return <Pill color="blue">{status}</Pill>;
  return <Pill>{status}</Pill>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-slate-900">{title}</h1>
        {sub && <p className="text-[12px] font-medium text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export function Td({ children, right, mono }: { children: ReactNode; right?: boolean; mono?: boolean }) {
  return (
    <td className={`px-4 py-3.5 text-[12px] font-medium text-slate-800 ${right ? "text-right" : ""} ${mono ? "font-mono text-[11px]" : ""}`}>
      {children}
    </td>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-[11.5px] font-semibold text-slate-400">{children}</p>;
}

export function agoShort(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtTx(amount: number, currency: string) {
  if (currency === "USDT") return `${(amount / 10000).toFixed(2)} USDT`;
  if (currency.includes("→")) return `${amount.toLocaleString("en-US")} ${currency}`;
  return `${amount.toLocaleString("en-US")} ${currency}`;
}
