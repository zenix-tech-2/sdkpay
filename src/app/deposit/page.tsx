import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { getAccounts } from "@/lib/data";
import { getFees } from "@/lib/settings";
import DepositFlow from "@/components/deposit-flow";

export default async function DepositPage() {
  const user = await requireUser();
  const accounts = await getAccounts(user.id);
  const fees = await getFees();
  const xaf = accounts.find((a) => a.isPrimary) ?? accounts[0];
  const usdt = accounts.find((a) => a.currency === "USDT");

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Top up my account</h1>
      <div className="mt-4">
        <DepositFlow xafBalance={xaf ? Number(xaf.balance) : 0} usdtBalance={usdt ? Number(usdt.balance) : 0} fees={fees} />
      </div>
    </Gate>
  );
}
