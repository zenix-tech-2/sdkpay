import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Link2, Eye, BadgeCheck, Power, Trash2, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { paymentLinks, users } from "@/db/schema";
import { adminToggleLink, adminDeleteLink } from "@/lib/admin-actions";
import { fmtAmount } from "@/lib/format";

export default async function AdminLinksPage() {
  const rows = await db
    .select({ link: paymentLinks, user: users })
    .from(paymentLinks)
    .innerJoin(users, eq(users.id, paymentLinks.userId))
    .orderBy(desc(paymentLinks.createdAt))
    .limit(100);

  const [stats] = await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where ${paymentLinks.active})::int`,
    clicks: sql<string>`coalesce(sum(${paymentLinks.clicks}), 0)`,
    collected: sql<string>`coalesce(sum(${paymentLinks.collected}), 0)`,
    payments: sql<number>`coalesce(sum(${paymentLinks.paymentsCount}), 0)`,
  }).from(paymentLinks);

  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Link2 size={14} /> Finance</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Payment links</h1>
      <p className="text-[12px] text-white/40">Every link across the platform — deactivate or remove anything abusive.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Links total", String(stats?.total ?? 0)],
          ["Active", String(stats?.active ?? 0)],
          ["Total clicks", String(stats?.clicks ?? 0)],
          ["Collected", `${fmtAmount(Number(stats?.collected ?? 0))} FCFA`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-[20px] font-black text-white">{v}</p>
            <p className="mt-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-white/35">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {rows.map(({ link, user }) => (
          <div key={link.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-nowrap">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${link.active ? "bg-violet-500/15 text-violet-300" : "bg-white/5 text-white/35"}`}><Link2 size={19} /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-white/85"><span className="truncate">{link.title}</span>{link.active && <BadgeCheck size={14} className="shrink-0 text-emerald-400" />}</p>
              <p className="truncate text-[10.5px] text-white/40">@{user.username} · {user.email}</p>
              <p className="mt-0.5 flex items-center gap-2 text-[9.5px] text-white/35"><Eye size={11} /> {link.clicks} clicks · {link.paymentsCount} pmt · {fmtAmount(Number(link.collected))} FCFA · <span className="font-mono">/pay/{link.slug}</span></p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <a href={`/pay/${link.slug}`} target="_blank" rel="noreferrer" aria-label="Open hosted checkout" className="rounded-lg border border-white/10 p-2.5 text-white/50 transition hover:text-white"><ExternalLink size={16} /></a>
              <form action={adminToggleLink.bind(null, link.id)}>
                <button type="submit" aria-label={link.active ? "Deactivate" : "Activate"} className={`rounded-lg border p-2.5 transition ${link.active ? "border-orange-400/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"}`}><Power size={16} /></button>
              </form>
              <form action={adminDeleteLink.bind(null, link.id)}>
                <button type="submit" aria-label="Delete link" className="rounded-lg border border-red-400/30 bg-red-500/5 p-2.5 text-red-400/80 transition hover:bg-red-500/15 hover:text-red-300"><Trash2 size={16} /></button>
              </form>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="rounded-2xl border border-white/[0.06] bg-white/[0.03] py-12 text-center text-[13px] text-white/35">No payment links yet.</p>}
      </div>
    </>
  );
}
