"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, TrendingDown, TrendingUp, Wrench, X } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatNumber, formatUsdt } from "@/lib/format";
import type { DashboardTransaction } from "@/lib/dashboard-types";

function fullDate(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(date);
  return `${day} at ${time}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="mt-7 first:mt-0"><h2 className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">{title}</h2><div className="mt-2">{children}</div></div>;
}

function Row({ label, value, copy = false, tone = "dark" }: { label: ReactNode; value: string; copy?: boolean; tone?: "dark" | "orange" | "green" }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard?.writeText(value.replace(/ FCFA$/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e5ebf5] py-3.5 last:border-b-0">
      <span className="max-w-[45%] text-[14px] leading-snug text-[#6d7d9e]">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className={`break-all text-right text-[15px] font-bold ${tone === "orange" ? "text-[#e5a300]" : tone === "green" ? "text-[#1aa85d]" : "text-[#17213d]"}`}>{value}</span>
        {copy && <button onClick={handleCopy} className="shrink-0 text-[#8b96b0] hover:text-[#e5a300]" aria-label="Copier">{copied ? <Check size={17} /> : <Copy size={17} />}</button>}
      </div>
    </div>
  );
}

export function TransactionDetailSection() {
  const pathname = usePathname();
  const { data } = useDashboard();
  const id = Number(pathname.split("/").filter(Boolean).pop());
  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
  const tx: DashboardTransaction | undefined = data.transactions.find((item) => item.id === id);
  if (!tx) {
    return (
      <div className="rounded-[20px] border border-[#e3e9f4] bg-white p-10 text-center">
        <p className="text-[15px] font-bold text-[#17213d]">Transaction introuvable</p>
        <Link href="/dashboard/transactions" className="mt-4 inline-block text-[13px] font-bold text-[#e5a300]">← Back to transactions</Link>
      </div>
    );
  }

  const failed = tx.status === "failed";
  const pending = tx.status === "pending";
  const incoming = tx.direction === "in";
  const isCrypto = tx.currency === "USDT";
  const unit = isCrypto ? "USDT" : "FCFA";
  const currencyLabel = isCrypto ? "USDT" : "XAF";
  const fee = isCrypto ? (tx.feeDecimal ?? 0) : (tx.fee ?? 0);
  const gross = isCrypto ? (tx.grossDecimal ?? (tx.amountDecimal ?? 0) + fee) : (tx.grossAmount ?? tx.amount + fee);
  const net = isCrypto ? (tx.amountDecimal ?? tx.amount / 10000) : tx.amount;
  const balanceBefore = isCrypto ? (tx.balanceBeforeDecimal ?? 0) : (tx.balanceBefore ?? data.user.balance);
  const balanceAfter = isCrypto ? (tx.balanceAfterDecimal ?? 0) : (tx.balanceAfter ?? data.user.balance);
  const heroAmount = incoming ? net : gross;
  const formatAmount = (value: number) => isCrypto ? formatUsdt(value, 4) : formatNumber(Math.round(value));
  const feeRate = isCrypto ? "2.50%" : "4.00%";
  const title = tx.note || (tx.type === "withdraw" ? "Withdrawal" : tx.type === "deposit" ? "Mobile Money Deposit" : tx.type);
  const createdLabel = fullDate(tx.createdAt);
  const updatedLabel = fullDate(tx.updatedAt ?? tx.createdAt);
  const siteReference = tx.siteReference || `IB-${tx.reference}`;

  return (
    <div className="mx-auto max-w-[760px]">
      <div className={`rounded-[24px] px-5 py-6 text-white shadow-[0_10px_28px_rgba(20,35,70,.08)] sm:px-7 sm:py-7 ${failed ? "bg-[#f03646]" : pending ? "bg-[#f0a500]" : "bg-[#0aa958]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/15">{incoming ? <TrendingUp size={25} /> : <TrendingDown size={25} />}</span>
            <p className="text-[18px] font-semibold sm:text-[20px]">{title}</p>
          </div>
          <Link href="/dashboard/transactions" className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/15 text-white" aria-label="Fermer">
            {failed ? <Wrench size={22} className="text-white/80" /> : <X size={25} className="text-[#ff4d5e]" />}
          </Link>
        </div>
        <div className="mt-5 flex justify-center"><span className={`rounded-lg border border-white/30 px-4 py-1.5 text-[13px] font-bold ${failed ? "bg-white/10" : "bg-[#078c49]/30"}`}>{failed ? "Failed" : tx.status === "completed" ? "Completed" : "Pending"}</span></div>
        <p className="font-display mt-5 text-center text-[46px] font-extrabold leading-none sm:text-[56px]">{incoming ? "+" : "-"}{formatAmount(heroAmount)} {unit}</p>
        <p className="mt-4 text-center text-[15px] text-white/90">{createdLabel}</p>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white px-5 py-6 sm:px-6">
        <Section title="REFERENCES">
          <Row label={<>SDK Pay<br />Ref.</>} value={tx.reference} copy />
          <Row label={<>Your site<br />reference</>} value={siteReference} copy />
        </Section>

        <Section title="FINANCIAL DETAILS">
          <Row label="Amount debited" value={`${formatAmount(gross)} ${unit}`} />
          <Row label={`Fees (${feeRate})`} value={`${formatAmount(fee)} ${unit}`} tone="orange" />
          <Row label={incoming ? "Amount received" : "Sent to recipient"} value={`${formatAmount(net)} ${unit}`} tone="green" />
        </Section>

        <Section title="INFORMATION">
          <Row label="Type" value={title} />
          <Row label="Currency" value={currencyLabel} />
          <Row label={isCrypto ? "Network" : "Operator"} value={isCrypto ? (tx.network || tx.method) : tx.method.toUpperCase()} />
          <Row label="Country" value={tx.countryName || "Cameroon"} />
          <Row label="Provider" value={tx.provider === "saaspay" ? "Saaspay.me (backup)" : "Ashtechpay"} />
          {tx.providerFallback && <Row label="Routing" value="Fallback used" />}
          {tx.recipientName && !isCrypto && <Row label="Recipient" value={tx.recipientName} />}
          <Row label={isCrypto ? "Wallet address" : "Recipient phone"} value={isCrypto ? (tx.walletAddress || tx.depositAddress || tx.counterparty || "—") : (tx.counterparty || "—")} />
        </Section>

        <Section title="BALANCE HISTORY">
          <Row label={`Solde avant (${currencyLabel})`} value={`${formatAmount(balanceBefore)} ${unit}`} />
          <Row label={`Solde après (${currencyLabel})`} value={`${formatAmount(balanceAfter)} ${unit}`} />
          <Row label="Created at" value={createdLabel} />
          {!failed && !pending && <Row label="Last updated" value={updatedLabel} />}
        </Section>
      </div>

    </div>
  );
}
