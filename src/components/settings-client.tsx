"use client";

import { useState, useTransition } from "react";
import {
  Mail, Bell, Smartphone, Globe, Check, Loader2, Lock, KeyRound, Trash2, Sun, Moon,
  Pencil, Save, Plus, Trash, ShieldAlert,
} from "lucide-react";
import { Toggle } from "@/components/bits";
import { changePassword, updateProfile, addPayoutMethod, removePayoutMethod, deleteAccount } from "@/lib/actions";

/* ---------- inline profile editor ---------- */
export function ProfileEditor({ fullName, phone, email }: { fullName: string; phone: string | null; email: string }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} aria-label="Edit profile" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
        <Pencil size={16} />
      </button>
    );
  }
  return (
    <form action={(fd) => start(async () => { await updateProfile(fd); setEditing(false); })} className="mt-1.5 space-y-2">
      <input name="fullName" defaultValue={fullName} required aria-label="Full name" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-gold" />
      <input name="phone" defaultValue={phone ?? ""} placeholder="Phone" aria-label="Phone" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-gold" />
      <input type="hidden" name="email" value={email} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-[12px] font-bold text-white disabled:opacity-60">{pending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save</button>
        <button type="button" onClick={() => setEditing(false)} className="h-9 rounded-lg border border-slate-200 px-3 text-[12px] font-bold text-slate-500">Cancel</button>
      </div>
    </form>
  );
}

/* ---------- theme toggle ---------- */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [flash, setFlash] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {flash && <span className="mr-1 hidden text-[11px] font-semibold text-amber-600 sm:inline">Dark mode arrives with v1.8</span>}
      <div className="flex rounded-xl bg-slate-100 p-1">
        {([["light", Sun, "Light"], ["dark", Moon, "Dark"]] as const).map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => { setTheme(id); if (id === "dark") { setFlash(true); setTimeout(() => setFlash(false), 2200); setTheme("light"); } }}
            aria-pressed={theme === id}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-4 text-[12.5px] font-bold transition ${theme === id ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- notification preferences ---------- */
export function NotificationPrefs() {
  const [prefs, setPrefs] = useState({ Email: true, Push: false, SMS: false, Marketing: false });
  const [saved, setSaved] = useState(false);
  const items = [
    { key: "Email" as const, icon: <Mail size={17} className="text-blue-500" />, title: "Email notifications", sub: "Email alerts" },
    { key: "Push" as const, icon: <Bell size={17} className="text-slate-700" />, title: "Push notifications", sub: "Browser alerts" },
    { key: "SMS" as const, icon: <Smartphone size={17} className="text-emerald-600" />, title: "SMS notifications", sub: "SMS alerts" },
    { key: "Marketing" as const, icon: <Globe size={17} className="text-orange-500" />, title: "Marketing communications", sub: "News and promotions" },
  ];
  return (
    <div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 py-3">
            {item.icon}
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-bold text-ink">{item.title}</span>
              <span className="block text-[11px] text-slate-400">{item.sub}</span>
            </span>
            <Toggle defaultChecked={prefs[item.key]} onChange={(v) => setPrefs({ ...prefs, [item.key]: v })} />
          </div>
        ))}
      </div>
      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1600); }}
        className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-[13px] font-bold text-slate-600 transition hover:border-gold"
      >
        {saved ? <Check size={16} className="text-emerald-600" /> : <Save size={16} />} {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

/* ---------- change password ---------- */
export function ChangePasswordForm() {
  const [state, setState] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) => start(async () => setState(await changePassword(fd)))}
      className="space-y-2.5"
    >
      <input name="current" type="password" required placeholder="Current password" autoComplete="current-password" className="h-11 w-full rounded-xl border border-slate-200 px-4 text-[13px] outline-none focus:border-gold" />
      <input name="next" type="password" required placeholder="New password (min. 8 characters)" autoComplete="new-password" className="h-11 w-full rounded-xl border border-slate-200 px-4 text-[13px] outline-none focus:border-gold" />
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">Password updated successfully.</p>}
      <button type="submit" disabled={pending} className="flex h-11 items-center gap-2 rounded-xl bg-navy px-4 text-[13px] font-bold text-white transition hover:bg-navy3 disabled:opacity-60">
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Update password
      </button>
    </form>
  );
}

