"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCheck, Trash2, X, ExternalLink, Clock, ArrowUpCircle } from "lucide-react";

interface Notif {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} at ${time}`;
}

function iconFor(n: Notif) {
  const t = `${n.title} ${n.message}`.toLowerCase();
  if (t.includes("pending") || t.includes("processing") || t.includes("attente")) {
    return <Clock size={26} className="text-[#f0a500]" />;
  }
  if (t.includes("withdrawal") || t.includes("retrait") || t.includes("envoi") || t.includes("sent")) {
    return <ArrowUpCircle size={26} className="text-orange-500" />;
  }
  if (t.includes("deposit") || t.includes("dépôt") || t.includes("reçu") || t.includes("received") || t.includes("paiement")) {
    return <Bell size={25} className="text-slate-900" />;
  }
  return <Bell size={25} className="text-slate-900" />;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch("/api/notifications");
    const d = await r.json();
    setNotifs(d.notifications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  async function clearAll() {
    if (!confirm("Delete all notifications?")) return;
    await fetch("/api/notifications", { method: "DELETE" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifs((n) => n.filter((x) => x.id !== id));
  }

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto -mt-5 max-w-2xl sm:-mt-6">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f4f6fb] py-4">
        <Link href="/dashboard" className="text-slate-500" aria-label="back">
          <ArrowLeft size={21} />
        </Link>
        <Bell size={23} className="text-slate-900" fill="currentColor" />
        <h1 className="text-[21px] font-extrabold text-slate-900">Notifications</h1>
        {unread > 0 && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[13px] font-extrabold text-white">
            {unread}
          </span>
        )}
        <span className="ml-auto flex items-center gap-4">
          <button onClick={markAll} title="Mark all read" className="text-[#f0a500]">
            <CheckCheck size={23} />
          </button>
          <button onClick={clearAll} title="Delete all" className="text-red-600">
            <Trash2 size={21} />
          </button>
        </span>
      </div>

      {loading && <p className="py-10 text-center text-[12.5px] font-bold text-slate-400">Loading...</p>}

      {!loading && notifs.length === 0 && (
        <div className="rounded-b-3xl bg-white p-12 text-center">
          <Bell size={35} className="mx-auto text-slate-200" />
          <p className="mt-3 text-[14px] font-extrabold">No notifications</p>
          <p className="text-[12px] font-medium text-slate-400">You're all caught up.</p>
        </div>
      )}

      <div className="divide-y divide-slate-200 border-b border-slate-200 bg-[#fffdf5]">
        {notifs.map((n) => (
          <div key={n.id} className="flex gap-3.5 px-4 py-5">
            <span className="relative shrink-0 pt-0.5">
              {iconFor(n)}
              {!n.isRead && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16.5px] font-bold text-slate-900">{n.title}</p>
              <p className="mt-0.5 line-clamp-3 text-[15px] font-medium leading-snug text-slate-500">{n.message}</p>
              <p className="mt-1.5 text-[13px] font-medium text-slate-400">{fmtDate(n.createdAt)}</p>
            </div>
            <span className="flex shrink-0 items-start gap-4 pt-1">
              <Link href="/dashboard/transactions" className="text-slate-300 hover:text-slate-500" title="Open transactions">
                <ExternalLink size={19} />
              </Link>
              <button onClick={() => remove(n.id)} className="font-extrabold text-red-600" title="Delete" aria-label="delete">
                <X size={21} strokeWidth={3} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
