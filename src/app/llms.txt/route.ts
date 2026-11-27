import { DOC_PAGES, SITE, type Lang } from "@/content/docs";
import { baseFromRequest } from "@/lib/base-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = baseFromRequest(req);
  const lang: Lang = new URL(req.url).searchParams.get("lang") === "fr" ? "fr" : "en";
  const q = lang === "fr" ? "?lang=fr" : "";
  const lines = [
    `# ${SITE.name}`,
    ``,
    `> ${SITE.tagline[lang]}`,
    ``,
    `Base URL: ${base} (always use the domain you fetched this file from).`,
    `Only the endpoints in the "Developers" page are public. Dashboard and admin routes need a signed-in session.`,
    ``,
    `## Docs`,
    ...DOC_PAGES.map((p) => `- [${p.title[lang]}](${base}/docs/raw/${p.slug}.md${q}): ${p.summary[lang]}`),
    ``,
    `## Optional`,
    `- [Full documentation in one file](${base}/llms-full.txt${q})`,
    `- [Documentation as JSON](${base}/api/docs${q})`,
    ``,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
