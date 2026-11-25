import { Megaphone, BellRing, Info } from "lucide-react";
import { BroadcastForm } from "@/components/admin-client";

export default function AdminBroadcastPage() {
  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Megaphone size={14} /> App control</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Broadcast</h1>
      <p className="text-[12px] text-white/40">Push one message into every customer&apos;s notification inbox — targeted, instant, auditable.</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-7">
          <BroadcastForm />
        </section>
        <aside className="space-y-4 xl:col-span-5">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[12px] font-extrabold text-white/75"><BellRing size={15} className="text-[#FFBD0D]" /> How delivery works</p>
            <ol className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-white/50">
              <li><b className="text-white/80">1.</b> Pick an audience — everyone, KYC-verified, pending, suspended, or admins only.</li>
              <li><b className="text-white/80">2.</b> Write the title and message. Keep it short — it lands in their bell instantly.</li>
              <li><b className="text-white/80">3.</b> The badge on their bell updates; tapping it opens the notifications screen.</li>
            </ol>
          </div>
          <div className="flex items-start gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-[11px] leading-relaxed text-white/45">
            <Info size={14} className="mt-0.5 shrink-0 text-sky-400" />
            <span>Broadcasts are permanent ledger rows in <code className="rounded bg-black/40 px-1">notifications</code> — customers can read and dismiss them individually, but they can&apos;t be unsent. For time-boxed notices (incidents, maintenance), prefer the <b className="text-white/70">announcement banner</b> in Control centre instead of a one-off broadcast.</span>
          </div>
        </aside>
      </div>
    </>
  );
}
