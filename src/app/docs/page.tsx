import Link from "next/link";
import type { Metadata } from "next";
import DocsShell from "@/components/docs/DocsShell";
import { sectionsFor, SITE, type Lang } from "@/content/docs";
import { getBaseUrl } from "@/lib/base-url";

export const metadata: Metadata = { title: "Documentation | SDK Pay" };
export const dynamic = "force-dynamic";

export default async function DocsHome({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang: Lang = (await searchParams).lang === "en" ? "en" : "fr";
  const base = await getBaseUrl();
  const q = lang === "en" ? "?lang=en" : "";
  return (
    <DocsShell lang={lang}>
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
        {lang === "fr" ? "Documentation SDK Pay" : "SDK Pay documentation"}
      </h1>
      <p className="mt-2 text-[15px] font-medium text-slate-500">{SITE.tagline[lang]}</p>
      <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-600">
        {lang === "fr" ? "URL de base" : "Base URL"} : <code className="font-mono text-slate-900">{base}</code>
        {" · "}
        <Link href="/docs/ai-access" className="text-blue-600 underline">{lang === "fr" ? "Accès IA" : "AI access"}</Link>
        {" · "}
        <a href="/llms.txt" className="text-blue-600 underline">llms.txt</a>
      </p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {sectionsFor(lang).map((g) => (
          <div key={g.section}>
            <h2 className="text-[13px] font-extrabold uppercase tracking-wide text-slate-400">{g.section}</h2>
            <div className="mt-2 space-y-2">
              {g.pages.map((p) => (
                <Link key={p.slug} href={`/docs/${p.slug}${q}`} className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40">
                  <span className="block text-[14px] font-extrabold text-slate-900">{p.title[lang]}</span>
                  <span className="mt-0.5 block text-[12.5px] font-medium text-slate-500">{p.summary[lang]}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DocsShell>
  );
}
