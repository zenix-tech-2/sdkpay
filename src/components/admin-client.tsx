"use client";

import { useState, useTransition } from "react";
import {
  Save, Loader2, Check, X, RotateCcw, KeyRound, Trash2, Megaphone,
} from "lucide-react";
import {
  saveFees, saveMaintenance, saveFlags, saveAnnouncement, broadcastNotification,
  addRelease, deleteRelease, adjustUserBalance, resetUserPassword,
} from "@/lib/admin-actions";
import type { FeeSettings, MaintenanceSettings, FeatureFlags, Announcement } from "@/lib/settings";

const Field = ({ label, name, defaultValue, suffix, step = "any", min = 0 }: { label: string; name: string; defaultValue: number | string; suffix?: string; step?: string; min?: number }) => (
  <label className="block">
    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">{label}</span>
    <span className="mt-1 flex h-11 items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] transition focus-within:border-[#FFBD0D]/50">
      <input name={name} type="number" step={step} min={min} defaultValue={defaultValue} className="h-full w-full bg-transparent px-3 text-[13.5px] font-bold text-white outline-none" />
      {suffix && <span className="pr-3 text-[11px] font-bold text-white/35">{suffix}</span>}
    </span>
  </label>
);

const SaveBtn = ({ pending, children }: { pending: boolean; children?: React.ReactNode }) => (
  <button type="submit" disabled={pending} className="flex h-12 items-center gap-2 rounded-xl bg-[#FFBD0D] px-6 text-[13px] font-extrabold text-[#232054] transition hover:brightness-105 disabled:opacity-50">
    {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {children ?? "Save changes"}
  </button>
);

const Flash = ({ ok }: { ok: boolean | null }) => ok === null ? null : ok
  ? <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-400"><Check size={15} /> Saved</span>
  : <span className="flex items-center gap-1.5 text-[12px] font-bold text-red-400"><X size={15} /> Failed</span>;

/* ============ FEES ============ */
export function FeesForm({ fees }: { fees: FeeSettings }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<boolean | null>(null);
  return (
    <form action={(fd) => start(async () => { await saveFees(fd); setSaved(true); setTimeout(() => setSaved(null), 2200); })} className="grid gap-3 sm:grid-cols-2">
      <Field label="Deposit fee" name="deposit_percent" defaultValue={fees.deposit_percent} suffix="%" />
      <Field label="Withdrawal fee" name="withdrawal_percent" defaultValue={fees.withdrawal_percent} suffix="%" />
      <Field label="Send (Mobile Money) fee" name="send_percent" defaultValue={fees.send_percent} suffix="%" />
      <Field label="Crypto deposit (USDT)" name="crypto_deposit_percent" defaultValue={fees.crypto_deposit_percent} suffix="%" />
      <Field label="Crypto withdrawal (fixed)" name="crypto_withdrawal_fixed" defaultValue={fees.crypto_withdrawal_fixed} suffix="USDT" step="0.01" />
      <Field label="Wallet conversion fee" name="conversion_percent" defaultValue={fees.conversion_percent} suffix="%" />
      <Field label="Min. withdrawal (XAF)" name="min_withdrawal" defaultValue={fees.min_withdrawal} suffix="XAF" />
      <Field label="Max. withdrawal (XAF)" name="max_withdrawal" defaultValue={fees.max_withdrawal} suffix="XAF" />
      <Field label="Min. withdrawal (USDT)" name="usdt_min" defaultValue={fees.usdt_min} suffix="USDT" />
      <Field label="Max. withdrawal (USDT)" name="usdt_max" defaultValue={fees.usdt_max} suffix="USDT" />
      <Field label="Min. deposit (XAF)" name="min_deposit" defaultValue={fees.min_deposit} suffix="XAF" />
      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 sm:col-span-2">
        <p className="text-[11px] text-white/40">Applied everywhere in the app <b className="text-white/70">immediately</b> — enforcement happens server-side.</p>
        <div className="flex items-center gap-3"><Flash ok={saved} /><SaveBtn pending={pending}>Save fees</SaveBtn></div>
      </div>
    </form>
  );
}

/* ============ MAINTENANCE ============ */
export function MaintenanceForm({ maintenance }: { maintenance: MaintenanceSettings }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [mode, setMode] = useState(maintenance.mode);
  return (
    <form action={(fd) => start(async () => { fd.set("mode", mode); await saveMaintenance(fd); setSaved(true); setTimeout(() => setSaved(null), 2200); })} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {([["off", "Off", "Normal operation"], ["banner", "Banner", "Info strip, app stays usable"], ["full", "Full lockout", "Everyone except admins sees the notice"]] as const).map(([value, label, sub]) => (
          <button type="button" key={value} onClick={() => setMode(value)} aria-pressed={mode === value}
            className={`rounded-2xl border p-3 text-left transition ${mode === value ? "border-[#FFBD0D] bg-[#FFBD0D]/10 ring-2 ring-[#FFBD0D]/40" : "border-white/10 hover:border-white/25"}`}>
            <span className="block text-[13px] font-extrabold text-white">{label}</span>
            <span className="mt-0.5 block text-[9.5px] leading-snug text-white/40">{sub}</span>
          </button>
        ))}
      </div>
      <Field label="Title" name="title" defaultValue={maintenance.title} />
      <label className="block">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">Message</span>
        <textarea name="message" rows={2} defaultValue={maintenance.message} className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[13px] font-semibold text-white outline-none focus:border-[#FFBD0D]/50" />
      </label>
      <Field label="Expected back (shown to users)" name="until" defaultValue={maintenance.until} />
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="text-[10.5px] text-white/40">Preview: <MaintenancePreview mode={mode} /></div>
        <div className="flex items-center gap-3"><Flash ok={saved} /><SaveBtn pending={pending}>Save</SaveBtn></div>
      </div>
    </form>
  );
}
const MaintenancePreview = ({ mode }: { mode: string }) =>
  mode === "off" ? <span className="text-emerald-400">App fully available</span> : mode === "banner" ? <span className="text-amber-400">Amber banner above the app</span> : <span className="text-red-400">Full-screen lockout for non-admins</span>;

/* ============ FLAGS ============ */
export function FlagsForm({ flags }: { flags: FeatureFlags }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [state, setState] = useState(flags);
  const items: { key: keyof FeatureFlags; label: string; sub: string }[] = [
    { key: "deposits", label: "Deposits", sub: "Mobile Money & crypto top-ups" },
    { key: "withdrawals", label: "Withdrawals", sub: "Mobile Money & USDT payouts" },
    { key: "sends", label: "Sends & transfers", sub: "Mobile Money, internal and crypto sends" },
    { key: "signups", label: "New account creation", sub: "Public sign-up page" },
    { key: "links", label: "Payment links", sub: "Create and use payment links & hosted checkout" },
  ];
  return (
    <form action={(fd) => start(async () => { for (const [k, v] of Object.entries(state)) fd.set(k, v ? "on" : "off"); await saveFlags(fd); setSaved(true); setTimeout(() => setSaved(null), 2200); })} className="space-y-2">
      {items.map((item) => (
        <button type="button" key={item.key} onClick={() => setState({ ...state, [item.key]: !state[item.key] })} aria-pressed={state[item.key]}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/20">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${state[item.key] ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-extrabold text-white">{item.label}</span><span className="block text-[10.5px] text-white/40">{item.sub}</span></span>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${state[item.key] ? "bg-[#FFBD0D]" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${state[item.key] ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </button>
      ))}
      <div className="flex items-center justify-between pt-1"><p className="text-[10.5px] text-white/40">Killed features return a friendly message everywhere, instantly.</p><div className="flex items-center gap-3"><Flash ok={saved} /><SaveBtn pending={pending}>Save flags</SaveBtn></div></div>
    </form>
  );
}

/* ============ ANNOUNCEMENT ============ */
export function AnnouncementForm({ announcement }: { announcement: Announcement }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [active, setActive] = useState(announcement.active);
  const [tone, setTone] = useState(announcement.tone);
  const [text, setText] = useState(announcement.text);
  return (
    <form action={(fd) => start(async () => { fd.set("active", active ? "on" : "off"); fd.set("tone", tone); fd.set("text", text); await saveAnnouncement(fd); setSaved(true); setTimeout(() => setSaved(null), 2200); })} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-extrabold text-white">Show banner in the app</span>
        <button type="button" onClick={() => setActive(!active)} role="switch" aria-checked={active} className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-[#FFBD0D]" : "bg-white/10"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`} /></button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="e.g. Planned maintenance Sunday 02:00–03:00 — deposits may be delayed." className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">{(["info", "warn", "critical"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTone(t)} className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition ${tone === t ? (t === "critical" ? "bg-red-500 text-white" : t === "warn" ? "bg-amber-500 text-black" : "bg-sky-500 text-white") : "bg-white/5 text-white/45"}`}>{t}</button>
        ))}</div>
        <div className="flex items-center gap-3"><Flash ok={saved} /><SaveBtn pending={pending}>Save</SaveBtn></div>
      </div>
      {active && text && <div className={`rounded-xl border px-4 py-2.5 text-[11.5px] font-bold ${tone === "critical" ? "border-red-400/40 bg-red-500/10 text-red-300" : tone === "warn" ? "border-amber-400/40 bg-amber-500/10 text-amber-300" : "border-sky-400/40 bg-sky-500/10 text-sky-300"}`}>{text}</div>}
    </form>
  );
}

/* ============ BROADCAST ============ */
export function BroadcastForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <form action={(fd) => start(async () => setResult(await broadcastNotification(fd)))} className="space-y-3">
      <Field label="Title" name="title" defaultValue="" />
      <textarea name="body" rows={3} required minLength={5} placeholder="e.g. Scheduled maintenance on Sunday 02:00–03:00. Deposits may be delayed by a few minutes." className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" onChange={(e) => setBody(e.target.value)} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select name="target" className="h-11 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[12.5px] font-bold text-white outline-none">
          <option value="all">Everyone</option>
          <option value="verified">KYC-verified users</option>
          <option value="pending">Pending / unverified users</option>
          <option value="suspended">Suspended users</option>
          <option value="admins">Admins only</option>
        </select>
        <SaveBtn pending={pending}><Megaphone size={16} /> Send broadcast</SaveBtn>
      </div>
      {/* live preview — exactly how it appears in the app bell */}
      <div className="rounded-2xl border border-white/10 bg-[#070B22] p-4">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-white/30">Preview — as seen in the app</p>
        <div className="mt-2 flex gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5"><Megaphone size={17} className="text-[#FFBD0D]" /></span>
          <span><span className="block text-[12.5px] font-extrabold text-white">{title || "Your title…"}</span><span className="mt-0.5 block text-[11px] leading-snug text-white/55">{body || "Your message body…"}</span></span>
        </div>
      </div>
      {result && (result.ok
        ? <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-[12px] font-bold text-emerald-300"><Check size={15} /> Broadcast delivered to {result.sent} user{result.sent === 1 ? "" : "s"}.</p>
        : <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-[12px] font-bold text-red-300">{result.error}</p>)}
    </form>
  );
}

/* ============ RELEASES ============ */
export function ReleaseForm() {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-[13px] font-extrabold text-white/60 transition hover:border-[#FFBD0D]/50 hover:text-[#FFBD0D]">+ New release</button>;
  return (
    <form action={(fd) => start(async () => { await addRelease(fd); setOpen(false); })} className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <input name="title" required placeholder="Title — e.g. Reduced transaction fees" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[13px] font-bold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" />
      <textarea name="body" required rows={2} placeholder="What changed and why it matters…" className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[12.5px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" />
      <textarea name="items" rows={3} placeholder={"Bullet points, one per line\nFaster settlement\nNew fee schedule\nDark mode"} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 font-mono text-[11px] text-white/80 outline-none placeholder:text-white/25" />
      <div className="flex gap-2"><SaveBtn pending={pending}>Publish release</SaveBtn><button type="button" onClick={() => setOpen(false)} className="h-12 rounded-xl border border-white/10 px-5 text-[12px] font-bold text-white/55">Cancel</button></div>
    </form>
  );
}
export function ReleaseDeleteButton({ n }: { n: string }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => { if (confirm(`Delete release ${n}?`)) start(() => deleteRelease(n)); }} disabled={pending} aria-label={`Delete release ${n}`} className="rounded-lg p-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-400">
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

/* ============ USER CONTROLS ============ */
export function BalanceAdjustForm({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  return (
    <form action={(fd) => start(async () => setResult(await adjustUserBalance(fd)))} className="space-y-2.5">
      <input type="hidden" name="userId" value={userId} />
      <div className="grid grid-cols-2 gap-2">
        <select name="direction" className="h-11 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[12px] font-bold text-white outline-none"><option value="credit">Credit (+)</option><option value="debit">Debit (−)</option></select>
        <input name="amount" required type="number" min={1} step="any" placeholder="Amount" className="h-11 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[12px] font-bold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" />
      </div>
      <input name="reason" required minLength={4} placeholder="Reason (audited) — e.g. Support dispute #4821" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[12px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#FFBD0D]/50" />
      {result && (result.ok ? <p className="text-[11.5px] font-bold text-emerald-400">Balance adjusted — wallet and ledger updated.</p> : <p className="text-[11.5px] font-bold text-red-400">{result.error}</p>)}
      <SaveBtn pending={pending}><RotateCcw size={15} /> Apply adjustment</SaveBtn>
    </form>
  );
}

export function TempPasswordButton({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);
  if (temp) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">Temporary password (shown once)</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <code className="font-mono text-[13px] font-bold text-amber-100">{temp}</code>
          <button onClick={() => navigator.clipboard.writeText(temp)} className="rounded-lg bg-amber-400/15 p-2 text-amber-300 hover:bg-amber-400/25" aria-label="Copy"><Check size={15} /></button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => start(async () => { const r = await resetUserPassword(userId); if (r.password) setTemp(r.password); })} disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 text-[12px] font-bold text-white/75 transition hover:border-white/30 hover:text-white">
      {pending ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Reset password
    </button>
  );
}

export function ConfirmAction({ label, confirmText, tone = "red", action, icon }: { label: string; confirmText: string; tone?: "red" | "neutral"; action: () => Promise<void>; icon?: React.ReactNode }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => { if (confirm(confirmText)) start(() => action()); }}
      disabled={pending}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-[12px] font-bold transition ${tone === "red" ? "border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20" : "border-white/10 text-white/70 hover:text-white"}`}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : icon} {label}
    </button>
  );
}
