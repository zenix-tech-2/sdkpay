"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Filter, Calendar, Copy, Check, Plus } from "lucide-react";
import { BalanceCard, TxIcon } from "@/components/dashboard/DashboardShell";
import { useDashLang } from "@/components/dashboard/LanguageContext";
import { timeAgo } from "@/lib/format";

interface Summary {
  user: { balanceXaf: number; balanceXof: number; balanceUsdt: number; fullName: string };
  stats: { links: number; transactions: number; collected: number; unread: number };
  recentTx: {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    label: string;
    createdAt: string;
    operator: string | null;
  }[];
  recentLinks: {
    id: string;
    title: string;
    slug: string;
    amount: number | null;
    currency: string;
    isActive: boolean;
    totalCollected: number;
    paymentsCount: number;
  }[];
}

export default function DashboardPage() {
  const { t } = useDashLang();
  const [data, setData] = useState<Summary | null>(null);
  const [filter, setFilter] = useState("all");
  const [period, setPeriod] = useState("month");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  function copyLink(slug: string) {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(""), 1500);
  }

  const quick = [
    { href: "/dashboard/deposit", label: t.deposit, bg: "bg-emerald-50", emoji: "🫳", sub: "💳" },
    { href: "/dashboard/send", label: t.send, bg: "bg-sky-50", emoji: "💰", sub: "" },
    { href: "/dashboard/withdraw", label: t.withdraw, bg: "bg-orange-50", emoji: "🧮", sub: "" },
    { href: "/dashboard/links", label: t.paymentLink, bg: "bg-purple-50", emoji: "👛", sub: "" },
  ];

  return (
    <div>
      <h1 className="text-[30px] sm:text-[34px] font-extrabold tracking-tight text-slate-900">{t.dashboard}</h1>

      <div className="mt-4">
        <BalanceCard xaf={data?.user.balanceXaf ?? 0} xof={data?.user.balanceXof ?? 0} usdt={data?.user.balanceUsdt ?? 0} />
      </div>

      <p className="mt-7 text-[13px] font-extrabold tracking-[0.18em] text-slate-400">{t.quickActions}</p>
      <div className="stagger mt-3 grid grid-cols-2 gap-3.5">
        {quick.map((q) => (
          <Link
            key={q.href + q.label}
            href={q.href}
            className="flex flex-col items-center rounded-[22px] border border-slate-200 bg-white px-4 py-7 shadow-sm hover:shadow-md hover:border-yellow-300 transition"
          >
            <span className={`flex h-[86px] w-[86px] items-center justify-center rounded-[26px] text-[46px] ${q.bg} shadow-inner`}>
              {q.emoji}
            </span>
            <span className="mt-3 text-[17px] font-bold text-slate-900">{q.label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard/referrals"
        className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] font-medium text-slate-800 hover:border-yellow-300"
      >
        <span className="truncate">{t.referralsBanner}</span>
        <ChevronRight size={20} className="ml-auto shrink-0" />
      </Link>

      {/* filters like screenshot */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-slate-400 shrink-0" />
          <div className="relative flex-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-800"
            >
              <option value="all">{t.allLinks}</option>
              <option value="active">Liens actifs</option>
              <option value="inactive">Liens inactifs</option>
            </select>
            <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-slate-400 shrink-0" />
          <div className="relative flex-1">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-800"
            >
              <option value="month">{t.thisMonth}</option>
              <option value="week">Cette semaine</option>
              <option value="all">Toute la période</option>
            </select>
            <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* stats row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          [String(data?.stats.links ?? 0), t.activeLinks],
          [`${(data?.stats.collected ?? 0).toLocaleString("fr-FR")}`, t.totalCollected],
          [String(data?.stats.transactions ?? 0), t.transactions],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center">
            <div className="truncate text-[16px] font-extrabold text-slate-900">{v}</div>
            <div className="mt-0.5 text-[10.5px] font-bold text-slate-400">{l}</div>
          </div>
        ))}
      </div>

      {/* recent links */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-[18px] font-extrabold">{t.recentLinks}</h2>
        <Link href="/dashboard/links" className="text-[13px] font-bold text-yellow-600 hover:underline">
          {t.seeAll}
        </Link>
      </div>
      <div className="stagger mt-2.5 space-y-2.5">
        {!data && (
          <>
            <div className="skeleton h-[76px] rounded-2xl" />
            <div className="skeleton h-[76px] rounded-2xl" />
          </>
        )}
        {data && data.recentLinks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-[13.5px] font-semibold text-slate-500">{t.noLinks}</p>
            <Link
              href="/dashboard/links"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-5 py-2.5 text-[13px] font-extrabold"
            >
              <Plus size={15} /> Créer un lien
            </Link>
          </div>
        )}
        {data?.recentLinks
          .filter((l) => (filter === "all" ? true : filter === "active" ? l.isActive : !l.isActive))
          .map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100 text-[20px]">🔗</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-extrabold">{l.title}</p>
                <p className="text-[12px] font-semibold text-slate-400">
                  {l.amount ? `${l.amount.toLocaleString("fr-FR")} ${l.currency}` : "Montant libre"} • {l.paymentsCount} paiement(s)
                </p>
              </div>
              <button
                onClick={() => copyLink(l.slug)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-yellow-100"
              >
                {copied === l.slug ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
      </div>

      {/* recent transactions */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-[18px] font-extrabold">{t.recentTx}</h2>
        <Link href="/dashboard/transactions" className="text-[13px] font-bold text-yellow-600 hover:underline">
          {t.seeAll}
        </Link>
      </div>
      <div className="stagger mt-2.5 space-y-2.5">
        {data && data.recentTx.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-[13.5px] font-semibold text-slate-400">
            {t.noTx}
          </div>
        )}
        {data?.recentTx.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <TxIcon type={tx.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-extrabold">{tx.label || tx.type}</p>
              <p className="text-[12px] font-semibold text-slate-400">
                {timeAgo(tx.createdAt)} {tx.operator ? `• ${tx.operator}` : ""}
              </p>
            </div>
            <span
              className={`text-[14px] font-extrabold ${
                ["deposit", "send_in", "payment_received"].includes(tx.type) ? "text-green-600" : "text-slate-900"
              }`}
            >
              {["deposit", "send_in", "payment_received"].includes(tx.type) ? "+" : "-"}
              {tx.currency === "USDT" ? `${(tx.amount / 10000).toFixed(2)} USDT` : tx.amount.toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
