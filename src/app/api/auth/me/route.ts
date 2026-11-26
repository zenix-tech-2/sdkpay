import { getSessionUser } from "@/lib/auth";
import { meResponse } from "@/lib/api-helpers";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await getSessionUser();
    return Response.json(user ? meResponse(user) : { user: null });
  } catch (error) {
    return apiError(error);
  }
}
