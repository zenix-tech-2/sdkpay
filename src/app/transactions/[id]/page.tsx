import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import Gate from "@/components/gate";
import { Panel, KpiRow } from "@/components/ui";
import { CopyButton } from "@/components/bits";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { fmtAmount, fmtDateTime, txTitle } from "@/lib/format";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [t] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).limit(1);
  if (!t) notFound();

  const credit = t.direction === "credit";
  const failed = t.status === "failed";
  const pending = t.status === "pending";
  const statusLabel = failed ? "Failed" : pending ? "Pending" : "Completed";
  const headerTone = failed ? "from-[#e5484d] to-[#d92d20]" : pending ? "from-[#f6c21a] to-[#eab308]" : "from-[#17b26a] to-[#0e9f6e]";
  const isUsdt = t.currency === "USDT";
  const cur = isUsdt ? "USDT" : "FCFA";
  const fmt = (n: number) => (isUsdt ? n.toFixed(4) + " USDT" : fmtAmount(n) + " FCFA");

  return (
    <Gate>
      <div className="mx-auto max-w-2xl">
        {/* status header card */}
        <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${headerTone} p-6 text-center text-white shadow-lg`}>
          <Link href="/transactions" aria-label="Close" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25">
            <X size={20} />
          </Link>
          <div className="flex items-center justify-center gap-2.5 text-[15px] font-bold text-white/95">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              {credit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </span>
            {txTitle(t)}
          </div>
          <span className="mt-4 inline-block rounded-lg border border-white/40 bg-white/15 px-4 py-1 text-[12px] font-bold uppercase tracking-widest text-white">
            {statusLabel}
          </span>
          <p className="mt-2 text-[42px] font-black tracking-tight sm:text-[48px]">
            {credit ? "+" : "-"}{fmt(Math.abs(Number(t.net)))}
          </p>
          <p className="flex items-center justify-center gap-1.5 text-[13px] text-white/85"><Clock size={13} /> {fmtDateTime(t.createdAt)}</p>
        </section>

        {/* details */}
        <Panel className="mt-5 divide-y divide-slate-100 p-5 sm:p-6">
          <div className="pb-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">References</p>
            <div className="mt-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-[14px] text-slate-500">SDK Pay Ref.</span>
              <span className="flex items-center gap-1 font-mono text-[12.5px] font-bold text-ink">{t.ref}<CopyButton text={t.ref} /></span>
            </div>
            {t.siteRef && (
              <div className="flex items-center justify-between gap-3 pt-3">
                <span className="text-[14px] text-slate-500">Your site reference</span>
                <span className="flex items-center gap-1 font-mono text-[12.5px] font-bold text-ink">{t.siteRef}<CopyButton text={t.siteRef} /></span>
              </div>
            )}
          </div>

          <div className="py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Financial details</p>
            <div className="mt-1 divide-y divide-slate-100">
              <KpiRow label="Amount debited" value={fmt(Number(t.amount))} />
              <KpiRow label={`Fees (${Number(t.feePercent).toFixed(2)}%)`} value={<span className="text-amber-600">{fmt(Number(t.fee))}</span>} />
              <KpiRow label={credit ? "Amount received" : "Sent to recipient"} value={<span className="text-emerald-600">{fmt(Number(t.net))}</span>} />
            </div>
          </div>

          <div className="py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Information</p>
            <div className="mt-1 divide-y divide-slate-100">
              <KpiRow label="Type" value={txTitle(t)} />
              <KpiRow label="Currency" value={t.currency} />
              {t.operator && <KpiRow label="Operator" value={t.operator.replace(/_/g, " ")} />}
              {t.country && <KpiRow label="Country" value={t.country} />}
              {t.recipient && <KpiRow label={credit ? "Payer" : "Recipient"} value={t.recipient} />}
              {t.recipientPhone && <KpiRow label="Recipient phone" value={t.recipientPhone} />}
              <KpiRow label="Source" value={t.source.toUpperCase()} />
            </div>
          </div>

          <div className="py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Balance history</p>
            <div className="mt-1 divide-y divide-slate-100">
              <KpiRow label="Solde avant (XAF)" value={t.balanceBefore !== null ? fmt(Number(t.balanceBefore)) : "—"} />
              <KpiRow label="Solde après (XAF)" value={t.balanceAfter !== null ? fmt(Number(t.balanceAfter)) : "—"} />
              <KpiRow label="Created at" value={fmtDateTime(t.createdAt)} />
              <KpiRow label="Last updated" value={fmtDateTime(t.createdAt)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <p className="flex items-center gap-2 text-[12px] text-slate-400"><ArrowDownLeft size={14} /><ArrowUpRight size={14} /> Receipt sent via SMS to the operator number.</p>
            <Link href="/transactions" className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-bold text-slate-600 transition hover:border-slate-300">Back to history</Link>
          </div>
        </Panel>
      </div>
    </Gate>
  );
}
