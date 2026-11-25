import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { Bell, BellRing, CheckCheck, Clock, ArrowUpCircle, ExternalLink, X, CreditCard } from "lucide-react";
import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { deleteNotification, markAllNotificationsRead, deleteAllNotifications } from "@/lib/actions";

function fmtNotifDate(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

function kindIcon(kind: string) {
  switch (kind) {
    case "deposit_pending":
      return <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><Clock size={21} /><span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" /></span>;
    case "deposit_rejected":
      return <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><BellRing size={20} /><span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-amber-50 bg-red-500" /></span>;
    case "withdrawal_confirmed":
      return <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><ArrowUpCircle size={21} /></span>;
    case "payment_received":
      return <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard size={20} /></span>;
    default:
      return <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Bell size={19} /></span>;
  }
}

const kindTarget = (kind: string) =>
  kind.startsWith("deposit") ? "/transactions" : kind.startsWith("withdrawal") ? "/withdraw" : kind === "payment_received" ? "/links" : "/dashboard";

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  const unread = rows.filter((r) => !r.read).length;

  return (
    <Gate>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" aria-label="Back to dashboard" className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"><ChevronLeftIcon /></Link>
          <h1 className="flex items-center gap-2.5 text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
            <Bell size={24} className="text-slate-700" /> Notifications
            {unread > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-extrabold text-white">{unread}</span>}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <form action={markAllNotificationsRead}>
            <button type="submit" title="Mark all as read" aria-label="Mark all as read" className="rounded-xl p-2.5 text-amber-600 transition hover:bg-amber-50"><CheckCheck size={21} /></button>
          </form>
          <form action={deleteAllNotifications}>
            <button type="submit" title="Clear all" aria-label="Clear all" className="rounded-xl p-2.5 text-red-500 transition hover:bg-red-50"><TrashIcon /></button>
          </form>
        </div>
      </div>

      <div className="mt-4 max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {rows.length === 0 && (
          <div className="p-12 text-center">
            <Bell size={36} className="mx-auto text-slate-200" />
            <p className="mt-3 text-[15px] font-bold text-ink">You&apos;re all caught up</p>
            <p className="mt-1 text-[12.5px] text-slate-500">Notifications about deposits, withdrawals and payments will appear here.</p>
          </div>
        )}
        <ul className="divide-y divide-slate-100">
          {rows.map((n) => (
            <li key={n.id} className={`relative flex gap-3 px-4 py-4 ${n.read ? "bg-white" : "bg-[#fffdf0]"}`}>
              <span className="relative shrink-0">
                {kindIcon(n.kind)}
                {!n.read && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold text-ink">{n.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{n.body}</p>
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">{fmtNotifDate(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Link href={kindTarget(n.kind)} aria-label="View details" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><ExternalLink size={17} /></Link>
                <form action={deleteNotification.bind(null, n.id)}>
                  <button type="submit" aria-label="Delete notification" className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"><X size={17} /></button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Gate>
  );
}

const ChevronLeftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const TrashIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
