"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, X, Copy, Check, Clock } from "lucide-react";
import { formatDetailDate } from "@/lib/format";
import { microToUsdt } from "@/lib/crypto";
import { Icon3D } from "@/components/Icon3D";

interface Tx {
  id: string;
  type: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  operator: string | null;
  phone: string | null;
  reference: string;
  label: string;
  counterparty: string | null;
  channel: string;
  provider: string | null;
  providerRef: string | null;
  country: string | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  createdAt: string;
  updatedAt: string;
}

const INCOMING = ["deposit", "send_in", "payment_received", "bonus"];

function txTitle(t: string, operator: string | null) {
  const crypto = (operator ?? "").toUpperCase().includes("USDT");
  if (crypto) {
    switch (t) {
      case "deposit": return "Crypto Deposit";
      case "withdraw": return "Crypto Withdrawal";
      case "send_out": return "Crypto Transfer";
      default: break;
    }
  }
  switch (t) {
    case "deposit": return "Mobile Money Deposit";
    case "withdraw": return "Withdrawal";
    case "send_out": return "Transfer sent";
    case "send_in": return "Transfer received";
    case "payment_received": return "Payment received";
    case "conversion": return "Currency conversion";
    case "payout": return "Debit adjustment";
    case "bonus": return "Credit adjustment";
    default: return "Transaction";
  }
}

function statusLabel(s: string) {
  return s === "success" ? "Completed" : s === "failed" ? "Failed" : "Pending";
}

