import { getPage, pageAsMarkdown, type Lang } from "@/content/docs";
import { baseFromRequest } from "@/lib/base-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.replace(/\.md$/, "");
  const page = getPage(slug);
  if (!page) return new Response("Not found", { status: 404 });
  const lang: Lang = new URL(req.url).searchParams.get("lang") === "fr" ? "fr" : "en";
  return new Response(pageAsMarkdown(page, lang, baseFromRequest(req)), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
