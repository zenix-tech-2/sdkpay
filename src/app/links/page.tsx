import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Link2 } from "lucide-react";
import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import LinkCard from "@/components/link-card";
import { requireUser } from "@/lib/session";
import { getPaymentLinks } from "@/lib/data";
import { getFlags } from "@/lib/settings";

export default async function LinksPage() {
  const user = await requireUser();
  const [links, flags] = await Promise.all([getPaymentLinks(user.id), getFlags()]);
  const headerList = await headers();
  const host = headerList.get("host") ?? "sdkpay.com";
  const proto = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">My payment links</h1>

      {flags.links ? (
        <Link
          href="/links/new"
          className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 text-[16px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition hover:brightness-105"
        >
          <Plus size={22} strokeWidth={2.5} /> New link
        </Link>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] font-semibold text-amber-800">Payment links are temporarily disabled by SDK Pay. Existing links keep working — new ones can&apos;t be created right now.</div>
      )}

      <SectionLabel><span className="mt-5 block">Recent links</span></SectionLabel>

      {links.length === 0 && (
        <Panel className="p-10 text-center">
          <Link2 size={34} className="mx-auto text-slate-300" />
          <p className="mt-3 text-[15px] font-bold text-ink">No payment links yet</p>
          <p className="mt-1 text-[13px] text-slate-500">Create your first link and start collecting Mobile Money payments in minutes.</p>
        </Panel>
      )}

      <div className="grid max-w-3xl gap-3">
        {links.map((l) => (
          <LinkCard
            key={l.id}
            baseUrl={baseUrl}
            link={{
              id: l.id,
              slug: l.slug,
              title: l.title,
              amount: l.amount === null ? null : Number(l.amount),
              currency: l.currency,
              clicks: l.clicks,
              paymentsCount: l.paymentsCount,
              collected: Number(l.collected),
              active: l.active,
            }}
          />
        ))}
      </div>
    </Gate>
  );
}
