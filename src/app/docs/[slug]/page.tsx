import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DocsShell from "@/components/docs/DocsShell";
import { Markdown } from "@/lib/markdown";
import { DOC_PAGES, getPage, renderBody, type Lang } from "@/content/docs";
import { getBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  const lang: Lang = (await searchParams).lang === "en" ? "en" : "fr";
  return page ? { title: `${page.title[lang]} | SDK Pay Docs`, description: page.summary[lang] } : {};
}

export default async function DocPageView({ params, searchParams }: Props) {
  const { slug } = await params;
  const lang: Lang = (await searchParams).lang === "en" ? "en" : "fr";
  const page = getPage(slug);
  if (!page) notFound();
  const base = await getBaseUrl();
  const i = DOC_PAGES.findIndex((p) => p.slug === slug);
  const prev = DOC_PAGES[i - 1];
  const next = DOC_PAGES[i + 1];
  const q = lang === "en" ? "?lang=en" : "";

  return (
    <DocsShell lang={lang} active={slug}>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-blue-600">{page.section[lang]}</p>
      <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-slate-900">{page.title[lang]}</h1>
      <p className="mt-1.5 text-[15px] font-medium text-slate-500">{page.summary[lang]}</p>
      <Markdown source={renderBody(page, lang, base)} />
      <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-[13px] font-bold">
        {prev ? <Link href={`/docs/${prev.slug}${q}`} className="text-slate-600">← {prev.title[lang]}</Link> : <span />}
        {next ? <Link href={`/docs/${next.slug}${q}`} className="text-blue-600">{next.title[lang]} →</Link> : <span />}
      </div>
      <p className="mt-6 text-[12px] font-medium text-slate-400">
        <a href={`/docs/raw/${slug}.md${q}`} className="underline">Markdown</a>
      </p>
    </DocsShell>
  );
}
