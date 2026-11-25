import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ChevronRight, Inbox, Clock3, ShieldCheck, ShieldX, IdCard, BookUser, CarFront } from "lucide-react";
import { db } from "@/db";
import { kycSubmissions, users } from "@/db/schema";
import { fmtDayLabel } from "@/lib/format";

const TABS = [
  { value: "pending", label: "Pending", icon: Clock3 },
  { value: "approved", label: "Approved", icon: ShieldCheck },
  { value: "rejected", label: "Rejected", icon: ShieldX },
  { value: "all", label: "All", icon: Inbox },
] as const;

const docLabel = (t: string) => (t === "national_id" ? "National ID" : t === "passport" ? "Passport" : "Driver's licence");
const docIcon = (t: string) => (t === "national_id" ? IdCard : t === "passport" ? BookUser : CarFront);

export default async function AdminKycQueue({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const tab = TABS.some((t) => t.value === status) ? (status as (typeof TABS)[number]["value"]) : "pending";

  const base = db.select({ sub: kycSubmissions, user: users }).from(kycSubmissions).innerJoin(users, eq(users.id, kycSubmissions.userId));
  const rows = await (tab === "all"
    ? base.orderBy(desc(kycSubmissions.createdAt))
    : base.where(eq(kycSubmissions.status, tab)).orderBy(desc(kycSubmissions.createdAt))).limit(50);

  const [counts] = await db.select({
    pending: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'pending')::int`,
    approved: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'approved')::int`,
    rejected: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'rejected')::int`,
    all: sql<number>`count(*)::int`,
  }).from(kycSubmissions);

  const pill = (s: string) =>
    s === "approved" ? "border-emerald-400/30 text-emerald-400" : s === "rejected" ? "border-red-400/30 text-red-400" : "border-amber-400/30 text-amber-300";

  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><ShieldCheck size={14} /> Compliance</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">KYC reviews</h1>
      <p className="text-[12px] text-white/40">Approve or reject identity submissions — the customer is notified instantly, either way.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.value;
          return (
            <Link key={t.value} href={`/admin/kyc?status=${t.value}`} className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-[12px] font-bold transition ${active ? "border-[#FFBD0D] bg-[#FFBD0D] text-[#232054]" : "border-white/10 text-white/60 hover:text-white"}`}>
              <Icon size={15} /> {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${active ? "bg-[#232054]/20" : "bg-white/10"}`}>{counts?.[t.value as keyof typeof counts] ?? 0}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid max-w-4xl gap-2.5">
        {rows.map(({ sub, user }) => {
          const DocIcon = docIcon(sub.docType);
          return (
            <Link key={sub.id} href={`/admin/kyc/${sub.id}`} className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-[#FFBD0D]/30 hover:bg-white/[0.05] sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFBD0D]/10 text-[12px] font-black text-[#FFBD0D]">
                  {user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-extrabold text-white">{sub.fullName}</span>
                  <span className="block truncate text-[11px] text-white/40">{user.email} · {user.phone ?? "—"}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-white/35"><DocIcon size={11} /> {docLabel(sub.docType)} · <span className="font-mono">{sub.docNumber}</span></span>
                </span>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto">
                <span className="flex -space-x-3">
                  {[sub.frontImage, sub.backImage, sub.selfieImage].filter(Boolean).slice(0, 3).map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={src as string} alt="" className="h-14 w-14 rounded-xl border-2 border-[#0E1434] object-cover" />
                  ))}
                </span>
                <span className="hidden text-[10px] font-semibold text-white/35 md:block">{fmtDayLabel(sub.createdAt)}</span>
                <span className={`rounded-md border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${pill(sub.status)}`}>{sub.status}</span>
                <ChevronRight size={17} className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#FFBD0D]" />
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
            <Inbox size={36} className="mx-auto text-white/15" />
            <p className="mt-3 text-[15px] font-bold text-white/70">Nothing here</p>
            <p className="mt-1 text-[12px] text-white/35">No {tab === "all" ? "" : tab} submissions at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
}
