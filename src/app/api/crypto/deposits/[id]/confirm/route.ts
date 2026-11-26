import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const { id } = await params;
    const transactionId = Number(id);
    const [record] = await db.select().from(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, result.user.id)))
      .limit(1);
    if (!record) return Response.json({ error: "Demande crypto introuvable" }, { status: 404 });
    if (record.status !== "pending") return Response.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });

    const net = Number(record.amountDecimal ?? record.amount / 10000);
    const before = Number(record.balanceBeforeDecimal ?? 0);
    const updated = await db.transaction(async (trx) => {
      const [account] = await trx.update(users)
        .set({ usdtBalance: sql`${users.usdtBalance} + ${net}` })
        .where(eq(users.id, result.user.id))
        .returning({ usdtBalance: users.usdtBalance });
      const after = account?.usdtBalance ?? before + net;
      const [transaction] = await trx.update(transactions).set({
        status: "completed",
        providerStatus: "success",
        balanceAfterDecimal: after,
        balanceAfter: Math.round(after * 10000),
        updatedAt: new Date(),
        expiresAt: null,
      }).where(eq(transactions.id, transactionId)).returning();
      return transaction;
    });
    return Response.json({ transaction: updated });
  } catch (error) {
    return apiError(error);
  }
}
