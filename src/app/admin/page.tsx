import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ShieldCheck, ShieldX, Clock3, Users, ArrowRight, BadgeDollarSign, ListChecks, FileSearch, UserCheck, XCircle } from "lucide-react";
import { db } from "@/db";
import { kycSubmissions, users, transactions } from "@/db/schema";
import { fmtAmount, fmtDayLabel } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [kycStats] = await db.select({
    pending: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'pending')::int`,
    approved: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'approved')::int`,
    rejected: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'rejected')::int`,
  }).from(kycSubmissions);

  const [userStats] = await db.select({
    total: sql<number>`count(*)::int`,
    verified: sql<number>`count(*) filter (where ${users.kycStatus} = 'verified')::int`,
  }).from(users);

  const [vol] = await db.select({
    volume: sql<string>`coalesce(sum(${transactions.net}) filter (where ${transactions.status} = 'completed'), 0)`,
    count: sql<number>`count(*)::int`,
  }).from(transactions);

  const recent = await db
    .select({ sub: kycSubmissions, user: users })
    .from(kycSubmissions)
    .innerJoin(users, eq(users.id, kycSubmissions.userId))
    .orderBy(desc(kycSubmissions.createdAt))
    .limit(5);

  const kpis = [
    { label: "Pending KYC reviews", value: String(kycStats?.pending ?? 0), icon: Clock3, tile: "bg-amber-50 text-amber-600", href: "/admin/kyc?status=pending" },
    { label: "Verified accounts", value: String(userStats?.verified ?? 0), icon: ShieldCheck, tile: "bg-emerald-50 text-emerald-600", href: "/admin/kyc?status=approved" },
    { label: "Rejected submissions", value: String(kycStats?.rejected ?? 0), icon: ShieldX, tile: "bg-red-50 text-red-500", href: "/admin/kyc?status=rejected" },
    { label: "Total users", value: String(userStats?.total ?? 0), icon: Users, tile: "bg-indigo-50 text-indigo-600", href: "/admin/kyc?status=all" },
  ];

  const statusPill = (s: string) =>
    s === "approved" ? <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-emerald-700">Approved</span>
    : s === "rejected" ? <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-red-600">Rejected</span>
    : <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-amber-700">Pending</span>;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Overview</h1>
          <p className="text-[13px] text-slate-500">Compliance pipeline and platform activity at a glance.</p>
        </div>
        <Link href="/admin/kyc" className="flex h-12 items-center gap-2 rounded-2xl bg-navy px-5 text-[13.5px] font-bold text-white transition hover:bg-navy3"><ListChecks size={17} /> Open KYC queue <ArrowRight size={15} /></Link>
      </div>

      {/* KPI grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.tile}`}><Icon size={21} /></span>
              <p className="mt-3 text-[26px] font-black leading-none text-ink">{k.value}</p>
              <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{k.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        {/* recent submissions */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-[14px] font-extrabold text-ink">Latest verification requests</p>
            <Link href="/admin/kyc" className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:underline">View all <ArrowRight size={13} /></Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map(({ sub, user }) => (
              <li key={sub.id}>
                <Link href={`/admin/kyc/${sub.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/90 text-[12px] font-black text-gold">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-ink">{sub.fullName}</span>
                    <span className="block text-[11px] text-slate-400">{sub.docType === "national_id" ? "National ID" : sub.docType === "passport" ? "Passport" : "Driver's licence"} · {fmtDayLabel(sub.createdAt)}</span>
                  </span>
                  {statusPill(sub.status)}
                </Link>
              </li>
            ))}
            {recent.length === 0 && <li className="px-5 py-8 text-center text-[13px] text-slate-400">No submissions yet.</li>}
          </ul>
        </section>

        {/* how review works + volume */}
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-[14px] font-extrabold text-ink">Review checklist</p>
            <ol className="mt-3 space-y-2.5 text-[12.5px] text-slate-600">
              {[
                ["1", "Open the submission and check document authenticity (hologram, MRZ, expiry)."],
                ["2", "Match the selfie against the document portrait — same person, no filters."],
                ["3", "Confirm the name and date of birth match the account profile."],
                ["4", "Approve, or reject with a clear reason the user can act on."],
              ].map(([n, t]) => (
                <li key={n} className="flex items-start gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-black text-white">{n}</span>{t}</li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400"><FileSearch size={13} /> SLA: first review within 24 business hours</p>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-5 text-white shadow-md">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55"><BadgeDollarSign size={14} /> Processed volume</p>
            <p className="mt-2 text-[32px] font-black tracking-tight">{fmtAmount(Number(vol?.volume ?? 0))} <span className="text-[15px] text-gold">FCFA</span></p>
            <p className="mt-1 text-[11.5px] text-white/55">{vol?.count ?? 0} transactions · all time</p>
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] font-semibold text-white/60"><UserCheck size={13} /> {userStats?.verified ?? 0} verified merchants · {userStats?.total ?? 0} total accounts</div>
          </section>
        </div>
      </div>
    </>
  );
}
