"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, ArrowLeftRight, BarChart3, Bell, ChevronRight, Download, FileText,
  Headset, Inbox, KeyRound, LayoutDashboard, Link2, LogOut, Megaphone, Menu,
  Package, Percent, RotateCcw, Route, Settings, ShieldCheck, Smartphone, Star,
  ToggleLeft, UserCog, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { label: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ] },
  { label: "Client app", items: [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/client-users", label: "Merchant accounts", icon: UserCog },
    { href: "/admin/kyc", label: "KYC approvals", icon: ShieldCheck },
    { href: "/admin/client-kyc", label: "KYC submissions", icon: FileText },
    { href: "/admin/wallets", label: "Wallets & balances", icon: Wallet },
    { href: "/admin/api-keys", label: "API keys", icon: KeyRound },
  ] },
  { label: "Payments", items: [
    { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/admin/client-transactions", label: "Ledger", icon: BarChart3 },
    { href: "/admin/payment-links", label: "Payment links", icon: Link2 },
    { href: "/admin/refunds", label: "Refunds & disputes", icon: RotateCcw },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Download },
    { href: "/admin/providers", label: "Provider routing", icon: Route },
    { href: "/admin/fees", label: "Fee rules", icon: Percent },
  ] },
  { label: "Operations", items: [
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/client-notifications", label: "Merchant alerts", icon: Inbox },
    { href: "/admin/support", label: "Support tickets", icon: Headset },
    { href: "/admin/support-inbox", label: "Support inbox", icon: Inbox },
    { href: "/admin/updates", label: "Updates & media", icon: Megaphone },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/catalog", label: "Catalog & requests", icon: Package },
  ] },
  { label: "Platform", items: [
    { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
    { href: "/admin/audit", label: "Audit log", icon: FileText },
    { href: "/admin/feature-flags", label: "Feature flags", icon: ToggleLeft },
    { href: "/admin/team", label: "Team & roles", icon: UserCog },
    { href: "/admin/merchant-app", label: "Merchant app", icon: Smartphone },
    { href: "/admin/docs", label: "Docs", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ pathname, close, onLogout, supportBadge, sessionEmail, clientUrl, adminOnly }: {
  pathname: string; close: () => void; onLogout: () => void; supportBadge: number;
  sessionEmail: string; clientUrl: string; adminOnly: boolean;
}) {
  return (
    <div className="admin-scroll px-3 py-5">
      <div className="mb-5 flex items-center justify-between px-2"><div><p className="text-[13px] font-extrabold text-white">SDK Pay Admin</p><p className="text-[10px] text-[#8fa0cb]">Operations console</p></div><button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 lg:hidden"><X size={16} /></button></div>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="mb-2 px-2 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#7486b3]">{group.label}</p>
          <nav className="space-y-1">{group.items.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={close} className={`admin-sidebar-item ${isActive(pathname, item.href) ? "active" : ""}`}><Icon size={15} /><span className="flex-1">{item.label}</span>{item.label === "Support tickets" && supportBadge > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4d63] px-1 text-[10px] font-extrabold text-white">{supportBadge}</span>}{isActive(pathname, item.href) && <ChevronRight size={14} />}</Link>; })}</nav>
        </div>
      ))}
      <div className="my-4 h-px bg-white/10" />
      <a href={clientUrl} target={clientUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="admin-sidebar-item"><Smartphone size={15} /><span>Open merchant app</span></a>
      <button onClick={onLogout} className="admin-sidebar-item"><LogOut size={15} /><span>Log out</span></button>
      <div className="mt-5 rounded-[12px] border border-white/10 bg-white/5 p-3"><p className="truncate text-[10px] font-bold text-white">{sessionEmail}</p><p className="mt-1 text-[9px] text-[#9aa8cb]">Independent session · {adminOnly ? "admin-only" : "combined"} deployment</p></div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { data, loading, notice } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  if (loading || !data) return <div className="admin-root flex min-h-screen items-center justify-center"><div className="h-24 w-24 animate-spin rounded-full border-4 border-[#dce5f3] border-t-[#ffb800]" /></div>;

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  const clientUrl = data.deployment.clientAppUrl || "/";

  return (
    <div className="admin-root relative min-h-screen">
      <div key={`admin-progress-${pathname}`} className="route-progress" />
      <div className="ambient-bg" aria-hidden="true" />
      <header className="admin-topbar sticky top-0 z-30 flex items-center justify-between px-4 text-white sm:px-6">
        <button onClick={() => setDrawer(true)} className="lg:hidden" aria-label="Menu"><Menu size={22} /></button>
        <span className="hidden text-[12px] font-semibold text-[#aeb9d8] lg:block">SDK Pay Operations</span>
        <p className="absolute left-1/2 -translate-x-1/2 text-[13px] font-bold">SDK Pay Admin</p>
        <div className="flex items-center gap-3"><span className="hidden text-[10px] font-bold text-[#9fb0db] sm:block">{data.deployment.environment}</span><Link href="/admin/notifications" className="relative"><Bell size={18} />{data.metrics.unreadNotifications > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff4d63]" />}</Link></div>
      </header>

      <aside className="admin-sidebar admin-scroll fixed left-0 top-[48px] z-20 hidden h-[calc(100vh-48px)] w-[248px] overflow-y-auto lg:block">
        <SidebarContent pathname={pathname} close={() => setDrawer(false)} onLogout={() => void logout()} supportBadge={data.metrics.openTickets} sessionEmail={data.session.email} clientUrl={clientUrl} adminOnly={data.deployment.adminOnly} />
      </aside>

      {drawer && <><button className="admin-overlay" onClick={() => setDrawer(false)} aria-label="Close menu" /><aside className="admin-drawer admin-scroll"><SidebarContent pathname={pathname} close={() => setDrawer(false)} onLogout={() => void logout()} supportBadge={data.metrics.openTickets} sessionEmail={data.session.email} clientUrl={clientUrl} adminOnly={data.deployment.adminOnly} /></aside></>}

      <main className="relative z-[1] px-4 pb-12 pt-6 sm:px-7 lg:ml-[248px]">
        <div key={pathname} className="page-enter mx-auto max-w-[1240px]">{children}</div>
      </main>
      {notice && <div className={`fixed bottom-5 right-5 z-[80] rounded-[12px] px-4 py-3 text-[12px] font-bold text-white shadow-xl ${notice.tone === "error" ? "bg-[#d43c4c]" : "bg-[#17854d]"}`}>{notice.message}</div>}
    </div>
  );
}
