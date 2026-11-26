"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, Mail, Menu, Power, X } from "lucide-react";
import { Logo } from "@/components/Logo";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("FR");

  return (
    <header className="sticky top-0 z-50 border-b border-[#eef1f7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo size="md" />
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#34405e] lg:flex">
          <a href="#solutions">Nos solutions</a>
          <a href="#wallet">Wallet</a>
          <a href="#comment">Comment ça marche</a>
          <a href="#securite">Sécurité</a>
          <a href="#api">API REST</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden items-center gap-1.5 rounded-full border border-[#e3e8f2] px-3 py-1.5 text-[11px] font-bold text-[#25314f] transition hover:border-[#ffb800] sm:inline-flex">
            <LogIn size={13} /> Se connecter
          </Link>
          <Link href="#footer" className="inline-flex items-center gap-1.5 rounded-full bg-[#ffb800] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#efa600]">
            <Mail size={13} /> Contact
          </Link>
          <div className="relative hidden sm:block">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 px-1 text-[11px] font-bold text-[#5c6783]" aria-label="Choisir la langue">
              🌍 {lang} <ChevronDown size={11} />
            </button>
            {langOpen && (
              <div className="animate-pop absolute right-0 top-7 w-28 rounded-xl border border-[#e8ecf5] bg-white p-1 shadow-lg">
                {["FR", "EN"].map((item) => (
                  <button key={item} onClick={() => { setLang(item); setLangOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#fff6dd]">{item === "FR" ? "Français" : "English"}</button>
                ))}
              </div>
            )}
          </div>
          <Link href="/login" className="hidden text-[#8c96ad] sm:block" aria-label="Compte"><Power size={14} /></Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-1.5 text-[#27324d]" aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="animate-pop border-t border-[#eef1f7] bg-white px-5 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 text-sm font-semibold text-[#34405e]">
            {[["Nos solutions", "#solutions"], ["Wallet sécurisé", "#wallet"], ["Comment ça marche", "#comment"], ["Sécurité", "#securite"], ["API REST", "#api"]].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-[#f5f8ff]">{label}</a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-lg bg-[#ffb800] px-3 py-2 text-center font-bold text-white">Se connecter</Link>
          </div>
        </div>
      )}
    </header>
  );
}
