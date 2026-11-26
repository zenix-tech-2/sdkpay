"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle, Th, Td, Empty, statusPill, agoShort } from "@/components/admin/ui";

interface Row {
  id: string;
  fullName: string;
  username: string;
  email: string;
  country: string;
  status: string;
  kycStatus: string;
  balanceXaf: number;
  balanceXof: number;
  balanceUsdt: number;
  createdAt: string;
}

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");
  const [status, setStatus] = useState("all");
  const [kyc, setKyc] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 30;

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setOffset(0);
  }, [deb, status, kyc]);

  useEffect(() => {
    fetch(`/api/admin/users?q=${encodeURIComponent(deb)}&status=${status}&kyc=${kyc}&limit=${limit}&offset=${offset}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.users ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {});
  }, [deb, status, kyc, offset]);

  return (
    <div>
      <PageTitle title="Users" sub={`${total} account${total === 1 ? "" : "s"}`} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, username, phone..."
            className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 text-[12.5px] font-medium shadow-sm focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl bg-white px-4 py-3 text-[12px] font-bold shadow-sm">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={kyc} onChange={(e) => setKyc(e.target.value)} className="rounded-2xl bg-white px-4 py-3 text-[12px] font-bold shadow-sm">
            <option value="all">All KYC</option>
            <option value="pending">Pending</option>
            <option value="review">Review</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>User</Th><Th>Country</Th><Th>Balances</Th><Th>KYC</Th><Th>Status</Th><Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <Td>
                  <Link href={`/admin/users/${u.id}`} className="block font-bold hover:text-yellow-600">{u.fullName}</Link>
                  <span className="block text-[10.5px] text-slate-400">{u.email}</span>
                </Td>
                <Td>{u.country}</Td>
                <Td>
                  <span className="block text-[11px]">{u.balanceXaf.toLocaleString("en-US")} XAF</span>
                  <span className="block text-[11px] text-slate-400">{u.balanceXof.toLocaleString("en-US")} XOF · {(u.balanceUsdt / 10000).toFixed(2)} USDT</span>
                </Td>
                <Td>{statusPill(u.kycStatus)}</Td>
                <Td>{statusPill(u.status)}</Td>
                <Td>{agoShort(u.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No users found.</Empty>}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11.5px] font-bold text-slate-500">
        <span>Showing {rows.length} of {total}</span>
        <span className="flex gap-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronLeft size={15} />
          </button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronRight size={15} />
          </button>
        </span>
      </div>
    </div>
  );
}
