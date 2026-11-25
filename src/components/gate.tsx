import Link from "next/link";
import { requireUser, publicUser } from "@/lib/session";
import { getPrimaryAccount, getUnreadCount } from "@/lib/data";
import { getMaintenance, getAnnouncement } from "@/lib/settings";
import AppShell from "@/components/shell";
import { Wrench, Megaphone, Info, AlertTriangle, OctagonAlert, Headset } from "lucide-react";

function MaintenanceScreen({ title, message, until }: { title: string; message: string; until: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0F2C] px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50rem 34rem at 50% -10%, rgba(255,189,13,0.14), transparent 60%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="SDK Pay mascot" className="relative h-36 w-36 rounded-full object-cover ring-8 ring-[#FFBD0D]/20" />
      <span className="relative mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFBD0D]/15"><Wrench size={24} className="text-[#FFBD0D]" /></span>
      <h1 className="relative mt-4 text-[28px] font-black tracking-tight text-white sm:text-[36px]">{title}</h1>
      <p className="relative mt-2 max-w-md text-[14px] leading-relaxed text-white/60">{message}</p>
      {until && <p className="relative mt-3 rounded-xl border border-[#FFBD0D]/30 bg-[#FFBD0D]/10 px-4 py-2 text-[12px] font-bold text-[#FFBD0D]">Expected back: {until}</p>}
      <a href="mailto:support@sdkpay.com" className="relative mt-8 flex h-12 items-center gap-2 rounded-2xl bg-[#FFBD0D] px-6 text-[14px] font-extrabold text-[#232054] transition hover:brightness-105"><Headset size={17} /> Contact support</a>
      <p className="relative mt-4 text-[11px] text-white/25">SDK Pay · Integrate · Pay · Grow</p>
    </div>
  );
}

function Banner({ maintenance, announcement }: { maintenance: { mode: string; title: string; until: string }; announcement: { active: boolean; text: string; tone: string } }) {
  const items: { tone: string; text: string; icon: React.ReactNode }[] = [];
  if (maintenance.mode === "banner") {
    items.push({ tone: "amber", text: `${maintenance.title}${maintenance.until ? ` — expected back ${maintenance.until}` : ""}`, icon: <Wrench size={14} /> });
  }
  if (announcement.active && announcement.text) {
    items.push({ tone: announcement.tone === "critical" ? "red" : announcement.tone === "warn" ? "amber" : "sky", text: announcement.text, icon: <Megaphone size={14} /> });
  }
  if (!items.length) return null;
  const tone = (t: string) => (t === "amber" ? "border-amber-300 bg-amber-50 text-amber-800" : t === "red" ? "border-red-300 bg-red-50 text-red-800" : "border-sky-300 bg-sky-50 text-sky-800");
  return (
    <div className="mb-4 space-y-2">
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[12px] font-semibold ${tone(item.tone)}`}>
          <span className="shrink-0">{item.icon}</span>
          <span className="min-w-0 flex-1">{item.text}</span>
          {item.tone === "red" ? <OctagonAlert size={15} className="shrink-0" /> : <Info size={15} className="shrink-0 opacity-60" />}
        </div>
      ))}
    </div>
  );
}

export default async function Gate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [maintenance, announcement] = await Promise.all([getMaintenance(), getAnnouncement()]);

  // full maintenance lockout — everyone except admins
  if (maintenance.mode === "full" && user.role !== "admin") {
    return <MaintenanceScreen title={maintenance.title} message={maintenance.message} until={maintenance.until} />;
  }

  const [primary, unread] = await Promise.all([
    getPrimaryAccount(user.id),
    getUnreadCount(user.id),
  ]);
  const bal = primary ? Number(primary.balance) : 0;
  const balance = `${bal.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} FCFA`;
  return (
    <AppShell user={publicUser(user)} balance={balance} unread={unread}>
      {user.role === "admin" && maintenance.mode !== "off" && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-violet-700"><Wrench size={14} /> Maintenance mode: {maintenance.mode} — visible only to admins</div>
      )}
      <Banner maintenance={maintenance} announcement={announcement} />
      {children}
    </AppShell>
  );
}
