"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Card, Th, Td, Empty, statusPill, agoShort, fmtTx, Pill } from "@/components/admin/ui";
import BalanceAdjust from "@/components/admin/BalanceAdjust";

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    const r = await fetch(`/api/admin/users/${id}`);
    const d = await r.json();
    setData(d);
    if (d.user) setNote(d.user.internalNote || "");
  }

  useEffect(() => {
    load();
  }, [id]);

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  if (!data?.user) return <p className="py-16 text-center text-[12.5px] font-bold text-slate-400">Loading...</p>;
  const u = data.user;

  function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
        <span className="text-[11.5px] font-medium text-slate-400">{label}</span>
        <span className={`text-right text-[12px] font-semibold text-slate-800 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/users" className="flex items-center gap-1 text-[11.5px] font-bold text-slate-500">
        <ArrowLeft size={14} /> Users
      </Link>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[21px] font-extrabold">{u.fullName}</h1>
          <p className="text-[11.5px] font-medium text-slate-500">{u.email}</p>
        </div>
        <span className="flex gap-1.5">
          {statusPill(u.status)}
          {statusPill(u.kycStatus === "verified" ? "Approved" : u.kycStatus)}
        </span>
      </div>

      <Card className="mt-3 !p-4">
        <Row label="Phone" value={u.phone} />
        <Row label="Country" value={`${u.country} (${u.countryCode})`} />
        <Row label="Username" value={`@${u.username}`} />
        <Row label="Role" value={u.role} />
        <Row label="Joined" value={new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        <Row label="Last login" value={u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"} />
        <Row label="Active sessions" value={String(data.meta?.activeSessions ?? 0)} />
        <Row label="Webhook URL" value={u.webhookUrl || "—"} mono />
        <Row
          label="Balances"
          value={`${u.balanceXaf.toLocaleString("en-US")} XAF · ${u.balanceXof.toLocaleString("en-US")} XOF · ${(u.balanceUsdt / 10000).toFixed(2)} USDT`}
        />
        <div className="flex items-center justify-between gap-3 pt-2.5">
          <span className="text-[11.5px] font-medium text-slate-400">User ID</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(u.id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex items-center gap-1.5 font-mono text-[10.5px] text-slate-500"
          >
            {u.id.slice(0, 13)}... {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
        </div>
      </Card>

      <p className="mb-2 mt-5 text-[12.5px] font-extrabold">KYC submissions</p>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px]">
          <thead><tr className="border-b border-slate-100"><Th>Submitted</Th><Th>Document</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {(data.kyc ?? []).map((k: any) => (
              <tr key={k.id} className="border-b border-slate-50 last:border-0">
                <Td>{new Date(k.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Td>
                <Td>{k.idType}</Td>
                <Td>{statusPill(k.status)}</Td>
                <Td right><Link href={`/admin/kyc/${k.id}`} className="text-[11.5px] font-bold text-sky-600">Review ›</Link></Td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data.kyc ?? []).length === 0 && <Empty>No submissions.</Empty>}
      </div>

      <p className="mb-2 mt-5 text-[12.5px] font-extrabold">API keys</p>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px]">
          <thead><tr className="border-b border-slate-100"><Th>Name</Th><Th>Env</Th><Th>Key</Th><Th>Status</Th></tr></thead>
          <tbody>
            {(data.keys ?? []).map((k: any) => (
              <tr key={k.id} className="border-b border-slate-50 last:border-0">
                <Td>{k.name}</Td>
                <Td><Pill color={k.isLive ? "green" : "gray"}>{k.isLive ? "Live" : "Test"}</Pill></Td>
                <Td mono>••••{k.keyPrefix}</Td>
                <Td><Pill color="green">Active</Pill></Td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data.keys ?? []).length === 0 && <Empty>No keys.</Empty>}
      </div>

      <p className="mb-2 mt-5 text-[12.5px] font-extrabold">Recent transactions</p>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px]">
          <thead><tr className="border-b border-slate-100"><Th>Reference</Th><Th>Amount</Th><Th>Status</Th><Th>When</Th></tr></thead>
          <tbody>
            {(data.transactions ?? []).map((t: any) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0">
                <Td mono><Link href={`/admin/transactions/${t.id}`} className="hover:text-yellow-600">{t.reference}</Link></Td>
                <Td>{fmtTx(t.amount, t.currency)}</Td>
                <Td>{statusPill(t.status === "success" ? "Successful" : t.status)}</Td>
                <Td>{agoShort(t.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data.transactions ?? []).length === 0 && <Empty>No transactions.</Empty>}
      </div>

      <Card className="mt-4">
        <p className="text-[12.5px] font-extrabold">Account controls</p>
        <div className="mt-2.5 flex gap-2">
          {u.status === "active" ? (
            <button onClick={() => patch({ status: "suspended" })} className="rounded-xl bg-rose-50 px-4 py-2 text-[11.5px] font-bold text-rose-600">
              Suspend account
            </button>
          ) : (
            <button onClick={() => patch({ status: "active" })} className="rounded-xl bg-green-100 px-4 py-2 text-[11.5px] font-bold text-green-700">
              Reactivate account
            </button>
          )}
        </div>
      </Card>

      <BalanceAdjust userId={id} onDone={load} />

      <Card className="mt-4">
        <p className="text-[12.5px] font-extrabold">Internal note</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Only visible to admins..."
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-[12px] font-medium"
        />
        <button
          onClick={async () => {
            await patch({ internalNote: note });
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="mt-2 rounded-xl bg-slate-100 px-4 py-2 text-[11.5px] font-bold"
        >
          {saved ? "Saved!" : "Save note"}
        </button>
      </Card>
    </div>
  );
}
