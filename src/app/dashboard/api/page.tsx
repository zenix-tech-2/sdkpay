"use client";

import Link from "next/link";
import { Globe, CodeXml, CircleCheck, ArrowRight } from "lucide-react";

const GOLD = "#f0a500";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 text-[19px] font-medium text-slate-900">
      <CircleCheck size={24} className="mt-0.5 shrink-0 text-[#f0a500]" fill="#fef3c7" />
      {children}
    </p>
  );
}

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Hosted checkout */}
      <div className="rounded-[26px] border border-slate-200 bg-white p-6">
        <span className="flex h-[110px] w-[130px] items-center justify-center rounded-[28px] bg-blue-50">
          <Globe size={58} className="text-blue-500" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-[26px] font-extrabold text-slate-900">Hosted Checkout</h2>
        <p className="mt-1.5 text-[18px] font-medium leading-relaxed text-slate-500">
          Redirect your customers to a ready-made SDK Pay page. No frontend code needed.
        </p>
        <div className="mt-5 space-y-3.5">
          <CheckItem>Payment links in one click</CheckItem>
          <CheckItem>Mobile Money and cards included</CheckItem>
          <CheckItem>Real-time status in your dashboard</CheckItem>
        </div>
        <Link
          href="/dashboard/links"
          className="mt-6 flex items-center justify-center gap-2 rounded-[16px] py-4 text-[20px] font-bold text-white"
          style={{ background: GOLD }}
        >
          Explore Hosted Checkout <ArrowRight size={22} />
        </Link>
      </div>

      {/* Direct API */}
      <div className="rounded-[26px] border border-slate-200 bg-white p-6">
        <span className="flex h-[110px] w-[130px] items-center justify-center rounded-[28px] bg-blue-50">
          <CodeXml size={58} className="text-[#f0a500]" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-[26px] font-extrabold text-slate-900">Direct API</h2>
        <p className="mt-1.5 text-[18px] font-medium leading-relaxed text-slate-500">
          Integrate payments directly into your application with your own screens and your own customer experience.
        </p>
        <div className="mt-5 space-y-3.5">
          <CheckItem>Full control over the payment flow</CheckItem>
          <CheckItem>Mobile Money and crypto APIs</CheckItem>
          <CheckItem>Documentation, examples and webhooks</CheckItem>
        </div>
        <Link
          href="/dashboard/api/direct"
          className="mt-6 flex items-center justify-center gap-2 rounded-[16px] py-4 text-[20px] font-bold text-white"
          style={{ background: GOLD }}
        >
          Explore Direct API <ArrowRight size={22} />
        </Link>
      </div>

      {/* help */}
      <div className="flex gap-3.5 rounded-[26px] border border-slate-200 bg-white p-6">
        <Globe size={30} className="shrink-0 text-slate-500" strokeWidth={1.8} />
        <p className="text-[18px] font-medium leading-relaxed text-slate-500">
          Need help choosing? Hosted Checkout is recommended when you want to redirect customers quickly.
          Direct API is best for teams that want to customize every step.
        </p>
      </div>

      <Link
        href="/docs"
        className="block rounded-[20px] border border-slate-200 bg-white py-3.5 text-center text-[15px] font-extrabold text-slate-700"
      >
        Full API documentation
      </Link>
    </div>
  );
}
