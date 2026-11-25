import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import {
  ChevronLeft, Mail, Phone, MapPin, Calendar, Fingerprint, Link2, Wallet, ShieldCheck,
  Ban, CheckCircle2, Crown, User, RefreshCw, Trash2, CircleDollarSign,
} from "lucide-react";
import { db } from "@/db";
import { users, accounts, transactions, kycSubmissions, paymentLinks, referrals } from "@/db/schema";
import { setUserStatus, setUserRole, setUserKyc, deleteUserAdmin } from "@/lib/admin-actions";
import { BalanceAdjustForm, TempPasswordButton } from "@/components/admin-client";
import { fmtAmount, fmtDateTime, txTitle, fmtDayLabel } from "@/lib/format";

const KYC_PILL: Record<string, string> = {
  verified: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  rejected: "border-red-400/30 bg-red-400/10 text-red-400",
  none: "border-white/10 bg-white/5 text-white/45",
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) notFound();

  const [wallets, recentTx, kycRows, links, referralRows] = await Promise.all([
    db.select().from(accounts).where(eq(accounts.userId, user.id)),
    db.select().from(transactions).where(eq(transactions.userId, user.id)).orderBy(desc(transactions.createdAt)).limit(8),
    db.select().from(kycSubmissions).where(eq(kycSubmissions.userId, user.id)).orderBy(desc(kycSubmissions.createdAt)).limit(3),
    db.select().from(paymentLinks).where(eq(paymentLinks.userId, user.id)),
    db.select().from(referrals).where(eq(referrals.referrerId, user.id)),
  ]);

  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition hover:text-white"><ChevronLeft size={15} /> All users</Link>

      {/* header */}
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFBD0D]/15 text-[19px] font-black text-[#FFBD0D]">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-black tracking-tight text-white">{user.fullName}</h1>
            <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${KYC_PILL[user.kycStatus]}`}>{user.kycStatus}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${user.role === "admin" ? "border-[#FFBD0D]/40 bg-[#FFBD0D]/10 text-[#FFBD0D]" : "border-white/10 text-white/40"}`}>{user.role}</span>
            {user.status === "suspended" && <span className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400">Suspended</span>}
          </div>
          <p className="mt-0.5 text-[12px] text-white/50">@{user.username} · <span className="font-mono">{user.publicId}</span></p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-white/40">
            <span className="flex items-center gap-1"><Mail size={11} /> {user.email}</span>
            <span className="flex items-center gap-1"><Phone size={11} /> {user.phone ?? "—"}</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> {user.country ?? "—"}</span>
            <span className="flex items-center gap-1"><Calendar size={11} /> Joined {fmtDayLabel(user.createdAt)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/35">Primary balance</p>
          <p className="mt-0.5 text-[26px] font-black text-white">{fmtAmount(Number(wallets.find((w) => w.isPrimary)?.balance ?? 0))} <span className="text-[13px] text-[#FFBD0D]">FCFA</span></p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* ===== control column ===== */}
        <div className="space-y-4 xl:col-span-4">
          {/* status & role */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-[13px] font-extrabold text-white/80">Account control</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {user.status === "active" ? (
                <form action={setUserStatus.bind(null, user.id, "suspended")}>
                  <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 text-[12px] font-extrabold text-red-300 transition hover:bg-red-500/20"><Ban size={15} /> Suspend</button>
                </form>
              ) : (
                <form action={setUserStatus.bind(null, user.id, "active")}>
                  <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-[12px] font-extrabold text-emerald-300 transition hover:bg-emerald-500/20"><CheckCircle2 size={15} /> Restore</button>
                </form>
              )}
              {user.role === "user" ? (
                <form action={setUserRole.bind(null, user.id, "admin")}>
                  <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#FFBD0D]/40 bg-[#FFBD0D]/10 text-[12px] font-extrabold text-[#FFBD0D] transition hover:bg-[#FFBD0D]/20"><Crown size={15} /> Make admin</button>
                </form>
              ) : (
                <form action={setUserRole.bind(null, user.id, "user")}>
                  <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-[12px] font-extrabold text-white/60 transition hover:text-white"><User size={15} /> Demote to user</button>
                </form>
              )}
            </div>
            {/* KYC override */}
            <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">KYC override</p>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {(["none", "pending", "verified", "rejected"] as const).map((k) => (
                <form key={k} action={setUserKyc.bind(null, user.id, k)}>
                  <button type="submit" className={`h-9 w-full rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition ${user.kycStatus === k ? "bg-[#FFBD0D] text-[#232054]" : "bg-white/5 text-white/45 hover:text-white"}`}>{k}</button>
                </form>
              ))}
            </div>
          </section>

          {/* balance adjustment */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-white/80"><CircleDollarSign size={16} className="text-[#FFBD0D]" /> Balance adjustment</p>
            <p className="mt-0.5 text-[10.5px] text-white/35">Audited — writes a ledger entry and notifies the user.</p>
            <div className="mt-3"><BalanceAdjustForm userId={user.id} /></div>
          </section>

          {/* security */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-[13px] font-extrabold text-white/80">Security</p>
            <div className="mt-3"><TempPasswordButton userId={user.id} /></div>
            {user.role !== "admin" && (
              <form action={deleteUserAdmin.bind(null, user.id)} className="mt-2">
                <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 text-[12px] font-bold text-red-400/80 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /> Delete account permanently</button>
              </form>
            )}
          </section>
        </div>

        {/* ===== data column ===== */}
        <div className="space-y-4 xl:col-span-8">
          {/* wallets */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-white/80"><Wallet size={16} className="text-[#FFBD0D]" /> Wallets ({wallets.length})</p>
            <div className="mt-2 divide-y divide-white/5">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2.5 text-[12px]">
                  <span className="flex items-center gap-2 font-bold text-white/75">{w.currency}{w.isPrimary && <span className="rounded bg-[#FFBD0D]/15 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-[#FFBD0D]">Primary</span>}</span>
                  <span className="font-extrabold text-white/85">{fmtAmount(Number(w.balance), Number(w.balance) % 1 !== 0 ? 2 : 0)} <span className="text-[9px] text-white/35">{w.currency === "USDT" ? "USDT" : "FCFA"}</span></span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-white/35">{links.length} payment link{links.length === 1 ? "" : "s"} · {referralRows.length} referral{referralRows.length === 1 ? "" : "s"} · ID <span className="font-mono">{user.publicId}</span></p>
          </section>

          {/* KYC history */}
          {kycRows.length > 0 && (
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <p className="text-[13px] font-extrabold text-white/80">KYC submissions</p>
              <div className="mt-2 space-y-2">
                {kycRows.map((k) => (
                  <div key={k.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={k.selfieImage} alt="selfie" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 text-[11.5px]"><p className="font-bold text-white/75">{k.docType.replace("_", " ")} · {k.docNumber}</p><p className="text-[10px] text-white/35">{fmtDateTime(k.createdAt)}</p></div>
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase ${k.status === "approved" ? "border-emerald-400/30 text-emerald-400" : k.status === "rejected" ? "border-red-400/30 text-red-400" : "border-amber-400/30 text-amber-300"}`}>{k.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* recent transactions */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <p className="border-b border-white/5 px-5 py-4 text-[13px] font-extrabold text-white/80">Recent transactions</p>
            <div className="divide-y divide-white/5">
              {recentTx.map((t) => (
                <Link key={t.id} href={`/admin/transactions/${t.id}`} className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-white/[0.03]">
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold text-white/75">{txTitle(t)}</span><span className="block text-[9.5px] text-white/35">{fmtDateTime(t.createdAt)} · {t.provider}</span></span>
                  <span className={`text-[12px] font-extrabold ${t.direction === "credit" ? "text-emerald-400" : "text-red-400"}`}>{t.direction === "credit" ? "+" : "-"}{fmtAmount(Math.abs(Number(t.net)))}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[8.5px] font-black uppercase ${t.status === "completed" ? "border-emerald-400/30 text-emerald-400" : t.status === "failed" ? "border-red-400/30 text-red-400" : "border-amber-400/30 text-amber-300"}`}>{t.status}</span>
                </Link>
              ))}
              {recentTx.length === 0 && <p className="px-5 py-8 text-center text-[12px] text-white/35">No transactions.</p>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
