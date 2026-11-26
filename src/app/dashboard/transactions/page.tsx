"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, RefreshCw, Download, CodeXml } from "lucide-react";
import { Icon3D, txIconName } from "@/components/Icon3D";

interface Tx {
  id: string;
  type: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  operator: string | null;
  reference: string;
  label: string;
  channel: string;
  country: string | null;
  createdAt: string;
}

const TYPE_OPTIONS = [
  ["all", "All types"],
  ["deposit", "Deposits"],
  ["withdraw", "Withdrawals"],
  ["send_out,send_in", "Transfers"],
  ["payment_received", "Payments received"],
  ["conversion", "Conversions"],
];

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["success", "Completed"],
  ["pending", "Pending"],
  ["failed", "Failed"],
];

const CURRENCY_OPTIONS = [
  ["all", "All currencies"],
  ["XAF", "XAF"],
  ["XOF", "XOF"],
];

function txTitle(t: string, operator: string | null) {
  const crypto = (operator ?? "").toUpperCase().includes("USDT");
  if (crypto) {
    if (t === "deposit") return "Crypto Deposit";
    if (t === "withdraw") return "Crypto Withdrawal";
    if (t === "send_out") return "Crypto Transfer";
  }
  switch (t) {
    case "deposit": return "Mobile Money Deposit";
    case "withdraw": return "Withdrawal";
    case "send_out": return "Transfer sent";
    case "send_in": return "Transfer received";
    case "payment_received": return "Payment received";
    case "conversion": return "Currency conversion";
    case "payout": return "Debit adjustment";
    case "bonus": return "Credit adjustment";
    default: return "Transaction";
  }
}

function TxGlyph({ type, operator }: { type: string; operator: string | null }) {
  if ((operator ?? "").toUpperCase().includes("USDT")) return <span className="text-[20px] font-extrabold">₮</span>;
  return <Icon3D name={txIconName(type)} size={30} />;
}

function txAmount(tx: { amount: number; currency: string }) {
  if (tx.currency === "USDT") return `${(tx.amount / 10000).toFixed(4)} USDT`;
  return `${tx.amount.toLocaleString("fr-FR")} FCFA`;
}

const INCOMING = ["deposit", "send_in", "payment_received", "bonus"];

