"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle, Th, Td, Empty, agoShort } from "@/components/admin/ui";

export default function AdminAudit() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setOffset(0);
  }, [deb]);

  async function load() {
    const r = await fetch(`/api/admin/audit?q=${encodeURIComponent(deb)}&limit=${limit}&offset=${offset}`);
    const d = await r.json();
    setRows(d.audit ?? []);
    setTotal(d.total ?? 0);
  }

  useEffect(() => {
    load();
  }, [deb, offset]);

  async function purge() {
    if (!confirm("Purge audit entries older than 90 days? (super admin only)")) return;
    const r = await fetch("/api/admin/audit", { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) alert(d.error);
    load();
  }

  return (
    <div>
      <PageTitle
        title="Audit log"
        sub="Every admin action, tracked"
        right={
          <button onClick={purge} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
            <Trash2 size={10.8} /> Purge &gt; 90 days
          </button>
        }
      />
      <div className="relative">
        <Search size={13.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search action, admin, target..."
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-[11px] font-medium shadow-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Action</Th><Th>Admin</Th><Th>Target</Th><Th>When</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 last:border-0">
                <Td mono>{a.action}</Td>
                <Td>{a.adminEmail || "—"}</Td>
                <Td>
                  <span className="block font-mono text-[10px]">{a.target || "—"}</span>
                  {a.detail && <span className="block max-w-[260px] truncate text-[10px] text-slate-400">{a.detail}</span>}
                </Td>
                <Td>{agoShort(a.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No audit entries.</Empty>}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10.5px] font-bold text-slate-500">
        <span>Showing {rows.length} of {total}</span>
        <span className="flex gap-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronLeft size={13.5} />
          </button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-40">
            <ChevronRight size={13.5} />
          </button>
        </span>
      </div>
    </div>
  );
}
