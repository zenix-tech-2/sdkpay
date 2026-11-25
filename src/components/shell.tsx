"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight, Wallet, ShieldCheck, LifeBuoy, Code2, Settings, Receipt,
  LogOut, Languages, Bell, Headset,
} from "lucide-react";
import { logout } from "@/lib/actions";
import type { PublicUser } from "@/lib/session";

/* ---------- live clock for the native status bar ---------- */
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function NativeStatusBar() {
  const now = useClock();
  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "1:07 AM";
  return (
    <div className="relative z-20 flex h-9 shrink-0 select-none items-center justify-between bg-[#FFBD0D] pl-4 pr-3 text-black">
      <span className="text-[12.5px] font-extrabold tracking-tight">{time}</span>
      <span className="absolute left-1/2 top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" aria-hidden />
      <div className="flex items-center gap-1.5">
        {/* moon (DND) */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
        {/* signal bars */}
        <svg width="15" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="5" rx="0.8" /><rect x="4.3" y="5" width="3" height="7" rx="0.8" />
          <rect x="8.6" y="2.6" width="3" height="9.4" rx="0.8" /><rect x="12.9" y="0" width="3" height="12" rx="0.8" opacity="0.35" />
        </svg>
        <span className="text-[9px] font-black leading-none">4G<br /><span className="text-[7px] font-bold">LTE</span></span>
        {/* battery */}
        <svg width="22" height="12" viewBox="0 0 26 13" fill="none" aria-hidden>
          <rect x="0.8" y="0.8" width="20" height="11.4" rx="3" stroke="currentColor" strokeWidth="1.4" />
          <rect x="3" y="3" width="12.4" height="7" rx="1.5" fill="currentColor" />
          <rect x="22.8" y="4" width="2.4" height="5" rx="1" fill="currentColor" />
        </svg>
        <span className="text-[11px] font-extrabold">80</span>
      </div>
    </div>
  );
}

/* black native-style app icon with SDK glyph */
const AppIcon = ({ className = "" }: { className?: string }) => (
  <span className={`flex items-center justify-center rounded-[10px] bg-black ${className}`} aria-hidden>
    <svg viewBox="0 0 24 24" fill="none" width="60%" height="60%">
      <path d="M6.5 6h9a1.5 1.5 0 0 1 0 3h-9a1.5 1.5 0 0 1 0-3Z" fill="#fff" />
      <path d="M6.5 11.3h11a1.5 1.5 0 0 1 0 3h-11a1.5 1.5 0 0 1 0-3Z" fill="#fff" opacity="0.92" />
      <path d="M6.5 16.6h7a1.5 1.5 0 0 1 0 3h-7a1.5 1.5 0 0 1 0-3Z" fill="#FFBD0D" />
    </svg>
  </span>
);

function MenuItems({ active, unread, kycStatus }: { active: string; unread: number; kycStatus: string }) {
  const img = (src: string) => () => <img src={src} alt="" className="h-11 w-11 object-contain" />;
  type Item = { href: string; label: string; icon?: React.ElementType; img?: string; tint?: string; badge?: React.ReactNode };
  const main: Item[] = [
    { href: "/dashboard", label: "Dashboard", img: "/icons3d/chart.svg" },
    { href: "/links", label: "My links", img: "/icons3d/link.svg" },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, tint: "bg-gold/50 text-amber-700" },
    { href: "/deposit", label: "Deposit", img: "/icons3d/deposit.svg" },
    { href: "/withdraw", label: "Withdraw", img: "/icons3d/withdraw.svg" },
    { href: "/send", label: "Send", img: "/icons3d/send.svg" },
    { href: "/accounts", label: "Accounts", img: "/icons3d/wallet.svg" },
    { href: "/referrals", label: "Referrals & earnings", img: "/icons3d/receipt.svg" },
  ];
  const support: Item[] = [
    { href: "/kyc", label: "KYC", img: "/icons3d/shield.svg" },
    { href: "/support", label: "Support", icon: LifeBuoy, tint: "bg-blue-100 text-blue-600" },
    { href: "/api", label: "API", icon: Code2, tint: "bg-violet-100 text-violet-600" },
    { href: "/settings", label: "Settings", icon: Settings, tint: "bg-slate-200 text-slate-600" },
    { href: "/fees", label: "Fees", icon: Receipt, tint: "bg-yellow-100 text-yellow-700" },
  ];

  const render = (item: Item) => {
    const isActive = active === item.href || active.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3.5 rounded-2xl px-2 py-1.5 transition-colors ${isActive ? "bg-[#E4E7EE]" : "active:bg-black/5"}`}
      >
        {item.img ? (
          <img src={item.img} alt="" className="h-11 w-11 object-contain" width={44} height={44} />
        ) : (
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tint}`}>{Icon && <Icon size={22} strokeWidth={2} />}</span>
        )}
        <span className="flex-1 text-[16.5px] font-bold tracking-[-0.01em] text-[#101318]">{item.label}</span>
        {item.href === "/kyc" && (
          kycStatus === "verified"
            ? <span className="rounded-lg bg-[#22c55e] px-2.5 py-1 text-[11.5px] font-extrabold text-white">Verified</span>
            : kycStatus === "pending"
              ? <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-[11.5px] font-extrabold text-white">In review</span>
              : <span className="rounded-lg bg-red-500 px-2.5 py-1 text-[11.5px] font-extrabold text-white">Verify</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <p className="px-3 pb-1.5 pt-4 text-[10.5px] font-extrabold tracking-[0.22em] text-[#8A8F9E]">MAIN MENU</p>
      <nav className="flex flex-col">{main.map(render)}</nav>
      <p className="px-3 pb-1.5 pt-5 text-[10.5px] font-extrabold tracking-[0.22em] text-[#8A8F9E]">SETTINGS &amp; SUPPORT</p>
      <nav className="flex flex-col">{support.map(render)}</nav>
      {unread > 0 && (
        <Link href="/notifications" className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">
          <Bell size={15} /> {unread} unread notification{unread > 1 ? "s" : ""}
        </Link>
      )}
    </>
  );
}

