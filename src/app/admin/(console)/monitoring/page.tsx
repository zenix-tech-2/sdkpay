"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageTitle, Th, Td, agoShort } from "@/components/admin/ui";

export default function AdminMonitoring() {
  const [d, setD] = useState<any>(null);

  async function load() {
    const r = await fetch("/api/admin/monitoring");
    setD(await r.json());
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function purge() {
    if (!confirm("Purge provider events older than 30 days?")) return;
    await fetch("/api/admin/monitoring", { method: "DELETE" });
    load();
  }

  function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[10.5px] font-medium text-slate-500">{label}</p>
        <p className={`text-[16.5px] font-extrabold ${color}`}>{value}</p>
        {sub && <p className="text-[10px] font-medium text-slate-400">{sub}</p>}
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Monitoring"
        sub="System health, provider traffic and webhook delivery"
        right={
          <button onClick={purge} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[10.5px] font-bold text-slate-600 shadow-sm">
            <Trash2 size={12} /> Purge logs &gt; 30 days
          </button>
        }
      />
      {!d && <p className="py-10 text-center text-[11.5px] font-bold text-slate-400">Checking systems...</p>}
      {d && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Database" value={d.db.ok ? "Online" : "Unreachable"} sub={`${d.db.ms} ms round-trip`} color={d.db.ok ? "text-green-600" : "text-rose-600"} />
            <Stat label="AshTechPay (primary)" value={d.providers.ashtechpay.ok ? "Online" : "Unreachable"} sub={d.providers.ashtechpay.detail} color={d.providers.ashtechpay.ok ? "text-green-600" : "text-rose-600"} />
            <Stat label="SasPay (backup)" value={d.providers.saaspay.ok ? "Online" : "Unreachable"} sub={d.providers.saaspay.detail} color={d.providers.saaspay.ok ? "text-green-600" : "text-rose-600"} />
            <Stat label="Mode" value={d.mode === "auto" ? "Operational" : d.mode} sub="provider routing" color="text-green-600" />
            <Stat label="Provider calls · 24h" value={String(d.stats.calls24h)} color="text-slate-900" />
            <Stat label="Provider errors · 24h" value={String(d.stats.errors24h)} color={d.stats.errors24h ? "text-yellow-600" : "text-slate-900"} />
            <Stat label="Failed webhooks" value={String(d.stats.failedWebhooks)} color={d.stats.failedWebhooks ? "text-rose-600" : "text-slate-900"} />
            <Stat label="Transactions · 24h" value={`${d.stats.tx24h} (${d.stats.txFailed24h} failed)`} color="text-slate-900" />
          </div>

          <p className="mb-2 mt-5 text-[12.5px] font-extrabold">Top provider actions · 24h</p>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100"><Th>Action</Th><Th>Provider</Th><Th right>Requests</Th></tr></thead>
              <tbody>
                {d.topActions.map((t: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <Td mono>{t.action}</Td><Td>{t.provider}</Td><Td right>{t.count}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.topActions.length === 0 && <p className="py-6 text-center text-[11px] font-semibold text-slate-400">No traffic yet.</p>}
          </div>

          <p className="mb-2 mt-5 text-[12.5px] font-extrabold">Failed deliveries</p>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[560px]">
              <thead><tr className="border-b border-slate-100"><Th>Event</Th><Th>Provider</Th><Th>Message</Th><Th>When</Th></tr></thead>
              <tbody>
                {d.failedDeliveries.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-50 last:border-0">
                    <Td mono>{e.action}</Td><Td>{e.provider}</Td>
                    <Td><span className="line-clamp-2 block max-w-[280px] text-[11px]">{e.message || "—"}</span></Td>
                    <Td>{agoShort(e.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.failedDeliveries.length === 0 && <p className="py-6 text-center text-[11px] font-semibold text-slate-400">All webhooks delivered ✓</p>}
          </div>

          <p className="mb-2 mt-5 text-[12.5px] font-extrabold">Latest provider events</p>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[560px]">
              <thead><tr className="border-b border-slate-100"><Th>Status</Th><Th>Action</Th><Th>Provider</Th><Th>When</Th></tr></thead>
              <tbody>
                {d.latest.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-50 last:border-0">
                    <Td><span className={`inline-block h-2.5 w-2.5 rounded-full ${e.status === "error" ? "bg-rose-500" : "bg-green-500"}`} /></Td>
                    <Td mono>{e.action}</Td><Td>{e.provider}</Td><Td>{agoShort(e.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.latest.length === 0 && <p className="py-6 text-center text-[11px] font-semibold text-slate-400">No events logged yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
