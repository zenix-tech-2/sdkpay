import Link from "next/link";
import { HandCoins, ArrowUpFromLine, Bitcoin, ArrowLeftRight, Info, Percent, ShieldCheck } from "lucide-react";
import Gate from "@/components/gate";
import { Panel } from "@/components/ui";
import { getFees } from "@/lib/settings";

function FeeCard({ icon, tile, title, rows }: { icon: React.ReactNode; tile: string; title: string; rows: [string, string][] }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tile}`}>{icon}</span>
        <p className="text-[15px] font-extrabold text-ink">{title}</p>
      </div>
      <div className="divide-y divide-slate-100 px-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
            <span className="text-slate-500">{k}</span>
            <span className="text-right font-bold text-ink">{v}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const fees = await getFees();
  const mm = `${fees.deposit_percent.toFixed(2)}%`;

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Fees</h1>
      <p className="text-[13px] text-slate-500">Live fee schedule — shown before every confirmation. No hidden charges.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FeeCard
          icon={<HandCoins size={22} className="text-emerald-600" />} tile="bg-emerald-50" title="Mobile Money"
          rows={[
            ["Deposit (top up)", `${mm} · min ${fees.min_deposit} FCFA`],
            ["Send to a Mobile Money number", `${fees.send_percent.toFixed(2)}%`],
            ["Withdraw to Mobile Money", `${fees.withdrawal_percent.toFixed(2)}%`],
            ["Failed deposits", "Never charged"],
            ["Payment link collection", `${fees.deposit_percent.toFixed(2)}% per payment`],
          ]}
        />
        <FeeCard
          icon={<Bitcoin size={22} className="text-orange-500" />} tile="bg-orange-50" title="Crypto (USDT · Tron)"
          rows={[
            ["USDT deposit", `${fees.crypto_deposit_percent.toFixed(2)}%`],
            ["USDT withdrawal (network)", `${fees.crypto_withdrawal_fixed.toFixed(2)} USDT fixed`],
            ["USDT send to external wallet", `${fees.crypto_withdrawal_fixed.toFixed(2)} USDT`],
            ["Wallet-to-wallet conversion", `${fees.conversion_percent.toFixed(2)}%`],
            ["Minimum network confirmation", "1 block (~3 min)"],
          ]}
        />
        <FeeCard
          icon={<ArrowLeftRight size={22} className="text-violet-600" />} tile="bg-violet-50" title="Internal &amp; conversions"
          rows={[
            ["SDK Pay → SDK Pay transfer", "Free — always"],
            ["XAF → XOF wallet conversion", `${fees.conversion_percent.toFixed(2)}%`],
            ["USD → XAF auto-conversion", `${fees.conversion_percent.toFixed(2)}% (Perfect Rate)`],
            ["Cross-border payouts", "2.00%"],
            ["Bulk payout file (100+)", "Volume pricing — talk to sales"],
          ]}
        />
        <FeeCard
          icon={<ArrowUpFromLine size={22} className="text-sky-600" />} tile="bg-sky-50" title="Limits"
          rows={[
            ["Minimum withdrawal", `${fees.min_withdrawal.toLocaleString("fr-FR")} XAF · ${fees.usdt_min} USDT`],
            ["Maximum withdrawal", `${fees.max_withdrawal.toLocaleString("fr-FR")} XAF · ${fees.usdt_max.toLocaleString("fr-FR")} USDT`],
            ["Daily Mobile Money send", "5,000,000 XAF"],
            ["Minimum payment link amount", `${fees.min_deposit} FCFA`],
            ["Unverified accounts", "Deposits capped at 50,000 XAF/day"],
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/80 text-navy2 shadow-inner"><Percent size={26} strokeWidth={2.2} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-amber-900">50% off your fees for 5 days</p>
          <p className="mt-0.5 text-[12px] leading-snug text-amber-800">Invite a friend who completes KYC — you both get reduced Mobile Money fees for 5 days.</p>
        </div>
        <Link href="/referrals" className="flex h-11 items-center gap-2 rounded-xl bg-navy px-5 text-[13px] font-bold text-white transition hover:bg-navy3"><ShieldCheck size={16} /> Get my link</Link>
      </div>

      <p className="mt-4 flex max-w-2xl items-start gap-2 text-[12px] leading-relaxed text-slate-400"><Info size={15} className="mt-0.5 shrink-0" /> Fees are deducted from the amount you enter and always displayed before you confirm. SDK Pay does not charge account maintenance or inactivity fees. VAT included where applicable by law.</p>
    </Gate>
  );
}