function Drawer({ user, balance, unread, onClose }: { user: PublicUser; balance: string; unread: number; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <div className="absolute inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative flex h-full w-[292px] max-w-[86%] flex-col bg-[#F2F3F6] shadow-2xl">
        {/* brand row — logo left, app icon right (native drawer pattern) */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="SDK Pay" className="h-8 w-auto" />
            <span className="leading-none">
              <span className="block text-[17px] font-black tracking-tight text-[#0E1A38]">SDK{" "}<span className="text-[#2E6BEB]">Pay</span></span>
              <span className="mt-0.5 block text-[6.5px] font-bold uppercase tracking-[0.22em] text-slate-400">Integrate · Pay · Grow</span>
            </span>
          </Link>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-[#101318] active:bg-black/5"><AppIcon className="h-9 w-9" /></button>
        </div>

        <div className="slim-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-3">
          {/* balance card */}
          <div className="mt-4 shrink-0 rounded-2xl bg-gradient-to-br from-[#2A2766] via-[#232054] to-[#1C1A4D] p-4 text-white">
            <p className="text-[13px] font-medium text-white/80">Available balance</p>
            <p className="mt-1 text-[26px] font-extrabold tracking-tight">{balance}</p>
          </div>

          <MenuItems active={pathname ?? "/dashboard"} unread={unread} kycStatus={user.kycStatus} />
          {user.role === "admin" && (
            <Link href="/admin" className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-[13px] font-extrabold text-violet-700">
              <ShieldCheck size={17} /> Admin console
            </Link>
          )}
        </div>

        {/* user footer */}
        <div className="shrink-0 border-t border-black/5 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="" className="h-12 w-12 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15.5px] font-extrabold text-[#101318]">{user.fullName}</p>
              <p className="truncate text-[13px] text-[#6B7280]">{user.email}</p>
            </div>
          </div>
          <form action={logout} className="mt-2.5">
            <button type="submit" className="flex items-center gap-3.5 py-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6DEDE] text-[#E5484D]"><LogOut size={20} /></span>
              <span className="text-[16px] font-bold text-[#E5484D]">Log out</span>
            </button>
          </form>
        </div>
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
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-black shadow-sm transition active:scale-95"
      >
        <Languages size={22} strokeWidth={1.9} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-black/5 bg-white py-1.5 shadow-2xl">
          {([{ code: "FR", label: "Français" }, { code: "EN", label: "English" }] as const).map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] transition ${lang === l.code ? "bg-[#FEF9E0] font-bold text-[#D9A400]" : "text-[#101318]"}`}
            >
              <Languages size={18} className="text-slate-400" />
              <span className="flex-1">{l.label}</span>
              {lang === l.code && <span className="h-2.5 w-2.5 rounded-full bg-[#F6C21A]" />}
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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0A0F2C]">
      {/* ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60rem 40rem at 12% 15%, rgba(46,107,235,0.22), transparent 55%), radial-gradient(55rem 40rem at 88% 85%, rgba(138,43,224,0.22), transparent 55%), radial-gradient(30rem 30rem at 70% 10%, rgba(255,189,13,0.08), transparent 60%)" }} />
      {/* giant watermark */}
      <span aria-hidden className="pointer-events-none absolute -left-6 bottom-6 hidden select-none text-[11rem] font-black leading-none text-white/[0.04] lg:block">SDK</span>
      <span aria-hidden className="pointer-events-none absolute -right-6 top-6 hidden select-none text-[11rem] font-black leading-none text-white/[0.04] lg:block">PAY</span>

      {/* desktop side captions */}
      <div className="pointer-events-none absolute left-10 top-1/2 z-0 hidden max-w-[240px] -translate-y-1/2 select-none xl:block">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]">Integrate · Pay · Grow</p>
        <p className="mt-4 text-[34px] font-black leading-[1.15] text-white/90">The native way to run payments.</p>
        <p className="mt-3 text-[13px] leading-relaxed text-white/45">Every screen, exactly as on the handset — status bar, drawer, haptics-fast navigation and 3D iconography.</p>
      </div>
      <div className="pointer-events-none absolute right-10 top-1/2 z-0 hidden max-w-[220px] -translate-y-1/2 select-none text-right xl:block">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/35">Native preview</p>
        <ul className="mt-4 space-y-3 text-[12.5px] font-semibold text-white/55">
          <li>Live Android status bar</li>
          <li>Drawer navigation</li>
          <li>Pixel-true spacing</li>
        </ul>
      </div>

      {/* ============ DEVICE FRAME ============ */}
      <div className="relative z-10 flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#F4F5F7] sm:my-4 sm:h-[min(908px,96vh)] sm:rounded-[46px] sm:shadow-[0_60px_140px_-30px_rgba(0,0,0,0.85),0_0_0_11px_#141a33,0_0_0_12px_rgba(255,255,255,0.09)]">
        <NativeStatusBar />

        {/* app bar */}
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white pl-4 pr-3">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="active:scale-95 transition-transform"><AppIcon className="h-9 w-9" /></button>
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <Link href="/notifications" aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-xl transition active:scale-95">
              {unread > 0 && <span className="absolute inset-0 m-auto h-11 w-11 rounded-full bg-[#FDE7E9]" />}
              <Bell size={23} strokeWidth={2.1} className="relative text-black" fill="currentColor" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-[#E5484D] px-1 text-[10.5px] font-black text-white ring-2 ring-white">{unread}</span>
              )}
            </Link>
            <Link href="/settings" aria-label="Profile" className="relative active:scale-95 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot.png" alt="" className="h-11 w-11 rounded-full object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#2F9DF0]">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            </Link>
          </div>
        </header>

        {/* content */}
        <main className="slim-scroll relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>

        {/* drawer */}
        {drawer && <Drawer user={user} balance={balance} unread={unread} onClose={() => setDrawer(false)} />}

        {/* floating support — native FAB */}
        <Link href="/support" aria-label="Support" className="absolute bottom-5 right-4 z-30 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#FFBD0D] shadow-[0_10px_30px_rgba(255,189,13,0.45)] ring-4 ring-white transition active:scale-95">
          <span className="flex h-[60%] w-[60%] items-center justify-center rounded-full bg-[#0A0F2C]">
            <Headset size={26} className="text-[#FFBD0D]" strokeWidth={2.2} />
          </span>
        </Link>
      </div>

      <p className="pointer-events-none absolute bottom-2.5 left-1/2 z-0 hidden -translate-x-1/2 text-[10.5px] font-semibold uppercase tracking-[0.35em] text-white/30 md:block">SDK Pay</p>
    </div>
  );
}
