import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { publicUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const updates: Partial<typeof users.$inferInsert> = {};
    if (typeof body.theme === "string") updates.theme = body.theme === "dark" ? "dark" : "light";
    if (typeof body.notifyEmail === "boolean") updates.notifyEmail = body.notifyEmail;
    if (typeof body.notifyPush === "boolean") updates.notifyPush = body.notifyPush;
    if (typeof body.notifySms === "boolean") updates.notifySms = body.notifySms;
    if (typeof body.notifyMarketing === "boolean") updates.notifyMarketing = body.notifyMarketing;
    if (body.conversionSources !== undefined) updates.conversionSources = JSON.stringify(body.conversionSources);
    if (typeof body.conversionDestination === "string") updates.conversionDestination = body.conversionDestination;
    if (typeof body.conversionActive === "boolean") updates.conversionActive = body.conversionActive;
    if (body.withdrawalNumbers !== undefined) updates.withdrawalNumbers = JSON.stringify(body.withdrawalNumbers);
    if (typeof body.pinConfigured === "boolean") updates.pinConfigured = body.pinConfigured;
    if (Object.keys(updates).length === 0) return Response.json({ error: "Aucune préférence à mettre à jour" }, { status: 400 });
    const [updated] = await db.update(users).set(updates).where(eq(users.id, result.user.id)).returning();
    return Response.json({ user: publicUser(updated) });
  } catch (error) {
    return apiError(error);
  }
}
