"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, LogOut, ArrowLeft } from "lucide-react";
import { logout } from "@/lib/actions";

export default function AdminNav({ pendingCount, email }: { pendingCount: number; email: string }) {
  const pathname = usePathname();
  const items: { href: string; label: string; icon: React.ElementType; badge?: number }[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/kyc", label: "KYC reviews", icon: ShieldCheck, badge: pendingCount },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-slate-200/70 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="SDK Pay" className="h-9 w-auto" />
            <span className="leading-none">
              <span className="block text-[18px] font-black tracking-tight text-[#0E1A38]">SDK <span className="text-violet-600">Admin</span></span>
              <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">Compliance console</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-2 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-slate-400">Console</p>
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`mt-0.5 flex items-center gap-3 rounded-xl px-2 py-2.5 transition ${active ? "bg-[#eceef6]" : "hover:bg-slate-50"}`}>
                <Icon size={20} className={active ? "text-navy3" : "text-slate-500"} strokeWidth={2} />
                <span className={`flex-1 text-[14px] font-semibold ${active ? "text-navy2" : "text-slate-700"}`}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10.5px] font-extrabold text-white">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="px-2 text-[10.5px] uppercase tracking-widest text-slate-400">Signed in as</p>
          <p className="mt-0.5 truncate px-2 text-[12px] font-bold text-slate-600">{email}</p>
          <Link href="/dashboard" className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"><ArrowLeft size={16} /> Back to app</Link>
          <form action={logout}><button type="submit" className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-[13px] font-bold text-red-500 transition hover:bg-red-50"><LogOut size={16} /> Log out</button></form>
        </div>
      </div>
    </aside>
  );
}
