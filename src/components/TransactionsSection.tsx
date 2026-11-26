"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, Search } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatNumber, formatUsdt } from "@/lib/format";
import type { DashboardTransaction } from "@/lib/dashboard-types";

function dayLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value)).toUpperCase();
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(value));
}

function emojiFor(tx: DashboardTransaction) {
  if (tx.type === "withdraw") return "🧮";
  if (tx.type === "send") return "🔁";
  if (tx.type === "payment") return "👛";
  return "💳";
}

function statusClass(status: string) {
  if (status === "failed") return "border-[#ff6b7a] bg-[#fff1f3]";
  if (status === "completed") return "border-[#5cc98a] bg-[#edfdf3]";
  return "border-[#f0c64b] bg-[#fffaeb]";
}

function HistoryCard({ tx }: { tx: DashboardTransaction }) {
  const incoming = tx.direction === "in";
  const failed = tx.status === "failed";
  const isCrypto = tx.currency === "USDT";
  const amountDisplay = isCrypto ? formatUsdt(tx.amountDecimal ?? tx.amount / 10000, 4) : formatNumber(tx.amount);
  const unit = isCrypto ? "USDT" : "FCFA";
  return (
    <Link href={`/dashboard/transactions/${tx.id}`} className={`block rounded-[18px] border-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${statusClass(tx.status)}`}>
      <div className="flex gap-3">
        <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white/70 text-[24px]">{emojiFor(tx)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[17px] font-bold text-[#17213d]">{tx.note || tx.type}</p>
            <p className={`shrink-0 text-[16px] font-extrabold ${incoming ? "text-[#1aa85d]" : "text-[#f04c5c]"}`}>{incoming ? "+" : "-"}{amountDisplay} {unit}</p>
          </div>
          {tx.type.includes("api") && <span className="mt-1 inline-flex items-center rounded-md border border-[#9cc7f5] bg-[#e7f2ff] px-2 py-0.5 text-[10px] font-bold text-[#2b7ac9]">&lt;/&gt; API</span>}
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-[12px] text-[#6c7892]">{tx.method} · {timeLabel(tx.createdAt)}</p>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${failed ? "border-[#f2a4ad] bg-[#ffe8eb] text-[#d43c4c]" : tx.status === "completed" ? "border-[#9ad9b4] bg-[#e1f8eb] text-[#218c55]" : "border-[#ead398] bg-[#fff5d9] text-[#a57908]"}`}>{tx.status === "failed" ? "Failed" : tx.status === "completed" ? "Completed" : "Pending"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TransactionsSection() {
  const { data, refresh, t } = useDashboard();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [currency, setCurrency] = useState("all");

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.transactions.filter((tx) => {
      if (type !== "all" && tx.type !== type) return false;
      if (status !== "all" && tx.status !== status) return false;
      const txCurrency = tx.currency ?? "XAF";
      if (currency !== "all" && currency !== txCurrency) return false;
      if (!term) return true;
      return `${tx.amount} ${tx.method} ${tx.reference} ${tx.note} ${tx.counterparty}`.toLowerCase().includes(term);
    });
  }, [data, search, type, status, currency]);

  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  const effective = rows.filter((tx) => tx.status === "completed" && (tx.currency ?? "XAF") === "XAF");
  const incoming = effective.filter((tx) => tx.direction === "in").reduce((sum, tx) => sum + tx.amount, 0);
  const outgoing = effective.filter((tx) => tx.direction === "out").reduce((sum, tx) => sum + tx.amount, 0);
  const groups = rows.reduce<Record<string, DashboardTransaction[]>>((acc, tx) => {
    const key = dayLabel(tx.createdAt);
    (acc[key] ??= []).push(tx);
    return acc;
  }, {});

  function exportCsv() {
    const header = "Date,Type,Currency,Amount,Fee,Status,Method,Reference\n";
    const body = rows.map((tx) => [tx.createdAt, tx.type, tx.currency ?? "XAF", tx.currency === "USDT" ? (tx.amountDecimal ?? tx.amount / 10000) : tx.amount, tx.currency === "USDT" ? (tx.feeDecimal ?? tx.fee / 10000) : tx.fee, tx.status, tx.method, tx.reference].join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sdkpay-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const selectClass = "h-[54px] rounded-[14px] border border-[#dce5f3] bg-white px-3 text-[14px] font-semibold text-[#25314d] outline-none";

  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Transactions</h1>
      <h2 className="mt-6 text-[12px] font-extrabold tracking-[.16em] text-[#8b96b0]">SUMMARY</h2>
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-4 rounded-[16px] border border-[#e3e9f4] bg-white px-4 py-3 shadow-[0_5px_18px_rgba(25,38,80,.035)]"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#dff3ea] text-[27px]">💳</span><p className="flex-1 text-[15px] font-semibold text-[#25314d]">Total incoming</p><p className="text-[17px] font-extrabold text-[#1aa85d]">+{formatNumber(incoming)} FCFA</p></div>
        <div className="flex items-center gap-4 rounded-[16px] border border-[#e3e9f4] bg-white px-4 py-3 shadow-[0_5px_18px_rgba(25,38,80,.035)]"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#fdeadd] text-[27px]">🧮</span><p className="flex-1 text-[15px] font-semibold text-[#25314d]">Total outgoing</p><p className="text-[17px] font-extrabold text-[#f04c5c]">-{formatNumber(outgoing)} FCFA</p></div>
        <div className="flex items-center gap-4 rounded-[16px] border border-[#e3e9f4] bg-white px-4 py-3 shadow-[0_5px_18px_rgba(25,38,80,.035)]"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e9eefb] text-[27px]">📈</span><p className="flex-1 text-[15px] font-semibold text-[#25314d]">Results displayed</p><p className="text-[17px] font-extrabold text-[#17213d]">{rows.length}</p></div>
      </div>

      <h2 className="mt-8 text-[12px] font-extrabold tracking-[.16em] text-[#8b96b0]">FILTERS</h2>
      <div className="relative mt-3"><Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by amount, operator, reference" className="h-[58px] w-full rounded-[16px] border border-[#dce5f3] bg-white pl-12 pr-3 text-[14px] text-[#25314d] outline-none placeholder:text-[#8b96b0]" /></div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}><option value="all">All types</option><option value="deposit">Deposit</option><option value="withdraw">Withdraw</option><option value="send">Send</option><option value="payment">Payment link</option><option value="api_payment">API</option></select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}><option value="all">All statuses</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="pending">Pending</option></select>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${selectClass} col-span-2 sm:col-span-1`}><option value="all">All currencies</option><option value="XAF">XAF</option><option value="USDT">USDT</option></select>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button onClick={() => void refresh()} className="flex h-[54px] items-center gap-2 rounded-[14px] border border-[#dce5f3] bg-white px-5 text-[15px] font-bold text-[#25314d]"><RefreshCw size={18} /> Refresh</button>
        <button onClick={exportCsv} className="flex h-[54px] items-center gap-2 rounded-[14px] border border-[#dce5f3] bg-white px-5 text-[15px] font-bold text-[#25314d]"><Download size={18} /> Export CSV</button>
      </div>

      <h2 className="mt-8 text-[12px] font-extrabold tracking-[.16em] text-[#8b96b0]">HISTORY</h2>
      <div className="mt-3 space-y-6">
        {Object.keys(groups).length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-[13px] text-[#8b96b0]">{t("Aucune transaction trouvée.", "No transactions found.")}</p>}
        {Object.entries(groups).map(([day, items]) => (
          <div key={day}>
            <p className="mb-3 text-[12px] font-extrabold tracking-[.1em] text-[#8b96b0]">{day}</p>
            <div className="space-y-3">{items.map((tx) => <HistoryCard key={tx.id} tx={tx} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
