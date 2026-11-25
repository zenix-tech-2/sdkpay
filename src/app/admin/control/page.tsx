import { Wrench, Megaphone, Power } from "lucide-react";
import { getMaintenance, getFlags, getAnnouncement } from "@/lib/settings";
import { MaintenanceForm, FlagsForm, AnnouncementForm } from "@/components/admin-client";

export default async function AdminControlPage() {
  const [maintenance, flags, announcement] = await Promise.all([getMaintenance(), getFlags(), getAnnouncement()]);

  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Wrench size={14} /> App control</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Control centre</h1>
      <p className="text-[12px] text-white/40">Maintenance modes, kill-switches and the announcement bar — changes apply instantly across both deployments.</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        {/* maintenance */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-7">
          <p className="flex items-center gap-2 text-[14px] font-extrabold text-white"><Wrench size={17} className="text-[#FFBD0D]" /> Maintenance mode &amp; notice</p>
          <p className="mt-0.5 text-[11px] text-white/40">Banner keeps the app usable with a notice; Full lockout shows a maintenance screen to every non-admin session.</p>
          <div className="mt-4"><MaintenanceForm maintenance={maintenance} /></div>
        </section>

        {/* kill switches */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-5">
          <p className="flex items-center gap-2 text-[14px] font-extrabold text-white"><Power size={17} className="text-red-400" /> Feature kill-switches</p>
          <p className="mt-0.5 text-[11px] text-white/40">Disabled features fail gracefully with a friendly message — no code deploy needed.</p>
          <div className="mt-4"><FlagsForm flags={flags} /></div>
        </section>

        {/* announcement */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:col-span-12">
          <p className="flex items-center gap-2 text-[14px] font-extrabold text-white"><Megaphone size={17} className="text-sky-400" /> Announcement banner</p>
          <p className="mt-0.5 text-[11px] text-white/40">A one-line strip shown to every signed-in customer above the app — perfect for incidents, incidents updates and promos.</p>
          <div className="mt-4 max-w-2xl"><AnnouncementForm announcement={announcement} /></div>
        </section>
      </div>
    </>
  );
}
