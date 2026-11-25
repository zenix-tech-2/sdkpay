"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Link2, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Send,
  Wallet, Coins, ShieldCheck, LifeBuoy, Code2, Settings, Receipt, LogOut, Menu,
  X, Languages, Bell, Headset, Search, ChevronDown, Check,
} from "lucide-react";
import { logout } from "@/lib/actions";
import type { PublicUser } from "@/lib/session";

type NavItem = { href: string; label: string; icon: React.ElementType; tile: string; badge?: React.ReactNode };

function MenuItems({ active, unread, kycStatus }: { active: string; unread: number; kycStatus: string }) {
  const main: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tile: "bg-sky-50 text-sky-600" },
    { href: "/links", label: "My links", icon: Link2, tile: "bg-violet-50 text-violet-600" },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, tile: "bg-amber-50 text-amber-600" },
    { href: "/deposit", label: "Deposit", icon: ArrowDownToLine, tile: "bg-emerald-50 text-emerald-600" },
    { href: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine, tile: "bg-orange-50 text-orange-600" },
    { href: "/send", label: "Send", icon: Send, tile: "bg-rose-50 text-rose-600" },
    { href: "/accounts", label: "Accounts", icon: Wallet, tile: "bg-cyan-50 text-cyan-600" },
    { href: "/referrals", label: "Referrals & earnings", icon: Coins, tile: "bg-lime-50 text-lime-700" },
  ];
  const support: NavItem[] = [
    { href: "/kyc", label: "KYC", icon: ShieldCheck, tile: "bg-slate-100 text-slate-600" },
    { href: "/support", label: "Support", icon: LifeBuoy, tile: "bg-blue-50 text-blue-600" },
    { href: "/api", label: "API", icon: Code2, tile: "bg-indigo-50 text-indigo-600" },
    { href: "/settings", label: "Settings", icon: Settings, tile: "bg-slate-100 text-slate-600" },
    { href: "/fees", label: "Fees", icon: Receipt, tile: "bg-yellow-50 text-yellow-700" },
  ];

  const render = (item: NavItem) => {
    const isActive = active === item.href || active.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-3 rounded-xl px-2 py-[7px] transition-colors ${
          isActive ? "bg-[#eceef6]" : "hover:bg-slate-50"
        }`}
      >
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tile} transition-transform group-hover:scale-105`}>
          <Icon size={21} strokeWidth={2.1} />
        </span>
        <span className={`flex-1 text-[15px] font-semibold ${isActive ? "text-navy2" : "text-slate-700"}`}>{item.label}</span>
        {item.href === "/kyc" && (
          kycStatus === "verified"
            ? <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">Verified</span>
            : kycStatus === "pending"
              ? <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">In review</span>
              : <span className="rounded-md bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">Verify</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <p className="px-2 pb-1.5 pt-4 text-[10.5px] font-extrabold tracking-[0.22em] text-slate-400">MAIN MENU</p>
      <nav className="flex flex-col gap-0.5">{main.map(render)}</nav>
      <p className="px-2 pb-1.5 pt-5 text-[10.5px] font-extrabold tracking-[0.22em] text-slate-400">SETTINGS &amp; SUPPORT</p>
      <nav className="flex flex-col gap-0.5">{support.map(render)}</nav>
      {unread > 0 && (
        <Link href="/notifications" className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800 transition hover:bg-amber-100">
          <Bell size={14} /> {unread} unread notification{unread > 1 ? "s" : ""}
        </Link>
      )}
    </>
  );
}

function SidebarContent({ user, balance, unread, onClose }: { user: PublicUser; balance: string; unread: number; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-white">
      {/* brand */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="SDK Pay" className="h-10 w-auto" />
          <span className="leading-none">
            <span className="block text-[21px] font-black tracking-tight text-[#0E1A38]">
              SDK{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">Pay</span>
            </span>
            <span className="mt-1 block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Integrate · Pay · Grow
            </span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="slim-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* balance card */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-navy3 via-navy to-navy2 p-4 text-white shadow-lg shadow-navy/30">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />
          <p className="text-[13px] font-medium text-white/70">Available balance</p>
          <p className="mt-1.5 text-[30px] font-extrabold tracking-tight">{balance}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-medium text-white/50">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cameroun · XAF wallet
          </div>
        </div>

        <MenuItems active={pathname ?? "/dashboard"} unread={unread} kycStatus={user.kycStatus} />
        {user.role === "admin" && (
          <Link href="/admin" className="mt-2 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-[13px] font-extrabold text-violet-700 transition hover:bg-violet-100">
            <ShieldCheck size={17} /> Admin console <ChevronDown size={14} className="ml-auto -rotate-90" />
          </Link>
        )}
      </div>

      {/* user footer */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="avatar" className="h-11 w-11 rounded-full border border-amber-200 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-ink">{user.fullName}</p>
            <p className="truncate text-[12px] text-slate-500">{user.email}</p>
          </div>
        </div>
        <form action={logout} className="mt-2">
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-red-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <LogOut size={18} />
            </span>
            <span className="text-[15px] font-bold text-red-500">Log out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"FR" | "EN">("EN");
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Language"
        className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-700 shadow-sm transition hover:border-slate-300"
      >
        <Languages size={19} />
        <span className="text-[12px] font-bold">{lang}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl">
          {([
            { code: "FR", label: "Français" },
            { code: "EN", label: "English" },
          ] as const).map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[14px] font-medium transition ${
                lang === l.code ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Languages size={16} className="text-slate-400" />
              <span className="flex-1">{l.label}</span>
              {lang === l.code && <span className="h-2 w-2 rounded-full bg-gold2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppShell({
  user,
  balance,
  unread,
  children,
}: {
  user: PublicUser;
  balance: string;
  unread: number;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  return (
    <div className="min-h-screen">
      {/* brand accent line */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-sky-400 via-gold to-violet-600" />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[292px] border-r border-slate-200/70 lg:block">
        <SidebarContent user={user} balance={balance} unread={unread} />
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy2/60 backdrop-blur-[2px]" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] shadow-2xl">
            <SidebarContent user={user} balance={balance} unread={unread} onClose={() => setDrawer(false)} />
          </div>
        </div>
      )}

      {/* main column */}
      <div className="lg:pl-[292px]">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1160px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden">
              <Menu size={20} />
            </button>

            {/* search (desktop) */}
            <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 transition focus-within:border-gold focus-within:bg-white focus-within:text-slate-600 md:flex">
              <Search size={17} />
              <input placeholder="Search transactions, links, people…" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate-400" />
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">⌘K</kbd>
            </div>
            <div className="flex-1 md:hidden" />

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <LanguageMenu />
              <Link href="/notifications" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300">
                <Bell size={20} strokeWidth={2} />
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-extrabold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/settings" className="relative" aria-label="Profile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot.png" alt="You" className="h-10 w-10 rounded-full border-2 border-amber-300 object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-sky-500">
                  <Check size={9} strokeWidth={4} className="text-white" />
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* page content */}
        <main className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* floating support */}
      <Link href="/support" aria-label="Support" className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-xl shadow-gold/40 ring-4 ring-gold/20 transition hover:scale-105 hover:bg-gold2">
        <Headset size={24} className="text-navy2" strokeWidth={2.1} />
        <span className="absolute right-0 top-0 h-3.5 w-3.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
      </Link>
    </div>
  );
}
