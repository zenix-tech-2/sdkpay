import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { getWalletsForUser } from "@/lib/wallets";
import { walletCurrencies } from "@/lib/wallet-currencies";

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    return Response.json({ wallets: await getWalletsForUser(result.user.id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const code = String(body.currency ?? "").trim().toUpperCase();
    const option = walletCurrencies.find((item) => item.code === code);
    if (!option) return Response.json({ error: "Devise non reconnue" }, { status: 400 });
    const existing = await db.select({ id: wallets.id }).from(wallets)
      .where(and(eq(wallets.userId, result.user.id), eq(wallets.currency, code)))
      .limit(1);
    if (existing.length) return Response.json({ error: "Vous possédez déjà ce compte" }, { status: 409 });
    const [wallet] = await db.insert(wallets).values({
      userId: result.user.id,
      currency: option.code,
      countryName: option.name,
      flag: option.flag,
      balance: 0,
      isPrimary: false,
    }).returning();
    return Response.json({ wallet }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
