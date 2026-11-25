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
    s === "approved" ? "bg-emerald-100 text-emerald-700" : s === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700";

  return (
    <>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">KYC reviews</h1>
      <p className="text-[13px] text-slate-500">Approve or reject identity submissions. Users are notified instantly.</p>

      {/* tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.value;
          return (
            <Link
              key={t.value}
              href={`/admin/kyc?status=${t.value}`}
              className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-[13px] font-bold transition ${active ? "border-navy bg-navy text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
            >
              <Icon size={16} /> {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${active ? "bg-white/20" : "bg-slate-100"}`}>{counts?.[t.value as keyof typeof counts] ?? 0}</span>
            </Link>
          );
        })}
      </div>

      {/* list */}
      <div className="mt-4 grid max-w-4xl gap-3">
        {rows.map(({ sub, user }) => {
          const DocIcon = docIcon(sub.docType);
          return (
            <Link key={sub.id} href={`/admin/kyc/${sub.id}`} className="group flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-gold hover:shadow-md sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/90 text-[13px] font-black text-gold">
                  {user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-extrabold text-ink">{sub.fullName}</span>
                  <span className="block truncate text-[11.5px] text-slate-500">{user.email} · {user.phone ?? "—"}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><DocIcon size={12} /> {docLabel(sub.docType)} · <span className="font-mono">{sub.docNumber}</span></span>
                </span>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto">
                <span className="flex -space-x-3">
                  {[sub.frontImage, sub.backImage, sub.selfieImage].filter(Boolean).slice(0, 3).map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={src as string} alt="" className="h-14 w-14 rounded-xl border-2 border-white object-cover shadow-sm" />
                  ))}
                </span>
                <span className="hidden text-[10.5px] font-semibold text-slate-400 md:block">{fmtDayLabel(sub.createdAt)}</span>
                <span className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${pill(sub.status)}`}>{sub.status}</span>
                <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-navy3" />
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
            <Inbox size={36} className="mx-auto text-slate-200" />
            <p className="mt-3 text-[15px] font-bold text-ink">Nothing here</p>
            <p className="mt-1 text-[12.5px] text-slate-500">No {tab === "all" ? "" : tab} submissions at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
}
