"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Megaphone,
  Pencil,
  Copy,
  Check,
  Fingerprint,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Palette,
  Sun,
  Moon,
  ArrowDownToLine,
  ArrowLeftRight,
  Bell,
  Lock,
  KeyRound,
  CodeXml,
  ChevronRight,
  ChevronDown,
  MonitorSmartphone,
  MapPinned,
  Clock,
  LogOut,
  Trash2,
  X,
  Loader2,
  Save,
  Plus,
} from "lucide-react";
import { timeAgo } from "@/lib/format";

function publicId(uuid: string) {
  let h = 7;
  for (const c of uuid) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return `SDKPAY${String(h % 10000000000).padStart(10, "0")}`;
}

interface Me {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  kycStatus: string;
}

interface Device {
  id: string;
  tokenId: string;
  device: string | null;
  ip: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

interface SavedNumber {
  id: string;
  label: string | null;
  phone: string | null;
  operator: string | null;
  country: string | null;
}

const GOLD = "#f0a500";

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // profile edit
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", username: "", phone: "" });
  const [pMsg, setPMsg] = useState("");
  // numbers
  const [numbers, setNumbers] = useState<SavedNumber[]>([]);
  const [numOpen, setNumOpen] = useState(false);
  const [addPhone, setAddPhone] = useState("");
  const [addLabel, setAddLabel] = useState("");
  // notifs
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({ email: true, push: false, sms: false, marketing: false });
  const [prefsSaved, setPrefsSaved] = useState(false);
  // password
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  // pin
  const [pinOpen, setPinOpen] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [pinForm, setPinForm] = useState({ current: "", next: "", confirm: "" });
  const [pinMsg, setPinMsg] = useState("");
  // devices
  const [devices, setDevices] = useState<Device[]>([]);
  // danger
  const [delOpen, setDelOpen] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delConfirm, setDelConfirm] = useState("");
  const [delErr, setDelErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sdkpay-theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setMe(d.user);
          setProfile({ fullName: d.user.fullName, username: d.user.username, phone: d.user.phone });
        }
      })
      .catch(() => {});
    fetch("/api/numbers")
      .then((r) => r.json())
      .then((d) => setNumbers((d.numbers ?? []).filter((n: SavedNumber & { kind: string }) => n.kind !== "crypto")))
      .catch(() => {});
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((d) => d.prefs && setPrefs(d.prefs))
      .catch(() => {});
    fetch("/api/user/pin")
      .then((r) => r.json())
      .then((d) => setPinSet(!!d.configured))
      .catch(() => {});
    fetch("/api/devices")
      .then((r) => r.json())
      .then((d) => setDevices(d.devices ?? []))
      .catch(() => {});
  }, []);

  function switchTheme(t: "light" | "dark") {
    setTheme(t);
    localStorage.setItem("sdkpay-theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    window.dispatchEvent(new CustomEvent("sdkpay-theme", { detail: t }));
  }

  function copyId() {
    if (!me) return;
    navigator.clipboard.writeText(publicId(me.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveProfile() {
    setPMsg("");
    const r = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const d = await r.json();
    if (!r.ok) {
      setPMsg(d.error);
      return;
    }
    setPMsg("Saved!");
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setMe(d.user));
    setTimeout(() => {
      setEditOpen(false);
      setPMsg("");
    }, 800);
  }

  async function savePrefs() {
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1500);
  }

  async function changePassword() {
    setPwErr("");
    setPwMsg("");
    if (pw.next !== pw.confirm) {
      setPwErr("New passwords do not match.");
      return;
    }
    const r = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: pw.current, next: pw.next }),
    });
    const d = await r.json();
    if (!r.ok) {
      setPwErr(d.error);
      return;
    }
    setPwMsg("Password changed successfully.");
    setPw({ current: "", next: "", confirm: "" });
  }

  async function savePin() {
    setPinMsg("");
    if (pinForm.next !== pinForm.confirm) {
      setPinMsg("PINs do not match.");
      return;
    }
    const r = await fetch("/api/user/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin: pinForm.current, newPin: pinForm.next }),
    });
    const d = await r.json();
    if (!r.ok) {
      setPinMsg(d.error);
      return;
    }
    setPinMsg("PIN saved. It will be required for withdrawals and transfers.");
    setPinSet(true);
    setPinForm({ current: "", next: "", confirm: "" });
  }

  async function disconnect(id: string) {
    await fetch(`/api/devices?id=${id}`, { method: "DELETE" });
    const r = await fetch("/api/devices");
    const d = await r.json();
    setDevices(d.devices ?? []);
  }

  async function disconnectOthers() {
    if (!confirm("Disconnect all other devices?")) return;
    await fetch("/api/devices?others=1", { method: "DELETE" });
    const r = await fetch("/api/devices");
    const d = await r.json();
    setDevices(d.devices ?? []);
  }

  async function addNumber() {
    if (addPhone.trim().length < 4) return;
    await fetch("/api/numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "momo", label: addLabel, phone: addPhone.trim(), country: me?.country }),
    });
    setAddPhone("");
    setAddLabel("");
    const r = await fetch("/api/numbers");
    const d = await r.json();
    setNumbers((d.numbers ?? []).filter((n: SavedNumber & { kind: string }) => n.kind !== "crypto"));
  }

  async function deleteNumber(id: string) {
    await fetch(`/api/numbers?id=${id}`, { method: "DELETE" });
    setNumbers((n) => n.filter((x) => x.id !== id));
  }

  async function deleteAccount() {
    setDelErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: delPw, confirm: delConfirm }),
      });
      const d = await r.json();
      if (!r.ok) {
        setDelErr(d.error);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const others = devices.filter((d) => !d.isCurrent).length;
  const kycLabel = me?.kycStatus === "verified" ? "Verified" : me?.kycStatus === "review" ? "In review" : "Not verified";

  return (
    <div className="mx-auto max-w-xl dark:text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-[27px] font-extrabold tracking-tight">Settings</h1>
        <Link
          href="/dashboard/settings/updates"
          className="flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-[12.5px] font-bold text-[#f0a500] dark:bg-yellow-500/10"
        >
          <Megaphone size={14.4} /> Updates
        </Link>
      </div>

      {/* PROFILE */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">PROFILE</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-4 border-b border-slate-200 p-5 dark:border-slate-700">
          <span className="flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-full bg-[#f6b800] text-[17.5px] font-extrabold text-[#0a1128]">
            {me
              ? me.fullName
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : ""}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[17.5px] font-extrabold">
              <span className="truncate">{me?.fullName ?? "..."}</span>
              <button onClick={() => setEditOpen(true)} className="text-slate-500" aria-label="edit profile">
                <Pencil size={14.4} />
              </button>
            </p>
            <p className="text-[13.5px] font-medium text-slate-500">@{me?.username}</p>
          </div>
          {me?.kycStatus === "verified" ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1.5 text-[11.5px] font-bold text-green-600">
              <ShieldCheck size={13.5} /> Verified
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-yellow-100 px-3.5 py-1.5 text-[11.5px] font-bold text-yellow-700">
              {kycLabel}
            </span>
          )}
        </div>
        {[
          { icon: Fingerprint, label: "ID", value: me ? publicId(me.id) : "...", copy: true },
          { icon: Mail, label: "Email", value: me?.email ?? "...", truncate: true },
          { icon: Phone, label: "Phone", value: me?.phone ?? "..." },
          { icon: MapPin, label: "Country", value: me?.country ?? "..." },
        ].map((r, i, arr) => (
          <div key={r.label} className={`flex items-center gap-3.5 px-5 py-4 ${i < arr.length - 1 ? "border-b border-slate-200 dark:border-slate-700" : ""}`}>
            <r.icon size={20.7} className="shrink-0 text-slate-900 dark:text-slate-100" />
            <span className="text-[15px] font-medium">{r.label}</span>
            <span className={`ml-auto text-[14.5px] font-medium text-slate-500 ${r.truncate ? "max-w-[170px] truncate" : ""}`}>{r.value}</span>
            {r.copy && (
              <button onClick={copyId} className="text-slate-400">
                {copied ? <Check size={17.1} className="text-green-500" /> : <Copy size={17.1} />}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* VERIFICATION */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">VERIFICATION</p>
      <Link href="/dashboard/kyc" className="mt-3 flex items-center gap-3.5 rounded-[24px] border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <ShieldCheck size={23.4} className="text-blue-600" fill="#dbeafe" />
        <span className="text-[15px] font-medium">KYC Verification</span>
        <span className="ml-auto text-[14.5px] font-medium text-slate-500">{kycLabel}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-500 text-green-500">
          <Check size={11.7} strokeWidth={3} />
        </span>
      </Link>

      {/* APPEARANCE */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">APPEARANCE</p>
      <div className="mt-3 flex items-center gap-3.5 rounded-[24px] border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <Palette size={22.5} />
        <span className="text-[15px] font-medium">Theme</span>
        <span className="ml-auto flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
          <button
            onClick={() => switchTheme("light")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13.5px] font-bold ${theme === "light" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
          >
            <Sun size={14.4} /> Light
          </button>
          <button
            onClick={() => switchTheme("dark")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13.5px] font-bold ${theme === "dark" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
          >
            <Moon size={14.4} /> Dark
          </button>
        </span>
      </div>

      {/* FINANCES */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">FINANCES</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button onClick={() => setNumOpen(true)} className="flex w-full items-center gap-3.5 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <ArrowDownToLine size={20.7} className="text-slate-900 dark:text-slate-100" />
          <span className="text-[15px] font-medium">Withdrawal numbers</span>
          <span className="ml-auto text-[14.5px] font-medium text-slate-500">Manage</span>
          <ChevronRight size={16.2} className="text-slate-300" />
        </button>
        <Link href="/dashboard/settings/auto-conversion" className="flex w-full items-center gap-3.5 px-5 py-4">
          <ArrowLeftRight size={20.7} className="text-slate-900 dark:text-slate-100" />
          <span className="text-[15px] font-medium">Automatic conversion</span>
          <span className="ml-auto text-[14.5px] font-medium text-slate-500">Configure</span>
          <ChevronRight size={16.2} className="text-slate-300" />
        </Link>
      </div>

      {/* NOTIFICATIONS */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">NOTIFICATIONS</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button onClick={() => setPrefsOpen(!prefsOpen)} className="flex w-full items-center gap-3.5 px-5 py-4">
          <Bell size={20.7} fill="currentColor" />
          <span className="text-[15px] font-medium">Notification preferences</span>
          <ChevronDown size={16.2} className={`ml-auto text-slate-400 transition-transform ${prefsOpen ? "rotate-180" : ""}`} />
        </button>
        {prefsOpen && (
          <>
            {(
              [
                ["email", "Email notifications", "Email alerts", Mail, "text-blue-500"],
                ["push", "Push notifications", "Browser alerts", Bell, "text-slate-900 dark:text-slate-100"],
                ["sms", "SMS notifications", "SMS alerts", Phone, "text-green-500"],
                ["marketing", "Marketing communications", "News and promotions", MapPin, "text-orange-500"],
              ] as [string, string, string, typeof Bell, string][]
            ).map(([key, title, sub, Icon, cls]) => (
              <div key={key} className="flex items-center gap-3.5 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
                <Icon size={20.7} className={cls} />
                <span>
                  <span className="block text-[15px] font-medium">{title}</span>
                  <span className="block text-[12.5px] font-medium text-slate-500">{sub}</span>
                </span>
                <button
                  onClick={() => setPrefs({ ...prefs, [key]: !prefs[key as keyof typeof prefs] })}
                  className={`relative ml-auto h-[30px] w-[54px] shrink-0 rounded-full transition ${prefs[key as keyof typeof prefs] ? "bg-[#f0a500]" : "bg-slate-200 dark:bg-slate-700"}`}
                >
                  <span className={`absolute top-[4px] h-[24px] w-[24px] rounded-full bg-white shadow transition-all ${prefs[key as keyof typeof prefs] ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
            ))}
            <div className="border-t border-slate-200 p-4 dark:border-slate-700">
              <button onClick={savePrefs} className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-[13.5px] font-medium">
                <Save size={15.3} /> {prefsSaved ? "Saved!" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* SECURITY & API */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">SECURITY & API</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button onClick={() => setPwOpen(!pwOpen)} className="flex w-full items-center gap-3.5 px-5 py-4">
          <span className="flex flex-col items-center leading-none">
            <Lock size={17.1} />
            <span className="text-[10px] font-extrabold tracking-widest">****</span>
          </span>
          <span className="text-[15px] font-medium">Change password</span>
          <ChevronDown size={16.2} className={`ml-auto text-slate-400 transition-transform ${pwOpen ? "rotate-180" : ""}`} />
        </button>
        {pwOpen && (
          <div className="space-y-2.5 border-t border-slate-200 p-4 dark:border-slate-700">
            {pwErr && <p className="rounded-xl bg-red-50 px-3 py-2 text-[10.5px] font-bold text-red-600">{pwErr}</p>}
            {pwMsg && <p className="rounded-xl bg-green-50 px-3 py-2 text-[10.5px] font-bold text-green-700">{pwMsg}</p>}
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="Current password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold dark:bg-slate-800" />
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="New password (min. 6)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold dark:bg-slate-800" />
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Confirm new password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold dark:bg-slate-800" />
            <button onClick={changePassword} className="w-full rounded-full bg-slate-900 py-3 text-[11px] font-extrabold text-white dark:bg-yellow-400 dark:text-slate-900">
              Update password
            </button>
          </div>
        )}
        <button onClick={() => setPinOpen(!pinOpen)} className="flex w-full items-center gap-3.5 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <KeyRound size={20.7} className="text-slate-500" />
          <span className="text-[15px] font-medium">PIN</span>
          <span className="ml-auto text-[14.5px] font-medium text-slate-500">{pinSet ? "Configured" : "Not set"}</span>
          <ChevronDown size={16.2} className={`text-slate-400 transition-transform ${pinOpen ? "rotate-180" : ""}`} />
        </button>
        {pinOpen && (
          <div className="space-y-2.5 border-t border-slate-200 p-4 dark:border-slate-700">
            {pinMsg && <p className={`rounded-xl px-3 py-2 text-[10.5px] font-bold ${pinMsg.includes("required") || pinMsg.includes("match") || pinMsg.includes("incorrect") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{pinMsg}</p>}
            {pinSet && (
              <input value={pinForm.current} onChange={(e) => setPinForm({ ...pinForm, current: e.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="Current PIN" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-[12.5px] font-extrabold tracking-[0.4em] dark:bg-slate-800" />
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <input value={pinForm.next} onChange={(e) => setPinForm({ ...pinForm, next: e.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="New PIN" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-[12.5px] font-extrabold tracking-[0.4em] dark:bg-slate-800" />
              <input value={pinForm.confirm} onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" placeholder="Confirm" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-[12.5px] font-extrabold tracking-[0.4em] dark:bg-slate-800" />
            </div>
            <button onClick={savePin} className="w-full rounded-full bg-slate-900 py-3 text-[11px] font-extrabold text-white dark:bg-yellow-400 dark:text-slate-900">
              Save PIN
            </button>
            <p className="text-center text-[10px] font-medium text-slate-400">Required for withdrawals and transfers.</p>
          </div>
        )}
        <Link href="/dashboard/api" className="flex w-full items-center gap-3.5 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <CodeXml size={20.7} />
          <span className="text-[15px] font-medium">API & intégrations</span>
          <ChevronRight size={16.2} className="ml-auto text-slate-300" />
        </Link>
      </div>

      {/* CONNECTED DEVICES */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">CONNECTED DEVICES</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {devices.map((d, i) => (
          <div key={d.id} className={`flex items-center gap-3.5 px-5 py-4 ${i > 0 ? "border-t border-slate-200 dark:border-slate-700" : ""}`}>
            <MonitorSmartphone size={23.4} className="shrink-0 text-slate-700 dark:text-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
                {d.device || "Unknown device"}
                {d.isCurrent && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10.5px] font-bold text-green-600">This device</span>
                )}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><MapPinned size={12.6} /> {d.ip || "—"}</span>
                <span className="flex items-center gap-1"><Clock size={12.6} /> {timeAgo(d.lastActiveAt)}</span>
              </p>
            </div>
            {!d.isCurrent && (
              <button onClick={() => disconnect(d.id)} className="shrink-0 text-slate-500" title="Disconnect">
                <LogOut size={17.1} />
              </button>
            )}
          </div>
        ))}
        {devices.length === 0 && (
          <p className="px-5 py-6 text-center text-[11px] font-semibold text-slate-400">No devices found.</p>
        )}
        {others > 0 && (
          <button onClick={disconnectOthers} className="flex w-full items-center gap-2 border-t border-slate-200 px-5 py-4 text-[15px] font-medium text-red-500 dark:border-slate-700">
            <LogOut size={16.2} /> Disconnect all other devices ({others})
          </button>
        )}
      </div>

      {/* DANGER ZONE */}
      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">DANGER ZONE</p>
      <button onClick={() => setDelOpen(true)} className="mt-3 flex w-full items-center gap-3.5 rounded-[24px] border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <Trash2 size={22.5} className="text-red-500" />
        <span className="text-left">
          <span className="block text-[15px] font-medium text-red-500">Delete my account</span>
          <span className="block text-[12.5px] font-medium text-slate-500">Irreversible action</span>
        </span>
        <ChevronRight size={16.2} className="ml-auto text-red-200" />
      </button>

      <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-3.5 text-[11.5px] font-extrabold text-red-500">
        <LogOut size={14.4} /> Log out
      </button>
      <p className="mt-3 pb-4 text-center text-[10px] font-medium text-slate-400">SDK Pay v1.7h</p>

      {/* edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900">
            <button onClick={() => setEditOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <h3 className="text-[15px] font-extrabold">Edit profile</h3>
            {pMsg && <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold">{pMsg}</p>}
            <div className="mt-3 space-y-2.5">
              <input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="Username" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <button onClick={saveProfile} className="w-full rounded-full bg-slate-900 py-3 text-[11px] font-extrabold text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* numbers modal */}
      {numOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNumOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-md sm:rounded-[28px]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold">Withdrawal numbers</h3>
              <button onClick={() => setNumOpen(false)} className="text-slate-400"><X size={17.1} /></button>
            </div>
            <div className="mt-3 space-y-2">
              {numbers.length === 0 && <p className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-[11px] font-semibold text-slate-400">No saved numbers yet.</p>}
              {numbers.map((n) => (
                <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-extrabold">{n.phone}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{n.label || n.operator || ""}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/numbers?id=${n.id}`, { method: "DELETE" });
                      setNumbers((x) => x.filter((y) => y.id !== n.id));
                    }}
                    className="rounded-xl bg-red-50 p-2.5 text-red-500"
                  >
                    <Trash2 size={12.6} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5 rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold"><Plus size={12.6} /> Add a number</p>
              <input value={addPhone} onChange={(e) => setAddPhone(e.target.value.replace(/[^0-9\s+]/g, ""))} placeholder="+237 XXX XXX XXX" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <input value={addLabel} onChange={(e) => setAddLabel(e.target.value)} placeholder="Label (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-medium" />
              <button onClick={addNumber} className="w-full rounded-full bg-slate-900 py-3 text-[11px] font-extrabold text-white">Add number</button>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      {delOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDelOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <button onClick={() => setDelOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500"><Trash2 size={20.7} /></span>
            <h3 className="mt-3 text-[16px] font-extrabold">Delete my account?</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              This permanently deletes your profile, wallets, links, numbers and history. Your transaction ledger is kept for compliance. This cannot be undone.
            </p>
            {delErr && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">{delErr}</p>}
            <input type="password" value={delPw} onChange={(e) => setDelPw(e.target.value)} placeholder="Your password" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
            <input value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} placeholder='Type DELETE to confirm' className="mt-2.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
            <button onClick={deleteAccount} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-3.5 text-[11.5px] font-extrabold text-white disabled:opacity-60">
              {busy && <Loader2 size={13.5} className="animate-spin" />} Delete forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
