"use client";

import { useEffect, useState } from "react";
import { Search, Power, Trash2, ExternalLink } from "lucide-react";
import { PageTitle, Th, Td, Empty, Pill, agoShort } from "@/components/admin/ui";

export default function AdminLinks() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  async function load() {
    const r = await fetch(`/api/admin/links?q=${encodeURIComponent(deb)}`);
    const d = await r.json();
    setRows(d.links ?? []);
  }

  useEffect(() => {
    load();
  }, [deb]);

  async function toggle(l: any) {
    await fetch("/api/admin/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, isActive: !l.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment link?")) return;
    await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageTitle title="Payment links" sub="All merchant checkout links" />
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, slug, merchant..."
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-[14px] font-medium shadow-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Link</Th><Th>Merchant</Th><Th>Amount</Th><Th>Collected</Th><Th>Status</Th><Th right>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 last:border-0">
                <Td>
                  <span className="block font-bold">{l.title}</span>
                  <span className="block font-mono text-[12px] text-slate-400">/pay/{l.slug} · {l.paymentsCount} pmts · {agoShort(l.createdAt)}</span>
                </Td>
                <Td>{l.email || "—"}</Td>
                <Td>{l.amount ? `${l.amount.toLocaleString("en-US")} ${l.currency}` : "Free"}</Td>
                <Td>{l.totalCollected.toLocaleString("en-US")}</Td>
                <Td><Pill color={l.isActive ? "green" : "gray"}>{l.isActive ? "Active" : "Off"}</Pill></Td>
                <Td right>
                  <span className="inline-flex gap-1.5">
                    <a href={`/pay/${l.slug}`} target="_blank" className="rounded-lg bg-slate-100 p-2 text-slate-600" title="Open">
                      <ExternalLink size={14} />
                    </a>
                    <button onClick={() => toggle(l)} className="rounded-lg bg-slate-100 p-2 text-slate-600" title="Toggle">
                      <Power size={14} />
                    </button>
                    <button onClick={() => remove(l.id)} className="rounded-lg bg-red-50 p-2 text-red-500" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No links found.</Empty>}
      </div>
    </div>
  );
}
