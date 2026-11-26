import { requireAdmin, publicAdmin } from "@/lib/admin-auth";
import { getAdminBootstrapData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await requireAdmin();
    if (!("admin" in result)) return result.response;
    const data = await getAdminBootstrapData(publicAdmin(result.admin));
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Admin data unavailable" }, { status: 500 });
  }
}