function statusLabel(s: string) {
  return s === "success" ? "Completed" : s === "failed" ? "Failed" : "Pending";
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [totals, setTotals] = useState({ entries: 0, exits: 0 });
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(id);
  }, [q]);

  async function load(spin = false) {
    if (spin) setRefreshing(true);
    else setLoading(true);
    try {
      const r = await fetch(
        `/api/transactions?type=${encodeURIComponent(type)}&status=${status}&currency=${currency}&q=${encodeURIComponent(debouncedQ)}`
      );
      const d = await r.json();
      setTxs(d.transactions ?? []);
      setTotals({ entries: Number(d.totals?.entries ?? 0), exits: Number(d.totals?.exits ?? 0) });
    } catch {
      /* ignore */
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status, currency, debouncedQ]);

  const groups = useMemo(() => {
    const map = new Map<string, Tx[]>();
    for (const tx of txs) {
      const k = dayKey(tx.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(tx);
    }
    return [...map.entries()];
  }, [txs]);

  function exportCsv() {
    const header = "date,reference,type,operator,country,amount,currency,fee,status,channel,label";
    const rows = txs.map((t) =>
      [
        new Date(t.createdAt).toISOString(),
        t.reference,
        t.type,
        (t.operator ?? "").replace(/,/g, " "),
        (t.country ?? "").replace(/,/g, " "),
        t.amount,
        t.currency,
        t.fee,
        t.status,
        t.channel,
        `"${(t.label ?? "").replace(/"/g, "'")}"`,
      ].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sdkpay-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <h1 className="text-[26.5px] font-extrabold tracking-tight text-slate-900">Transactions</h1>

      <p className="mt-5 text-[12.5px] font-bold tracking-[0.22em] text-slate-500">SUMMARY</p>
      <div className="mt-3 space-y-3.5">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-5">
          <span className="flex h-[53px] w-[53px] items-center justify-center rounded-2xl bg-emerald-50 "><Icon3D name="card" size={36} /></span>
          <span className="text-[16.5px] font-medium text-slate-900">Total incoming</span>
          <span className="ml-auto text-[16.5px] font-bold text-green-500">+{totals.entries.toLocaleString("fr-FR")} FCFA</span>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-5">
          <span className="flex h-[53px] w-[53px] items-center justify-center rounded-2xl bg-red-50 "><Icon3D name="withdraw" size={36} /></span>
          <span className="text-[16.5px] font-medium text-slate-900">Total outgoing</span>
          <span className="ml-auto text-[16.5px] font-bold text-red-500">-{totals.exits.toLocaleString("fr-FR")} FCFA</span>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-5">
          <span className="flex h-[53px] w-[53px] items-center justify-center rounded-2xl bg-slate-100 "><Icon3D name="chart" size={36} /></span>
          <span className="text-[16.5px] font-medium text-slate-900">Results displayed</span>
          <span className="ml-auto text-[16.5px] font-bold text-slate-900">{txs.length}</span>
        </div>
      </div>

      <p className="mt-6 text-[12.5px] font-bold tracking-[0.22em] text-slate-500">FILTERS</p>
      <div className="relative mt-3">
        <Search size={19} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by amount, operator, reference"
          className="w-full rounded-full border border-slate-300 bg-white py-[16px] pl-14 pr-5 text-[15px] font-medium placeholder:text-slate-500 focus:border-yellow-500"
        />
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5">
        <div className="relative">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full appearance-none rounded-[24px] border border-slate-300 bg-white px-5 py-[14px] text-[15px] font-medium focus:border-yellow-500">
            {TYPE_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full appearance-none rounded-[24px] border border-slate-300 bg-white px-5 py-[14px] text-[15px] font-medium focus:border-yellow-500">
            {STATUS_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
      <div className="relative mt-3.5 w-[calc(50%-7px)]">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full appearance-none rounded-[24px] border border-slate-300 bg-white px-5 py-[14px] text-[15px] font-medium focus:border-yellow-500">
          {CURRENCY_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      <div className="mt-3.5 flex justify-center gap-3.5">
        <button
          onClick={() => load(true)}
          className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[16px] font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[16px] font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <p className="mt-6 text-[12.5px] font-bold tracking-[0.22em] text-slate-500">HISTORY</p>

      {loading && <p className="mt-4 text-center text-[12.5px] font-bold text-slate-400">Loading...</p>}

      {!loading && txs.length === 0 && (
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-8 text-center text-[12.5px] font-semibold text-slate-400">
          No transactions found.
        </div>
      )}

      {groups.map(([day, items]) => (
        <div key={day}>
          <p className="mt-4 text-[13px] font-bold tracking-[0.18em] text-slate-500">{day}</p>
          <div className="stagger mt-2.5 space-y-3.5">
            {items.map((tx) => {
              const failed = tx.status === "failed";
              const pending = tx.status === "pending";
              const incoming = INCOMING.includes(tx.type);
              const time = new Date(tx.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              return (
                <Link
                  key={tx.id}
                  href={`/dashboard/transactions/${tx.id}`}
                  className={`flex items-center gap-3.5 rounded-[24px] border-[1.5px] p-[16px] transition hover:shadow-md ${
                    failed
                      ? "border-red-400 border-l-[7px] border-l-red-500 bg-red-50"
                      : pending
                        ? "border-yellow-400 border-l-[7px] border-l-yellow-500 bg-yellow-50/60"
                        : "border-green-500 border-l-[7px] border-l-green-500 bg-green-50"
                  }`}
                >
                  <span className="flex h-[49.5px] w-[49.5px] shrink-0 items-center justify-center rounded-full bg-white/80 text-[26.5px] shadow-sm">
                    <TxGlyph type={tx.type} operator={tx.operator} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-medium text-slate-900">{txTitle(tx.type, tx.operator)}</p>
                    {tx.channel === "api" && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11.5px] font-bold text-sky-600">
                        <CodeXml size={11} /> API
                      </span>
                    )}
                    <p className="mt-1 truncate text-[13px] font-medium text-slate-500">
                      {tx.operator ?? tx.label ?? "SDK Pay"} · {time}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-[16px] font-bold ${
                        failed ? "text-slate-500" : incoming ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {incoming ? "+" : "-"}{txAmount(tx)}
                    </p>
                    <span
                      className={`mt-1.5 inline-block rounded-lg border px-2.5 py-1 text-[12px] font-medium ${
                        failed
                          ? "border-red-300 bg-red-100/70 text-red-500"
                          : pending
                            ? "border-yellow-300 bg-yellow-100/70 text-yellow-700"
                            : "border-green-300 bg-green-100/70 text-green-600"
                      }`}
                    >
                      {statusLabel(tx.status)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
