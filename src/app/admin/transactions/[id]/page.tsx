import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { fmtAmount, fmtDateTime, txTitle } from "@/lib/format";

export default async function AdminTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select({ tx: transactions, user: users }).from(transactions).innerJoin(users, eq(users.id, transactions.userId)).where(eq(transactions.id, id)).limit(1);
  if (!row) notFound();
  const { tx, user } = row;

  const credit = tx.direction === "credit";
  const failed = tx.status === "failed";
  const isUsdt = tx.currency === "USDT";
  const fmt = (n: number) => (isUsdt ? `${n.toFixed(4)} USDT` : `${fmtAmount(n)} FCFA`);
  const headerTone = failed ? "from-[#e5484d] to-[#b42318]" : tx.status === "pending" ? "from-[#f6c21a] to-[#d9a400]" : "from-[#17b26a] to-[#0e9f6e]";

  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono text-[11px]">{tx.ref}</span>],
    ["Merchant ref / site ref", tx.siteRef ?? "—"],
    ["Provider reference", tx.providerRef ? <span key="p" className="font-mono text-[11px]">{tx.providerRef}</span> : "—"],
    ["Provider / rail", `${tx.provider}${tx.providerStatus ? ` · ${tx.providerStatus}` : ""}`],
    ["Source", tx.source.toUpperCase()],
    ["Amount debited", fmt(Number(tx.amount))],
    [`Fees (${Number(tx.feePercent).toFixed(2)}%)`, <span key="f" className="text-amber-400">{fmt(Number(tx.fee))}</span>],
    [credit ? "Amount received" : "Sent to recipient", <span key="n" className="text-emerald-400">{fmt(Number(tx.net))}</span>],
    ["Operator", tx.operator ? tx.operator.replace(/_/g, " ") : "—"],
    ["Country", tx.country ?? "—"],
    ["Recipient", tx.recipient ?? "—"],
    ["Recipient phone", tx.recipientPhone ?? "—"],
    ["Balance before → after", tx.balanceBefore !== null ? `${fmt(Number(tx.balanceBefore))} → ${fmt(Number(tx.balanceAfter ?? 0))}` : "—"],
    ["Created at", `${fmtDateTime(tx.createdAt)}`],
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/transactions" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition hover:text-white"><ChevronLeft size={15} /> Transactions</Link>
        <Link href={`/admin/users/${user.id}`} className="rounded-xl border border-[#FFBD0D]/30 bg-[#FFBD0D]/10 px-4 py-2 text-[11px] font-extrabold text-[#FFBD0D] transition hover:bg-[#FFBD0D]/20">Open user → {user.fullName}</Link>
      </div>

      <div className={`relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br ${headerTone} p-6 text-center text-white shadow-lg`}>
        <div className="flex items-center justify-center gap-2 text-[14px] font-bold text-white/90">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20">{credit ? <TrendingUp size={17} /> : <TrendingDown size={17} />}</span>
          {txTitle(tx)}
          <span className="ml-2 rounded-md border border-white/40 bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{tx.status}</span>
        </div>
        <p className="mt-2 text-[36px] font-black tracking-tight sm:text-[42px]">{credit ? "+" : "-"}{fmt(Math.abs(Number(tx.net)))}</p>
        <p className="flex items-center justify-center gap-1.5 text-[12px] text-white/75"><Clock size={12} /> {fmtDateTime(tx.createdAt)}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 lg:col-span-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/35">Ledger details</p>
          <dl className="mt-2 divide-y divide-white/5">
            {rows.map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between gap-6 py-2.5 text-[12px]"><dt className="text-white/40">{k}</dt><dd className="text-right font-semibold text-white/85">{v}</dd></div>
            ))}
          </dl>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/35">Account</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBD0D]/15 text-[12px] font-black text-[#FFBD0D]">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
              <span><span className="block text-[14px] font-extrabold text-white">{user.fullName}</span><span className="block text-[11px] text-white/40">{user.email}</span></span>
            </div>
            <dl className="mt-3 divide-y divide-white/5 text-[12px]">
              <div className="flex justify-between py-2"><dt className="text-white/40">KYC</dt><dd className="font-bold text-white/80">{user.kycStatus}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-white/40">Role</dt><dd className="font-bold text-white/80">{user.role}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-white/40">Account</dt><dd className="font-bold text-white/80">{user.status}</dd></div>
            </dl>
          </section>
          <section className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-[11px] leading-relaxed text-amber-200/80">
            <p className="font-extrabold uppercase tracking-widest">Read-only</p>
            <p className="mt-1">Ledger entries are immutable. To correct a balance, open the user and use <b>Balance adjustment</b> — it writes a signed audit entry and notifies the customer.</p>
          </section>
        </div>
      </div>
    </>
  );
}
