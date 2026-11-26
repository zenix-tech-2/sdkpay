import { db } from "@/db";
import { kycUpdates } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const fullName = String(body.fullName ?? result.user.fullName).trim();
    const documentType = String(body.documentType ?? "").trim();
    const documentNumber = String(body.documentNumber ?? "").trim();
    if (!fullName || !documentType || !documentNumber) return Response.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    const [record] = await db.insert(kycUpdates).values({
      userId: result.user.id,
      fullName,
      documentType,
      documentNumber,
    }).returning();
    return Response.json({ ok: true, record }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
