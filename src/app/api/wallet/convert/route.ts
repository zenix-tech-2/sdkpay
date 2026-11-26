import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomRef } from "@/lib/format";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const { amount, from } = await req.json();
    const amt = Number(amount);
    if (!amt || amt < 100) return NextResponse.json({ error: "Montant minimum : 100." }, { status: 400 });
    const src = from === "XOF" ? "XOF" : "XAF";
    const dst = src === "XAF" ? "XOF" : "XAF";
    const balance = src === "XOF" ? user.balanceXof : user.balanceXaf;
    if (amt > balance) return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
    const ref = randomRef("SDK-C");
    if (src === "XAF") {
      await db.update(users).set({ balanceXaf: user.balanceXaf - amt, balanceXof: user.balanceXof + amt }).where(eq(users.id, user.id));
    } else {
      await db.update(users).set({ balanceXof: user.balanceXof - amt, balanceXaf: user.balanceXaf + amt }).where(eq(users.id, user.id));
    }
    const inserted = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "conversion",
        amount: amt,
        currency: `${src}→${dst}`,
        status: "success",
        reference: ref,
        label: `Conversion ${src} → ${dst}`,
        country: user.country,
        balanceBefore: balance,
        balanceAfter: balance - amt,
      })
      .returning({ id: transactions.id });
    await db.insert(notifications).values({
      userId: user.id,
      title: "Conversion effectuée",
      message: `${amt.toLocaleString("fr-FR")} ${src} convertis en ${dst}. Réf : ${ref}`,
    });
    return NextResponse.json({ ok: true, id: inserted[0].id, reference: ref });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
