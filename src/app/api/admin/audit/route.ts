import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { adminAudit } from "@/db/schema";
import { desc, ilike, or, lt, count } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const limit = Math.min(200, Number(url.searchParams.get("limit") || 50));
  const offset = Number(url.searchParams.get("offset") || 0);
  const like = `%${q}%`;
  const where = q ? or(ilike(adminAudit.action, like), ilike(adminAudit.adminEmail, like), ilike(adminAudit.target, like)) : undefined;
  const [total] = await db.select({ c: count() }).from(adminAudit).where(where as never);
  const rows = await db
    .select()
    .from(adminAudit)
    .where(where as never)
    .orderBy(desc(adminAudit.createdAt))
    .limit(limit)
    .offset(offset);
  return NextResponse.json({ audit: rows, total: Number(total.c), limit, offset });
}

export async function DELETE() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super") return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  const cutoff = new Date(Date.now() - 90 * 86400000);
  const res = await db.delete(adminAudit).where(lt(adminAudit.createdAt, cutoff)).returning({ id: adminAudit.id });
  await audit(admin, "audit.purge", "admin_audit", `purged ${res.length} entries older than 90 days`);
  return NextResponse.json({ ok: true, purged: res.length });
}
