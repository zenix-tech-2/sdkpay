"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  LayoutGrid,
  Users,
  ShieldCheck,
  KeyRound,
  ArrowLeftRight,
  Link2,
  Undo2,
  Megaphone,
  Send,
  Star,
  Headset,
  Activity,
  ScrollText,
  Smartphone,
  BookOpen,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";

const NAVY = "#10132e";
const GOLD = "#f0a500";

const MENU = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/kyc", label: "KYC approvals", icon: ShieldCheck, badge: "kyc" },
  { href: "/admin/keys", label: "API keys", icon: KeyRound },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/links", label: "Payment links", icon: Link2 },
  { href: "/admin/refunds", label: "Refunds & disputes", icon: Undo2, badge: "refunds" },
  { href: "/admin/updates", label: "Updates & media", icon: Megaphone },
  { href: "/admin/notifications", label: "Notifications", icon: Send },
  { href: "/admin/reviews", label: "Reviews", icon: Star, badge: "reviews" },
  { href: "/admin/support", label: "Support tickets", icon: Headset, badge: "tickets" },
  { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
  { href: "/admin/admins", label: "Team", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({ kyc: 0, refunds: 0, tickets: 0, reviews: 0 });

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => d.badges && setBadges(d.badges))
      .catch(() => {});
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const drawer = (
    <div className="flex h-full flex-col p-4" style={{ background: NAVY }}>
      <div className="flex items-center justify-between px-2 py-2">
        <p className="text-[13px] font-bold text-white">Admin menu</p>
        <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-1.5 text-white lg:hidden" aria-label="close">
          <X size={14} />
        </button>
      </div>
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto">
        {MENU.map((m) => {
          const active = isActive(m.href);
          const count = m.badge ? badges[m.badge as keyof typeof badges] : 0;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition"
              style={active ? { background: GOLD, color: NAVY } : { color: "#aab0c5" }}
            >
              <m.icon size={17} />
              {m.label}
              {!!count && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
        <div className="my-3 border-t border-white/10" />
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[#aab0c5] hover:bg-white/5">
          <Smartphone size={17} /> Merchant app
        </Link>
        <Link href="/docs" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[#aab0c5] hover:bg-white/5">
          <BookOpen size={17} /> Docs
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold text-rose-300 hover:bg-white/5">
          <LogOut size={17} /> Log out
        </button>
      </nav>
      <p className="truncate px-3.5 pb-1 pt-3 text-[10.5px] font-medium text-slate-500">
        {admin.email} · {admin.role}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#edf0f7" }}>
      {/* topbar */}
      <header className="sticky top-0 z-40 flex h-[46px] items-center gap-3 px-4" style={{ background: NAVY }}>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-white/10 p-1.5 text-white lg:hidden" aria-label="menu">
          <Menu size={18} />
        </button>
        <p className="mx-auto text-[13px] font-extrabold text-white lg:mx-0">SDK Pay Admin</p>
        <Link href="/admin/support" className="relative rounded-lg bg-white/10 p-1.5 text-white" aria-label="tickets">
          <Bell size={16} />
          {!!badges.tickets && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
              {badges.tickets > 9 ? "9+" : badges.tickets}
            </span>
          )}
        </Link>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-60 shrink-0 lg:block">{drawer}</aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute bottom-0 left-0 top-0 w-[80%] max-w-[300px]">{drawer}</div>
          </div>
        )}
        <main key={pathname} className="page-enter min-w-0 flex-1 px-4 py-5 pb-16 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
