import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, desc, ilike, or, sql, count } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status") || "all";
  const kyc = url.searchParams.get("kyc") || "all";
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 30));
  const offset = Number(url.searchParams.get("offset") || 0);

  const conds = [];
  if (status !== "all") conds.push(eq(users.status, status));
  if (kyc !== "all") conds.push(eq(users.kycStatus, kyc));
  if (q) {
    const like = `%${q}%`;
    conds.push(or(ilike(users.fullName, like), ilike(users.email, like), ilike(users.username, like), ilike(users.phone, like))!);
  }
  const where = conds.length ? and(...conds) : undefined;

  const [total] = await db.select({ c: count() }).from(users).where(where as never);
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      email: users.email,
      phone: users.phone,
      country: users.country,
      status: users.status,
      kycStatus: users.kycStatus,
      balanceXaf: users.balanceXaf,
      balanceXof: users.balanceXof,
      balanceUsdt: users.balanceUsdt,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(where as never)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ users: rows, total: Number(total.c), limit, offset });
}
