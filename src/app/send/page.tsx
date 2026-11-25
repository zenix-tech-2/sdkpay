import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { getAccounts } from "@/lib/data";
import SendFlow, { type SendWallet } from "@/components/send-flow";

export default async function SendPage() {
  const user = await requireUser();
  const accounts = await getAccounts(user.id);
  const wallets: SendWallet[] = accounts.map((a) => ({
    currency: a.currency,
    balance: Number(a.balance),
    countryCode: a.countryCode,
    country: a.country,
  }));

  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Send money</h1>
      <p className="text-[13px] text-slate-500">Instant transfer or via Mobile Money</p>
      <div className="mt-4">
        <SendFlow wallets={wallets} />
      </div>
    </Gate>
  );
}
