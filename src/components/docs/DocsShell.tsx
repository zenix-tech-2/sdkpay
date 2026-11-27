import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Logo from "@/components/Logo";
import { sectionsFor, type Lang } from "@/content/docs";

export default function DocsShell({ lang, active, children }: { lang: Lang; active?: string; children: ReactNode }) {
  const q = lang === "en" ? "?lang=en" : "";
  const sections = sectionsFor(lang);
  const nav = (
    <nav className="space-y-5">
      {sections.map((g) => (
        <div key={g.section}>
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{g.section}</p>
          <div className="mt-1.5 space-y-0.5">
            {g.pages.map((p) => (
              <Link
                key={p.slug}
                href={`/docs/${p.slug}${q}`}
                className={`block rounded-xl px-3 py-2 text-[13px] font-semibold ${
                  active === p.slug ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.title[lang]}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-full border border-slate-200 text-[11px] font-extrabold">
              <Link href={active ? `/docs/${active}` : "/docs"} className={`px-3 py-1.5 ${lang === "fr" ? "bg-slate-900 text-white" : "text-slate-500"}`}>FR</Link>
              <Link href={`${active ? `/docs/${active}` : "/docs"}?lang=en`} className={`px-3 py-1.5 ${lang === "en" ? "bg-slate-900 text-white" : "text-slate-500"}`}>EN</Link>
            </div>
            <Link href="/" className="hidden items-center gap-1 text-[12px] font-bold text-slate-500 sm:flex">
              <ArrowLeft size={12} /> {lang === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link href="/register" className="rounded-full bg-yellow-400 px-4 py-2 text-[12px] font-extrabold">
              {lang === "fr" ? "Créer un compte" : "Create account"}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details className="rounded-2xl border border-slate-200 p-3 lg:hidden">
            <summary className="flex cursor-pointer items-center gap-2 text-[13px] font-extrabold">
              <BookOpen size={14} /> {lang === "fr" ? "Sommaire" : "Contents"}
            </summary>
            <div className="mt-3 max-h-[55vh] overflow-y-auto">{nav}</div>
          </details>
          <div className="hidden lg:block">{nav}</div>
        </aside>
        <main className="min-w-0 max-w-3xl">{children}</main>
      </div>
    </div>
  );
}
