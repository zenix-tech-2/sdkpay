import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const rows = await db.select().from(notifications).where(eq(notifications.userId, result.user.id)).orderBy(desc(notifications.createdAt));
    return Response.json({ notifications: rows });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    if (body.all) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, result.user.id));
    } else if (Array.isArray(body.ids) && body.ids.length) {
      const ids = body.ids.map(Number).filter(Number.isFinite);
      await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, result.user.id), inArray(notifications.id, ids)));
    }
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const url = new URL(request.url);
    const all = url.searchParams.get("all") === "1";
    const id = Number(url.searchParams.get("id"));
    if (all) {
      await db.delete(notifications).where(eq(notifications.userId, result.user.id));
    } else if (Number.isFinite(id)) {
      await db.delete(notifications).where(and(eq(notifications.userId, result.user.id), eq(notifications.id, id)));
    }
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
