import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentLinks } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";
import { linkColumns, parseLinkInput } from "@/lib/link-input";

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const links = await db.select().from(paymentLinks).where(eq(paymentLinks.userId, result.user.id)).orderBy(desc(paymentLinks.id));
    return Response.json({ links });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const parsed = parseLinkInput(await request.json());
    if (parsed.error) return Response.json({ error: parsed.error }, { status: 400 });
    const values = parsed.values;

    let slug = values.slugHint || randomCode(9);
    if ((await db.select({ id: paymentLinks.id }).from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1)).length) {
      if (values.slugHint) return Response.json({ error: "Cette URL personnalisée est déjà utilisée" }, { status: 409 });
      slug = randomCode(9);
    }
    const [link] = await db.insert(paymentLinks).values({
      userId: result.user.id,
      slug,
      currency: "XAF",
      status: "active",
      ...linkColumns(values),
    }).returning();
    return Response.json({ link, url: `/pay/${link.slug}` }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
