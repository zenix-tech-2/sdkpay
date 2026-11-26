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
    if (!record) return Response.json({ error: "Demande de dépôt introuvable" }, { status: 404 });
    if (record.status !== "pending") return Response.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });

    const net = record.amount;
    const before = record.balanceBefore;
    const updated = await db.transaction(async (trx) => {
      const [account] = await trx.update(users)
        .set({ balance: sql`${users.balance} + ${net}` })
        .where(eq(users.id, result.user.id))
        .returning({ balance: users.balance });
      const after = account?.balance ?? before + net;
      const [transaction] = await trx.update(transactions).set({
        status: "completed",
        providerStatus: "success",
        balanceAfter: after,
        balanceAfterDecimal: after,
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