function money(v: number, currency: string) {
  if (currency === "USDT") return `${microToUsdt(v).toFixed(4)} USDT`;
  return `${v.toLocaleString("fr-FR")} FCFA`;
}

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tx, setTx] = useState<Tx | null>(null);
  const [owner, setOwner] = useState({ fullName: "", country: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) setError(d.error || "Transaction not found.");
        else {
          setTx(d.transaction);
          setOwner(d.owner);
        }
      })
      .catch(() => setError("Network error."));
  }, [id]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <Icon3D name="invoice" size={56} className="mx-auto" />
        <h1 className="mt-3 text-[16.5px] font-extrabold">{error}</h1>
        <button onClick={() => router.back()} className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-[12px] font-extrabold text-white">
          Go back
        </button>
      </div>
    );
  }

  if (!tx) {
    return <p className="py-16 text-center text-[12.5px] font-bold text-slate-400">Loading...</p>;
  }

  const failed = tx.status === "failed";
  const pending = tx.status === "pending";
  const incoming = INCOMING.includes(tx.type);
  const bg = failed ? "#dc2626" : pending ? "#f0a500" : "#1faa53";
  const feePct = tx.amount > 0 ? ((tx.fee / tx.amount) * 100).toFixed(2) : "0.00";
  const net = tx.amount - tx.fee;
  const cur = tx.currency.includes("→") ? tx.currency.split("→")[0] : tx.currency;
  const title = txTitle(tx.type, tx.operator);

  function Row({ label, value, bold = true }: { label: string; value: string; bold?: boolean }) {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px] last:border-0">
        <span className="shrink-0 text-[16.5px] font-medium text-slate-500">{label}</span>
        <span className={`break-all text-right text-[16.5px] ${bold ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>{value}</span>
      </div>
    );
  }

  function RefRow({ label, value, k }: { label: string; value: string; k: string }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-[14px] last:border-0">
        <span className="max-w-[130px] shrink-0 text-[16.5px] font-medium leading-snug text-slate-500">{label}</span>
        <span className="flex min-w-0 items-center justify-end gap-2 text-right text-[16px] font-medium text-slate-900">
          <span className="break-all">{value}</span>
          <button onClick={() => copy(value, k)} className="shrink-0 text-slate-400 hover:text-slate-700" aria-label="copy">
            {copied === k ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[28px] p-6 pb-8 text-white" style={{ background: bg }}>
        <div className="flex items-center gap-3">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/20">
            {pending ? <Clock size={23} /> : incoming ? <TrendingUp size={23} /> : <TrendingDown size={23} />}
          </span>
          <p className="flex-1 text-[18.5px] font-bold">{title}</p>
          <button
            onClick={() => router.back()}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            aria-label="close"
          >
            <X size={21} strokeWidth={3} className="text-red-500" />
          </button>
        </div>
        <div className="mt-3 text-center">
          <span className="inline-block rounded-xl border-[1.5px] border-white/70 bg-white/15 px-5 py-1.5 text-[15px] font-bold">
            {statusLabel(tx.status)}
          </span>
        </div>
        <p className="mt-2 text-center text-[38.5px] font-extrabold leading-none tracking-tight">
          {incoming ? "+" : "-"}{money(tx.amount, tx.currency)}
        </p>
        <p className="mt-3 text-center text-[16.5px] font-medium text-white/85">{formatDetailDate(tx.createdAt)}</p>
      </div>

      <div className="mt-4 rounded-[28px] border border-slate-200 bg-white px-6 py-2">
        <p className="pt-5 text-[13px] font-bold tracking-[0.14em] text-slate-500">REFERENCES</p>
        <RefRow label="SDK Pay Ref." value={tx.reference} k="ref" />
        <RefRow label="Your site reference" value={tx.counterparty || "—"} k="site" />
        {tx.providerRef && <RefRow label="Provider ref" value={tx.providerRef} k="prov" />}

        <p className="pt-6 text-[13px] font-bold tracking-[0.14em] text-slate-500">FINANCIAL DETAILS</p>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px]">
          <span className="text-[16.5px] font-medium text-slate-500">Amount debited</span>
          <span className="text-right text-[16.5px] font-bold text-slate-900">{money(tx.amount, tx.currency)}</span>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px]">
          <span className="text-[16.5px] font-medium text-slate-500">Fees ({feePct}%)</span>
          <span className="text-right text-[16.5px] font-bold text-[#f59e0b]">{money(tx.fee, tx.currency)}</span>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px]">
          <span className="text-[16.5px] font-medium text-slate-500">{incoming ? "Amount received" : "Sent to recipient"}</span>
          <span className="text-right text-[16.5px] font-bold text-green-500">{money(net, tx.currency)}</span>
        </div>

        <p className="pt-6 text-[13px] font-bold tracking-[0.14em] text-slate-500">INFORMATION</p>
        <Row label="Type" value={title} />
        <Row label="Currency" value={cur} />
        <Row label="Operator" value={(tx.operator ?? "SDK Pay").toUpperCase()} />
        <Row
          label="Provider"
          value={
            tx.provider === "ashtechpay"
              ? "AshTechPay (primary)"
              : tx.provider === "saaspay"
                ? "SasPay (backup)"
                : tx.provider === "demo"
                  ? "Demo simulation"
                  : "—"
          }
        />
        <Row label="Country" value={tx.country || owner.country || "—"} />
        {tx.counterparty && !incoming && <Row label="Recipient" value={tx.counterparty} />}
        {tx.counterparty && incoming && <Row label="Sender" value={tx.counterparty} />}
        <Row label="Recipient phone" value={tx.phone || "—"} />
        {tx.channel === "api" && <Row label="Channel" value="API" />}

        <p className="pt-6 text-[13px] font-bold tracking-[0.14em] text-slate-500">BALANCE HISTORY</p>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px]">
          <span className="text-[16.5px] font-medium text-slate-500">Solde avant ({cur})</span>
          <span className="text-right text-[16.5px] font-bold text-slate-900">
            {tx.balanceBefore !== null ? money(tx.balanceBefore, tx.currency) : "—"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-[16px]">
          <span className="text-[16.5px] font-medium text-slate-500">Solde après ({cur})</span>
          <span className="text-right text-[16.5px] font-bold text-slate-900">
            {tx.balanceAfter !== null ? money(tx.balanceAfter, tx.currency) : "—"}
          </span>
        </div>
        <Row label="Created at" value={formatDetailDate(tx.createdAt)} />
        <Row label="Last updated" value={formatDetailDate(tx.updatedAt || tx.createdAt)} />
      </div>
    </div>
  );
}
