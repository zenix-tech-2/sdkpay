import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import SignupForm from "./signup-form";
import { CheckCircle2 } from "lucide-react";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy2 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-violet-700/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="SDK Pay" className="relative h-24 w-auto self-start rounded-2xl bg-white/95 p-3 object-contain" />
        <div className="relative max-w-lg">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">Integrate · Pay · Grow</p>
          <h1 className="mt-4 text-[44px] font-black leading-[1.08] tracking-tight xl:text-[52px]">
            One account.<br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">Every payment rail.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">Join 2,400+ businesses accepting Mobile Money and crypto with SDK Pay. Sign up, verify your identity, and start collecting today.</p>
          <ul className="mt-8 space-y-3 text-[14px] font-medium text-white/85">
            {["Free account — no setup fees, no monthly charges", "KYC review usually takes under 24 business hours", "Your money, your way: Mobile Money, crypto, payment links"].map((t) => (
              <li key={t} className="flex items-start gap-2.5"><CheckCircle2 size={19} className="mt-0.5 shrink-0 text-gold" /> {t}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-[11px] text-white/40">© 2026 SDK Pay Inc. · Licensed payment service provider · Cameroun</p>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center bg-mist px-5 py-10 sm:px-10" style={{ backgroundImage: "radial-gradient(#d8dbe4 1.1px, transparent 1.1px)", backgroundSize: "22px 22px" }}>
        <div className="w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="SDK Pay" className="mx-auto mb-5 h-14 w-auto lg:hidden" />
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">
            <SignupForm />
          </div>
          <p className="mt-5 text-center text-[12.5px] text-slate-500">Already have an account? <Link href="/login" className="font-bold text-navy2 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
