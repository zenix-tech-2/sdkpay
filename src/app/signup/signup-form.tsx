"use client";

import { useActionState, useState } from "react";
import { signup } from "@/lib/actions";
import { Eye, EyeOff, Loader2, User, AtSign, Mail, Lock, Phone, Globe, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, { error: null as string | null });
  const [show, setShow] = useState(false);

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, Icon: React.ElementType) => (
    <div>
      <label htmlFor={name} className="text-[12px] font-bold text-slate-600">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
        <Icon size={17} className="shrink-0 text-slate-400" />
        <input id={name} name={name} {...props} className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400" />
      </div>
    </div>
  );

  return (
    <form action={formAction} className="w-full">
      <h2 className="text-[24px] font-extrabold tracking-tight text-ink">Create your account</h2>
      <p className="mt-1 text-[13px] text-slate-500">Start collecting payments in minutes. KYC is required before your first withdrawal.</p>

      {state?.error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] font-medium text-red-600">{state.error}</div>}

      <div className="mt-5 grid gap-3">
        {field("fullName", "Full name", { required: true, placeholder: "Raymond Mensah", autoComplete: "name" }, User)}
        <div className="grid gap-3 sm:grid-cols-2">
          {field("username", "Username", { required: true, placeholder: "raymond", autoComplete: "username" }, AtSign)}
          {field("phone", "Phone", { required: true, placeholder: "6XXXXXXXX", inputMode: "tel", autoComplete: "tel" }, Phone)}
        </div>
        {field("email", "Email address", { required: true, type: "email", placeholder: "you@company.com", autoComplete: "email" }, Mail)}
        <div>
          <label htmlFor="country" className="text-[12px] font-bold text-slate-600">Country</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 focus-within:border-gold">
            <Globe size={17} className="shrink-0 text-slate-400" />
            <select id="country" name="country" className="w-full appearance-none bg-transparent text-[14px] outline-none">
              {["Cameroun", "Bénin", "Burkina Faso", "Côte d'Ivoire", "Sénégal", "Gabon", "Congo", "Mali", "Niger", "Tchad", "Guinée-Bissau", "Togo", "Centrafrique", "RD Congo", "Sierra Leone"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="password" className="text-[12px] font-bold text-slate-600">Password</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
            <Lock size={17} className="shrink-0 text-slate-400" />
            <input id="password" name="password" type={show ? "text" : "password"} required placeholder="Min. 8 characters" autoComplete="new-password" className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="text-slate-400 hover:text-slate-700">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 text-[11px] leading-snug text-slate-500">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[#f6c21a]" />
        <span>I agree to the <a href="mailto:legal@sdkpay.com" className="font-bold text-slate-700 hover:underline">Terms of Service</a> and <a href="mailto:legal@sdkpay.com" className="font-bold text-slate-700 hover:underline">Privacy Policy</a>, and I consent to identity verification (KYC) as required by payment regulations.</span>
      </label>

      <button type="submit" disabled={pending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/30 transition hover:brightness-105 disabled:opacity-60">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <>Create account <ArrowRight size={17} strokeWidth={2.5} /></>}
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400"><ShieldCheck size={13} className="text-emerald-500" /> Your data is encrypted and never shared without consent.</p>
    </form>
  );
}
