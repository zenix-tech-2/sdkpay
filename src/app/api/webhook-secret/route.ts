import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { publicUser } from "@/lib/auth";
import { randomCode } from "@/lib/format";

export async function POST() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const secret = result.user.webhookSecret || `whsec_${randomCode(28)}`;
    const [updated] = await db.update(users).set({ webhookSecret: secret }).where(eq(users.id, result.user.id)).returning();
    return Response.json({ user: publicUser(updated), secret });
  } catch (error) {
    return apiError(error);
  }
}
