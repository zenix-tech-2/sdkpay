import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Gate from "@/components/gate";
import Wizard from "./wizard";

export default function NewLinkPage() {
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
          <Wizard />
        </div>
      </div>
    </Gate>
  );
}
