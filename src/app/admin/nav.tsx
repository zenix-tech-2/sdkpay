"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShieldCheck, Users, ArrowLeftRight, Link2, Receipt, Wrench,
  Megaphone, Sparkles, LogOut, ArrowLeft, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/actions";

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: number };

export default function AdminNav({ pendingCount, email, suspendedCount }: { pendingCount: number; email: string; suspendedCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const isAdminDeployment = process.env.NEXT_PUBLIC_APP_ROLE === "admin";

  const sections: { label: string; items: NavItem[] }[] = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
    { label: "Compliance", items: [{ href: "/admin/kyc", label: "KYC reviews", icon: ShieldCheck, badge: pendingCount }] },
    { label: "User control", items: [{ href: "/admin/users", label: "All users", icon: Users, badge: suspendedCount || undefined }] },
    { label: "Finance", items: [
      { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/admin/links", label: "Payment links", icon: Link2 },
      { href: "/admin/fees", label: "Fees & limits", icon: Receipt },
    ] },
    { label: "App control", items: [
      { href: "/admin/control", label: "Maintenance & flags", icon: Wrench },
      { href: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
      { href: "/admin/updates", label: "Release notes", icon: Sparkles },
    ] },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-[#141B3D] bg-[#0E1434] text-white lg:flex lg:flex-col">
      {/* brand */}
      <div className="border-b border-white/5 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="SDK Pay" className="h-9 w-auto brightness-0 invert" />
          <span className="leading-none">
            <span className="block text-[17px] font-black tracking-tight text-white">SDK <span className="text-[#FFBD0D]">Admin</span></span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.25em] text-white/35">Control plane</span>
          </span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <p className="truncate text-[11px] font-semibold text-white/45">{email}</p>
        </div>
        {isAdminDeployment && (
          <span className="mt-2 inline-flex items-center rounded-md bg-[#FFBD0D] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#232054]">Admin deployment</span>
        )}
      </div>

      {/* nav */}
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between px-5 pt-4 text-[9.5px] font-extrabold uppercase tracking-[0.28em] text-white/30">
        Navigation <ChevronDown size={13} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      <nav className={`flex-1 overflow-y-auto px-3 pb-3 transition-all ${open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        {sections.map((section) => (
          <div key={section.label} className="mt-3">
            <p className="px-2 text-[9px] font-extrabold uppercase tracking-[0.25em] text-white/25">{section.label}</p>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                      active ? "bg-[#FFBD0D] text-[#232054] shadow-[0_6px_18px_rgba(255,189,13,0.25)]" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2.1} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9.5px] font-black ${active ? "bg-[#232054] text-[#FFBD0D]" : "bg-red-500 text-white"}`}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className="border-t border-white/5 p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold text-white/55 transition hover:bg-white/5 hover:text-white">
          <ArrowLeft size={15} /> Back to customer app
        </Link>
        <form action={logout}>
          <button type="submit" className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold text-red-400 transition hover:bg-red-500/10">
            <LogOut size={15} /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
