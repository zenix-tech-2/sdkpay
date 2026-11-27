import { DOC_PAGES, SITE, pageAsMarkdown, type Lang } from "@/content/docs";
import { baseFromRequest } from "@/lib/base-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = baseFromRequest(req);
  const lang: Lang = new URL(req.url).searchParams.get("lang") === "fr" ? "fr" : "en";
  const body = [`# ${SITE.name} documentation\n\n> ${SITE.tagline[lang]}\n\nBase URL: ${base}\n`, ...DOC_PAGES.map((p) => pageAsMarkdown(p, lang, base))].join("\n---\n\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
