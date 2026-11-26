"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Clock3, Headset, Languages, LogOut, Send, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { formatNumber, formatUsdt } from "@/lib/format";
import type { DashboardData } from "@/lib/dashboard-types";

type DashboardContextValue = {
  data: DashboardData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
  t: (fr: string, en: string) => string;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside DashboardShell");
  return value;
}

const menu = [
  { href: "/dashboard", icon: "📊", fr: "Dashboard", en: "Dashboard" },
  { href: "/dashboard/links", icon: "🧾", fr: "My links", en: "My links" },
  { href: "/dashboard/transactions", icon: "🪙", fr: "Transactions", en: "Transactions" },
  { href: "/dashboard/deposit", icon: "💳", fr: "Deposit", en: "Deposit" },
  { href: "/dashboard/withdraw", icon: "💵", fr: "Withdraw", en: "Withdraw" },
  { href: "/dashboard/send", icon: "🔁", fr: "Send", en: "Send" },
  { href: "/dashboard/accounts", icon: "📱", fr: "Accounts", en: "Accounts" },
  { href: "/dashboard/referrals", icon: "🐱", fr: "Referrals & earnings", en: "Referrals & earnings" },
];

const settingsMenu = [
  { href: "/dashboard/kyc", icon: "🛡️", label: "KYC", badge: "Verified" },
  { href: "/dashboard/support", icon: "📞", label: "Support" },
  { href: "/dashboard/api", icon: "📄", label: "API" },
  { href: "/dashboard/icons", icon: "🎨", label: "Icons & providers" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
  { href: "/dashboard/fees", icon: "🧾", label: "Fees" },
];


function KButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Ouvrir le menu" className="flex h-10 w-10 items-center justify-center rounded-[8px] border-[2px] border-[#17213d] font-display text-[19px] font-black text-[#17213d]">
      K
    </button>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("en");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.status === 401) { router.push("/login"); return; }
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void refresh(); }, [refresh]);

  const t = useCallback((fr: string, en: string) => (lang === "en" ? en : fr), [lang]);
  const value = useMemo(() => ({ data, loading, refresh, lang, setLang, t }), [data, loading, refresh, lang, t]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function sendSupport() {
    if (!chatMessage.trim()) return;
    await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data?.user.email, message: chatMessage }) });
    setChatSent(true);
    setChatMessage("");
    setTimeout(() => setChatSent(false), 4000);
  }

  const unreadCount = data?.notifications?.filter((item) => !item.isRead).length ?? 0;
  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <DashboardContext.Provider value={value}>
      <div className="min-h-screen bg-[#f4f7fd]">
        <div key={`progress-${pathname}`} className="route-progress" />
        <div className="ambient-bg" aria-hidden="true" />
        <div className="motion-shimmer h-8 bg-[#ffb800]" />
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#e9edf5] bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-4">
            <KButton onClick={() => setDrawer(true)} />
            <span className="hidden text-[13px] font-bold text-[#8791a8] sm:block">SDK Pay · {t("Espace marchand", "Merchant space")}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex h-10 w-11 items-center justify-center rounded-[10px] border border-[#dbe4f2] bg-[#f8fbff] text-[#25314d]" aria-label="Langue"><Languages size={19} /></button>
              {langOpen && (
                <div className="animate-pop absolute right-0 top-12 z-40 w-[190px] rounded-2xl border border-[#e8edf6] bg-white p-2 shadow-[0_18px_45px_rgba(20,35,70,.16)]">
                  {(["fr", "en"] as const).map((code) => (
                    <button key={code} onClick={() => { setLang(code); setLangOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold ${lang === code ? "bg-[#fff4d8] text-[#e5a300]" : "text-[#1c2741] hover:bg-[#f5f8ff]"}`}>
                      <Languages size={17} /> {code === "fr" ? "Français" : "English"} {lang === code && <span className="ml-auto h-2 w-2 rounded-full bg-[#ffb800]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => router.push("/dashboard/notifications")} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe8ed] text-[#6a2540]" aria-label="Notifications">
              <Bell size={19} className="rotate-[-25deg]" />
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4d63] text-[10px] font-bold text-white">{unreadCount}</span>
            </button>
            <button onClick={() => router.push("/dashboard/accounts")} className="relative mr-1 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf75] to-[#f09c37] text-xl" aria-label="Profil">🙂
              <span className="absolute -bottom-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e8ef0] text-white"><Clock3 size={10} /></span>
            </button>
          </div>
        </header>

        {drawer && (
          <div className="fixed inset-0 z-50 flex" onClick={() => setDrawer(false)}>
            <div className="absolute inset-0 bg-black/45" />
            <aside onClick={(e) => e.stopPropagation()} className="animate-pop relative flex h-full w-[82%] max-w-[350px] flex-col overflow-y-auto bg-[#f4f7fd] shadow-2xl">
              <div className="flex h-[90px] items-center justify-between border-b border-[#e6ecf7] px-5">
                <Logo size="md" href="/dashboard" />
                <KButton onClick={() => setDrawer(false)} />
              </div>
              <div className="px-5 pb-6 pt-6">
                <div className="rounded-[18px] bg-[#1d2a77] px-5 py-5 text-white">
                  <p className="text-[14px] font-medium text-[#c8d2f5]">{t("Available balance", "Available balance")}</p>
                  <p className="font-display mt-2 text-[31px] font-extrabold">{loading ? "…" : formatNumber(data?.user.balance ?? 0)} FCFA</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#b8c4ee]">{formatUsdt(data?.user.usdtBalance ?? 0, 4)} USDT</p>
                </div>
                <p className="mt-8 text-[11px] font-bold tracking-[.15em] text-[#8b96b0]">MAIN MENU</p>
                <nav className="mt-3 space-y-1.5">
                  {menu.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setDrawer(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition ${isActive(item.href) ? "bg-[#e5edfb] text-[#17213d]" : "text-[#1c2741] hover:bg-[#e9effa]"}`}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm">{item.icon}</span>
                      {t(item.fr, item.en)}
                    </Link>
                  ))}
                </nav>
                <p className="mt-9 text-[11px] font-bold tracking-[.15em] text-[#8b96b0]">SETTINGS &amp; SUPPORT</p>
                <nav className="mt-3 space-y-1.5">
                  {settingsMenu.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setDrawer(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition ${isActive(item.href) ? "bg-[#e5edfb] text-[#17213d]" : "text-[#1c2741] hover:bg-[#e9effa]"}`}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.badge && <span className="ml-auto rounded-lg bg-[#12b76a] px-3 py-1.5 text-[12px] font-extrabold text-white">{item.badge}</span>}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="border-t border-[#e3eaf6] px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf75] to-[#f09c37] text-xl">🙂</span>
                  <div><p className="text-[14px] font-extrabold text-[#17213d]">{data?.user.fullName ?? "..."}</p><p className="text-[11px] text-[#8b96b0]">{data?.user.email ?? ""}</p></div>
                </div>
                <button onClick={logout} className="mt-5 flex items-center gap-3 text-[14px] font-bold text-[#f0475e]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe8ec]"><LogOut size={16} /></span> Log out</button>
              </div>
            </aside>
          </div>
        )}

        <main className="relative z-[1] mx-auto max-w-[1180px] px-4 pb-24 pt-7 sm:px-7">
          <div key={pathname} className="page-enter">{children}</div>
        </main>

        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
          {chatOpen && (
            <div className="animate-pop w-[300px] rounded-2xl border border-[#e8edf6] bg-white p-4 shadow-[0_18px_50px_rgba(20,35,70,.2)]">
              <div className="flex items-center justify-between"><p className="text-[13px] font-bold text-[#17213d]">{t("Support SDK Pay", "SDK Pay Support")}</p><button onClick={() => setChatOpen(false)}><X size={15} /></button></div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#7c87a1]">{t("Une question ? Écrivez-nous, notre équipe répond 24/7.", "Any question? Write to us, our team answers 24/7.")}</p>
              <textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder={t("Votre message...", "Your message...")} className="mt-3 h-20 w-full resize-none rounded-xl border border-[#dfe6f3] p-2.5 text-[12px] outline-none focus:border-[#ffb800]" />
              {chatSent && <p className="mt-1 text-[11px] font-semibold text-[#2e9e63]">✓ {t("Message envoyé !", "Message sent!")}</p>}
              <button onClick={sendSupport} className="brand-btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px]"><Send size={13} /> {t("Envoyer", "Send")}</button>
            </div>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#ffca22] text-[#26324d] shadow-[0_10px_25px_rgba(255,184,0,.4)]" aria-label="Support"><Headset size={30} strokeWidth={1.8} /></button>
        </div>

        <div className="hidden">
          <ChevronRight />
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
