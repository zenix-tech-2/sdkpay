import { eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";
import { randomCode } from "@/lib/format";

export async function POST(request: Request) {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const body = await request.json();
    const identifier = String(body.recipient ?? "").trim().toLowerCase();
    const gross = Math.round(Number(body.amount));
    if (!identifier) return Response.json({ error: "Indiquez le destinataire" }, { status: 400 });
    if (!Number.isFinite(gross) || gross < 100) return Response.json({ error: "Le montant minimum est de 100 FCFA" }, { status: 400 });

    const [recipient] = await db.select().from(users).where(or(eq(users.username, identifier), eq(users.email, identifier))).limit(1);
    if (!recipient) return Response.json({ error: "Aucun compte SDK Pay trouvé" }, { status: 404 });
    if (recipient.id === result.user.id) return Response.json({ error: "Vous ne pouvez pas vous envoyer de l'argent" }, { status: 400 });

    const fee = 0;
    const net = gross;
    const stamp = Date.now().toString(36).toUpperCase();
    const senderReference = `SDK-S-${stamp}-${randomCode(6).toUpperCase()}`;
    const recipientReference = `SDK-R-${stamp}-${randomCode(6).toUpperCase()}`;

    const outcome = await db.transaction(async (trx) => {
      const [senderAccount] = await trx.select({ balance: users.balance }).from(users).where(eq(users.id, result.user.id)).limit(1);
      const [recipientAccount] = await trx.select({ balance: users.balance }).from(users).where(eq(users.id, recipient.id)).limit(1);
      const senderBefore = senderAccount?.balance ?? 0;
      const recipientBefore = recipientAccount?.balance ?? 0;
      if (senderBefore < gross) throw new Error("Solde insuffisant pour cette opération");
      const [updatedSender] = await trx.update(users).set({ balance: sql`${users.balance} - ${gross}` }).where(eq(users.id, result.user.id)).returning({ balance: users.balance });
      const [updatedRecipient] = await trx.update(users).set({ balance: sql`${users.balance} + ${net}` }).where(eq(users.id, recipient.id)).returning({ balance: users.balance });
      const senderAfter = updatedSender?.balance ?? senderBefore - gross;
      const recipientAfter = updatedRecipient?.balance ?? recipientBefore + net;
      const records = await trx.insert(transactions).values([
        {
          userId: result.user.id,
          type: "send",
          direction: "out",
          amount: net,
          fee,
          grossAmount: gross,
          status: "completed",
          method: "Internal transfer",
          counterparty: recipient.username,
          reference: senderReference,
          note: `Transfert interne à ${recipient.fullName}`,
          balanceBefore: senderBefore,
          balanceAfter: senderAfter,
          siteReference: `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
          recipientName: recipient.fullName,
          countryName: "Cameroun",
          currency: "XAF",
          amountDecimal: net,
          feeDecimal: fee,
          grossDecimal: gross,
          balanceBeforeDecimal: senderBefore,
          balanceAfterDecimal: senderAfter,
          providerReference: senderReference,
          flow: "internal_transfer",
        },
        {
          userId: recipient.id,
          type: "deposit",
          direction: "in",
          amount: net,
          fee: 0,
          grossAmount: net,
          status: "completed",
          method: "Internal transfer",
          counterparty: result.user.username,
          reference: recipientReference,
          note: `Transfert reçu de ${result.user.fullName}`,
          balanceBefore: recipientBefore,
          balanceAfter: recipientAfter,
          siteReference: `IB-${randomCode(8).toUpperCase()}-${randomCode(4).toUpperCase()}`,
          recipientName: result.user.fullName,
          countryName: "Cameroun",
          currency: "XAF",
          amountDecimal: net,
          feeDecimal: 0,
          grossDecimal: net,
          balanceBeforeDecimal: recipientBefore,
          balanceAfterDecimal: recipientAfter,
          providerReference: recipientReference,
          flow: "internal_transfer",
        },
      ]).returning();
      return { transaction: records[0], balance: senderAfter };
    });
    return Response.json({ ok: true, ...outcome }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("Solde insuffisant")) return Response.json({ error: message }, { status: 400 });
    return apiError(error);
  }
}
