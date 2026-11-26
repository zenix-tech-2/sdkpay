import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FEE_DEFAULTS } from "@/lib/platform";

const KNOWN = Object.keys(FEE_DEFAULTS);

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(platformSettings);
  const values: Record<string, string> = { ...FEE_DEFAULTS };
  rows.forEach((r) => {
    values[r.key] = r.value;
  });
  return NextResponse.json({ settings: values });
}

export async function PATCH(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super") return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  const body = await req.json();
  const changes: string[] = [];
  for (const key of KNOWN) {
    if (body[key] === undefined) continue;
    const value = String(body[key]).slice(0, 20);
    if (key !== "manual_withdrawals" && (Number.isNaN(Number(value)) || Number(value) < 0)) {
      return NextResponse.json({ error: `Invalid value for ${key}.` }, { status: 400 });
    }
    if (key === "manual_withdrawals" && value !== "true" && value !== "false") {
      return NextResponse.json({ error: "Invalid value for manual_withdrawals." }, { status: 400 });
    }
    await db
      .insert(platformSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: platformSettings.key, set: { value, updatedAt: new Date() } });
    changes.push(`${key}=${value}`);
  }
  await audit(admin, "settings.update", "platform", changes.join(", "));
  return NextResponse.json({ ok: true });
}
