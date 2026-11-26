import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and, gte, sql, or, ilike, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "all";
  const period = url.searchParams.get("period") || "all";
  const status = url.searchParams.get("status") || "all";
  const currency = url.searchParams.get("currency") || "all";
  const q = url.searchParams.get("q")?.trim() || "";

  const conds = [eq(transactions.userId, user.id)];
  if (type && type !== "all") {
    const types = type.split(",").filter(Boolean);
    if (types.length === 1) conds.push(eq(transactions.type, types[0]));
    else if (types.length > 1) conds.push(inArray(transactions.type, types));
  }
  if (status && status !== "all") conds.push(eq(transactions.status, status));
  if (currency && currency !== "all") conds.push(eq(transactions.currency, currency));
  if (period === "month") {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    conds.push(gte(transactions.createdAt, d));
  } else if (period === "week") {
    const d = new Date(Date.now() - 7 * 86400000);
    conds.push(gte(transactions.createdAt, d));
  }
  if (q) {
    const like = `%${q}%`;
    const numeric = Number(q.replace(/\s/g, ""));
    const orConds = [
      ilike(transactions.label, like),
      ilike(transactions.operator, like),
      ilike(transactions.reference, like),
      ilike(transactions.counterparty, like),
    ];
    if (!Number.isNaN(numeric) && q.replace(/\s/g, "").length > 0) {
      orConds.push(sql`${transactions.amount} = ${numeric}`);
    }
    conds.push(or(...orConds)!);
  }

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conds))
    .orderBy(desc(transactions.createdAt))
    .limit(200);

  const [totals] = await db
    .select({
      entries: sql<number>`coalesce(sum(case when ${transactions.type} in ('deposit','send_in','payment_received','bonus') and ${transactions.status} = 'success' and ${transactions.currency} != 'USDT' then ${transactions.amount} else 0 end),0)`,
      exits: sql<number>`coalesce(sum(case when ${transactions.type} in ('withdraw','send_out','payout') and ${transactions.status} = 'success' and ${transactions.currency} != 'USDT' then ${transactions.amount} else 0 end),0)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  return NextResponse.json({ transactions: rows, totals });
}
