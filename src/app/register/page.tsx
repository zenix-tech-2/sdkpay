"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, Ticket, Loader2 } from "lucide-react";
import { LogoLarge } from "@/components/Logo";
import CountrySelect from "@/components/auth/CountrySelect";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-[10.5px] text-[11.5px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition";
const labelCls = "mb-1.5 block text-[12.5px] font-extrabold text-slate-900";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    dial: "+237",
    phone: "",
    referral: "",
    password: "",
    confirm: "",
  });
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setForm((f) => ({ ...f, referral: ref.slice(0, 6).toLowerCase() }));
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          phone: form.phone,
          countryCode: form.dial,
          referral: form.referral,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen auth-bg pb-16">
      <div className="h-14 bg-[#f6b800]" />
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="pt-4">
          <LogoLarge />
        </div>
        <h1 className="mt-8 text-center text-[24px] sm:text-[28.5px] font-extrabold tracking-tight text-slate-900">
          Create an account
        </h1>

        <form onSubmit={submit} className="mt-8 rounded-[26px] border border-slate-200 bg-white p-6 sm:p-9 shadow-xl shadow-slate-200/50 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[11px] font-bold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Full name</label>
            <div className="relative">
              <User size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Jean Dupont"
                className={`${inputCls} pl-12`}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Username</label>
            <div className="relative">
              <User size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="jeandupont"
                className={`${inputCls} pl-12`}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <div className="relative">
              <Mail size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="votreemail@exemple.com"
                className={`${inputCls} pl-12`}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Phone</label>
            <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[180px_1fr] gap-3">
              <CountrySelect value={form.dial} onChange={(d) => set("dial", d)} />
              <div className="relative">
                <Phone size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="6 XX XX XX XX"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Code de parrainage <span className="font-semibold">(facultatif)</span></label>
            <div className="relative">
              <Ticket size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                value={form.referral}
                onChange={(e) => set("referral", e.target.value)}
                placeholder="Code de 6 caractères, ex. a7k2r9"
                maxLength={6}
                className={`${inputCls} pl-12`}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Lock size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={show1 ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pl-12 pr-12`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow1(!show1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {show1 ? <EyeOff size={16.2} /> : <Eye size={16.2} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Confirm password</label>
            <div className="relative">
              <Lock size={16.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={show2 ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pl-12 pr-12`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow2(!show2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {show2 ? <EyeOff size={16.2} /> : <Eye size={16.2} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-4 text-[12.5px] font-extrabold text-slate-900 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 disabled:opacity-60 transition"
          >
            {loading && <Loader2 size={14.4} className="animate-spin" />}
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="text-center text-[11px] font-semibold text-slate-500">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-extrabold text-yellow-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-[10px] font-medium text-slate-400">
          En continuant, vous acceptez nos Conditions d&apos;utilisation et notre Politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
