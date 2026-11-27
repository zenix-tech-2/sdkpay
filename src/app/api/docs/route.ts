import { NextResponse } from "next/server";
import { DOC_PAGES, renderBody, type Lang } from "@/content/docs";
import { baseFromRequest } from "@/lib/base-url";

export const dynamic = "force-dynamic";

/** GET /api/docs?lang=en|fr&q=search  ->  all docs pages as JSON (AI/tool friendly). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "fr" ? "fr" : "en";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const base = baseFromRequest(req);
  let pages = DOC_PAGES.map((p) => ({
    slug: p.slug,
    section: p.section[lang],
    title: p.title[lang],
    summary: p.summary[lang],
    url: `${base}/docs/${p.slug}${lang === "fr" ? "?lang=fr" : "?lang=en"}`,
    markdown: `${base}/docs/raw/${p.slug}.md${lang === "fr" ? "?lang=fr" : ""}`,
    content: renderBody(p, lang, base),
  }));
  if (q) pages = pages.filter((p) => `${p.title} ${p.summary} ${p.content}`.toLowerCase().includes(q));
  return NextResponse.json({ baseUrl: base, lang, count: pages.length, pages });
}
