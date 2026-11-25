import { requireUser, publicUser } from "@/lib/session";
import { getPrimaryAccount, getUnreadCount } from "@/lib/data";
import AppShell from "@/components/shell";

export default async function Gate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [primary, unread] = await Promise.all([
    getPrimaryAccount(user.id),
    getUnreadCount(user.id),
  ]);
  const bal = primary ? Number(primary.balance) : 0;
  const balance = `${bal.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} FCFA`;
  return (
    <AppShell user={publicUser(user)} balance={balance} unread={unread}>
      {children}
    </AppShell>
  );
}
