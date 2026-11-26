import { getAdminSession, publicAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Admin session required" }, { status: 401 });
  return Response.json({ admin: publicAdmin(admin) });
}
