"use client";

import { useState } from "react";

export default function BalanceAdjust({ userId, onDone }: { userId: string; onDone?: () => void }) {
  const [wallet, setWallet] = useState<"XAF" | "XOF" | "USDT">("XAF");
  const [dir, setDir] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg("");
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/users/${userId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, direction: dir, amount: Number(amount), reason }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg(d.error);
        return;
      }
      setMsg(`Done. Ref ${d.reference}`);
      setAmount("");
      setReason("");
      onDone?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[12.5px] font-extrabold">Balance adjustment</p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {(["XAF", "XOF", "USDT"] as const).map((w) => (
          <button
            key={w}
            onClick={() => setWallet(w)}
            className={`rounded-xl border-2 py-2 text-[11.5px] font-extrabold ${wallet === w ? "border-yellow-400 bg-yellow-50" : "border-slate-200 text-slate-400"}`}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(["credit", "debit"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDir(d)}
            className={`rounded-xl border-2 py-2 text-[11.5px] font-extrabold capitalize ${dir === d ? (d === "credit" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-slate-200 text-slate-400"}`}
          >
            {d}
          </button>
        ))}
      </div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder={`Amount (${wallet === "USDT" ? "USDT" : "FCFA"})`}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[12px] font-bold"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required, shown to merchant)"
        className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[12px] font-medium"
      />
      {msg && <p className="mt-2 text-[11px] font-bold text-slate-600">{msg}</p>}
      <button
        onClick={submit}
        disabled={busy || !amount || !reason.trim()}
        className="mt-2.5 w-full rounded-xl bg-[#10132e] py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
      >
        {busy ? "Processing..." : `${dir === "credit" ? "Credit" : "Debit"} wallet`}
      </button>
    </div>
  );
}
