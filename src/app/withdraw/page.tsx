import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { getFees } from "@/lib/settings";
import { getAccounts } from "@/lib/data";
import { db } from "@/db";
import { payoutMethods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import WithdrawFlow from "@/components/withdraw-flow";

export default async function WithdrawPage() {
  const user = await requireUser();
  const [accounts, methods] = await Promise.all([
    getAccounts(user.id),
    db.select().from(payoutMethods).where(eq(payoutMethods.userId, user.id)).orderBy(desc(payoutMethods.createdAt)),
  ]);
  const fees = await getFees();
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
  const usdt = accounts.find((a) => a.currency === "USDT");

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Withdraw</h1>
      <div className="mt-4">
        <WithdrawFlow
          xafBalance={primary ? Number(primary.balance) : 0}
          usdtBalance={usdt ? Number(usdt.balance) : 0}
          methods={methods.map((m) => ({ id: m.id, operator: m.operator, phone: m.phone, label: m.label }))}
          fees={fees}
        />
      </div>
    </Gate>
  );
}
