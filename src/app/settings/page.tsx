import Link from "next/link";
import {
  Megaphone, BadgeCheck, Fingerprint, Mail, Phone, MapPin, ShieldCheck, SunMoon,
  Landmark, ArrowLeftRight, ChevronRight, Bell, Lock, KeyRound, Code2, MonitorSmartphone,
  LogOut, ChevronLeft, CircleCheck,
} from "lucide-react";
import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import { CopyButton, Accordion } from "@/components/bits";
import { ProfileEditor, ThemeToggle, NotificationPrefs, ChangePasswordForm, PinCard, PayoutManager, DangerZone } from "@/components/settings-client";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { devices, payoutMethods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { disconnectDevice, disconnectOtherDevices } from "@/lib/actions";

export default async function SettingsPage() {
  const user = await requireUser();
  const [deviceRows, payoutRows] = await Promise.all([
    db.select().from(devices).where(eq(devices.userId, user.id)).orderBy(desc(devices.createdAt)),
    db.select().from(payoutMethods).where(eq(payoutMethods.userId, user.id)),
  ]);
  const others = deviceRows.filter((d) => !d.current);

  return (
    <Gate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Settings</h1>
        <Link href="/updates" className="flex h-12 items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 text-[13.5px] font-bold text-amber-700 transition hover:bg-amber-100">
          <Megaphone size={17} /> Updates
        </Link>
      </div>

      {/* PROFILE */}
      <SectionLabel><span className="mt-5 block">Profile</span></SectionLabel>
      <Panel className="max-w-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-4 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="Profile" className="h-[4.5rem] w-[4.5rem] rounded-2xl border border-amber-200 object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[17px] font-extrabold text-ink">{user.fullName}</p>
              <ProfileEditor fullName={user.fullName} phone={user.phone} email={user.email} />
            </div>
            <p className="text-[12.5px] text-slate-500">@{user.username}</p>
          </div>
          {user.kycStatus === "verified" ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-extrabold text-emerald-600"><BadgeCheck size={15} /> Verified</span>
          ) : (
            <span className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 text-[12px] font-extrabold text-amber-700">KYC pending</span>
          )}
        </div>
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <Fingerprint size={18} className="shrink-0 text-slate-400" />
            <span className="w-16 text-[13.5px] font-bold text-ink">ID</span>
            <span className="min-w-0 flex-1 truncate text-right font-mono text-[12.5px] font-semibold text-slate-500">{user.publicId}</span>
            <CopyButton text={user.publicId} />
          </div>
          {[
            { icon: Mail, tint: "text-blue-500", label: "Email", value: user.email },
            { icon: Phone, tint: "text-blue-600", label: "Phone", value: user.phone ?? "—" },
            { icon: MapPin, tint: "text-slate-800", label: "Country", value: user.country ?? "Cameroun" },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                <Icon size={18} className={`shrink-0 ${row.tint}`} />
                <span className="w-16 text-[13.5px] font-bold text-ink">{row.label}</span>
                <span className="min-w-0 flex-1 truncate text-right text-[12.5px] font-medium text-slate-500">{row.value}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* VERIFICATION */}
      <SectionLabel><span className="mt-6 block">Verification</span></SectionLabel>
      <Link href="/kyc" className="flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50"><ShieldCheck size={22} className="text-blue-600" /></span>
        <span className="flex-1 text-[14.5px] font-bold text-ink">KYC Verification</span>
        <span className="text-[13px] font-semibold text-slate-500">Verified</span>
        <CircleCheck size={19} className="text-emerald-500" />
      </Link>

      {/* APPEARANCE */}
      <SectionLabel><span className="mt-6 block">Appearance</span></SectionLabel>
      <div className="flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100"><SunMoon size={21} className="text-slate-600" /></span>
        <span className="flex-1 text-[14.5px] font-bold text-ink">Theme</span>
        <ThemeToggle />
      </div>

      {/* FINANCES */}
      <SectionLabel><span className="mt-6 block">Finances</span></SectionLabel>
      <Panel className="max-w-2xl overflow-hidden">
        <Link href="/settings#payout-numbers" className="flex items-center gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50"><Landmark size={20} className="text-sky-600" /></span>
          <span className="min-w-0 flex-1 text-[14px] font-bold text-ink">Withdrawal numbers</span>
          <span className="text-[12.5px] font-semibold text-slate-500">Manage</span>
          <ChevronRight size={17} className="text-slate-300" />
        </Link>
        <Link href="/conversion" className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50"><ArrowLeftRight size={19} className="text-violet-600" /></span>
          <span className="min-w-0 flex-1 text-[14px] font-bold text-ink">Automatic conversion</span>
          <span className="text-[12.5px] font-semibold text-slate-500">Configure</span>
          <ChevronRight size={17} className="text-slate-300" />
        </Link>
      </Panel>

      {/* PAYOUT NUMBERS (anchored) */}
      <div id="payout-numbers" className="scroll-mt-24">
        <SectionLabel><span className="mt-6 block">Withdrawal numbers</span></SectionLabel>
        <Panel className="max-w-2xl p-4">
          <PayoutManager methods={payoutRows.map((p) => ({ id: p.id, operator: p.operator, phone: p.phone, label: p.label }))} />
        </Panel>
      </div>

      {/* NOTIFICATIONS */}
      <SectionLabel><span className="mt-6 block">Notifications</span></SectionLabel>
      <Panel className="max-w-2xl overflow-hidden">
        <Accordion title="Notification preferences" icon={<Bell size={19} className="text-slate-700" />}>
          <NotificationPrefs />
        </Accordion>
      </Panel>

      {/* SECURITY & API */}
      <SectionLabel><span className="mt-6 block">Security &amp; API</span></SectionLabel>
      <Panel className="max-w-2xl divide-y divide-slate-100 overflow-hidden">
        <Accordion title="Change password" icon={<Lock size={19} className="text-slate-700" />}>
          <ChangePasswordForm />
        </Accordion>
        <Accordion title="PIN" icon={<KeyRound size={19} className="text-slate-700" />} right={<span className="text-[12px] font-semibold text-slate-400">Configured</span>}>
          <PinCard />
        </Accordion>
        <Link href="/api" className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><Code2 size={19} className="text-indigo-600" /></span>
          <span className="flex-1 text-[14.5px] font-bold text-ink">API &amp; intégrations</span>
          <ChevronRight size={17} className="text-slate-300" />
        </Link>
      </Panel>

      {/* CONNECTED DEVICES */}
      <SectionLabel><span className="mt-6 block">Connected devices</span></SectionLabel>
      <Panel className="max-w-2xl overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {deviceRows.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3.5">
              <MonitorSmartphone size={22} className="shrink-0 text-slate-400" strokeWidth={1.8} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-ink">
                  {d.label}
                  {d.current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">This device</span>}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400">{d.ip} · {d.lastActive}</span>
              </span>
              {!d.current && (
                <form action={disconnectDevice.bind(null, d.id)}>
                  <button type="submit" aria-label="Disconnect device" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><LogOut size={17} /></button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {others.length > 0 && (
          <form action={disconnectOtherDevices} className="border-t border-slate-100">
            <button type="submit" className="flex w-full items-center gap-2 px-4 py-3.5 text-[13px] font-bold text-red-500 transition hover:bg-red-50/50"><LogOut size={16} /> Disconnect all other devices ({others.length})</button>
          </form>
        )}
      </Panel>

      {/* DANGER ZONE */}
      <SectionLabel><span className="mt-6 block">Danger zone</span></SectionLabel>
      <Panel className="max-w-2xl overflow-hidden border-red-100">
        <DangerZone />
      </Panel>

      <div className="h-4" />
    </Gate>
  );
}