/* ---------- PIN card ---------- */
export function PinCard() {
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div>
      {done ? (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[12.5px] font-bold text-emerald-700"><Check size={16} /> PIN updated. It will be required on your next withdrawal.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (pin.length === 4) setDone(true); }} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <KeyRound size={15} className="text-slate-400" />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              type="password" inputMode="numeric" maxLength={4} placeholder="New 4-digit PIN" aria-label="New PIN"
              className="h-11 w-32 bg-transparent tracking-[0.4em] outline-none placeholder:tracking-normal placeholder:text-slate-400"
            />
          </div>
          <button type="submit" disabled={pin.length !== 4} className="h-11 rounded-xl bg-navy px-4 text-[12.5px] font-bold text-white disabled:opacity-40">Save PIN</button>
        </form>
      )}
    </div>
  );
}

/* ---------- payout numbers manager ---------- */
export type PayoutMethodItem = { id: string; operator: string; phone: string; label: string | null };
export function PayoutManager({ methods }: { methods: PayoutMethodItem[] }) {
  const [operator, setOperator] = useState("MTN_MONEY");
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {methods.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-[9px] font-black ${m.operator === "MTN_MONEY" ? "bg-[#ffcb05] text-slate-900" : "bg-[#ff7900] text-white"}`}>{m.operator === "MTN_MONEY" ? "MTN" : "OM"}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink">{m.phone}</span>
              <span className="block text-[10.5px] text-slate-400">{m.operator === "MTN_MONEY" ? "MTN Money" : "Orange Money"}{m.label ? ` · ${m.label}` : ""}</span>
            </span>
            <button onClick={() => start(() => removePayoutMethod(m.id))} aria-label="Remove number" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash size={16} /></button>
          </li>
        ))}
        {methods.length === 0 && <li className="py-3 text-center text-[12.5px] text-slate-400">No registered numbers yet.</li>}
      </ul>
      <form
        action={(fd) => start(async () => { await addPayoutMethod(operator, phone, label); setPhone(""); setLabel(""); })}
        className="mt-3 grid grid-cols-[1fr_1.4fr_auto] gap-2"
      >
        <select value={operator} onChange={(e) => setOperator(e.target.value)} aria-label="Operator" className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold outline-none focus:border-gold">
          <option value="MTN_MONEY">MTN Money</option>
          <option value="ORANGE_MONEY">Orange Money</option>
        </select>
        <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="6XXXXXXXX" inputMode="tel" className="h-11 rounded-xl border border-slate-200 px-3 text-[12.5px] outline-none focus:border-gold" />
        <button type="submit" disabled={pending || phone.replace(/\D/g, "").length < 8} aria-label="Add number" className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-navy2 disabled:opacity-40"><Plus size={18} strokeWidth={2.5} /></button>
      </form>
    </div>
  );
}

/* ---------- danger zone ---------- */
export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-red-50/50">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={19} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-bold text-red-500">Delete my account</span>
            <span className="block text-[11.5px] text-slate-400">Irreversible action</span>
          </span>
        </button>
      ) : (
        <div className="border-t border-red-100 bg-red-50/50 p-4">
          <p className="flex items-center gap-2 text-[12.5px] font-bold text-red-600"><ShieldAlert size={16} /> This permanently deletes your wallets, links and transaction history.</p>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder='Type DELETE to confirm' className="mt-2 h-11 w-full rounded-xl border border-red-200 bg-white px-4 text-[13px] outline-none focus:border-red-400" />
          <div className="mt-2 flex gap-2">
            <button onClick={() => setOpen(false)} className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600">Cancel</button>
            <button disabled={confirm !== "DELETE" || pending} onClick={() => start(() => deleteAccount())} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-[13px] font-bold text-white disabled:opacity-40">
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Delete forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
