import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super") return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  const rows = await db
    .select({ id: admins.id, name: admins.name, email: admins.email, role: admins.role, isActive: admins.isActive, lastLoginAt: admins.lastLoginAt, createdAt: admins.createdAt })
    .from(admins)
    .orderBy(desc(admins.createdAt));
  return NextResponse.json({ admins: rows });
}

export async function POST(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super") return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  const { name, email, password, role } = await req.json();
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json({ error: "Name, email and password (min. 8 chars) required." }, { status: 400 });
  }
  const exists = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email.trim().toLowerCase())).limit(1);
  if (exists.length) return NextResponse.json({ error: "Admin email already exists." }, { status: 409 });
  const inserted = await db
    .insert(admins)
    .values({
      name: name.trim().slice(0, 120),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: role === "super" ? "super" : "support",
    })
    .returning({ id: admins.id });
  await audit(admin, "admin.create", email, `role=${role}`);
  return NextResponse.json({ ok: true, id: inserted[0].id });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super") return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  const { id, isActive, role } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (id === admin.id && isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate yourself." }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  if (typeof isActive === "boolean") patch.isActive = isActive;
  if (role === "super" || role === "support") patch.role = role;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await db.update(admins).set(patch).where(eq(admins.id, id));
  await audit(admin, "admin.update", id, JSON.stringify(patch));
  return NextResponse.json({ ok: true });
}
