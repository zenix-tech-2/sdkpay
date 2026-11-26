import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { db } from "@/db";
import { kycSubmissions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") || "pending";
  const rows = await db
    .select({
      id: kycSubmissions.id,
      userId: kycSubmissions.userId,
      idType: kycSubmissions.idType,
      idNumber: kycSubmissions.idNumber,
      status: kycSubmissions.status,
      createdAt: kycSubmissions.createdAt,
      reviewedAt: kycSubmissions.reviewedAt,
      fullName: users.fullName,
      email: users.email,
      country: users.country,
    })
    .from(kycSubmissions)
    .leftJoin(users, eq(users.id, kycSubmissions.userId))
    .where(status === "all" ? undefined : eq(kycSubmissions.status, status))
    .orderBy(desc(kycSubmissions.createdAt))
    .limit(100);
  return NextResponse.json({ submissions: rows });
}
