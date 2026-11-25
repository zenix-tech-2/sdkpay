import Link from "next/link";
import { ArrowRightLeft, BadgeCheck, ChevronRight, Circle, Coins, HandCoins, Banknote, Calculator, Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, Smartphone, KeyRound, MessageCircle, Link2, Eye } from "lucide-react";
import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import FilterSelect from "@/components/filter-select";
import { CopyButton } from "@/components/bits";
import { requireUser } from "@/lib/session";
import { getAccounts, getLatestTransactions, getPaymentLinks, getTxSummary, getMonthlySeries } from "@/lib/data";
import { fmtAmount, fmtTime, txTitle } from "@/lib/format";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string; links?: string }> }) {
  const user = await requireUser();
  const { period, links } = await searchParams;
  const [accounts, summary, txsAll, linksRows, series] = await Promise.all([
    getAccounts(user.id),
    getTxSummary(user.id),
    getLatestTransactions(user.id, 20),
    getPaymentLinks(user.id),
    getMonthlySeries(user.id),
  ]);
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
  const balance = primary ? Number(primary.balance) : 0;

  const now = new Date("2026-11-25T00:00:00Z"); // sandbox clock anchor
  const txs = (period ?? "month") === "month"
    ? txsAll.filter((t) => t.createdAt.getUTCMonth() === now.getUTCMonth() && t.createdAt.getUTCFullYear() === now.getUTCFullYear())
    : txsAll;
  const recent = txs.slice(0, 5);

  const linkFilter = links ?? "all";
  const visibleLinks = linksRows
    .filter((l) => (linkFilter === "active" ? l.active : linkFilter === "inactive" ? !l.active : true))
    .slice(0, 3);

  const maxBar = Math.max(...series.map((s) => s.value), 1);

  const quickActions = [
    { href: "/deposit", label: "Deposit", icon: HandCoins, tile: "bg-emerald-50 text-emerald-600" },
    { href: "/send", label: "Send", icon: Banknote, tile: "bg-violet-50 text-violet-600" },
    { href: "/withdraw", label: "Withdraw", icon: Calculator, tile: "bg-orange-50 text-orange-600" },
    { href: "/links/new", label: "Payment link", icon: Wallet, tile: "bg-amber-50 text-amber-600" },
  ];

  return (
    <Gate>
      {user.kycStatus !== "verified" && (
        <Link href="/kyc" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 transition hover:border-gold">
          <ShieldCheck size={22} className="shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-amber-900">
            <b>{user.kycStatus === "pending" ? "Your identity verification is under review." : "Verify your identity to unlock withdrawals and payment links."}</b>{" "}
            {user.kycStatus === "pending" ? "You'll be notified as soon as our team approves your documents." : "It takes less than 24 business hours."}
          </span>
          <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-navy px-4 text-[12px] font-extrabold text-white">{user.kycStatus === "pending" ? "View status" : "Verify now"} <ChevronRight size={14} /></span>
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Dashboard</h1>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
          All systems operational
        </p>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-3">
        {/* ============ LEFT / MAIN ============ */}
        <div className="space-y-5 xl:col-span-2">
          {/* balance card */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-5 text-white shadow-xl shadow-navy/25 sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-16 right-28 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">Main Balance (XAF)</p>
                <p className="mt-2 text-[44px] font-black leading-none tracking-tight sm:text-[52px]">
                  {fmtAmount(balance, balance % 1 !== 0 ? 2 : 0)}
                  <span className="ml-2 align-middle text-[18px] font-extrabold text-gold">FCFA</span>
                </p>
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-white/55">
                  <ShieldCheck size={13} className="text-emerald-400" /> Cameroon · XAF · KYC verified
                </p>
              </div>
              <Link
                href="/conversion"
                className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-gold backdrop-blur transition hover:border-gold hover:bg-white/15"
              >
                <Coins size={17} /> Conversion
              </Link>
            </div>
            <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Incoming (all time)</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-extrabold text-emerald-400"><ArrowDownLeft size={15} /> +{fmtAmount(summary.incoming)} FCFA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Outgoing (all time)</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-extrabold text-rose-300"><ArrowUpRight size={15} /> -{fmtAmount(summary.outgoing)} FCFA</p>
              </div>
            </div>
          </section>

          {/* quick actions */}
          <section>
            <SectionLabel>Quick actions</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href} className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${a.tile} transition-transform group-hover:scale-110`}>
                      <Icon size={30} strokeWidth={1.8} />
                    </span>
                    <span className="text-[13px] font-bold text-ink">{a.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* referral banner */}
          <Link href="/referrals" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-gold hover:bg-amber-50/40">
            <span className="text-[13.5px] font-semibold text-slate-700">Referrals and rewards: <span className="text-navy2">invite your friends</span></span>
            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </Link>

          {/* recent activity */}
          <section>
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>Recent activity</SectionLabel>
              <FilterSelect
                param="period"
                value={period ?? "month"}
                className="w-40"
                options={[
                  { value: "month", label: "This month" },
                  { value: "all", label: "All time" },
                ]}
              />
            </div>
            <Panel className="divide-y divide-slate-100 overflow-hidden">
              {recent.length === 0 && (
                <p className="px-5 py-6 text-center text-[13px] text-slate-400">No transactions in this period yet.</p>
              )}
              {recent.map((t) => {
                const credit = t.direction === "credit";
                const failed = t.status === "failed";
                return (
                  <Link key={t.id} href={`/transactions/${t.id}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${failed ? "bg-red-50 text-red-500" : credit ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}>
                      {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink">{txTitle(t)}</span>
                      <span className="block text-[11px] text-slate-400">{t.operator ? t.operator.replace(/_/g, " ") : t.type} · {fmtTime(t.createdAt)} UTC</span>
                    </span>
                    <span className={`text-[13px] font-extrabold ${failed ? "text-slate-400" : credit ? "text-emerald-600" : "text-red-500"}`}>
                      {failed ? "" : credit ? "+" : "-"}{fmtAmount(Math.abs(Number(t.net)))} FCFA
                    </span>
                  </Link>
                );
              })}
              <Link href="/transactions" className="flex items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-bold text-navy2 transition hover:bg-slate-50">
                View all transactions <ChevronRight size={15} />
              </Link>
            </Panel>
          </section>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="space-y-5">
          {/* volume chart */}
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Payments volume</SectionLabel>
              <Link href="/transactions" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">Details <ChevronRight size={12} /></Link>
            </div>
            <svg viewBox="0 0 260 120" className="mt-1 w-full" role="img" aria-label="Incoming volume per day">
              {series.length === 0 && <text x="130" y="60" textAnchor="middle" fontSize="11" fill="#94a3b8">No data yet</text>}
              {series.map((s, i) => {
                const bw = 260 / Math.max(series.length, 1) - 8;
                const x = i * (260 / Math.max(series.length, 1)) + 4;
                const h = Math.max(6, (s.value / maxBar) * 78);
                return <rect key={i} x={x} y={96 - h} width={bw} height={h} rx="4" className="fill-navy3/80" />;
              })}
              <line x1="0" y1="96" x2="260" y2="96" stroke="#e2e8f0" strokeWidth="1.5" />
              {series.map((s, i) => (
                <text key={i} x={i * (260 / Math.max(series.length, 1)) + 4 + (260 / Math.max(series.length, 1) - 8) / 2} y="110" textAnchor="middle" fontSize="8" fill="#94a3b8">{s.day.split(" ")[0]}</text>
              ))}
            </svg>
            <p className="mt-2 text-[11px] text-slate-400">Completed Mobile Money deposits per day · XAF</p>
          </Panel>

          {/* top links with filter */}
          <section>
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>My payment links</SectionLabel>
              <FilterSelect
                param="links"
                value={linkFilter}
                className="w-36"
                options={[
                  { value: "all", label: "All links" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
            <Panel className="divide-y divide-slate-100 overflow-hidden">
              {visibleLinks.length === 0 && <p className="px-5 py-6 text-center text-[13px] text-slate-400">No links in this filter.</p>}
              {visibleLinks.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/90 text-white"><Link2 size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{l.title} {l.active && <BadgeCheck size={13} className="inline text-emerald-500" />}</p>
                    <p className="flex items-center gap-2 text-[10.5px] text-slate-400"><Eye size={11} /> {l.clicks} clicks · {l.amount === null ? "Free amount" : `${fmtAmount(Number(l.amount))} FCFA`}</p>
                  </div>
                  <CopyButton text={`https://sdkpay.com/pay/${l.slug}`} label="Copy link" />
                </div>
              ))}
              <Link href="/links" className="flex items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-bold text-navy2 transition hover:bg-slate-50">
                Manage all links <ChevronRight size={15} />
              </Link>
            </Panel>
          </section>

          {/* account health */}
          <Panel className="p-5">
            <SectionLabel>Account health</SectionLabel>
            <ul className="mt-2 divide-y divide-slate-100 text-[13px]">
              <li className="flex items-center gap-2.5 py-2.5"><ShieldCheck size={17} className="text-emerald-500" /><span className="flex-1 text-slate-600">KYC verification</span><span className="font-bold text-emerald-600">Verified</span></li>
              <li className="flex items-center gap-2.5 py-2.5"><Smartphone size={17} className="text-blue-500" /><span className="flex-1 text-slate-600">Payout numbers</span><span className="font-bold text-ink">2 registered</span></li>
              <li className="flex items-center gap-2.5 py-2.5"><KeyRound size={17} className="text-violet-500" /><span className="flex-1 text-slate-600">API access</span><span className="flex items-center gap-1.5 font-bold text-emerald-600"><Circle size={8} fill="currentColor" /> Live</span></li>
            </ul>
          </Panel>

          {/* WhatsApp community */}
          <a href="https://wa.me/237683677872" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white"><MessageCircle size={22} fill="currentColor" strokeWidth={0} /></span>
            <span className="text-[12.5px] leading-snug text-emerald-900"><span className="font-extrabold">Join the SDK Pay WhatsApp channel</span><br />Product news, uptime alerts and fee updates.</span>
            <ChevronRight size={18} className="ml-auto shrink-0 text-emerald-600" />
          </a>

          {/* arrow decor */}
          <div className="hidden items-center justify-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.25em] text-slate-300 xl:flex">
            <ArrowRightLeft size={12} /> Integrate · Pay · Grow <ArrowRightLeft size={12} />
          </div>
        </div>
      </div>
    </Gate>
  );
}
