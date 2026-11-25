import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  ShieldCheck, Clock3, Users, ArrowRight, BadgeDollarSign, Wallet, Receipt, CircleSlash,
  ArrowUpRight, Link2, Megaphone, Wrench, Sparkles, Gauge,
} from "lucide-react";
import { db } from "@/db";
import { kycSubmissions, users, transactions, paymentLinks, accounts } from "@/db/schema";
import { fmtAmount, fmtTime, txTitle } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [kycStats] = await db.select({
    pending: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'pending')::int`,
    approved: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'approved')::int`,
    rejected: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'rejected')::int`,
  }).from(kycSubmissions);

  const [userStats] = await db.select({
    total: sql<number>`count(*)::int`,
    verified: sql<number>`count(*) filter (where ${users.kycStatus} = 'verified')::int`,
    suspended: sql<number>`count(*) filter (where ${users.status} = 'suspended')::int`,
    admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
  }).from(users);

  const [txStats] = await db.select({
    volume: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.status} = 'completed'), 0)`,
    count: sql<number>`count(*)::int`,
    fees: sql<string>`coalesce(sum(${transactions.fee}) filter (where ${transactions.status} = 'completed'), 0)`,
    pendingCount: sql<number>`count(*) filter (where ${transactions.status} = 'pending')::int`,
  }).from(transactions);

  const [linkStats] = await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where ${paymentLinks.active})::int`,
    collected: sql<string>`coalesce(sum(${paymentLinks.collected}), 0)`,
  }).from(paymentLinks);

  const [walletStats] = await db.select({
    xaf: sql<string>`coalesce(sum(${accounts.balance}) filter (where ${accounts.currency} = 'XAF'), 0)`,
    usdt: sql<string>`coalesce(sum(${accounts.balance}) filter (where ${accounts.currency} = 'USDT'), 0)`,
  }).from(accounts);

  const series = await db
    .select({
      day: sql<string>`to_char(${transactions.createdAt}, 'DD Mon')`,
      value: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.direction} = 'credit' and ${transactions.status} = 'completed'), 0)`,
    })
    .from(transactions)
    .groupBy(sql`date_trunc('day', ${transactions.createdAt}), to_char(${transactions.createdAt}, 'DD Mon')`)
    .orderBy(sql`date_trunc('day', ${transactions.createdAt})`)
    .limit(14);
  const maxBar = Math.max(...series.map((s) => Number(s.value)), 1);

  const recentTx = await db
    .select({ tx: transactions, user: users })
    .from(transactions)
    .innerJoin(users, eq(users.id, transactions.userId))
    .orderBy(desc(transactions.createdAt))
    .limit(6);

  const recentKyc = await db
    .select({ sub: kycSubmissions, user: users })
    .from(kycSubmissions)
    .innerJoin(users, eq(users.id, kycSubmissions.userId))
    .orderBy(desc(kycSubmissions.createdAt))
    .limit(5);

  const kpis = [
    { label: "Pending KYC", value: String(kycStats?.pending ?? 0), sub: `${kycStats?.approved ?? 0} approved · ${kycStats?.rejected ?? 0} rejected`, icon: Clock3, tint: "text-[#FFBD0D] border-[#FFBD0D]/20 bg-[#FFBD0D]/10", href: "/admin/kyc?status=pending" },
    { label: "Verified users", value: String(userStats?.verified ?? 0), sub: `${userStats?.total ?? 0} total · ${userStats?.admins ?? 0} admins`, icon: ShieldCheck, tint: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10", href: "/admin/users?kyc=verified" },
    { label: "Suspended", value: String(userStats?.suspended ?? 0), sub: "Tap to review & restore", icon: CircleSlash, tint: "text-red-400 border-red-400/20 bg-red-400/10", href: "/admin/users?status=suspended" },
    { label: "Fees collected", value: `${fmtAmount(Number(txStats?.fees ?? 0))} FCFA`, sub: "All time · completed txs", icon: Receipt, tint: "text-violet-400 border-violet-400/20 bg-violet-400/10", href: "/admin/transactions" },
  ];

  const statusPill = (s: string) =>
    s === "approved" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
    : s === "rejected" ? "bg-red-400/10 text-red-400 border-red-400/30"
    : "bg-amber-400/10 text-amber-300 border-amber-400/30";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Gauge size={14} /> Control plane</p>
          <h1 className="mt-1 text-[30px] font-black tracking-tight text-white sm:text-[36px]">Operations overview</h1>
          <p className="text-[12.5px] text-white/45">Ledger, compliance and app control at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/control" className="flex h-11 items-center gap-2 rounded-xl border border-[#FFBD0D]/30 bg-[#FFBD0D]/10 px-4 text-[12px] font-extrabold text-[#FFBD0D] transition hover:bg-[#FFBD0D]/20"><Wrench size={15} /> Control centre</Link>
          <Link href="/admin/broadcast" className="flex h-11 items-center gap-2 rounded-xl bg-[#FFBD0D] px-4 text-[12px] font-extrabold text-[#232054] transition hover:brightness-105"><Megaphone size={15} /> Broadcast</Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href} className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${k.tint}`}>
              <Icon size={20} />
              <p className="mt-2.5 text-[24px] font-black leading-none tracking-tight text-white sm:text-[28px]">{k.value}</p>
              <p className="mt-1 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-white/40">{k.label}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white/35">{k.sub}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        {/* volume chart + financial strip */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold text-white/80">Incoming volume — last days</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live ledger</span>
          </div>
          <svg viewBox="0 0 320 150" className="mt-3 w-full" role="img" aria-label="Incoming volume per day">
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2="320" y1={130 - f * 100} y2={130 - f * 100} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />)}
            {series.map((s, i) => {
              const bw = 320 / Math.max(series.length, 1) - 6;
              const x = i * (320 / Math.max(series.length, 1)) + 3;
              const h = Math.max(5, (Number(s.value) / maxBar) * 92);
              return (
                <g key={i}>
                  <rect x={x} y={130 - h} width={bw} height={h} rx="3.5" className="fill-[#FFBD0D]/80" />
                  <text x={x + bw / 2} y="145" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{s.day.split(" ")[0]}</text>
                </g>
              );
            })}
          </svg>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Volume (completed)", `${fmtAmount(Number(txStats?.volume ?? 0))} FCFA`],
              ["Transactions", String(txStats?.count ?? 0)],
              ["Pending now", String(txStats?.pendingCount ?? 0)],
              ["Link sales", `${fmtAmount(Number(linkStats?.collected ?? 0))} FCFA`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <p className="text-[14px] font-black leading-tight text-white">{v}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/35">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-white/40">
            <p className="flex items-center gap-2"><Wallet size={13} className="text-sky-400" /> Custody XAF: <span className="text-white/70">{fmtAmount(Number(walletStats?.xaf ?? 0))} FCFA</span></p>
            <p className="flex items-center gap-2"><BadgeDollarSign size={13} className="text-emerald-400" /> Custody USDT: <span className="text-white/70">{Number(walletStats?.usdt ?? 0).toFixed(4)}</span></p>
            <p className="flex items-center gap-2"><Link2 size={13} className="text-violet-400" /> Links: <span className="text-white/70">{linkStats?.active ?? 0}/{linkStats?.total ?? 0} active</span></p>
            <p className="flex items-center gap-2"><Receipt size={13} className="text-amber-400" /> Fees: <span className="text-white/70">{fmtAmount(Number(txStats?.fees ?? 0))} FCFA</span></p>
          </div>
        </section>

        {/* pending KYC — approve fast */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] xl:col-span-5">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <p className="text-[13px] font-extrabold text-white/80">Verification queue</p>
            <Link href="/admin/kyc" className="flex items-center gap-1 text-[11px] font-bold text-[#FFBD0D] hover:underline">Open queue <ArrowRight size={12} /></Link>
          </div>
          <ul className="divide-y divide-white/5">
            {recentKyc.map(({ sub, user }) => (
              <li key={sub.id}>
                <Link href={`/admin/kyc/${sub.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.03]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFBD0D]/10 text-[10px] font-black text-[#FFBD0D]">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold text-white/85">{sub.fullName}</span><span className="block text-[10px] text-white/35">{sub.docType.replace("_", " ")} · {user.email}</span></span>
                  <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusPill(sub.status)}`}>{sub.status}</span>
                </Link>
              </li>
            ))}
            {recentKyc.length === 0 && <li className="px-5 py-8 text-center text-[12px] text-white/35">Queue is clear — nothing waiting.</li>}
          </ul>
        </section>
      </div>

      {/* recent transactions */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <p className="flex items-center gap-2 text-[13px] font-extrabold text-white/80"><ArrowUpRight size={15} className="text-[#FFBD0D]" /> Latest transactions</p>
          <Link href="/admin/transactions" className="flex items-center gap-1 text-[11px] font-bold text-[#FFBD0D] hover:underline">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[11.5px]">
            <thead className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
              <tr className="border-b border-white/5"><th className="px-5 py-2.5">User</th><th className="px-5 py-2.5">Type</th><th className="px-5 py-2.5">Amount</th><th className="px-5 py-2.5">Status</th><th className="px-5 py-2.5">Provider</th><th className="px-5 py-2.5">Time</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTx.map(({ tx, user }) => (
                <tr key={tx.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-2.5"><span className="block max-w-[150px] truncate font-bold text-white/80">{user.fullName}</span><span className="block max-w-[150px] truncate text-[10px] text-white/35">{user.email}</span></td>
                  <td className="px-5 py-2.5 text-white/60">{txTitle(tx)}</td>
                  <td className={`px-5 py-2.5 font-extrabold ${tx.direction === "credit" ? "text-emerald-400" : "text-red-400"}`}>{tx.direction === "credit" ? "+" : "-"}{fmtAmount(Math.abs(Number(tx.net)))} {tx.currency === "USDT" ? "USDT" : "FCFA"}</td>
                  <td className="px-5 py-2.5"><span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase ${tx.status === "completed" ? "border-emerald-400/30 text-emerald-400" : tx.status === "failed" ? "border-red-400/30 text-red-400" : "border-amber-400/30 text-amber-300"}`}>{tx.status}</span></td>
                  <td className="px-5 py-2.5 text-white/45">{tx.provider}</td>
                  <td className="px-5 py-2.5 text-white/40">{fmtTime(tx.createdAt)}</td>
                </tr>
              ))}
              {recentTx.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-white/35">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* quick jumps */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { href: "/admin/kyc", label: "KYC queue", icon: ShieldCheck },
          { href: "/admin/users", label: "User control", icon: Users },
          { href: "/admin/fees", label: "Fees & limits", icon: Receipt },
          { href: "/admin/updates", label: "Publish release", icon: Sparkles },
        ].map((q) => {
          const Icon = q.icon;
          return <Link key={q.href} href={q.href} className="flex h-12 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 text-[11.5px] font-extrabold text-white/55 transition hover:border-[#FFBD0D]/30 hover:text-white"><Icon size={15} className="text-[#FFBD0D]" />{q.label}</Link>;
        })}
      </div>
    </>
  );
}
