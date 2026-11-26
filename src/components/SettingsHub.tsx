"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowUpRight, Bell, Check, CheckCheck, ChevronDown, ChevronRight, Clock3,
  Copy, ExternalLink, Globe2, KeyRound, Lock, Mail, MapPin, Monitor, Moon, Pencil,
  Save, ShieldCheck, Smartphone, Sun, Trash2, Wallet, X, Zap,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatUsdt } from "@/lib/format";

function parseList(value: string, fallback: string[]) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : fallback;
  } catch { return fallback; }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#8b96b0]">{children}</h2>;
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[18px] border border-[#dce5f3] bg-white ${className}`}>{children}</div>;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} className={`relative h-[32px] w-[58px] shrink-0 rounded-full transition ${checked ? "bg-[#ffb800]" : "bg-[#dce5f3]"}`}><span className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow transition-all ${checked ? "left-[29px]" : "left-[3px]"}`} /></button>;
}

function Row({ icon, label, value, action, chevron = false, onClick }: { icon?: ReactNode; label: ReactNode; value?: ReactNode; action?: ReactNode; chevron?: boolean; onClick?: () => void }) {
  const content = <>{icon && <span className="flex w-8 shrink-0 items-center justify-center text-[19px]">{icon}</span>}<span className="min-w-0 flex-1 text-[16px] font-bold text-[#17213d]">{label}</span>{value && <span className="text-[15px] font-semibold text-[#6d7d9e]">{value}</span>}{action}{chevron && <ChevronRight size={20} className="text-[#8b96b0]" />}</>;
  return onClick ? <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-[#edf1f8] px-5 py-4 text-left last:border-b-0 hover:bg-[#f8fbff]">{content}</button> : <div className="flex items-center gap-3 border-b border-[#edf1f8] px-5 py-4 last:border-b-0">{content}</div>;
}

const demoDevices = [
  { label: "Mobile · Chrome", ip: "162.251.62.98", age: "2 days ago", current: true },
  { label: "Mobile · Chrome", ip: "86.105.212.251", age: "6 days ago", current: false },
  { label: "Mobile · Chrome", ip: "86.105.212.251", age: "11 days ago", current: false },
  { label: "Mobile · Chrome", ip: "216.106.182.83", age: "20 days ago", current: false },
];

export function SettingsHubSection() {
  const router = useRouter();
  const { data, refresh } = useDashboard();
  const [theme, setTheme] = useState("light");
  const [notifOpen, setNotifOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prefs, setPrefs] = useState({ notifyEmail: true, notifyPush: false, notifySms: false, notifyMarketing: false });
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!data) return;
    setTheme(data.user.theme);
    setPrefs({ notifyEmail: data.user.notifyEmail, notifyPush: data.user.notifyPush, notifySms: data.user.notifySms, notifyMarketing: data.user.notifyMarketing });
    setFullName(data.user.fullName);
    setEmail(data.user.email);
    setPhone(data.user.phone);
    document.documentElement.dataset.theme = data.user.theme;
    const motion = window.localStorage.getItem("sdkpay_motion") !== "off";
    setMotionEnabled(motion);
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [data]);

  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
  const user = data.user;

  async function savePreferences(payload: Record<string, unknown>) {
    setMessage("");
    const res = await fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { await refresh(); setMessage("✓ Saved"); }
    else setMessage("Unable to save");
    setTimeout(() => setMessage(""), 3000);
  }

  async function changeTheme(next: string) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    await savePreferences({ theme: next });
  }

  function toggleMotion() {
    const next = !motionEnabled;
    setMotionEnabled(next);
    document.documentElement.dataset.motion = next ? "on" : "off";
    window.localStorage.setItem("sdkpay_motion", next ? "on" : "off");
    setMessage(next ? "✓ Motion enabled" : "✓ Motion reduced");
    setTimeout(() => setMessage(""), 2500);
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email, phone }) });
    if (res.ok) { await refresh(); setProfileOpen(false); setMessage("✓ Profile updated"); }
    else setMessage("Unable to update profile");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
    const json = await res.json();
    setMessage(res.ok ? "✓ Password updated" : json.error);
    if (res.ok) { setCurrentPassword(""); setNewPassword(""); setPasswordOpen(false); }
  }

  async function disconnectDevices() {
    const res = await fetch("/api/devices", { method: "DELETE" });
    setMessage(res.ok ? "✓ Other devices disconnected" : "Unable to disconnect devices");
  }

  async function deleteAccount() {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) router.push("/login");
    else setMessage("Unable to delete account");
  }

  function copyId() {
    void navigator.clipboard?.writeText(user.accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-[34px] font-extrabold text-[#111b36] sm:text-[42px]">Settings</h1><Link href="/dashboard/settings/updates" className="flex items-center gap-2 rounded-full border border-[#f0d99a] bg-[#fff8e6] px-4 py-2 text-[14px] font-bold text-[#e5a300]"><span>📣</span> Updates</Link></div>

      <SectionTitle>PROFILE</SectionTitle>
      <Panel>
        <div className="flex items-center gap-4 px-5 py-5">
          <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf75] to-[#e98d33] text-[30px]">🙂</span>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[20px] font-extrabold text-[#17213d]">{user.fullName}</p><button onClick={() => setProfileOpen(!profileOpen)} className="text-[#6d7d9e]"><Pencil size={16} /></button></div><p className="text-[14px] text-[#6d7d9e]">@{user.username}</p></div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#e6f8ee] px-3 py-1.5 text-[13px] font-extrabold text-[#12a150]"><ShieldCheck size={15} /> Verified</span>
        </div>
        {profileOpen && <form onSubmit={saveProfile} className="space-y-3 border-t border-[#edf1f8] bg-[#f8fbff] p-5"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-[48px] w-full rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><input value={email} onChange={(e) => setEmail(e.target.value)} className="h-[48px] w-full rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-[48px] w-full rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><button className="brand-btn h-[46px] w-full rounded-[12px] text-[14px]">Save profile</button></form>}
        <Row icon={<span className="text-[13px] font-black">ID</span>} label="ID" value={user.accountId} action={<button onClick={copyId} className="text-[#8b96b0]">{copied ? <Check size={18} /> : <Copy size={18} />}</button>} />
        <Row icon={<Mail size={19} className="text-[#1e8ef0]" />} label="Email" value={user.email.length > 18 ? `${user.email.slice(0, 16)}...` : user.email} />
        <Row icon={<Smartphone size={19} className="text-[#1e8ef0]" />} label="Phone" value={user.phone} />
        <Row icon={<MapPin size={19} className="text-[#17213d]" />} label="Country" value="Cameroun" />
      </Panel>

      <SectionTitle>VERIFICATION</SectionTitle>
      <Panel><Row icon={<ShieldCheck size={22} className="text-[#1d63b8]" />} label="KYC Verification" value="Verified" action={<ShieldCheck size={20} className="text-[#12a150]" />} /></Panel>

      <SectionTitle>APPEARANCE</SectionTitle>
      <Panel>
        <div className="flex items-center gap-3 px-5 py-4"><span className="flex w-8 justify-center text-[20px]">🎨</span><span className="flex-1 text-[16px] font-bold text-[#17213d]">Theme</span><div className="flex rounded-full bg-[#eef2fa] p-1"><button onClick={() => void changeTheme("light")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold ${theme === "light" ? "bg-white text-[#17213d] shadow" : "text-[#8b96b0]"}`}><Sun size={16} /> Light</button><button onClick={() => void changeTheme("dark")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold ${theme === "dark" ? "bg-white text-[#17213d] shadow" : "text-[#8b96b0]"}`}><Moon size={16} /> Dark</button></div></div>
        <Row icon={<Zap size={20} className="text-[#e5a300]" />} label="Motion & transitions" value="Animations" action={<Switch checked={motionEnabled} onChange={toggleMotion} />} />
      </Panel>

      <SectionTitle>FINANCES</SectionTitle>
      <Panel>
        <Row icon={<Wallet size={20} className="text-[#1d63b8]" />} label="Withdrawal numbers" value="Manage" chevron onClick={() => router.push("/dashboard/settings/withdrawal-numbers")} />
        <Row icon={<span className="text-[20px]">💱</span>} label="Automatic conversion" value="Configure" chevron onClick={() => router.push("/dashboard/settings/conversion")} />
      </Panel>

      <SectionTitle>NOTIFICATIONS</SectionTitle>
      <Panel>
        <Row icon={<Bell size={20} className="text-[#17213d]" />} label="Notification preferences" action={<ChevronDown size={20} className={`text-[#8b96b0] transition ${notifOpen ? "rotate-180" : ""}`} />} onClick={() => setNotifOpen(!notifOpen)} />
        {notifOpen && (
          <div className="border-t border-[#edf1f8]">
            {[
              ["Email notifications", "Email alerts", "notifyEmail", <Mail size={19} className="text-[#1e8ef0]" />],
              ["Push notifications", "Browser alerts", "notifyPush", <Bell size={19} className="text-[#17213d]" />],
              ["SMS notifications", "SMS alerts", "notifySms", <Smartphone size={19} className="text-[#12a150]" />],
              ["Marketing communications", "News and promotions", "notifyMarketing", <Globe2 size={19} className="text-[#f07800]" />],
            ].map(([title, subtitle, key, icon]) => (
              <div key={key as string} className="flex items-center gap-3 border-b border-[#edf1f8] px-5 py-4 last:border-b-0"><span className="flex w-8 justify-center">{icon}</span><div className="flex-1"><p className="text-[15px] font-bold text-[#17213d]">{title as string}</p><p className="text-[12px] text-[#8b96b0]">{subtitle as string}</p></div><Switch checked={prefs[key as keyof typeof prefs]} onChange={() => setPrefs({ ...prefs, [key as keyof typeof prefs]: !prefs[key as keyof typeof prefs] })} /></div>
            ))}
            <div className="p-4"><button onClick={() => void savePreferences(prefs)} className="flex h-[46px] items-center gap-2 rounded-[12px] border border-[#dce5f3] px-4 text-[14px] font-bold text-[#25314d]"><Save size={16} /> Save</button></div>
          </div>
        )}
      </Panel>

      <SectionTitle>SECURITY &amp; API</SectionTitle>
      <Panel>
        <Row icon={<Lock size={20} className="text-[#17213d]" />} label="Change password" action={<ChevronDown size={20} className={`text-[#8b96b0] transition ${passwordOpen ? "rotate-180" : ""}`} />} onClick={() => setPasswordOpen(!passwordOpen)} />
        {passwordOpen && <form onSubmit={changePassword} className="space-y-3 border-b border-[#edf1f8] bg-[#f8fbff] p-5"><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="h-[46px] w-full rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="h-[46px] w-full rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><button className="brand-btn h-[44px] w-full rounded-[12px] text-[14px]">Update password</button></form>}
        <Row icon={<KeyRound size={20} className="text-[#6d7d9e]" />} label="PIN" value="Configured" action={<ChevronDown size={20} className={`text-[#8b96b0] transition ${pinOpen ? "rotate-180" : ""}`} />} onClick={() => setPinOpen(!pinOpen)} />
        {pinOpen && <div className="flex gap-2 border-b border-[#edf1f8] bg-[#f8fbff] p-5"><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="New 4-digit PIN" className="h-[46px] min-w-0 flex-1 rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><button onClick={() => void savePreferences({ pinConfigured: true })} className="brand-btn rounded-[12px] px-4 text-[14px]">Save PIN</button></div>}
        <Row icon={<span className="text-[18px]">⚙️</span>} label="API & intégrations" chevron onClick={() => router.push("/dashboard/api")} />
      </Panel>

      <SectionTitle>CONNECTED DEVICES</SectionTitle>
      <Panel>
        {demoDevices.map((device, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-[#edf1f8] px-5 py-4 last:border-b-0"><Monitor size={20} className="text-[#1d63b8]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[15px] font-bold text-[#17213d]">{device.label}</p>{device.current && <span className="rounded-full bg-[#e6f8ee] px-2 py-0.5 text-[10px] font-extrabold text-[#12a150]">This device</span>}</div><p className="mt-1 flex items-center gap-3 text-[11px] text-[#8b96b0]"><span className="flex items-center gap-1"><MapPin size={12} /> {device.ip}</span><span className="flex items-center gap-1"><Clock3 size={12} /> {device.age}</span></p></div>{!device.current && <ExternalLink size={18} className="text-[#8b96b0]" />}</div>
        ))}
        <button onClick={() => void disconnectDevices()} className="flex w-full items-center gap-2 border-t border-[#edf1f8] px-5 py-4 text-[14px] font-bold text-[#f0475e]"><LogOutIcon /> Disconnect all other devices (3)</button>
      </Panel>

      <SectionTitle>DANGER ZONE</SectionTitle>
      <Panel><button onClick={() => setDeleteOpen(true)} className="flex w-full items-center gap-3 px-5 py-5 text-left"><Trash2 size={21} className="text-[#f0475e]" /><span><span className="block text-[16px] font-bold text-[#f0475e]">Delete my account</span><span className="block text-[12px] text-[#8b96b0]">Irreversible action</span></span><ChevronRight size={20} className="ml-auto text-[#8b96b0]" /></button></Panel>
      {message && <p className="mt-4 rounded-lg bg-[#e3f6eb] px-3 py-2 text-[12px] font-bold text-[#218c55]">{message}</p>}

      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={() => setDeleteOpen(false)}>
          <div className="w-full max-w-[390px] rounded-[20px] bg-white p-6" onClick={(e) => e.stopPropagation()}><h2 className="text-[20px] font-extrabold text-[#17213d]">Delete my account?</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">This action is irreversible. All wallets, links and transactions will be removed.</p><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => setDeleteOpen(false)} className="h-[48px] rounded-[12px] border border-[#dce5f3] font-bold text-[#25314d]">Cancel</button><button onClick={() => void deleteAccount()} className="h-[48px] rounded-[12px] bg-[#f0475e] font-bold text-white">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}

function LogOutIcon() {
  return <span className="text-[17px]">↪</span>;
}

export function AutomaticConversionSection() {
  const router = useRouter();
  const { data, refresh } = useDashboard();
  const [sources, setSources] = useState<string[]>(["USD", "EUR", "XOF", "GBP"]);
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!data) return;
    setSources(parseList(data.user.conversionSources, ["USD", "EUR", "XOF", "GBP"]));
    setDestination(data.user.conversionDestination);
  }, [data]);
  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
  const flags: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", XOF: "🇲🇱", GBP: "🇬🇧" };
  const destinations = data.wallets ?? [];

  async function activate() {
    if (!destination) return;
    const res = await fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversionSources: sources, conversionDestination: destination, conversionActive: true }) });
    if (res.ok) { await refresh(); router.push("/dashboard/settings"); }
    else setMessage("Unable to activate conversion rule");
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex items-center gap-3"><Link href="/dashboard/settings" className="text-[#6d7d9e]"><ArrowLeft size={22} /></Link><Zap size={26} className="text-[#e5a300]" /><h1 className="font-display text-[28px] font-extrabold text-[#111b36] sm:text-[34px]">Automatic conversion</h1></div>
      <div className="mt-6 rounded-[18px] border border-[#c9d8f4] bg-[#f5f8ff] p-5 text-[14px] leading-relaxed text-[#5d6882]">Conversion starts when the available source wallet balance reaches at least the equivalent of <strong className="text-[#17213d]">500 FCFA</strong>. Smaller credits accumulate until this threshold is reached.</div>
      <div className="mt-5 rounded-[20px] border-2 border-[#ffd66b] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[20px] font-extrabold text-[#17213d]"><span className="text-[#e5a300]">＋</span> New conversion rule</h2>
        <p className="mt-6 text-[12px] font-extrabold tracking-[.14em] text-[#6d7d9e]">SOURCE WALLETS: INCOMING FUNDS</p>
        <div className="mt-3 flex items-center gap-3 rounded-[16px] border-2 border-[#ffb800] px-4 py-4"><Wallet size={24} className="text-[#6d7d9e]" /><span className="min-w-0 flex-1 text-[18px] font-bold text-[#17213d]">{sources.join(", ")}</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb800] text-[14px] font-extrabold text-white">{sources.length}</span><ChevronRight size={22} className="text-[#6d7d9e]" /></div>
        <div className="mt-3 flex flex-wrap gap-2">{sources.map((source) => <button key={source} onClick={() => setSources(sources.filter((item) => item !== source))} className="flex items-center gap-2 rounded-full bg-[#fff5d9] px-3 py-2 text-[13px] font-bold text-[#17213d]"><span>{flags[source] ?? "💱"}</span>{source}<X size={14} className="text-[#f0475e]" /></button>)}</div>
        <div className="my-6 flex items-center gap-3 text-[13px] font-semibold text-[#6d7d9e]"><span className="h-px flex-1 bg-[#dce5f3]" /><span className="text-[#e5a300]">→</span> converted to <span className="h-px flex-1 bg-[#dce5f3]" /></div>
        <p className="text-[12px] font-extrabold tracking-[.14em] text-[#6d7d9e]">DESTINATION WALLET</p>
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-3 h-[62px] w-full appearance-none rounded-[14px] border-2 border-[#ffb800] bg-white px-4 text-[15px] font-semibold text-[#17213d] outline-none"><option value="">Choose the destination...</option>{destinations.map((wallet) => <option key={wallet.id} value={wallet.currency}>{wallet.flag} {wallet.currency} · {wallet.countryName}</option>)}</select>
        <div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => router.push("/dashboard/settings")} className="h-[56px] rounded-[14px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#25314d]">Cancel</button><button onClick={() => void activate()} disabled={!destination || sources.length === 0} className={`flex h-[56px] items-center justify-center gap-2 rounded-[14px] text-[16px] font-extrabold text-white ${destination && sources.length ? "brand-btn" : "cursor-not-allowed bg-[#f7d477]"}`}><Zap size={18} /> Activate ({sources.length})</button></div>
        {message && <p className="mt-3 text-[12px] font-semibold text-[#c83c3c]">{message}</p>}
      </div>
    </div>
  );
}

export function UpdatesSection() {
  const [open, setOpen] = useState(1);
  const updates = [
    { title: "Security update", month: "July 2026", icon: <ShieldCheck size={20} />, body: "Additional session hardening and improved monitoring for suspicious account activity." },
    { title: "Reduced transaction fees", month: "July 2026", icon: <ArrowUpRight size={20} />, bullets: ["Lower fees for Mobile Money transactions", "New competitive rates for cross-border transfers", "Minimum fees adjusted for small amounts", "Full transparency: fees shown before confirmation"] },
    { title: "Reduced conversion fees", month: "July 2026", icon: <Wallet size={20} />, body: "Lower automatic-conversion fees and clearer rate previews before activation." },
  ];
  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/dashboard/settings" className="flex items-center gap-2 text-[14px] font-semibold text-[#6d7d9e]"><ArrowLeft size={18} /> Settings</Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-[34px] font-extrabold text-[#111b36] sm:text-[42px]">Updates</h1><p className="mt-1 text-[15px] text-[#6d7d9e]">What&apos;s new and improved</p></div><span className="flex items-center gap-2 rounded-full border border-[#dce5f3] bg-white px-4 py-2 text-[13px] font-bold text-[#3c4966]"><span className="h-2 w-2 rounded-full bg-[#ffb800]" /> v1 · 7h ASH</span></div>
      <div className="mt-6 space-y-4">
        {updates.map((update, index) => (
          <div key={update.title} className={`overflow-hidden rounded-[18px] border bg-white ${open === index ? "border-[#ffd66b]" : "border-[#dce5f3]"}`}>
            <button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center gap-3 px-5 py-5 text-left"><span className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#f1f5fc] text-[#5d6882]">{update.icon}</span><div className="flex-1"><p className="text-[12px] font-semibold text-[#8b96b0]">#{String(index + 1).padStart(2, "0")} — {update.month}</p><p className="text-[16px] font-extrabold text-[#17213d]">{update.title}</p></div><ChevronDown size={20} className={`text-[#8b96b0] transition ${open === index ? "rotate-180" : ""}`} /></button>
            {open === index && <div className="border-t border-[#edf1f8] px-5 py-5">{update.bullets ? <><p className="text-[14px] leading-relaxed text-[#6d7d9e]">Transaction fees have been lowered in several countries to offer you better rates.</p><ul className="mt-4 space-y-3">{update.bullets.map((item) => <li key={item} className="flex gap-3 text-[15px] text-[#17213d]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffb800]" />{item}</li>)}</ul></> : <p className="text-[14px] leading-relaxed text-[#6d7d9e]">{update.body}</p>}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WithdrawalNumbersSection() {
  const router = useRouter();
  const { data, refresh } = useDashboard();
  const [numbers, setNumbers] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { if (data) setNumbers(parseList(data.user.withdrawalNumbers, ["651010478", "690326932"])); }, [data]);
  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
  async function save(next: string[]) {
    const res = await fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalNumbers: next }) });
    if (res.ok) { setNumbers(next); await refresh(); setMessage("✓ Saved"); } else setMessage("Unable to save");
    setTimeout(() => setMessage(""), 3000);
  }
  return (
    <div className="mx-auto max-w-[760px]"><Link href="/dashboard/settings" className="flex items-center gap-2 text-[14px] font-semibold text-[#6d7d9e]"><ArrowLeft size={18} /> Settings</Link><h1 className="font-display mt-5 text-[31px] font-extrabold text-[#111b36]">Withdrawal numbers</h1><Panel className="mt-5">{numbers.map((number) => <div key={number} className="flex items-center gap-3 border-b border-[#edf1f8] px-5 py-4 last:border-b-0"><Smartphone size={19} className="text-[#1e8ef0]" /><span className="flex-1 text-[15px] font-bold text-[#17213d]">{number}</span><button onClick={() => void save(numbers.filter((item) => item !== number))} className="text-[#f0475e]"><X size={18} /></button></div>)}<div className="flex gap-2 bg-[#f8fbff] p-4"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add a phone number" className="h-[48px] min-w-0 flex-1 rounded-[12px] border border-[#dce5f3] px-3 text-[14px]" /><button onClick={() => { if (value.trim() && !numbers.includes(value.trim())) { void save([...numbers, value.trim()]); setValue(""); } }} className="brand-btn rounded-[12px] px-4 text-[14px]">Add</button></div></Panel>{message && <p className="mt-4 text-[13px] font-bold text-[#218c55]">{message}</p>}<button onClick={() => router.push("/dashboard/settings")} className="mt-5 h-[52px] w-full rounded-[14px] border border-[#dce5f3] bg-white text-[15px] font-bold text-[#25314d]">Done</button></div>
  );
}

function notificationDate(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date);
  return `${day} at ${time}`;
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "pending") return <Clock3 size={21} className="text-[#e5a300]" />;
  if (type === "confirmed") return <ArrowUpRight size={21} className="text-[#f07800]" />;
  return <Bell size={21} className="text-[#17213d]" />;
}

export function NotificationsPage() {
  const { data, refresh } = useDashboard();
  const [message, setMessage] = useState("");
  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
  const items = data.notifications ?? [];
  const unread = items.filter((item) => !item.isRead).length;

  async function mutate(method: "PATCH" | "DELETE", body?: unknown, query = "") {
    const res = await fetch(`/api/notifications${query}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    if (res.ok) { await refresh(); setMessage("✓ Updated"); } else setMessage("Unable to update");
    setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex items-center gap-3"><Link href="/dashboard/settings" className="text-[#6d7d9e]"><ArrowLeft size={22} /></Link><Bell size={23} className="text-[#17213d]" /><h1 className="font-display text-[24px] font-extrabold text-[#111b36]">Notifications</h1><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4d63] text-[12px] font-extrabold text-white">{unread}</span><button onClick={() => void mutate("PATCH", { all: true })} className="ml-auto text-[#e5a300]" aria-label="Mark all read"><CheckCheck size={22} /></button><button onClick={() => void mutate("DELETE", undefined, "?all=1")} className="text-[#f0475e]" aria-label="Delete all"><Trash2 size={21} /></button></div>
      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#dce5f3] bg-white">
        {items.length === 0 && <p className="px-5 py-12 text-center text-[14px] text-[#8b96b0]">No notifications</p>}
        {items.map((item) => (
          <div key={item.id} className={`relative flex gap-3 border-b border-[#edf1f8] px-5 py-5 last:border-b-0 ${item.isRead ? "bg-white" : "bg-[#fffaf0]"}`}>
            {!item.isRead && <span className="absolute left-[38px] top-[18px] h-[7px] w-[7px] rounded-full bg-[#ff4d63]" />}
            <span className="mt-1 flex w-6 shrink-0 justify-center"><NotificationIcon type={item.type} /></span>
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-[17px] font-bold text-[#17213d]">{item.title}</p><a href={item.link || "#"} className="text-[#8b96b0]"><ExternalLink size={16} /></a></div><p className="mt-2 text-[14px] leading-relaxed text-[#6d7d9e]">{item.message}</p><p className="mt-3 text-[12px] text-[#8b96b0]">{notificationDate(item.createdAt)}</p></div>
            <button onClick={() => void mutate("DELETE", undefined, `?id=${item.id}`)} className="self-start text-[#f0475e]"><X size={21} /></button>
          </div>
        ))}
      </div>
      {message && <p className="mt-4 text-[13px] font-bold text-[#218c55]">{message}</p>}
    </div>
  );
}
