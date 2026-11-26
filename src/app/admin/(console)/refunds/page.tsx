"use client";

import { useEffect, useState } from "react";
import { PageTitle, Th, Td, Empty, statusPill, agoShort, fmtTx, Pill } from "@/components/admin/ui";

export default function AdminRefunds() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState("pending");
  const [kind, setKind] = useState("all");

  async function load() {
    const r = await fetch(`/api/admin/refunds?status=${status}&kind=${kind}`);
    const d = await r.json();
    setRows(d.refunds ?? []);
  }

  useEffect(() => {
    load();
  }, [status, kind]);

  async function decide(id: string, decision: "approve" | "reject") {
    if (!confirm(`${decision === "approve" ? "Execute" : "Reject"} this case?`)) return;
    const r = await fetch("/api/admin/refunds", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    const d = await r.json();
    if (!r.ok) alert(d.error);
    load();
  }

  return (
    <div>
      <PageTitle title="Refunds & disputes" sub="Review and execute customer refunds" />
      <div className="flex flex-wrap gap-2">
        {["pending", "completed", "rejected", "all"].map((t) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-bold capitalize ${status === t ? "bg-[#10132e] text-white" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {t}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-slate-300 sm:block" />
        {["all", "refund", "dispute"].map((t) => (
          <button
            key={t}
            onClick={() => setKind(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-bold capitalize ${kind === t ? "bg-yellow-400 text-slate-900" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Case</Th><Th>Merchant</Th><Th>Amount</Th><Th>Status</Th><Th>When</Th><Th right> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <Td mono>
                  <span className="block">{r.reference}</span>
                  <span className="mt-0.5 block">
                    <Pill color={r.kind === "dispute" ? "yellow" : "blue"}>{r.kind}</Pill>
                  </span>
                  {r.reason && <span className="mt-1 block font-sans text-[12px] text-slate-400">{r.reason}</span>}
                </Td>
                <Td>
                  <span className="block font-bold">{r.fullName}</span>
                  <span className="block text-[12px] text-slate-400">{r.email}</span>
                  <span className="block font-mono text-[11.5px] text-slate-400">tx: {r.txRef || "—"}</span>
                </Td>
                <Td>{fmtTx(r.amount, r.currency)}</Td>
                <Td>{statusPill(r.status)}</Td>
                <Td>{agoShort(r.createdAt)}</Td>
                <Td right>
                  {r.status === "pending" ? (
                    <span className="inline-flex gap-1.5">
                      <button onClick={() => decide(r.id, "approve")} className="rounded-lg bg-green-500 px-3 py-1.5 text-[12px] font-extrabold text-white">
                        Execute
                      </button>
                      <button onClick={() => decide(r.id, "reject")} className="rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-extrabold text-rose-600">
                        Reject
                      </button>
                    </span>
                  ) : (
                    <span className="text-[11.5px] font-semibold text-slate-400">
                      {r.decidedAt ? agoShort(r.decidedAt) : "—"}
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No cases. Open one from any transaction.</Empty>}
      </div>
    </div>
  );
}
