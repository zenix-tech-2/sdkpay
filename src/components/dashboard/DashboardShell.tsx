"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Languages,
  BadgeCheck,
  LogOut,
  ChevronRight,
  X,
  Headset,
} from "lucide-react";
import Logo from "@/components/Logo";
import { NavigationProgress } from "@/components/motion/motion";
import { LanguageProvider, useDashLang } from "./LanguageContext";
import { formatMoney } from "@/lib/format";
import { Icon3D, txIconName, type Icon3DName } from "@/components/Icon3D";

export interface ShellUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  countryCode?: string;
  referralCode: string;
  balanceXaf: number;
  balanceXof: number;
  kycStatus: string;
}

interface Notif {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function avatarUrl(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='48' fill='#f6b800'/><text x='48' y='63' font-family='Arial,sans-serif' font-size='38' font-weight='bold' text-anchor='middle' fill='#0a1128'>${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function ShellInner({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useDashLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [balance, setBalance] = useState({ xaf: user.balanceXaf, xof: user.balanceXof });
  const [currency, setCurrency] = useState<"XAF" | "XOF">("XAF");

  const unread = notifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifs(d.notifications ?? []))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setBalance({ xaf: d.user.balanceXaf ?? 0, xof: d.user.balanceXof ?? 0 });
      })
      .catch(() => {});
  }, [pathname]);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const menu = [
    { href: "/dashboard", label: t.dashboard, icon3d: "home" as const, tile: "bg-amber-100 text-amber-600" },
    { href: "/dashboard/links", label: t.myLinks, icon3d: "payment" as const, tile: "bg-orange-100 text-orange-600" },
    { href: "/dashboard/transactions", label: t.transactions, icon3d: "transactions" as const, tile: "bg-purple-100 text-purple-600" },
    { href: "/dashboard/deposit", label: t.deposit, icon3d: "receive" as const, tile: "bg-emerald-100 text-emerald-600" },
    { href: "/dashboard/withdraw", label: t.withdraw, icon3d: "withdraw" as const, tile: "bg-yellow-100 text-yellow-700" },
    { href: "/dashboard/send", label: t.send, icon3d: "send" as const, tile: "bg-red-100 text-red-500" },
    { href: "/dashboard/accounts", label: t.accounts, icon3d: "wallet" as const, tile: "bg-teal-100 text-teal-600" },
    { href: "/dashboard/referrals", label: t.referrals, icon3d: "gains" as const, tile: "bg-amber-100 text-amber-700" },
  ];

  const settingsMenu = [
    { href: "/dashboard/kyc", label: t.kyc, icon3d: "profile" as const, tile: "bg-emerald-100 text-emerald-700", badge: user.kycStatus },
    { href: "/dashboard/support", label: t.support, icon3d: "support" as const, tile: "bg-sky-100 text-sky-700" },
    { href: "/dashboard/api", label: t.api, icon3d: "project" as const, tile: "bg-violet-100 text-violet-700" },
    { href: "/dashboard/settings", label: t.settings, icon3d: "gauge" as const, tile: "bg-slate-200 text-slate-600" },
    { href: "/dashboard/fees", label: t.fees, icon3d: "invoice" as const, tile: "bg-yellow-100 text-yellow-700" },
  ];

  const shownBalance = currency === "XAF" ? balance.xaf : balance.xof;

  useEffect(() => {
    if (localStorage.getItem("sdkpay-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
    const fn = (e: Event) => {
      document.documentElement.classList.toggle("dark", (e as CustomEvent).detail === "dark");
    };
    window.addEventListener("sdkpay-theme", fn);
    return () => window.removeEventListener("sdkpay-theme", fn);
  }, []);

  return (
    <div className="sdk-shell min-h-screen bg-[#f4f6fb]">
      {/* yellow top strip like app */}
      <NavigationProgress />

      {/* topbar */}
      <div className="sdk-topbar sticky top-0 z-40 bg-[#f4f6fb]/95 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-3 h-[44px] flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg border border-slate-900 p-1 text-slate-900"
            aria-label="open menu"
          >
            <PanelLeftClose size={17.1} strokeWidth={2.4} />
          </button>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden lg:flex rounded-lg border border-slate-900 p-1 text-slate-900"
            aria-label="toggle menu"
          >
            {sidebarOpen ? <PanelLeftClose size={17.1} strokeWidth={2.4} /> : <PanelLeftOpen size={17.1} strokeWidth={2.4} />}
          </button>

          <div className="ml-auto flex items-center gap-2.5">
            {/* language */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangOpen(!langOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                <Languages size={15.3} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
                  {[
                    { code: "fr", label: "Français" },
                    { code: "en", label: "English" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code as "fr" | "en");
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-[11.5px] font-bold ${
                        lang === l.code ? "bg-yellow-50 text-yellow-500" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Languages size={14.4} />
                      {l.label}
                      {lang === l.code && <span className="ml-auto h-2 w-2 rounded-full bg-yellow-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setLangOpen(false);
                }}
                className="relative flex items-center justify-center rounded-full bg-red-100 h-[32px] w-[32px] text-slate-900 hover:bg-red-200/70"
              >
                <Bell size={16.2} fill="currentColor" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[253.5px] sm:w-[285.5px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-[11px] font-extrabold">Notifications</p>
                    <button onClick={markAll} className="text-[10px] font-bold text-yellow-600 hover:underline">
                      Tout marquer lu
                    </button>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto">
                    {notifs.length === 0 && (
                      <p className="px-4 py-8 text-center text-[10.5px] font-semibold text-slate-400">Aucune notification</p>
                    )}
                    {notifs.map((n) => (
                      <div key={n.id} className={`border-b border-slate-50 px-4 py-3 ${n.isRead ? "" : "bg-yellow-50/50"}`}>
                        <p className="text-[10.5px] font-extrabold text-slate-800">{n.title}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-500 leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-[10.5px] font-extrabold text-slate-700 hover:bg-slate-100"
                  >
                    See all notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* avatar */}
            <Link href="/dashboard/accounts" className="relative">
              <img src={avatarUrl(user.fullName)} alt={user.fullName} className="h-[32px] w-[32px] rounded-full object-cover ring-2 ring-white shadow" />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-[#f4f6fb]">
                <BadgeCheck size={11.7} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl flex">
        {/* desktop sidebar */}
        <aside className={`hidden lg:block transition-all ${sidebarOpen ? "w-[229.5px]" : "w-0 overflow-hidden"}`}>
          <SidebarContent
            user={user}
            menu={menu}
            settingsMenu={settingsMenu}
            pathname={pathname}
            shownBalance={shownBalance}
            currency={currency}
            t={t}
            logout={logout}
            onNav={() => {}}
          />
        </aside>

        {/* mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[84%] max-w-[340px] bg-white overflow-y-auto animate-fade-up">
              <SidebarContent
                user={user}
                menu={menu}
                settingsMenu={settingsMenu}
                pathname={pathname}
                shownBalance={shownBalance}
                currency={currency}
                t={t}
                logout={logout}
                onNav={() => setSidebarOpen(false)}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* main */}
        <main key={pathname} className="page-enter flex-1 min-w-0 px-4 sm:px-6 py-5 pb-28">{children}</main>
      </div>

      {/* support FAB */}
      <button
        onClick={() => setSupportOpen(true)}
        className="fixed bottom-6 right-5 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-yellow-400 shadow-2xl shadow-yellow-500/40 hover:scale-105 transition"
        aria-label="support"
      >
        <Headset size={27} className="text-slate-900" />
      </button>

      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSupportOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <button onClick={() => setSupportOpen(false)} className="absolute right-4 top-4 text-slate-400">
              <X size={16.2} />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <Headset size={22.5} className="text-yellow-600" />
            </div>
            <h3 className="mt-3 text-[14.5px] font-extrabold">Support SDK Pay</h3>
            <p className="mt-1 text-[10.5px] font-medium text-slate-500">
              Notre équipe est disponible 24/7 pour vous aider.
            </p>
            <div className="mt-4 space-y-2">
              <a href="mailto:support@sdkpay.com" className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-[11px] font-bold">
                <Icon3D name="mail" size={18} /> support@sdkpay.com
              </a>
              <a href="tel:+237683677872" className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-[11px] font-bold">
                <Icon3D name="phone" size={18} /> +237 6 83 67 78 72
              </a>
              <Link href="/contact" className="block rounded-2xl bg-yellow-400 px-4 py-3 text-center text-[11px] font-extrabold">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  user,
  menu,
  settingsMenu,
  pathname,
  shownBalance,
  currency,
  t,
  logout,
  onNav,
  onClose,
}: {
  user: ShellUser;
  menu: { href: string; label: string; icon3d: Icon3DName; tile: string }[];
  settingsMenu: { href: string; label: string; icon3d: Icon3DName; tile: string; badge?: string }[];
  pathname: string;
  shownBalance: number;
  currency: string;
  t: Record<string, string>;
  logout: () => void;
  onNav: () => void;
  onClose?: () => void;
}) {
  function kycBadge(status: string) {
    if (status === "verified")
      return <span className="ml-auto rounded-lg bg-green-500 px-2.5 py-1 text-[10px] font-extrabold text-white">Verified</span>;
    if (status === "review")
      return <span className="ml-auto rounded-lg bg-blue-500 px-2.5 py-1 text-[10px] font-extrabold text-white">Review</span>;
    return <span className="ml-auto rounded-lg bg-yellow-400 px-2.5 py-1 text-[10px] font-extrabold text-slate-900">Pending</span>;
  }
  return (
    <div className="sdk-sidebar flex min-h-[calc(100vh-100px)] flex-col bg-white lg:m-4 lg:rounded-3xl lg:border lg:border-slate-200 lg:min-h-0">
      <div className="flex items-center justify-between px-5 pt-5">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="rounded-lg border-[2.5px] border-slate-900 p-1" aria-label="close">
            <PanelLeftClose size={16.2} strokeWidth={2.6} />
          </button>
        )}
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-[22px] bg-[#23207e] p-5 text-white">
          <p className="text-[11px] font-medium text-white/70">{t.availableBalance}</p>
          <p className="mt-1 text-[24px] font-extrabold tracking-tight">
            {shownBalance.toLocaleString("fr-FR")} <span className="text-[16px]">FCFA</span>
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/50">{currency} • {user.countryCode ?? ""}</p>
        </div>
      </div>

      <p className="px-6 pt-6 text-[10px] font-extrabold tracking-[0.16em] text-slate-400">{t.mainMenu}</p>
      <nav className="mt-2 space-y-1 px-3 pb-4">
        {menu.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNav}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                active ? "bg-sky-50" : "hover:bg-slate-50"
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${m.tile} shadow-sm`}>
                <Icon3D name={m.icon3d} size={27} />
              </span>
              <span className={`text-[12.5px] font-bold ${active ? "text-slate-900" : "text-slate-800"}`}>
                {m.label}
              </span>
              {active && !("badge" in m && m.badge) && <ChevronRight size={12.6} className="ml-auto text-slate-300" />}
            </Link>
          );
        })}
      </nav>

      <p className="px-6 pt-4 text-[10px] font-extrabold tracking-[0.16em] text-slate-400">{t.settingsSupport}</p>
      <nav className="mt-2 space-y-1 px-3 pb-4">
        {settingsMenu.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNav}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                active ? "bg-sky-50" : "hover:bg-slate-50"
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${m.tile} shadow-sm`}>
                <Icon3D name={m.icon3d} size={27} />
              </span>
              <span className={`text-[12.5px] font-bold ${active ? "text-slate-900" : "text-slate-800"}`}>
                {m.label}
              </span>
              {m.badge !== undefined ? (
                kycBadge(m.badge)
              ) : (
                active && <ChevronRight size={12.6} className="ml-auto text-slate-300" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <img src={avatarUrl(user.fullName)} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[11.5px] font-extrabold text-slate-900">{user.fullName}</p>
            <p className="truncate text-[10px] font-medium text-slate-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-red-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <LogOut size={15.3} />
          </span>
          <span className="text-[12.5px] font-bold text-red-500">{t.logout}</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ShellInner user={user}>{children}</ShellInner>
    </LanguageProvider>
  );
}

export function BalanceCard({
  xaf,
  xof,
  usdt = 0,
}: {
  xaf: number;
  xof: number;
  usdt?: number;
}) {
  const [cur, setCur] = useState<"XAF" | "XOF">("XAF");
  const [convOpen, setConvOpen] = useState(false);
  const [amt, setAmt] = useState("");
  const [msg, setMsg] = useState("");
  const { t } = useDashLang();
  const shown = cur === "XAF" ? xaf : xof;

  async function convert() {
    setMsg("");
    const res = await fetch("/api/wallet/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amt), from: cur }),
    });
    const d = await res.json();
    if (!res.ok) {
      setMsg(d.error);
      return;
    }
    setMsg("Conversion réussie !");
    setAmt("");
    setTimeout(() => window.location.reload(), 900);
  }

  return (
    <>
      <div className="pop-in relative overflow-hidden rounded-[26px] bg-[#23207e] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-20 h-56 w-56 rounded-full bg-yellow-400/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11.5px] sm:text-[13.5px] font-medium text-white/70">
                {t.mainBalance} ({cur})
              </p>
              <button
                onClick={() => setCur(cur === "XAF" ? "XOF" : "XAF")}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold hover:bg-white/25"
              >
                {cur === "XAF" ? "→ XOF" : "→ XAF"}
              </button>
            </div>
            <p className="mt-2 text-[34.5px] sm:text-[44.5px] leading-none font-extrabold tracking-tight">
              {shown.toLocaleString("fr-FR")}
            </p>
            <p className="mt-2 text-[10px] font-bold text-white/50">
              XAF: {xaf.toLocaleString("fr-FR")} • XOF: {xof.toLocaleString("fr-FR")} • USDT: {(usdt / 10000).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => setConvOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-yellow-500/50 bg-yellow-500/15 px-4 sm:px-5 py-3 text-[11.5px] sm:text-[13.5px] font-extrabold text-yellow-400 hover:bg-yellow-500/25"
          >
            <Icon3D name="transactions" size={21.6} /> {t.conversion}
          </button>
        </div>
      </div>

      {convOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConvOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <h3 className="text-[14.5px] font-extrabold">{t.conversion} XAF ↔ XOF</h3>
            <p className="mt-1 text-[10px] font-medium text-slate-500">Parité 1:1 • Sans frais</p>
            <div className="mt-4 flex gap-2">
              {(["XAF", "XOF"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCur(c)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-[11px] font-extrabold ${cur === c ? "border-yellow-400 bg-yellow-50" : "border-slate-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              type="number"
              min={100}
              placeholder="Montant"
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-[11.5px] font-bold focus:border-yellow-500"
            />
            {msg && <p className="mt-2 text-[10.5px] font-bold text-slate-600">{msg}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConvOpen(false)} className="flex-1 rounded-full border border-slate-200 py-3 text-[11px] font-extrabold">
                Annuler
              </button>
              <button onClick={convert} className="flex-1 rounded-full bg-yellow-400 py-3 text-[11px] font-extrabold">
                Convertir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TxIcon({ type }: { type: string }) {
  const bgs: Record<string, string> = {
    deposit: "bg-emerald-100",
    withdraw: "bg-orange-100",
    send_out: "bg-red-100",
    send_in: "bg-green-100",
    payment_received: "bg-sky-100",
    conversion: "bg-purple-100",
    bonus: "bg-yellow-100",
  };
  return (
    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bgs[type] ?? bgs.bonus}`}>
      <Icon3D name={txIconName(type)} size={25.2} />
    </span>
  );
}
