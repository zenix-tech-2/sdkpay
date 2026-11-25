import Link from "next/link";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { Search, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { fmtAmount, fmtTime, txTitle } from "@/lib/format";

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const type = String(sp.type ?? "");
  const status = String(sp.status ?? "");
  const page = Math.max(1, Number(String(sp.page ?? "1")) || 1);
  const perPage = 22;

  const conditions: SQL[] = [];
  if (type) conditions.push(eq(transactions.type, type));
  if (status) conditions.push(eq(transactions.status, status));
  if (q) conditions.push(or(ilike(transactions.ref, `%${q}%`), ilike(transactions.operator, `%${q}%`), ilike(transactions.recipientPhone, `%${q}%`), ilike(transactions.siteRef, `%${q}%`), ilike(transactions.providerRef, `%${q}%`)) as SQL);

  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db
    .select({ tx: transactions, user: users })
    .from(transactions)
    .innerJoin(users, eq(users.id, transactions.userId))
    .where(where)
    .orderBy(desc(transactions.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (status) p.set("status", status);
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/admin/transactions?${p.toString()}`;
  };

  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><ArrowLeftRight size={14} /> Finance</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Transactions</h1>
      <p className="text-[12px] text-white/40">Every ledger entry across the platform — newest first. Read-only; use user control for adjustments.</p>

      <form action="/admin/transactions" method="get" className="mt-4 flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-[#FFBD0D]/40">
        <Search size={16} className="shrink-0 text-white/35" />
        <input name="q" defaultValue={q} placeholder="Search reference, phone, operator, provider ref…" className="h-full w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/30" />
        {type && <input type="hidden" name="type" value={type} />}
        {status && <input type="hidden" name="status" value={status} />}
      </form>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {[["", "All types"], ["deposit", "Deposits"], ["withdrawal", "Withdrawals"], ["internal_transfer", "Internal"], ["mobile_money_send", "MM Sends"], ["crypto_send", "Crypto"], ["payment_received", "Links"], ["adjustment", "Adjustments"]].map(([v, l]) => (
          <Link key={v} href={qs({ type: v, page: "1" })} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${type === v ? "border-[#FFBD0D] bg-[#FFBD0D] text-[#232054]" : "border-white/10 text-white/55 hover:text-white"}`}>{l}</Link>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        {[["", "All statuses"], ["completed", "Completed"], ["pending", "Pending"], ["failed", "Failed"]].map(([v, l]) => (
          <Link key={v} href={qs({ status: v, page: "1" })} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${status === v ? "border-sky-400 bg-sky-400 text-[#082f49]" : "border-white/10 text-white/55 hover:text-white"}`}>{l}</Link>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[12px]">
            <thead className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
              <tr className="border-b border-white/5"><th className="px-5 py-3">Reference</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Amount / Net</th><th className="px-5 py-3">Fee</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">When</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map(({ tx, user }) => (
                <tr key={tx.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3"><Link href={`/admin/transactions/${tx.id}`} className="font-mono text-[10px] font-bold text-sky-300 hover:underline">{tx.ref}</Link></td>
                  <td className="px-5 py-3"><span className="block max-w-[140px] truncate font-bold text-white/75">{user.fullName}</span></td>
                  <td className="px-5 py-3 text-[10.5px] text-white/55">{txTitle(tx)}</td>
                  <td className="px-5 py-3"><span className={`block font-extrabold ${tx.direction === "credit" ? "text-emerald-400" : "text-red-400"}`}>{tx.direction === "credit" ? "+" : "-"}{fmtAmount(Math.abs(Number(tx.net)))}</span><span className="block text-[9px] text-white/35">gross {fmtAmount(Number(tx.amount))}</span></td>
                  <td className="px-5 py-3 text-amber-400/90">{fmtAmount(Number(tx.fee))}</td>
                  <td className="px-5 py-3"><span className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase ${tx.status === "completed" ? "border-emerald-400/30 text-emerald-400" : tx.status === "failed" ? "border-red-400/30 text-red-400" : "border-amber-400/30 text-amber-300"}`}>{tx.status}</span></td>
                  <td className="px-5 py-3 text-white/45">{tx.provider}</td>
                  <td className="px-5 py-3 text-[10.5px] text-white/40">{fmtTime(tx.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-white/35">No transactions match.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
          <Link href={qs({ page: String(Math.max(1, page - 1)) })} className={`flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-bold text-white/60 ${page <= 1 ? "pointer-events-none opacity-35" : "hover:text-white"}`}><ChevronLeft size={14} /> Prev</Link>
          <Link href={qs({ page: String(page + 1) })} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-bold text-white/60 hover:text-white">Next <ChevronRight size={14} /></Link>
        </div>
      </div>

      {/* mobile-friendly cards for small screens */}
      <div className="mt-3 space-y-2 lg:hidden">
        {rows.slice(0, 8).map(({ tx, user }) => (
          <Link key={tx.id} href={`/admin/transactions/${tx.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <span className="min-w-0"><span className="block truncate text-[11px] font-bold text-white/75">{user.fullName} · {txTitle(tx)}</span><span className="block font-mono text-[9px] text-white/35">{tx.ref}</span></span>
            <span className={`shrink-0 text-[12px] font-extrabold ${tx.direction === "credit" ? "text-emerald-400" : "text-red-400"}`}>{tx.direction === "credit" ? "+" : "-"}{fmtAmount(Math.abs(Number(tx.net)))}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
