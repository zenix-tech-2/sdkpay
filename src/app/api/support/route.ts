import { db } from "@/db";
import { supportMessages } from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getSessionUser();
    const body = await request.json();
    const email = String(body.email ?? user?.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (!email || !message) return Response.json({ error: "E-mail et message requis" }, { status: 400 });
    await db.insert(supportMessages).values({ userId: user?.id ?? null, email, message });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Impossible d'envoyer le message" }, { status: 500 });
  }
}
