import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { USDT_UNIT, microToUsdt } from "@/lib/crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { wallet, direction, amount, reason } = await req.json();
  if (!["XAF", "XOF", "USDT"].includes(wallet)) return NextResponse.json({ error: "Invalid wallet." }, { status: 400 });
  if (direction !== "credit" && direction !== "debit") return NextResponse.json({ error: "Invalid direction." }, { status: 400 });
  const amt = Number(amount);
  if (!amt || amt <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  if (!reason?.trim()) return NextResponse.json({ error: "Reason required." }, { status: 400 });

  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const u = rows[0];
  const micro = wallet === "USDT" ? Math.round(amt * USDT_UNIT) : Math.round(amt);
  const bal = wallet === "USDT" ? u.balanceUsdt : wallet === "XOF" ? u.balanceXof : u.balanceXaf;
  if (direction === "debit" && micro > bal) {
    return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
  }

  const col = wallet === "USDT" ? "balanceUsdt" : wallet === "XOF" ? "balanceXof" : "balanceXaf";
  if (direction === "credit") {
    await db.update(users).set({ [col]: sql`${users[col]} + ${micro}` }).where(eq(users.id, id));
  } else {
    await db.update(users).set({ [col]: sql`${users[col]} - ${micro}` }).where(eq(users.id, id));
  }
  const ref = randomRef("SDK-A");
  await db.insert(transactions).values({
    userId: id,
    type: direction === "credit" ? "bonus" : "payout",
    amount: micro,
    currency: wallet,
    status: "success",
    reference: ref,
    label: `Admin ${direction}: ${reason.trim().slice(0, 120)}`,
    counterparty: `admin:${admin.email}`,
    country: u.country,
    balanceBefore: bal,
    balanceAfter: direction === "credit" ? bal + micro : bal - micro,
  });
  const shown = wallet === "USDT" ? `${microToUsdt(micro).toFixed(4)} USDT` : `${micro.toLocaleString("en-US")} ${wallet}`;
  await db.insert(notifications).values({
    userId: id,
    title: direction === "credit" ? "Account credited" : "Account debited",
    message: `SDK Pay ${direction === "credit" ? "credited" : "debited"} your ${wallet} wallet by ${shown}. Reason: ${reason.trim().slice(0, 160)}`,
  });
  await audit(admin, `balance.${direction}`, id, `${shown} — ${reason.slice(0, 160)}`);
  return NextResponse.json({ ok: true, reference: ref });
}
