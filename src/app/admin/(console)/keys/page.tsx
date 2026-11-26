"use client";

import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { PageTitle, Th, Td, Empty, Pill, agoShort } from "@/components/admin/ui";

export default function AdminKeys() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  async function load() {
    const r = await fetch(`/api/admin/keys?q=${encodeURIComponent(deb)}`);
    const d = await r.json();
    setRows(d.keys ?? []);
  }

  useEffect(() => {
    load();
  }, [deb]);

  async function revoke(id: string) {
    if (!confirm("Revoke this API key? The integration will stop working immediately.")) return;
    await fetch(`/api/admin/keys?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageTitle title="API keys" sub="All merchant keys across test and live" />
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search key name or merchant email..."
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-[12.5px] font-medium shadow-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Merchant</Th><Th>Name</Th><Th>Env</Th><Th>Key</Th><Th>Created</Th><Th right> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k) => (
              <tr key={k.id} className="border-b border-slate-50 last:border-0">
                <Td>
                  <span className="block font-bold">{k.fullName}</span>
                  <span className="block text-[10.5px] text-slate-400">{k.email}</span>
                </Td>
                <Td>{k.name}</Td>
                <Td><Pill color={k.isLive ? "green" : "gray"}>{k.isLive ? "Live" : "Test"}</Pill></Td>
                <Td mono>••••{k.keyPrefix}</Td>
                <Td>{agoShort(k.createdAt)}</Td>
                <Td right>
                  <button onClick={() => revoke(k.id)} className="rounded-lg bg-red-50 p-2 text-red-500" title="Revoke">
                    <Trash2 size={13} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No keys found.</Empty>}
      </div>
    </div>
  );
}
