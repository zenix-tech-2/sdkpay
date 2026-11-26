"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CountryFlag } from "@/components/IconAssets";
import { Check, ChevronDown, Eye, EyeOff, Lock, Mail, Phone, Search, Ticket, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { countries, type Country } from "@/lib/countries";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", phone: "", referralCode: "", password: "", confirmPassword: "" });
  const [country, setCountry] = useState<Country>(countries.find((c) => c.code === "CM")!);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setForm((current) => ({ ...current, referralCode: ref }));
  }, []);

  const filtered = countries.filter((c) => `${c.name} ${c.dial}`.toLowerCase().includes(search.toLowerCase()));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dialCode: country.dial, countryCode: country.code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Inscription impossible"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  const input = (key: keyof typeof form, placeholder: string, Icon: typeof UserRound, type = "text") => (
    <div className="relative">
      <Icon size={18} className="field-icon" />
      <input
        type={type}
        required={key !== "referralCode"}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`field ${type === "password" ? "pr-12" : ""}`}
      />
      {type === "password" && (
        <button type="button" onClick={() => key === "password" ? setShowPassword(!showPassword) : setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d8aa9]" aria-label="Afficher le mot de passe">
          {(key === "password" ? showPassword : showConfirm) ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f8ff]">
      <div className="h-8 bg-[#ffb800]" />
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 pb-16 pt-9">
        <div className="scale-[1.45] origin-center"><Logo size="lg" /></div>
        <h1 className="font-display mt-10 text-center text-[30px] font-extrabold text-[#111b36] sm:text-[38px]">Create an account</h1>
        <p className="mt-2 text-center text-[13px] text-[#7b869f]">Vendez en ligne et recevez vos paiements en quelques minutes.</p>

        <form onSubmit={submit} className="mt-8 w-full rounded-[22px] border border-[#e8edf7] bg-white px-5 py-7 shadow-[0_12px_40px_rgba(30,45,90,.05)] sm:px-8">
          <div className="space-y-5">
            <div><label className="label">Full name</label>{input("fullName", "Jean Dupont", UserRound)}</div>
            <div><label className="label">Username</label>{input("username", "jeandupont", UserRound)}</div>
            <div><label className="label">Email</label>{input("email", "votreemail@exemple.com", Mail, "email")}</div>

            <div className="relative">
              <label className="label">Phone</label>
              <div className="grid grid-cols-[minmax(140px,42%)_1fr] gap-2">
                <button type="button" onClick={() => setPickerOpen(!pickerOpen)} className={`flex h-[56px] items-center justify-between rounded-xl border bg-white px-3 text-[15px] font-semibold text-[#23304d] ${pickerOpen ? "border-[#ffb800] ring-[3px] ring-[#ffb800]/20" : "border-[#d9e2f3]"}`}>
                  <span className="flex items-center gap-2"><CountryFlag code={country.code} size={24} square /> {country.dial}</span>
                  <ChevronDown size={17} className="text-[#7d8aa9]" />
                </button>
                <div className="relative"><Phone size={18} className="field-icon" /><input required type="tel" placeholder="6XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" /></div>
              </div>
              {pickerOpen && (
                <div className="animate-pop absolute left-0 right-0 top-[84px] z-30 rounded-2xl border border-[#e3e9f5] bg-white p-4 shadow-[0_18px_50px_rgba(20,35,70,.18)]">
                  <div className="flex items-center gap-2 border-b border-[#e8edf6] pb-3"><Search size={17} className="text-[#8792ab]" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un pays..." className="w-full bg-transparent text-[15px] text-[#2b3855] outline-none placeholder:text-[#9aa5bd]" /></div>
                  <div className="brand-scroll mt-2 max-h-[240px] overflow-y-auto pr-1">
                    {filtered.map((c) => (
                      <button type="button" key={c.code} onClick={() => { setCountry(c); setPickerOpen(false); setSearch(""); }} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] hover:bg-[#f3f7ff] ${c.code === country.code ? "bg-[#eef4ff]" : ""}`}>
                        <span className="w-5 text-sm font-bold text-[#1b2742]">{c.code === country.code ? <Check size={16} /> : ""}</span>
                        <CountryFlag code={c.code} size={24} square /><span className="font-bold text-[#1b2742]">{c.name}</span><span className="text-[#8994ab]">· {c.dial}</span>
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="py-5 text-center text-sm text-[#8994ab]">Aucun pays trouvé</p>}
                  </div>
                </div>
              )}
            </div>

            <div><label className="label">Code de parrainage (facultatif)</label>
              <div className="relative"><Ticket size={18} className="field-icon" /><input placeholder="Code de 6 caractères, ex. a7k2r" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} className="field" /></div>
            </div>
            <div><label className="label">Password</label>{input("password", "••••••••", Lock, showPassword ? "text" : "password")}</div>
            <div><label className="label">Confirm password</label>{input("confirmPassword", "••••••••", Lock, showConfirm ? "text" : "password")}</div>
          </div>

          {error && <p className="mt-5 rounded-lg bg-[#fff0f0] px-3 py-2.5 text-[13px] font-medium text-[#c83c3c]">{error}</p>}
          <button type="submit" disabled={loading} className="brand-btn mt-7 h-[54px] w-full rounded-xl text-[15px] disabled:opacity-60">{loading ? "Création du compte..." : "Créer mon compte"}</button>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#8a94ab]">En créant un compte, vous acceptez les conditions d&apos;utilisation et la politique de confidentialité de SDK Pay.</p>
          <p className="mt-5 text-center text-[13px] text-[#5f6b86]">Vous avez déjà un compte ? <Link href="/login" className="font-bold text-[#e5a300] hover:underline">Se connecter</Link></p>
        </form>
        <Link href="/" className="mt-7 text-[12px] font-semibold text-[#7b869f] hover:text-[#e5a300]">← Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}
