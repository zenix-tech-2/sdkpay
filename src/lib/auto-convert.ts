import { db } from "@/db";
import { users, transactions, conversionRules, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomRef } from "@/lib/format";
import { settlementOf } from "@/lib/wallets";
import { USDT_UNIT } from "@/lib/crypto";

const USDT_RATE = 600; // 1 USDT = 600 FCFA (demo rate)

/**
 * Automatic conversion engine. Runs after every wallet credit: for each active
 * rule, source families holding >= threshold (in FCFA equivalent) are fully
 * converted into the destination family.
 */
export async function runAutoConversion(userId: string) {
  const rules = await db
    .select()
    .from(conversionRules)
    .where(and(eq(conversionRules.userId, userId), eq(conversionRules.isActive, true)));
  if (!rules.length) return;

  const urows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!urows.length) return;
  const user = urows[0];
  const balances = { XAF: user.balanceXaf, XOF: user.balanceXof, USDT: user.balanceUsdt };

  for (const rule of rules) {
    const dest = rule.destination as "XAF" | "XOF" | "USDT";
    const sources = rule.sources.split(",").map((s) => s.trim()).filter(Boolean);
    const families = [...new Set(sources.map(settlementOf))].filter((f) => f !== dest);

    for (const fam of families) {
      const bal = balances[fam as keyof typeof balances];
      if (!bal || bal <= 0) continue;
      const equiv = fam === "USDT" ? (bal / USDT_UNIT) * USDT_RATE : bal;
      if (equiv < rule.threshold) continue;

      // compute converted amount
      let credited: number;
      if (fam === "USDT") credited = Math.round((bal / USDT_UNIT) * USDT_RATE);
      else if (dest === "USDT") credited = Math.round((bal / USDT_RATE) * USDT_UNIT);
      else credited = bal;
      if (credited <= 0) continue;

      const ref = randomRef("SDK-C");
      await db.insert(transactions).values({
        userId,
        type: "conversion",
        amount: fam === "USDT" ? bal : bal,
        currency: `${fam}→${dest}`,
        status: "success",
        reference: ref,
        label: `Auto-conversion ${fam} → ${dest} (${credited.toLocaleString("fr-FR")})`,
        country: user.country,
        balanceBefore: bal,
        balanceAfter: 0,
      });

      if (fam === "XAF") await db.update(users).set({ balanceXaf: 0 }).where(eq(users.id, userId));
      if (fam === "XOF") await db.update(users).set({ balanceXof: 0 }).where(eq(users.id, userId));
      if (fam === "USDT") await db.update(users).set({ balanceUsdt: 0 }).where(eq(users.id, userId));
      if (dest === "XAF") await db.update(users).set({ balanceXaf: balances.XAF + credited }).where(eq(users.id, userId));
      if (dest === "XOF") await db.update(users).set({ balanceXof: balances.XOF + credited }).where(eq(users.id, userId));
      if (dest === "USDT") await db.update(users).set({ balanceUsdt: balances.USDT + credited }).where(eq(users.id, userId));

      // refresh local snapshot for subsequent rules
      const fresh = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (fresh.length) {
        balances.XAF = fresh[0].balanceXaf;
        balances.XOF = fresh[0].balanceXof;
        balances.USDT = fresh[0].balanceUsdt;
      }

      await db.insert(notifications).values({
        userId,
        title: "Automatic conversion",
        message: `${fam === "USDT" ? (bal / USDT_UNIT).toFixed(2) + " USDT" : bal.toLocaleString("fr-FR") + " " + fam} auto-converted to ${dest}. Réf : ${ref}`,
      });
    }
  }
}
