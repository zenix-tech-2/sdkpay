"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Wallet, ArrowLeftRight, ShieldCheck, Headset, Link2, ArrowUpRight } from "lucide-react";
import { Card, PageTitle, Pill, Th, Td, Empty, agoShort, fmtTx } from "@/components/admin/ui";

interface Overview {
  stats: Record<string, number>;
  series: { day: string; users: number; txs: number; volume: number }[];
  latestUsers: { id: string; fullName: string; email: string; country: string; createdAt: string }[];
  latestTx: { id: string; reference: string; type: string; amount: number; currency: string; status: string; email: string | null; createdAt: string }[];
  latestTickets: { id: string; subject: string; status: string; email: string | null; createdAt: string }[];
}

export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const s = data?.stats ?? {};
  const cards = [
    { icon: Users, bg: "bg-blue-50 text-blue-600", n: s.users ?? 0, l: "Total users", sub: `${s.newUsers7 ?? 0} new in 7d`, href: "/admin/users" },
    { icon: Wallet, bg: "bg-green-50 text-green-600", n: `${(s.revenue30d ?? 0).toLocaleString("en-US")}`, l: "Fee revenue (30d)", sub: "XAF/XOF fees", href: "/admin/transactions" },
    { icon: ArrowLeftRight, bg: "bg-violet-50 text-violet-600", n: s.tx24h ?? 0, l: "Transactions (24h)", sub: `${(s.vol24h ?? 0).toLocaleString("en-US")} volume`, href: "/admin/transactions" },
    { icon: ShieldCheck, bg: "bg-yellow-50 text-yellow-600", n: s.kycPending ?? 0, l: "Pending KYC", sub: "Awaiting review", href: "/admin/kyc" },
    { icon: Headset, bg: "bg-orange-50 text-orange-600", n: s.ticketsOpen ?? 0, l: "Open tickets", sub: "Support queue", href: "/admin/support" },
    { icon: Link2, bg: "bg-sky-50 text-sky-600", n: s.links ?? 0, l: "Payment links", sub: `${s.refundsPending ?? 0} pending refunds`, href: "/admin/links" },
  ];
  const maxVol = Math.max(1, ...(data?.series.map((x) => x.volume) ?? [1]));

  return (
    <div>
      <PageTitle title="Overview" sub="Platform health and what needs your attention" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.l} href={c.href} className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg}`}>
                <c.icon size={22} />
              </span>
              <ArrowUpRight size={17} className="text-slate-300" />
            </div>
            <p className="mt-3 truncate text-[26px] font-extrabold text-slate-900">{c.n}</p>
            <p className="text-[13.5px] font-bold">{c.l}</p>
            <p className="text-[12px] font-medium text-slate-400">{c.sub}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <p className="text-[15px] font-extrabold">Volume · last 14 days</p>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {(data?.series ?? []).map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.txs} txs`}>
              <div className="flex w-full items-end gap-0.5">
                <div className="flex-1 rounded-t bg-yellow-400" style={{ height: `${Math.max(3, (d.volume / maxVol) * 110)}px` }} />
              </div>
              <span className="hidden text-[9px] font-bold text-slate-400 sm:block">{d.day.split(" ")[1]}</span>
            </div>
          ))}
          {!data && <p className="w-full text-center text-[12px] text-slate-400">Loading...</p>}
        </div>
        <div className="mt-2 flex gap-4 text-[11.5px] font-bold text-slate-500">
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" /> Volume (FCFA)</span>
          <span className="ml-auto">{(data?.series ?? []).reduce((a, b) => a + b.txs, 0)} txs · {(data?.series ?? []).reduce((a, b) => a + b.users, 0)} new users</span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="!p-0 overflow-hidden">
          <p className="px-5 pb-2 pt-4 text-[15px] font-extrabold">Latest transactions</p>
          <table className="w-full">
            <thead><tr className="border-y border-slate-100"><Th>Reference</Th><Th>Amount</Th><Th>Status</Th></tr></thead>
            <tbody>
              {(data?.latestTx ?? []).map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <Td mono>{t.reference}</Td>
                  <Td>{fmtTx(t.amount, t.currency)}</Td>
                  <Td><Pill color={t.status === "success" ? "green" : t.status === "failed" ? "red" : "yellow"}>{t.status}</Pill></Td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data || data.latestTx.length === 0) && <Empty>No transactions yet.</Empty>}
        </Card>
        <Card className="!p-0 overflow-hidden">
          <p className="px-5 pb-2 pt-4 text-[15px] font-extrabold">Latest users</p>
          <table className="w-full">
            <thead><tr className="border-y border-slate-100"><Th>User</Th><Th>Country</Th><Th>When</Th></tr></thead>
            <tbody>
              {(data?.latestUsers ?? []).map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <Td><span className="block font-bold">{u.fullName}</span><span className="block text-[12px] text-slate-400">{u.email}</span></Td>
                  <Td>{u.country}</Td>
                  <Td>{agoShort(u.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data || data.latestUsers.length === 0) && <Empty>No users yet.</Empty>}
        </Card>
      </div>
    </div>
  );
}
