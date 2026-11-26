"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Connexion impossible"); return; }
      router.push("/admin");
      router.refresh();
    } catch { setError("Impossible de contacter le serveur"); }
    finally { setBusy(false); }
  }

  return (
    <main className="admin-root relative flex min-h-screen items-center justify-center bg-[#0d1530] px-4 py-10">
      <div className="absolute inset-0 opacity-45" style={{ background: "radial-gradient(circle at 15% 18%, #ffb800 0, transparent 28%), radial-gradient(circle at 82% 82%, #2442d6 0, transparent 34%)" }} />
      <div className="motion-pop relative w-full max-w-[430px] overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,.35)]">
        <div className="flex items-center justify-between bg-[#111a38] px-6 py-5 text-white"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><ShieldCheck size={20} /></span><span><span className="block text-[15px] font-extrabold">SDK PAY ADMIN</span><span className="block text-[10px] font-semibold uppercase tracking-widest text-[#aeb9d8]">Independent console</span></span></div><span className="rounded-full bg-[#ffb800] px-3 py-1 text-[10px] font-extrabold text-[#17213d]">SECURE</span></div>
        <form onSubmit={submit} className="space-y-4 p-7">
          <div><p className="admin-kicker">ADMIN ACCESS</p><h1 className="font-display mt-1 text-[27px] font-extrabold text-[#111b36]">Operations sign in</h1><p className="mt-1 text-[13px] text-[#71809b]">Separate session for the SDK Pay back office and all merchant-app controls.</p></div>
          <div className="relative"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sdkpay.com" className="admin-input pl-11" /></div>
          <div className="relative"><Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="admin-input pl-11" /></div>
          {error && <p className="rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
          <button disabled={busy} className="admin-btn admin-btn-primary h-[50px] w-full disabled:opacity-60"><KeyRound size={17} /> {busy ? "Connexion..." : "Se connecter"}</button>
          <button type="button" onClick={() => { setEmail("admin@sdkpay.com"); setPassword("admin1234"); }} className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#e2e9f5] bg-[#f7f9fd] px-4 py-3 text-[12px] font-bold text-[#4b5875]"><Sparkles size={14} /> Remplir le compte démo</button>
          <p className="text-center text-[11px] leading-relaxed text-[#8b96b0]">Démo : admin@sdkpay.com / admin1234<br />Production : définir ADMIN_EMAIL et ADMIN_PASSWORD.</p>
        </form>
      </div>
    </main>
  );
}
