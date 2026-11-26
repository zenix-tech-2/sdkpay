import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, and, desc, ilike, or, gte, sql, count } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const type = url.searchParams.get("type") || "all";
  const status = url.searchParams.get("status") || "all";
  const provider = url.searchParams.get("provider") || "all";
  const period = url.searchParams.get("period") || "all";
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 30));
  const offset = Number(url.searchParams.get("offset") || 0);

  const conds = [];
  if (type !== "all") {
    const types = type.split(",").filter(Boolean);
    conds.push(types.length === 1 ? eq(transactions.type, types[0]) : sql`${transactions.type} = ANY(${types})`);
  }
  if (status !== "all") conds.push(eq(transactions.status, status));
  if (provider !== "all") conds.push(eq(transactions.provider, provider));
  if (period === "24h") conds.push(gte(transactions.createdAt, new Date(Date.now() - 86400000)));
  if (period === "7d") conds.push(gte(transactions.createdAt, new Date(Date.now() - 7 * 86400000)));
  if (q) {
    const like = `%${q}%`;
    conds.push(
      or(
        ilike(transactions.reference, like),
        ilike(transactions.operator, like),
        ilike(transactions.phone, like),
        ilike(transactions.label, like),
        ilike(users.email, like)
      )!
    );
  }
  const where = conds.length ? and(...conds) : undefined;

  const [total] = await db
    .select({ c: count() })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .where(where as never);
  const rows = await db
    .select({
      id: transactions.id,
      reference: transactions.reference,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      fee: transactions.fee,
      status: transactions.status,
      operator: transactions.operator,
      provider: transactions.provider,
      createdAt: transactions.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .where(where as never)
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ transactions: rows, total: Number(total.c), limit, offset });
}
