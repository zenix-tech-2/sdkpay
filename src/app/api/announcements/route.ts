import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Public feed for the merchant Updates page (published only).
export async function GET() {
  const rows = await db
    .select()
    .from(announcements)
    .where(eq(announcements.status, "published"))
    .orderBy(desc(announcements.createdAt))
    .limit(20);
  return NextResponse.json({ announcements: rows });
}
