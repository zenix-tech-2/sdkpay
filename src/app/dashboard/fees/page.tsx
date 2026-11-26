"use client";

import { useState } from "react";
import { BadgePercent, Calculator, Check } from "lucide-react";

const FEES = [
  { op: "Mobile Money deposit", fee: "4%", note: "Credited instantly to your wallet", free: false },
  { op: "Payment link collection", fee: "4%", note: "Deducted automatically per payment", free: false },
  { op: "Withdrawal to Mobile Money", fee: "4%", note: "Minimum 500 FCFA per withdrawal", free: false },
  { op: "API Payout (disbursement)", fee: "4%", note: "Bulk payouts to beneficiaries", free: false },
  { op: "Mobile Money transfer (Send)", fee: "4%", note: "Send to any phone number", free: false },
  { op: "Crypto deposit (USDT)", fee: "2.5%", note: "TRC20 / BEP20 / ERC20", free: false },
  { op: "Crypto withdrawal / transfer", fee: "1 USDT", note: "Flat fee per transaction", free: false },
  { op: "Transfer between SDK Pay users", fee: "Free", note: "Instant & unlimited", free: true },
  { op: "XAF ↔ XOF conversion", fee: "Free", note: "1:1 parity, no spread", free: true },
  { op: "Payment link creation", fee: "Free", note: "Unlimited links, QR codes included", free: true },
  { op: "API access & webhooks", fee: "Free", note: "Test + live keys included", free: true },
];

export default function FeesPage() {
  const [amount, setAmount] = useState("10000");
  const amt = Number(amount || 0);
  const rate = 0.04;
  const fee = Math.round(amt * rate);
  const net = amt - fee;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900">Fees</h1>
      <p className="text-[10.5px] font-medium text-slate-500">No hidden fees. You know exactly what you pay.</p>

      <div className="mt-4 flex items-center gap-3 rounded-[24px] bg-[#26247e] p-5 text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-900">
          <BadgePercent size={18.9} />
        </span>
        <div>
          <p className="text-[12.5px] font-extrabold">Transparent pricing</p>
          <p className="text-[10px] font-medium text-white/70">Fees are deducted automatically. No monthly subscription.</p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {FEES.map((f) => (
          <div key={f.op} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.free ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-700"}`}>
              {f.free ? <Check size={14.4} strokeWidth={3} /> : <BadgePercent size={14.4} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold">{f.op}</p>
              <p className="truncate text-[10px] font-medium text-slate-400">{f.note}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-extrabold ${f.free ? "bg-green-100 text-green-700" : "bg-slate-900 text-white"}`}>
              {f.fee}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
        <h3 className="flex items-center gap-2 text-[12.5px] font-extrabold">
          <Calculator size={14.4} className="text-[#f0a500]" /> Fee calculator
        </h3>
        <div className="mt-3 rounded-2xl border-2 border-[#f0a500] bg-yellow-50 px-4 py-3 text-center text-[10.5px] font-extrabold">
          Deposit / Collection / Withdrawal / Payout — 4%
        </div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
          placeholder="Amount"
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[13.5px] font-extrabold focus:border-yellow-500"
        />
        <div className="mt-3 space-y-2">
          <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-[10.5px] font-bold text-slate-500">Amount</span>
            <span className="text-[11px] font-extrabold">{amt.toLocaleString("fr-FR")} FCFA</span>
          </div>
          <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-[10.5px] font-bold text-slate-500">Fee</span>
            <span className="text-[11px] font-extrabold text-red-500">-{fee.toLocaleString("fr-FR")} FCFA</span>
          </div>
          <div className="flex justify-between rounded-2xl bg-green-50 px-4 py-3">
            <span className="text-[10.5px] font-bold text-green-700">You receive</span>
            <span className="text-[11.5px] font-extrabold text-green-600">{net.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
