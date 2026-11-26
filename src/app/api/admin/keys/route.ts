import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  const like = `%${q}%`;
  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      isLive: apiKeys.isLive,
      createdAt: apiKeys.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(apiKeys)
    .leftJoin(users, eq(users.id, apiKeys.userId))
    .where(q ? or(ilike(apiKeys.name, like), ilike(users.email, like)) : undefined)
    .orderBy(desc(apiKeys.createdAt))
    .limit(100);
  return NextResponse.json({ keys: rows });
}

export async function DELETE(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  await audit(admin, "key.revoke", id, "");
  return NextResponse.json({ ok: true });
}
