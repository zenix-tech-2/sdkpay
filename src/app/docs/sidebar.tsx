"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const DOC_GROUPS: { label: string; items: { id: string; label: string }[] }[] = [
  {
    label: "Getting started",
    items: [
      { id: "welcome", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
      { id: "authentication", label: "Authentication" },
      { id: "environments", label: "Environments & keys" },
    ],
  },
  {
    label: "Choosing a rail",
    items: [
      { id: "hosted-checkout", label: "Hosted Checkout (redirect)" },
      { id: "direct-api", label: "Direct API overview" },
      { id: "collect", label: "Mobile Money collect" },
      { id: "flows", label: "Payment flows" },
      { id: "crypto", label: "Crypto (USDT)" },
      { id: "payouts", label: "Payouts" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "webhooks", label: "Webhooks" },
      { id: "idempotency", label: "Idempotency" },
      { id: "rate-limits", label: "Rate limits" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "countries", label: "GET /v1/countries" },
      { id: "fees-ref", label: "GET /v1/fees" },
      { id: "errors", label: "Errors & HTTP statuses" },
      { id: "sandbox", label: "Sandbox & test numbers" },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: "reliability", label: "Reliability & failover" },
      { id: "security", label: "Security" },
      { id: "ai", label: "For AI assistants" },
    ],
  },
];

export default function DocsSidebar() {
  const [active, setActive] = useState<string>("welcome");

  useEffect(() => {
    const ids = DOC_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (
    <nav className="space-y-5">
      {DOC_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[9.5px] font-extrabold uppercase tracking-[0.25em] text-slate-400">{group.label}</p>
          <ul className="mt-1.5 space-y-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
                    active === item.id ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:bg-slate-100 hover:text-[#141B3D]"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* mobile — collapsible */}
      <details className="mb-6 rounded-2xl border border-slate-200 bg-white lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-[14px] font-extrabold text-[#141B3D]">On this page <ChevronDown size={17} /></summary>
        <div className="border-t border-slate-100 p-4">{nav}</div>
      </details>
      {/* desktop — sticky sidebar */}
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto slim-scroll lg:block">
        {nav}
        <Link href="/dashboard" className="mt-6 block rounded-xl border border-slate-200 px-3 py-2.5 text-center text-[11.5px] font-extrabold text-slate-500 transition hover:border-amber-300 hover:text-amber-700">← Back to the app</Link>
      </aside>
    </>
  );
}
