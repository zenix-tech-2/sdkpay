"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/actions";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, Zap, Smartphone, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: null as string | null });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="w-full max-w-md">
      <h2 className="text-[26px] font-extrabold tracking-tight text-ink">Welcome back</h2>
      <p className="mt-1 text-[14px] text-slate-500">Sign in to your SDK Pay merchant account.</p>

      {state?.error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">
          {state.error}
        </div>
      )}

      <label className="mt-6 block text-[12.5px] font-bold text-slate-600">Email address</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
        <Mail size={18} className="text-slate-400" />
        <input
          name="email" type="email" required autoComplete="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label className="text-[12.5px] font-bold text-slate-600">Password</label>
        <a href="mailto:support@sdkpay.com" className="text-[12px] font-semibold text-blue-600 hover:underline">Forgot password?</a>
      </div>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
        <Lock size={18} className="text-slate-400" />
        <input
          name="password" type={show ? "text" : "password"} required autoComplete="current-password" placeholder="Your password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
        />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="text-slate-400 hover:text-slate-700">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        type="submit" disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/30 transition hover:brightness-105 disabled:opacity-60"
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <>Sign in <ArrowRight size={17} strokeWidth={2.5} /></>}
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-300">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => { setEmail("honestansah@gmail.com"); setPassword("demo1234"); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-[13.5px] font-bold text-slate-700 transition hover:border-gold hover:bg-amber-50 hover:text-amber-800"
      >
        <Zap size={16} className="text-gold2" /> Use demo account <span className="font-medium text-slate-400">(honestansah@gmail.com)</span>
      </button>

      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> PCI-DSS</span>
        <span className="flex items-center gap-1.5"><Lock size={13} className="text-emerald-500" /> 256-bit TLS</span>
        <span className="flex items-center gap-1.5"><Smartphone size={13} className="text-emerald-500" /> KYC verified</span>
      </div>
    </form>
  );
}
