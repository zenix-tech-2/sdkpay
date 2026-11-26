"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight, ArrowLeftRight, X, Loader2, Star, Trash2 } from "lucide-react";
import { displayUnit } from "@/lib/wallets";
import CountryFlag from "@/components/CountryFlag";

const GOLD = "#f0a500";
const NAVY = "#26247e";

interface Wallet {
  id: string;
  walletCode: string;
  country: string;
  countryCode: string;
  flag: string;
  isPrimary: boolean;
  family: "XAF" | "XOF" | "USDT";
  balance: number;
}

function fmtBalance(w: Wallet) {
  if (w.family === "USDT") return (w.balance / 10000).toFixed(4);
  return w.balance.toLocaleString("fr-FR");
}

export default function AccountsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [convOpen, setConvOpen] = useState(false);
  const [from, setFrom] = useState<"XAF" | "XOF">("XAF");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/wallets");
    const d = await r.json();
    setWallets(d.wallets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setPrimary(id: string) {
    await fetch("/api/wallets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this account? Its transaction history is kept.")) return;
    const r = await fetch(`/api/wallets?id=${id}`, { method: "DELETE" });
    if (r.ok) load();
    else {
      const d = await r.json();
      alert(d.error);
    }
  }

  async function convert() {
    setMsg("");
    setBusy(true);
    try {
      const r = await fetch("/api/wallet/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), from }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg(d.error);
        return;
      }
      setMsg("Conversion successful!");
      setAmount("");
      load();
      setTimeout(() => {
        setConvOpen(false);
        setMsg("");
      }, 900);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900">My Accounts</h1>
        <Link
          href="/dashboard/accounts/new"
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-[12.5px] font-medium text-slate-900"
        >
          <Plus size={15.3} /> Add account
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-[26px] p-6 text-white" style={{ background: NAVY }}>
        <div>
          <p className="text-[15px] font-medium text-white/85">Wallets</p>
          <p className="text-[41.5px] font-extrabold leading-none">{loading ? "–" : wallets.length}</p>
          <p className="mt-1 text-[15px] font-medium leading-tight text-white/85">active<br />account{wallets.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setConvOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-[13.5px] font-bold text-white/70 hover:bg-white/15"
        >
          <ArrowLeftRight size={17.1} /> Request<br />conversion
        </button>
      </div>

      <div className="mt-4 space-y-3.5">
        {wallets.map((w) => (
          <div key={w.id} className="flex items-center gap-3.5 rounded-[24px] border border-slate-200 bg-white p-4">
            <CountryFlag code={w.countryCode} emoji={w.flag} size={44.1} circle className="border border-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[16px] font-extrabold text-slate-900">
                {w.walletCode}
                {w.isPrimary && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10.5px] font-extrabold text-[#f0a500]">Primary</span>
                )}
              </p>
              <p className="truncate text-[12.5px] font-medium text-slate-500">{w.country} {w.walletCode}</p>
              {!w.isPrimary && (
                <span className="mt-1 flex gap-3">
                  <button onClick={() => setPrimary(w.id)} className="flex items-center gap-1 text-[10px] font-extrabold text-yellow-600 hover:underline">
                    <Star size={10} /> Set primary
                  </button>
                  <button onClick={() => remove(w.id)} className="flex items-center gap-1 text-[10px] font-extrabold text-red-400 hover:underline">
                    <Trash2 size={10} /> Delete
                  </button>
                </span>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[17.5px] font-extrabold text-slate-900">{fmtBalance(w)}</p>
              <p className="text-[11.5px] font-medium text-slate-500">{displayUnit(w.walletCode)}</p>
            </div>
            <button
              onClick={() => {
                if (w.family !== "USDT") setFrom(w.family);
                setConvOpen(true);
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-[#f0a500] hover:bg-yellow-100"
              title="Convert"
            >
              <ArrowLeftRight size={16.2} />
            </button>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/accounts/new"
        className="mt-3.5 flex items-center gap-4 rounded-[24px] border-2 border-dashed border-slate-300 bg-white/60 p-5 hover:border-yellow-400"
      >
        <span className="flex h-[41.5px] w-[41.5px] items-center justify-center rounded-full border-2 border-dashed border-slate-400 text-slate-500">
          <Plus size={18.9} />
        </span>
        <span className="text-[16px] font-medium text-slate-500">Add account</span>
        <ChevronRight size={17.1} className="ml-auto text-slate-400" />
      </Link>

      {convOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConvOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <button onClick={() => setConvOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <h3 className="text-[15px] font-extrabold">Request conversion</h3>
            <p className="text-[10px] font-medium text-slate-500">XAF ↔ XOF • 1:1 parity • Free</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["XAF", "XOF"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setFrom(c)}
                  className={`rounded-2xl border-2 py-3 text-[11px] font-extrabold ${from === c ? "border-yellow-400 bg-yellow-50" : "border-slate-200 text-slate-400"}`}
                >
                  From {c}
                </button>
              ))}
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="Amount (min. 100)"
              className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[12.5px] font-extrabold focus:border-yellow-500"
            />
            {msg && <p className="mt-2 text-[10.5px] font-bold text-slate-600">{msg}</p>}
            <button
              onClick={convert}
              disabled={busy || Number(amount) < 100}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[11.5px] font-extrabold text-white disabled:opacity-50"
              style={{ background: GOLD }}
            >
              {busy && <Loader2 size={13.5} className="animate-spin" />}
              Convert to {from === "XAF" ? "XOF" : "XAF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
