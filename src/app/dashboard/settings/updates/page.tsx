"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, TrendingDown, ArrowLeftRight, Zap, ChevronDown, Megaphone } from "lucide-react";

const STATIC = [
  {
    id: "s1",
    date: "July 2026",
    icon: "shield",
    title: "Security update",
    desc: "Stronger protection for your account and your money.",
    bullets: [
      "Transaction PIN for withdrawals and transfers",
      "Connected-devices control with remote disconnect",
      "Instant alerts on every sensitive action",
    ],
  },
  {
    id: "s2",
    date: "July 2026",
    icon: "trend",
    title: "Reduced transaction fees",
    desc: "Transaction fees have been lowered in several countries to offer you better rates.",
    bullets: [
      "Lower fees for Mobile Money transactions",
      "New competitive rates for cross-border transfers",
      "Minimum fees adjusted for small amounts",
      "Full transparency: fees shown before confirmation",
    ],
  },
  {
    id: "s3",
    date: "July 2026",
    icon: "swap",
    title: "Reduced conversion fees",
    desc: "Moving money between your wallets is now cheaper than ever.",
    bullets: [
      "Free XAF ↔ XOF conversions at 1:1 parity",
      "New automatic conversion rules",
      "Best USDT rates with full fee breakdown",
    ],
  },
];

function IconFor({ icon }: { icon: string }) {
  if (icon === "trend") return <TrendingDown size={22.5} className="text-slate-700" strokeWidth={1.8} />;
  if (icon === "swap") return <ArrowLeftRight size={22.5} className="text-slate-700" strokeWidth={1.8} />;
  if (icon === "zap") return <Zap size={22.5} className="text-slate-700" strokeWidth={1.8} />;
  if (icon === "mega") return <Megaphone size={22.5} className="text-slate-700" strokeWidth={1.8} />;
  return <ShieldCheck size={22.5} className="text-slate-700" strokeWidth={1.8} />;
}

export default function UpdatesPage() {
  const [open, setOpen] = useState("");
  const [items, setItems] = useState(STATIC);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.announcements ?? []).map((a: any, i: number) => {
          let bullets: string[] = [];
          try {
            bullets = a.bullets ? JSON.parse(a.bullets) : [];
          } catch { /* ignore */ }
          return {
            id: `a${i}`,
            date: new Date(a.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            icon: "mega",
            title: a.title,
            desc: a.body,
            bullets,
            mediaUrl: a.mediaUrl,
          };
        });
        if (list.length) {
          setItems(list);
          setOpen(list[0].id);
        } else {
          setOpen("s2");
        }
      })
      .catch(() => setOpen("s2"));
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/settings" className="flex items-center gap-1.5 text-[14.5px] font-medium text-slate-500">
        <ArrowLeft size={16.2} /> Settings
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-[27px] font-extrabold tracking-tight">Updates</h1>
        <span className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 font-mono text-[13.5px] font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f0a500]" /> v1.7h SDK
        </span>
      </div>
      <p className="text-[15px] font-medium text-slate-500">What&apos;s new and improved</p>

      <div className="mt-5 space-y-4">
        {items.map((u: any, idx: number) => {
          const active = open === u.id;
          return (
            <div
              key={u.id}
              className={`overflow-hidden rounded-[26px] border bg-white ${active ? "border-yellow-300" : "border-slate-200"}`}
            >
              <button onClick={() => setOpen(active ? "" : u.id)} className="flex w-full items-center gap-4 p-5 text-left">
                <span className="flex h-[51px] w-[51px] shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  {u.mediaUrl ? <img src={u.mediaUrl} alt="" className="h-full w-full object-cover" /> : <IconFor icon={u.icon} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-500">
                    #{String(idx + 1).padStart(2, "0")} <span className="h-px w-8 bg-slate-200" /> {u.date}
                  </span>
                  <span className="mt-0.5 block text-[16.5px] font-bold text-slate-900">{u.title}</span>
                </span>
                <ChevronDown size={18.9} className={`shrink-0 text-slate-400 transition-transform ${active ? "rotate-180" : ""}`} />
              </button>
              {active && (
                <div className="border-t border-slate-200 p-6">
                  <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-slate-500">{u.desc}</p>
                  {u.bullets?.length > 0 && (
                    <ul className="mt-4 space-y-3.5">
                      {u.bullets.map((b: string) => (
                        <li key={b} className="flex items-start gap-3 text-[15px] font-medium text-slate-900">
                          <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f0a500]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
