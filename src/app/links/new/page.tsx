import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Gate from "@/components/gate";
import Wizard from "./wizard";
import { getFlags } from "@/lib/settings";

export default async function NewLinkPage() {
  const flags = await getFlags();
  return (
    <Gate>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2.5">
          <Link href="/links" aria-label="Back to my links" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <ChevronLeft size={26} />
          </Link>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">New payment link</h1>
        </div>
        <div className="mt-4">
          {flags.links ? <Wizard /> : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-[13px] font-semibold text-amber-800">Payment links are temporarily disabled by SDK Pay. Please check back soon.</div>
          )}
        </div>
      </div>
    </Gate>
  );
}
