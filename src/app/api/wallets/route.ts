import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { COUNTRIES } from "@/data/countries";
import { WALLET_CATALOG, balanceFamily } from "@/lib/wallets";
import { foreignBalance } from "@/lib/foreign-balance";

async function ensurePrimary(userId: string, countryName: string) {
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length) return;
  const match = COUNTRIES.find((c) => c.name === countryName);
  await db.insert(wallets).values({
    userId,
    walletCode: match?.wallet ?? "XAF",
    country: match?.name ?? countryName ?? "Cameroun",
    countryCode: match?.code ?? "CM",
    flag: match?.flag ?? "🇨🇲",
    isPrimary: true,
  });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  await ensurePrimary(user.id, user.country);
  const rows = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, user.id))
    .orderBy(desc(wallets.isPrimary), desc(wallets.createdAt));
  const withBalances = await Promise.all(
    rows.map(async (w) => {
      const fam = balanceFamily(w.walletCode);
      const balance =
        fam === "USDT" ? user.balanceUsdt : fam === "XOF" ? user.balanceXof : fam === "XAF" ? user.balanceXaf : await foreignBalance(user.id, fam);
      return { ...w, family: fam, balance };
    })
  );
  return NextResponse.json({ wallets: withBalances, catalog: WALLET_CATALOG });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { code } = await req.json();
  const entry = WALLET_CATALOG.find((c) => c.code === code);
  if (!entry) return NextResponse.json({ error: "Unknown currency." }, { status: 400 });
  const dup = await db
    .select({ id: wallets.id })
    .from(wallets)
    .where(and(eq(wallets.userId, user.id), eq(wallets.walletCode, code)))
    .limit(1);
  if (dup.length) return NextResponse.json({ error: "You already have this account." }, { status: 409 });
  const country = COUNTRIES.find((c) => c.wallet === code);
  const inserted = await db
    .insert(wallets)
    .values({
      userId: user.id,
      walletCode: entry.code,
      country: entry.country,
      countryCode: country?.code ?? entry.code,
      flag: entry.flag,
      isPrimary: false,
    })
    .returning();
  return NextResponse.json({ ok: true, wallet: inserted[0] });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.update(wallets).set({ isPrimary: false }).where(eq(wallets.userId, user.id));
  await db
    .update(wallets)
    .set({ isPrimary: true })
    .where(and(eq(wallets.id, id), eq(wallets.userId, user.id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const rows = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, user.id)))
    .limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (rows[0].isPrimary) return NextResponse.json({ error: "Cannot delete your primary account." }, { status: 400 });
  await db.delete(wallets).where(and(eq(wallets.id, id), eq(wallets.userId, user.id)));
  return NextResponse.json({ ok: true });
}
