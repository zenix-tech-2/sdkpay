"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Undo2 } from "lucide-react";
import { Card, statusPill, fmtTx } from "@/components/admin/ui";

export default function AdminTxDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmt, setRefundAmt] = useState("");
  const [refundReason, setRefundReason] = useState("");

  async function load() {
    const r = await fetch(`/api/admin/transactions/${id}`);
    setData(await r.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  async function act(action: "complete" | "fail") {
    if (!confirm(`${action === "complete" ? "Manually complete" : "Mark as failed"} this transaction?`)) return;
    const r = await fetch(`/api/admin/transactions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const d = await r.json();
    setMsg(d.error || `Transaction ${action === "complete" ? "completed" : "marked failed"}.`);
    load();
  }

  async function createRefund() {
    const r = await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txId: id, kind: "refund", amount: refundAmt ? Number(refundAmt) : undefined, reason: refundReason }),
    });
    const d = await r.json();
    setMsg(d.error || `Refund case ${d.refund.reference} created.`);
    setRefundOpen(false);
    setRefundAmt("");
    setRefundReason("");
  }

  if (!data?.transaction) return <p className="py-16 text-center text-[14px] font-bold text-slate-400">Loading...</p>;
  const t = data.transaction;

  function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
        <span className="text-[13px] font-medium text-slate-400">{label}</span>
        <span className={`text-right text-[13.5px] font-semibold ${mono ? "font-mono text-[12.5px]" : ""}`}>{value}</span>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/transactions" className="flex items-center gap-1 text-[13px] font-bold text-slate-500">
        <ArrowLeft size={16} /> Transactions
      </Link>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div>
          <h1 className="font-mono text-[20px] font-extrabold">{t.reference}</h1>
          <p className="text-[13px] font-medium text-slate-500">
            {t.type} · {data.user ? <Link href={`/admin/users/${data.user.id}`} className="font-bold text-sky-600">{data.user.email}</Link> : "—"}
          </p>
        </div>
        {statusPill(t.status === "success" ? "Successful" : t.status)}
      </div>

      {msg && <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-[12.5px] font-bold">{msg}</p>}

      <Card className="mt-3 !py-2">
        <Row label="Amount debited" value={fmtTx(t.amount, t.currency)} />
        <Row label="Fee" value={fmtTx(t.fee, t.currency)} />
        <Row label="Operator" value={(t.operator || "—").toUpperCase()} />
        <Row label="Phone" value={t.phone || "—"} mono />
        <Row label="Country" value={t.country || "—"} />
        <Row label="Provider" value={t.provider ? `${t.provider} (${t.providerRef || "—"})` : "—"} mono />
        <Row label="Channel" value={t.channel} />
        <Row label="Counterparty" value={t.counterparty || "—"} />
        <Row label="Created" value={new Date(t.createdAt).toLocaleString("en-US")} />
      </Card>

      {t.status === "pending" && (
        <Card className="mt-3">
          <p className="text-[14px] font-extrabold">Manual decision</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <button onClick={() => act("complete")} className="rounded-xl bg-green-500 py-3 text-[14px] font-extrabold text-white">
              ✓ Complete
            </button>
            <button onClick={() => act("fail")} className="rounded-xl bg-rose-50 py-3 text-[14px] font-extrabold text-rose-600">
              Mark failed
            </button>
          </div>
        </Card>
      )}

      {(t.type === "deposit" || t.type === "payment_received") && t.status === "success" && (
        <Card className="mt-3">
          <p className="flex items-center gap-2 text-[14px] font-extrabold">
            <Undo2 size={16} /> Refund
          </p>
          {!refundOpen ? (
            <button onClick={() => setRefundOpen(true)} className="mt-2 rounded-xl bg-slate-100 px-4 py-2.5 text-[13px] font-bold">
              Open refund case
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                value={refundAmt}
                onChange={(e) => setRefundAmt(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={`Amount (max ${fmtTx(t.amount - t.fee, t.currency)})`}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13.5px] font-bold"
              />
              <input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason (visible to merchant on execution)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13.5px] font-medium"
              />
              <button onClick={createRefund} className="w-full rounded-xl bg-[#10132e] py-2.5 text-[13.5px] font-bold text-white">
                Create case
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
