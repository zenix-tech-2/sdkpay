import Link from "next/link";
import { Plus, ChevronRight, Coins, BadgeDollarSign } from "lucide-react";
import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { getAccounts } from "@/lib/data";
import { flagUrl } from "@/lib/countries";
import { fmtAmount } from "@/lib/format";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await getAccounts(user.id);
  const sorted = [...accounts].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return (
    <Gate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">My Accounts</h1>
        <Link href="/accounts/new" className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[14px] font-bold text-ink shadow-sm transition hover:border-gold">
          <Plus size={19} strokeWidth={2.5} /> Add account
        </Link>
      </div>

      {/* wallets summary */}
      <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-6 text-white shadow-lg">
        <div>
          <p className="text-[13px] font-medium text-white/65">Wallets</p>
          <p className="mt-1 text-[44px] font-black leading-none">{accounts.length}</p>
          <p className="mt-1.5 text-[12px] font-medium text-white/60">active accounts</p>
        </div>
        <div className="hidden h-16 w-px bg-white/10 sm:block" />
        <Link href="/conversion" className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/5 px-5 py-4 text-[13px] font-bold text-white/60 transition hover:border-gold/50 hover:text-gold">
          <BadgeDollarSign size={22} />
          <span className="text-center leading-tight">Request<br />conversion</span>
        </Link>
      </div>

      {/* wallet rows */}
      <div className="mt-4 max-w-2xl space-y-3">
        {sorted.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-slate-100">
              {a.currency === "USDT" ? (
                <span className="flex h-full w-full items-center justify-center bg-[#26a17b] text-[20px] font-black text-white">₮</span>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={flagUrl(a.countryCode)} alt={a.country} className="h-full w-full object-cover" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[17px] font-extrabold text-ink">
                {a.currency}
                {a.isPrimary && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-amber-700">Primary</span>}
              </p>
              <p className="text-[12px] text-slate-500">{a.country} {a.currency !== "USDT" ? a.currency : ""}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[19px] font-extrabold text-ink">{fmtAmount(Number(a.balance), Number(a.balance) % 1 !== 0 ? 2 : 0)}</p>
              <p className="text-[11px] text-slate-400">{a.currency === "USDT" ? "USDT" : "FCFA"}</p>
            </div>
            <Link href="/conversion" aria-label="Convert" className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-gold2 transition hover:bg-amber-100">
              <Coins size={19} />
            </Link>
          </div>
        ))}

        {/* add account dashed row */}
        <Link href="/accounts/new" className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-slate-500 transition hover:border-gold hover:text-navy2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300"><Plus size={22} /></span>
          <span className="flex-1 text-[15px] font-bold">Add account</span>
          <ChevronRight size={18} />
        </Link>
      </div>
    </Gate>
  );
}
