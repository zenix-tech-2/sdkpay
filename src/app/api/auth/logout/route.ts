import { destroySession } from "@/lib/auth";
import { ensureSchema } from "@/lib/ensure-schema";

export async function POST() {
  await ensureSchema();
  await destroySession();
  return Response.json({ ok: true });
}
