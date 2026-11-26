import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, notifications, kycSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { idType, idNumber, frontName, backName, frontUrl, backUrl } = await req.json();
  if (!idType || !idNumber?.trim()) {
    return NextResponse.json({ error: "ID type and ID number are required." }, { status: 400 });
  }
  for (const [label, url] of [["front", frontUrl], ["back", backUrl]] as const) {
    if (url && (typeof url !== "string" || url.length > 700_000)) {
      return NextResponse.json({ error: `${label} image too large (max ~500KB).` }, { status: 400 });
    }
    if (url && !url.startsWith("data:image/")) {
      return NextResponse.json({ error: `${label} must be an image.` }, { status: 400 });
    }
  }
  await db.insert(kycSubmissions).values({
    userId: user.id,
    idType: String(idType).slice(0, 40),
    idNumber: idNumber.trim().slice(0, 80),
    frontName: frontName?.slice(0, 160) || null,
    backName: backName?.slice(0, 160) || null,
    frontUrl: frontUrl || null,
    backUrl: backUrl || null,
  });
  await db.update(users).set({ kycStatus: "review", updatedAt: new Date() }).where(eq(users.id, user.id));
  await db.insert(notifications).values({
    userId: user.id,
    title: "KYC en cours de vérification",
    message: "Vos documents ont été reçus. Vérification sous 24h ouvrées. Vous serez notifié du résultat.",
  });
  return NextResponse.json({ ok: true, status: "review" });
}
