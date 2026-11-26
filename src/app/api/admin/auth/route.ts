import { NextResponse } from "next/server";
import { adminFromRequest, adminLogin, adminLogout, ensureSeeded, defaultsHint, audit } from "@/lib/admin-auth";

export async function GET() {
  await ensureSeeded();
  const admin = await adminFromRequest();
  return NextResponse.json({ admin, defaultsHint: !admin && defaultsHint() });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  const admin = await adminLogin(email, password);
  if (!admin) return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  await audit(admin, "login", admin.email, "Admin console login");
  return NextResponse.json({ ok: true, admin });
}

export async function DELETE() {
  const admin = await adminFromRequest();
  await adminLogout();
  if (admin) await audit(admin, "logout", admin.email, "Admin console logout");
  return NextResponse.json({ ok: true });
}
