"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Connexion impossible"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8ff]">
      <div className="h-8 bg-[#ffb800]" />
      <div className="mx-auto flex max-w-[560px] flex-col items-center px-4 pb-16 pt-9">
        <div className="scale-[1.45] origin-center"><Logo size="lg" /></div>
        <h1 className="font-display mt-10 text-center text-[30px] font-extrabold text-[#111b36] sm:text-[38px]">Welcome back</h1>
        <p className="mt-2 text-center text-[13px] text-[#7b869f]">Connectez-vous à votre wallet SDK Pay.</p>

        <form onSubmit={submit} className="mt-8 w-full rounded-[22px] border border-[#e8edf7] bg-white px-5 py-8 shadow-[0_12px_40px_rgba(30,45,90,.05)] sm:px-8">
          <label className="label">Email ou nom d&apos;utilisateur</label>
          <div className="relative"><Mail size={18} className="field-icon" /><input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="votreemail@exemple.com" className="field" /></div>
          <div className="mt-5"><label className="label">Password</label>
            <div className="relative"><Lock size={18} className="field-icon" /><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="field pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d8aa9]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          {error && <p className="mt-5 rounded-lg bg-[#fff0f0] px-3 py-2.5 text-[13px] font-medium text-[#c83c3c]">{error}</p>}
          <button type="submit" disabled={loading} className="brand-btn mt-7 h-[54px] w-full rounded-xl text-[15px] disabled:opacity-60">{loading ? "Connexion..." : "Se connecter"}</button>
          <div className="mt-5 rounded-xl border border-dashed border-[#e4c982] bg-[#fffbf0] px-4 py-3 text-center text-[12px] text-[#6c758d]">
            Compte démo : <strong className="text-[#26324d]">demo@sdkpay.com</strong> / <strong className="text-[#26324d]">demo1234</strong>
            <button type="button" onClick={() => { setIdentifier("demo@sdkpay.com"); setPassword("demo1234"); }} className="ml-2 font-bold text-[#e5a300] hover:underline">Remplir</button>
          </div>
          <p className="mt-6 text-center text-[13px] text-[#5f6b86]">Pas encore de compte ? <Link href="/signup" className="font-bold text-[#e5a300] hover:underline">Créer un compte</Link></p>
        </form>
        <Link href="/" className="mt-7 text-[12px] font-semibold text-[#7b869f] hover:text-[#e5a300]">← Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}
