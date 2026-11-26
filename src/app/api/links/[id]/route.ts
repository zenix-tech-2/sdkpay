import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentLinks } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { linkColumns, parseLinkInput } from "@/lib/link-input";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const { id } = await params;
    const linkId = Number(id);
    const body = await request.json();

    if (body.title === undefined) {
      const status = body.status === "disabled" ? "disabled" : "active";
      const [link] = await db.update(paymentLinks).set({ status })
        .where(and(eq(paymentLinks.id, linkId), eq(paymentLinks.userId, result.user.id)))
        .returning();
      if (!link) return Response.json({ error: "Lien introuvable" }, { status: 404 });
      return Response.json({ link });
    }

    const parsed = parseLinkInput(body);
    if (parsed.error) return Response.json({ error: parsed.error }, { status: 400 });
    const values = parsed.values;
    if (values.slugHint) {
      const existing = await db.select({ id: paymentLinks.id }).from(paymentLinks).where(eq(paymentLinks.slug, values.slugHint)).limit(1);
      if (existing.length && existing[0].id !== linkId) return Response.json({ error: "Cette URL personnalisée est déjà utilisée" }, { status: 409 });
    }
    const [link] = await db.update(paymentLinks).set({
      ...linkColumns(values),
      ...(values.slugHint ? { slug: values.slugHint } : {}),
    }).where(and(eq(paymentLinks.id, linkId), eq(paymentLinks.userId, result.user.id))).returning();
    if (!link) return Response.json({ error: "Lien introuvable" }, { status: 404 });
    return Response.json({ link });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const { id } = await params;
    const [link] = await db.delete(paymentLinks)
      .where(and(eq(paymentLinks.id, Number(id)), eq(paymentLinks.userId, result.user.id)))
      .returning({ id: paymentLinks.id });
    if (!link) return Response.json({ error: "Lien introuvable" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
