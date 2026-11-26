"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle, Th, Td, Empty, statusPill, agoShort, fmtTx } from "@/components/admin/ui";

export default function AdminTransactions() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 30;

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setOffset(0);
  }, [deb, type, status, provider]);

  useEffect(() => {
    fetch(`/api/admin/transactions?q=${encodeURIComponent(deb)}&type=${type}&status=${status}&provider=${provider}&limit=${limit}&offset=${offset}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.transactions ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {});
  }, [deb, type, status, provider, offset]);

  async function exportCsv() {
    const r = await fetch(`/api/admin/transactions?q=${encodeURIComponent(deb)}&type=${type}&status=${status}&provider=${provider}&limit=100&offset=0`);
    const d = await r.json();
    const header = "reference,email,type,amount,currency,fee,status,operator,provider,created_at";
    const lines = (d.transactions ?? []).map((t: any) =>
      [t.reference, t.email ?? "", t.type, t.amount, t.currency, t.fee ?? 0, t.status, (t.operator ?? "").replace(/,/g, " "), t.provider ?? "", t.createdAt].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sdkpay-admin-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <PageTitle
        title="Transactions"
        sub={`${total} record${total === 1 ? "" : "s"}`}
        right={
          <button onClick={exportCsv} className="rounded-full bg-white px-4 py-2.5 text-[13px] font-extrabold text-slate-700 shadow-sm">
            Export CSV
          </button>
        }
      />
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference, phone, operator, email..."
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-[14px] font-medium shadow-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-sm">
          <option value="all">All types</option>
          <option value="deposit">Deposits</option>
          <option value="withdraw">Withdrawals</option>
          <option value="send_out,send_in">Transfers</option>
          <option value="payment_received">Collections</option>
          <option value="conversion">Conversions</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-sm">
          <option value="all">All statuses</option>
          <option value="success">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-sm">
          <option value="all">All providers</option>
          <option value="ashtechpay">AshTechPay</option>
          <option value="saaspay">SasPay</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Reference</Th><Th>Merchant</Th><Th>Amount</Th><Th>Provider</Th><Th>Status</Th><Th>When</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <Td mono>
                  <Link href={`/admin/transactions/${t.id}`} className="hover:text-yellow-600">{t.reference}</Link>
                  <span className="block font-sans text-[12px] text-slate-400">{t.type}</span>
                </Td>
                <Td>{t.email || "—"}</Td>
                <Td>{fmtTx(t.amount, t.currency)}</Td>
                <Td><span className="text-[12.5px] font-bold text-slate-500">{t.provider || "—"}</span></Td>
                <Td>{statusPill(t.status === "success" ? "Successful" : t.status)}</Td>
                <Td>{agoShort(t.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No transactions found.</Empty>}
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px] font-bold text-slate-500">
        <span>Showing {rows.length} of {total}</span>
        <span className="flex gap-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronLeft size={17} />
          </button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronRight size={17} />
          </button>
        </span>
      </div>
    </div>
  );
}
