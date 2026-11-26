import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";

export async function DELETE() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    await db.delete(users).where(eq(users.id, result.user.id));
    const jar = await cookies();
    jar.delete("sdkpay_session");
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
