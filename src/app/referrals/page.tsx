import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import ShareButton, { ReferralCopyButton } from "@/components/share-button";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { referrals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { Link2, Timer, ShieldCheck, Users, Percent } from "lucide-react";

export default async function ReferralsPage() {
  const user = await requireUser();
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(referrals).where(eq(referrals.referrerId, user.id));
  const invited = row?.n ?? 0;
  const link = `https://sdkpay.com/reg?ref=${user.referralCode}`;

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Referrals &amp; earnings</h1>
      <p className="text-[13px] text-slate-500">Invite friends, cut your fees in half.</p>

      <div className="mt-4 grid max-w-2xl gap-4">
        {/* personal link */}
        <Panel className="p-5">
          <div className="flex items-start justify-between gap-3">
            <SectionLabel>Your personal link</SectionLabel>
            <span className="rounded-xl bg-amber-50 p-2 text-gold2"><Link2 size={18} /></span>
          </div>
          <p className="text-[17px] font-extrabold leading-snug text-ink">One link,<br />one invited account.</p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[12px] text-slate-600">
            <span className="break-all">{link}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <ReferralCopyButton url={link} />
            <ShareButton title="Join SDK Pay" text="Create your verified SDK Pay account with my invite link:" url={link} />
          </div>
        </Panel>

        {/* reduced fee period */}
        <Panel className="p-5">
          <div className="flex items-start justify-between gap-3">
            <SectionLabel>Reduced-fee period</SectionLabel>
            <span className="rounded-xl bg-amber-50 p-2 text-gold2"><Timer size={18} /></span>
          </div>
          <p className="text-[19px] font-extrabold text-ink">Not unlocked</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">The period starts when your invitee meets the requirements and their account is verified.</p>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[12px] font-semibold text-slate-500">
            <ShieldCheck size={15} className="text-slate-400" /> Program duration: 5 days
          </div>
        </Panel>

        {/* network */}
        <Panel className="overflow-hidden">
          <div className="border-b border-slate-100 p-5 pb-4">
            <SectionLabel>Your network</SectionLabel>
            <p className="text-[17px] font-extrabold text-ink">Invited people</p>
            <p className="mt-0.5 text-[13px] text-slate-500">{invited} associated account{invited === 1 ? "" : "s"}</p>
          </div>
          <div className="flex flex-col items-center px-5 py-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-gold2"><Users size={30} strokeWidth={1.6} /></span>
            <p className="mt-3 text-[15px] font-extrabold text-ink">Your network starts here</p>
          </div>
        </Panel>

        {/* offer */}
        <Panel className="p-5">
          <p className="flex items-center gap-2 text-[17px] font-extrabold text-ink"><Percent size={19} className="text-gold2" /> Get 50% off your fees for 5 days!</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">Get a 50% discount on fees for each eligible Mobile Money deposit and withdrawal for 5 days.</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">This offer applies only to eligible Mobile Money transactions. It reduces transaction fees; it is not a cash payment. USDT transactions are not included.</p>
        </Panel>
      </div>
    </Gate>
  );
}
