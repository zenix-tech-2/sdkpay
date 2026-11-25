import Link from "next/link";
import { and, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import { Search, ChevronLeft, ChevronRight, Users, ShieldCheck, CircleSlash, Mail, MapPin, Wallet } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { accounts, transactions } from "@/db/schema";

const KYC_PILL: Record<string, string> = {
  verified: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  rejected: "border-red-400/30 bg-red-400/10 text-red-400",
  none: "border-white/10 bg-white/5 text-white/45",
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const kyc = String(sp.kyc ?? "");
  const status = String(sp.status ?? "");
  const role = String(sp.role ?? "");
  const page = Math.max(1, Number(String(sp.page ?? "1")) || 1);
  const perPage = 18;

  const conditions: SQL[] = [];
  if (kyc) conditions.push(eq(users.kycStatus, kyc));
  if (status) conditions.push(eq(users.status, status));
  if (role) conditions.push(eq(users.role, role));
  if (q) conditions.push(or(ilike(users.fullName, `%${q}%`), ilike(users.email, `%${q}%`), ilike(users.username, `%${q}%`), ilike(users.phone, `%${q}%`)) as SQL);

  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ n: sql<number>`count(*)::int` }).from(users).where(where);
  const total = totalRow?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  const rows = await db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(perPage).offset((page - 1) * perPage);
  const ids = rows.map((r) => r.id);
  const balances = ids.length
    ? await db.select({ userId: accounts.userId, total: sql<string>`coalesce(sum(${accounts.balance}) filter (where ${accounts.currency} = 'XAF'), 0)` }).from(accounts).where(sql`${accounts.userId} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`).groupBy(accounts.userId)
    : [];
  const balMap = new Map(balances.map((b) => [b.userId, Number(b.total)]));

  const filters = [
    { label: "All", params: {} },
    { label: "Verified", params: { kyc: "verified" } },
    { label: "Pending KYC", params: { kyc: "pending" } },
    { label: "Rejected", params: { kyc: "rejected" } },
    { label: "Suspended", params: { status: "suspended" } },
    { label: "Admins", params: { role: "admin" } },
  ];
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (kyc) p.set("kyc", kyc);
    if (status) p.set("status", status);
    if (role) p.set("role", role);
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/admin/users?${p.toString()}`;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Users size={14} /> User control</p>
          <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">All users <span className="text-white/35">· {total}</span></h1>
        </div>
        <p className="text-[11px] font-semibold text-white/35">Page {page} of {pages}</p>
      </div>

      {/* search + filter pills */}
      <form action="/admin/users" method="get" className="mt-4 flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-[#FFBD0D]/40">
        <Search size={17} className="shrink-0 text-white/35" />
        <input name="q" defaultValue={q} placeholder="Search name, email, username or phone…" className="h-full w-full bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-white/30" />
        {kyc && <input type="hidden" name="kyc" value={kyc} />}
        {status && <input type="hidden" name="status" value={status} />}
        {role && <input type="hidden" name="role" value={role} />}
      </form>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const active = (f.params.kyc ?? "") === kyc && (f.params.status ?? "") === status && (f.params.role ?? "") === role;
          const p = new URLSearchParams();
          if (q) p.set("q", q);
          for (const [k, v] of Object.entries(f.params)) p.set(k, String(v));
          return (
            <Link key={f.label} href={`/admin/users?${p.toString()}`} className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition ${active ? "border-[#FFBD0D] bg-[#FFBD0D] text-[#232054]" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"}`}>{f.label}</Link>
          );
        })}
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[12px]">
            <thead className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
              <tr className="border-b border-white/5"><th className="px-5 py-3">User</th><th className="px-5 py-3">Country</th><th className="px-5 py-3">KYC</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Balance</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFBD0D]/10 text-[10px] font-black text-[#FFBD0D]">{u.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
                      <span className="min-w-0"><span className="block max-w-[170px] truncate font-bold text-white/85">{u.fullName}</span><span className="block max-w-[170px] truncate text-[10px] text-white/35">{u.email}</span></span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/55">{u.country ?? "—"}</td>
                  <td className="px-5 py-3"><span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${KYC_PILL[u.kycStatus] ?? KYC_PILL.none}`}>{u.kycStatus}</span></td>
                  <td className="px-5 py-3"><span className={`text-[10px] font-extrabold uppercase tracking-wider ${u.role === "admin" ? "text-[#FFBD0D]" : "text-white/40"}`}>{u.role}</span></td>
                  <td className="px-5 py-3 font-bold text-white/70">{(balMap.get(u.id) ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} <span className="text-[9px] text-white/35">FCFA</span></td>
                  <td className="px-5 py-3">{u.status === "active" ? <span className="flex w-fit items-center gap-1.5 text-[11px] font-bold text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Active</span> : <span className="flex w-fit items-center gap-1.5 text-[11px] font-bold text-red-400"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />Suspended</span>}</td>
                  <td className="px-5 py-3 text-right"><Link href={`/admin/users/${u.id}`} className="rounded-lg border border-white/10 px-3 py-1.5 text-[10.5px] font-extrabold text-[#FFBD0D] transition hover:border-[#FFBD0D]/50">Manage →</Link></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-white/35">No users match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
          <Link href={qs({ page: String(Math.max(1, page - 1)) })} aria-disabled={page <= 1} className={`flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-bold text-white/60 ${page <= 1 ? "pointer-events-none opacity-35" : "hover:text-white"}`}><ChevronLeft size={14} /> Prev</Link>
          <span className="text-[11px] font-bold text-white/35">{(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
          <Link href={qs({ page: String(Math.min(pages, page + 1)) })} aria-disabled={page >= pages} className={`flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-bold text-white/60 ${page >= pages ? "pointer-events-none opacity-35" : "hover:text-white"}`}>Next <ChevronRight size={14} /></Link>
        </div>
      </div>
    </>
  );
}
