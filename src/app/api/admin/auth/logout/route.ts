import { destroyAdminSession } from "@/lib/admin-auth";
import { ensureSchema } from "@/lib/ensure-schema";

export async function POST() {
  await ensureSchema();
  await destroyAdminSession();
  return Response.json({ ok: true });
}
