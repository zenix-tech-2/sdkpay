import type { Metadata } from "next";
import Link from "next/link";
import DocsSidebar from "./sidebar";

export const metadata: Metadata = {
  title: "SDK Pay Docs — Direct API, webhooks & integration",
  description: "Complete developer documentation for SDK Pay: authentication, Mobile Money collect, payment flows, crypto, payouts, webhooks, fees, sandbox — plus machine-readable llms.txt for AI assistants.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBFBF9]">
      {/* docs top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#FBFBF9]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.svg" alt="SDK Pay" className="h-7 w-auto" />
              <span className="text-[16px] font-black tracking-tight text-[#141B3D]">SDK <span className="text-[#2E6BEB]">Pay</span></span>
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden truncate text-[13px] font-extrabold text-slate-500 sm:inline">Developers <span className="text-slate-300">·</span> Documentation</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-emerald-600 md:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> All systems operational</span>
            <Link href="/login" className="flex h-9 items-center rounded-xl bg-[#141B3D] px-4 text-[12px] font-extrabold text-[#FFBD0D] transition hover:bg-[#1D2450]">Open the app</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <DocsSidebar />
        <article className="min-w-0 max-w-4xl flex-1">{children}</article>
      </div>
    </div>
  );
}
