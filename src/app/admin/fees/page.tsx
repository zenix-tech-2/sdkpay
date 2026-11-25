import { Receipt, ShieldCheck, Zap, Info } from "lucide-react";
import { getFees } from "@/lib/settings";
import { FeesForm } from "@/components/admin-client";

export default async function AdminFeesPage() {
  const fees = await getFees();
  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Receipt size={14} /> Finance</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Fees &amp; limits</h1>
      <p className="text-[12px] text-white/40">The live fee schedule used by every flow — deposits, withdrawals, sends, conversions. Enforcement is server-side.</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-8">
          <FeesForm fees={fees} />
        </section>
        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-[#FFBD0D]/20 bg-[#FFBD0D]/[0.06] p-5">
            <p className="flex items-center gap-2 text-[12px] font-extrabold text-[#FFBD0D]"><Zap size={15} /> Effective immediately</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/55">Saving here changes what the app <b className="text-white/80">charges and displays</b> — deposits, withdrawals, sends and /fees page all read this configuration. Server actions always recompute fees themselves; client-side amounts are only estimates.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[12px] font-extrabold text-white/75"><Info size={15} /> Current schedule</p>
            <ul className="mt-3 space-y-1.5 text-[11.5px] text-white/55">
              <li className="flex justify-between"><span>Deposit / withdrawal / send</span><span className="font-bold text-white/80">{fees.deposit_percent}% · {fees.withdrawal_percent}% · {fees.send_percent}%</span></li>
              <li className="flex justify-between"><span>Crypto deposit</span><span className="font-bold text-white/80">{fees.crypto_deposit_percent}%</span></li>
              <li className="flex justify-between"><span>Crypto withdrawal (fixed)</span><span className="font-bold text-white/80">{fees.crypto_withdrawal_fixed} USDT</span></li>
              <li className="flex justify-between"><span>Wallet conversion</span><span className="font-bold text-white/80">{fees.conversion_percent}%</span></li>
              <li className="flex justify-between"><span>Withdraw range</span><span className="font-bold text-white/80">{fees.min_withdrawal} – {fees.max_withdrawal.toLocaleString("en-US")} XAF</span></li>
              <li className="flex justify-between"><span>USDT range</span><span className="font-bold text-white/80">{fees.usdt_min} – {fees.usdt_max} USDT</span></li>
              <li className="flex justify-between"><span>Min deposit</span><span className="font-bold text-white/80">{fees.min_deposit} XAF</span></li>
            </ul>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4 text-[10.5px] font-semibold text-emerald-300/80"><ShieldCheck size={15} className="shrink-0" /> Fees are stored in <code className="rounded bg-black/30 px-1">app_meta.fees</code> — versioned, cached 30s, rollback-safe.</div>
        </aside>
      </div>
    </>
  );
}
