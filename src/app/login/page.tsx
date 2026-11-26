"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { LogoLarge } from "@/components/Logo";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-[11.5px] text-[13px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition";
const labelCls = "mb-1.5 block text-[14px] font-extrabold text-slate-900";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de connexion.");
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
        <h1 className="mt-8 text-center text-[26.5px] sm:text-[31.5px] font-extrabold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-[12.5px] font-semibold text-slate-500">
          Connectez-vous pour gérer vos paiements
        </p>

        <form onSubmit={submit} className="mt-8 rounded-[26px] border border-slate-200 bg-white p-6 sm:p-9 shadow-xl shadow-slate-200/50 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12px] font-bold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Email or username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="votreemail@exemple.com"
                className={`${inputCls} pl-12`}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pl-12 pr-12`}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-yellow-500" />
              Se souvenir de moi
            </label>
            <a href="#" className="text-yellow-600 hover:underline">Mot de passe oublié ?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-4 text-[14px] font-extrabold text-slate-900 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 disabled:opacity-60 transition"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-[12px] font-semibold text-slate-500">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-extrabold text-yellow-600 hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[11.5px] font-bold text-slate-400 hover:text-slate-600">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
