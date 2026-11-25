import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const rows = await db.select().from(transactions).where(eq(transactions.userId, user.id)).orderBy(desc(transactions.createdAt));

  const header = ["reference", "type", "direction", "status", "amount", "fee", "net", "currency", "operator", "country", "recipient", "source", "created_at"];
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((t) =>
      [t.ref, t.type, t.direction, t.status, t.amount, t.fee, t.net, t.currency, t.operator ?? "", t.country ?? "", t.recipient ?? "", t.source, t.createdAt.toISOString()]
        .map(escape)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sdkpay-transactions.csv"',
    },
  });
}
