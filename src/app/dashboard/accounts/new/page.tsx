"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";
import type { CatalogEntry } from "@/lib/wallets";
import CountryFlag from "@/components/CountryFlag";

export default function AddAccountPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [mine, setMine] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/wallets")
      .then((r) => r.json())
      .then((d) => {
        setCatalog(d.catalog ?? []);
        setMine((d.wallets ?? []).map((w: { walletCode: string }) => w.walletCode));
      })
      .catch(() => {});
  }, []);

  const filtered = catalog.filter(
    (c) =>
      c.code.toLowerCase().includes(q.toLowerCase()) ||
      c.country.toLowerCase().includes(q.toLowerCase())
  );

  async function create() {
    if (!selected) return;
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selected }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      router.push("/dashboard/accounts");
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/accounts" className="flex items-center gap-1.5 text-[15px] font-medium text-slate-500">
        <ArrowLeft size={18} /> My Accounts
      </Link>

      <div className="mt-3 flex items-start gap-3">
        <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-[#f0a500]">
          <Plus size={23} strokeWidth={2.6} />
        </span>
        <div>
          <h1 className="text-[24.5px] font-extrabold tracking-tight text-slate-900">Add account</h1>
          <p className="text-[15px] font-medium leading-snug text-slate-500">
            Open a new account in another currency. The account will be initialized with a balance of 0.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-yellow-400 px-4 py-1 ring-2 ring-yellow-400/30">
            <Search size={19} className="shrink-0 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for a country or currency..."
              className="w-full bg-transparent py-3 text-[16px] font-medium placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>
        {err && <p className="mx-3 mb-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] font-bold text-red-600">{err}</p>}
        <div className="max-h-[380px] overflow-y-auto">
          {filtered.map((c) => {
            const owned = mine.includes(c.code);
            const active = selected === c.code;
            return (
              <button
                key={c.code}
                disabled={owned}
                onClick={() => setSelected(c.code)}
                className={`flex w-full items-center gap-3.5 border-t border-slate-100 px-5 py-3.5 text-left ${owned ? "opacity-40" : "hover:bg-slate-50"} ${active ? "bg-yellow-50/60" : ""}`}
              >
                <CountryFlag code={c.iso} emoji={c.flag} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[17.5px] font-extrabold text-slate-900">{c.code}</span>
                  <span className="block truncate text-[14px] font-medium text-slate-500">{c.country}</span>
                </span>
                {owned ? (
                  <span className="text-[11.5px] font-extrabold text-slate-400">Added</span>
                ) : (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] ${active ? "border-[#f0a500]" : "border-slate-200"}`}
                  >
                    {active && <span className="h-3.5 w-3.5 rounded-full bg-[#f0a500]" />}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-[12.5px] font-semibold text-slate-400">No currency found</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-slate-300 bg-white py-3.5 text-[16px] font-medium text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={create}
            disabled={!selected || loading}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[16px] font-bold text-white disabled:opacity-50"
            style={{ background: "#f0a500" }}
          >
            {loading && <Loader2 size={17} className="animate-spin" />}
            {loading ? "..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
