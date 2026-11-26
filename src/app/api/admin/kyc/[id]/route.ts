import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { kycSubmissions, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const sub = rows[0];
  const urows = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, country: users.country, kycStatus: users.kycStatus })
    .from(users)
    .where(eq(users.id, sub.userId))
    .limit(1);
  return NextResponse.json({ submission: sub, user: urows[0] ?? null });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { decision, note } = await req.json();
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }
  if (decision === "reject" && !note?.trim()) {
    return NextResponse.json({ error: "A note to the user is required when rejecting." }, { status: 400 });
  }
  const rows = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const sub = rows[0];

  const status = decision === "approve" ? "approved" : "rejected";
  await db
    .update(kycSubmissions)
    .set({ status, reviewNote: note?.trim() || null, reviewedBy: admin.id, reviewedAt: new Date() })
    .where(eq(kycSubmissions.id, id));
  await db
    .update(users)
    .set({ kycStatus: decision === "approve" ? "verified" : "pending", updatedAt: new Date() })
    .where(eq(users.id, sub.userId));
  await db.insert(notifications).values({
    userId: sub.userId,
    title: decision === "approve" ? "KYC approved ✓" : "KYC rejected",
    message:
      decision === "approve"
        ? "Your identity has been verified. Full limits unlocked!"
        : `Your KYC submission was rejected: ${note.trim()} Please resubmit with valid documents.`,
  });
  await audit(admin, `kyc.${decision}`, id, `user=${sub.userId} note=${(note || "").slice(0, 200)}`);
  return NextResponse.json({ ok: true });
}
