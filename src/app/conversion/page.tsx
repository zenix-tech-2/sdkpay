import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { getAccounts } from "@/lib/data";
import { db } from "@/db";
import { conversionRules } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ConversionManager from "@/components/conversion-manager";

export default async function ConversionPage() {
  const user = await requireUser();
  const [accounts, rules] = await Promise.all([
    getAccounts(user.id),
    db.select().from(conversionRules).where(eq(conversionRules.userId, user.id)).orderBy(desc(conversionRules.createdAt)),
  ]);

  return (
    <Gate>
      <div className="flex items-center gap-2.5">
        <Link href="/accounts" aria-label="Back to accounts" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]"><Zap size={24} className="text-gold2" fill="currentColor" /> Automatic conversion</h1>
          <p className="text-[12.5px] text-slate-500">Route incoming foreign funds into your primary wallet automatically.</p>
        </div>
      </div>

      <div className="mt-4 max-w-2xl">
        <ConversionManager
          rules={rules.map((r) => ({ id: r.id, sources: r.sources, destination: r.destination, active: r.active }))}
          wallets={accounts.map((a) => ({ currency: a.currency, country: a.country }))}
        />
      </div>
    </Gate>
  );
}
