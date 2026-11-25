import Link from "next/link";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import FilterSelect from "@/components/filter-select";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getTxSummary } from "@/lib/data";
import { fmtAmount, fmtDayLabel, fmtTime, txTitle } from "@/lib/format";
import { Search, RefreshCw, Download, Code2, ChartLine } from "lucide-react";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const type = String(sp.type ?? "");
  const status = String(sp.status ?? "");
  const currency = String(sp.currency ?? "");

  const conditions: SQL[] = [eq(transactions.userId, user.id)];
  if (type) conditions.push(eq(transactions.type, type));
  if (status) conditions.push(eq(transactions.status, status));
  if (currency) conditions.push(eq(transactions.currency, currency));
  if (q) conditions.push(or(ilike(transactions.ref, `%${q}%`), ilike(transactions.operator, `%${q}%`), ilike(transactions.recipientPhone, `%${q}%`), ilike(transactions.siteRef, `%${q}%`)) as SQL);

  const [rows, summary] = await Promise.all([
    db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.createdAt)).limit(100),
    getTxSummary(user.id),
  ]);

  // group by day
  const groups: { label: string; items: typeof rows }[] = [];
  for (const t of rows) {
    const label = fmtDayLabel(t.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }

  const txIcon = (t: { type: string }) =>
    t.type === "deposit" ? "/icons3d/deposit.svg"
    : t.type === "withdrawal" || t.type === "mobile_money_send" ? "/icons3d/withdraw.svg"
    : t.type === "internal_transfer" ? "/icons3d/send.svg"
    : t.type === "crypto_send" || t.type === "crypto_deposit" ? "/icons3d/chart.svg"
    : t.type === "payment_received" ? "/icons3d/link.svg"
    : "/icons3d/chart.svg";

  const summaryCards = [
    { img: "/icons3d/deposit.svg", label: "Total incoming", value: `+${fmtAmount(summary.incoming)} FCFA`, tone: "text-emerald-600" },
    { img: "/icons3d/withdraw.svg", label: "Total outgoing", value: `-${fmtAmount(summary.outgoing)} FCFA`, tone: "text-red-500" },
    { img: "/icons3d/chart.svg", label: "Results displayed", value: String(rows.length), tone: "text-ink" },
  ];

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Transactions</h1>

      {/* SUMMARY */}
      <SectionLabel><span className="mt-4 block">Summary</span></SectionLabel>
      <div className="grid gap-3 sm:grid-cols-3">
        {summaryCards.map((c) => (
          <Panel key={c.label} className="flex items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt="" className="h-14 w-14 shrink-0 object-contain" />
            <span className="min-w-0">
              <span className="block text-[15px] font-medium text-[#1F2430]">{c.label}</span>
              <span className={`mt-0.5 block truncate text-[18px] font-extrabold tracking-tight ${c.tone}`}>{c.value}</span>
            </span>
          </Panel>
        ))}
      </div>

      {/* FILTERS */}
      <SectionLabel><span className="mt-5 block">Filters</span></SectionLabel>
      <Panel className="p-4">
        <form action="/transactions" method="get" className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-gold focus-within:bg-white">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input name="q" defaultValue={q} placeholder="Search by amount, operator, reference…" className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect param="type" value={type} className="w-44" options={[
              { value: "", label: "All types" },
              { value: "deposit", label: "Deposits" },
              { value: "withdrawal", label: "Withdrawals" },
              { value: "internal_transfer", label: "Internal transfers" },
              { value: "mobile_money_send", label: "Mobile Money sends" },
              { value: "crypto_send", label: "USDT sends" },
              { value: "payment_received", label: "Payment links" },
            ]} />
            <FilterSelect param="status" value={status} className="w-40" options={[
              { value: "", label: "All statuses" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]} />
            <FilterSelect param="currency" value={currency} className="w-40" options={[
              { value: "", label: "All currencies" },
              { value: "XAF", label: "XAF" },
              { value: "USDT", label: "USDT" },
            ]} />
            <Link href="/transactions" className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300">
              <RefreshCw size={15} /> Refresh
            </Link>
            <a href="/api/export/csv" download className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-gold">
              <Download size={15} /> Export CSV
            </a>
          </div>
        </form>
      </Panel>

      {/* HISTORY */}
      <SectionLabel><span className="mt-5 block">History</span></SectionLabel>
      {groups.length === 0 && (
        <Panel className="p-8 text-center">
          <ChartLine size={30} className="mx-auto text-slate-300" />
          <p className="mt-2 text-[14px] font-semibold text-slate-500">No transactions match these filters.</p>
        </Panel>
      )}
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{g.label}</p>
            <div className="space-y-2.5">
              {g.items.map((t) => {
                const credit = t.direction === "credit";
                const failed = t.status === "failed";
                const completed = t.status === "completed";
                const net = Math.abs(Number(t.net));
                return (
                  <Link key={t.id} href={`/transactions/${t.id}`} className={`block overflow-hidden rounded-2xl border-l-[5px] p-4 shadow-sm transition hover:shadow-md ${failed ? "border-red-400 bg-red-50/70" : completed ? "border-emerald-400 bg-emerald-50/70" : "border-amber-400 bg-amber-50/70"} border-y border-r border-y-slate-100 border-r-slate-100`}>
                    <div className="flex items-center gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={txIcon(t)} alt="" className="h-12 w-12 shrink-0 object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-ink">
                          <span className="truncate">{txTitle(t)}</span>
                          {t.source === "api" && <span className="flex items-center gap-0.5 rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-sky-600"><Code2 size={10} /> API</span>}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-slate-500">{t.operator ? t.operator.replace(/_/g, " ") + " · " : ""}{fmtTime(t.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-[15px] font-extrabold ${failed ? "text-slate-500" : credit ? "text-emerald-600" : "text-red-500"}`}>
                          {credit ? "+" : "-"}{fmtAmount(net)} {t.currency === "USDT" ? "USDT" : "FCFA"}
                        </p>
                        <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${failed ? "bg-red-100 text-red-600" : completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {completed ? "Completed" : failed ? "Failed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Gate>
  );
}
