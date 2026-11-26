"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Share2, Link2, Timer, ShieldCheck, Users } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface Ref {
  id: string;
  reward: number;
  status: string;
  createdAt: string;
  fullName: string | null;
}

export default function ReferralsPage() {
  const [code, setCode] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [feeUntil, setFeeUntil] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => {
        setCode(d.referralCode ?? "");
        setRefs(d.referrals ?? []);
      })
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setFeeUntil(d.user.reducedFeeUntil ?? null))
      .catch(() => {});
  }, []);

  const link = typeof window !== "undefined" && code ? `${window.location.origin}/register?ref=${code}` : "";
  const unlocked = feeUntil !== null && new Date(feeUntil).getTime() > Date.now();

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join SDK Pay", text: `Join SDK Pay with my code ${code} and pay online easily!`, url: link });
        return;
      } catch { /* dismissed */ }
    }
    copy();
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* personal link */}
      <div className="rounded-[26px] border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11.5px] font-bold tracking-[0.18em] text-slate-500">YOUR PERSONAL LINK</p>
          <span className="flex h-[47.5px] w-[47.5px] shrink-0 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50 text-[#f0a500]">
            <Link2 size={22.5} />
          </span>
        </div>
        <p className="mt-1 max-w-[260px] text-[20.5px] font-bold leading-snug text-slate-900">
          One link, one invited account.
        </p>
        <div className="mt-4 truncate rounded-[18px] border border-slate-300 px-5 py-4 font-mono text-[14.5px] font-medium text-slate-900">
          {link || "Loading..."}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={copy}
            className="flex items-center justify-center gap-2 rounded-[16px] py-3.5 text-[15px] font-bold text-white"
            style={{ background: "#f0a500" }}
          >
            {copied ? <Check size={16.2} /> : <Copy size={16.2} />} {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-2 rounded-[16px] border border-slate-300 bg-white py-3.5 text-[15px] font-medium text-slate-900"
          >
            <Share2 size={16.2} /> {shared ? "Copied!" : "Share"}
          </button>
        </div>
        {code && (
          <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
            Your code: <span className="font-extrabold tracking-[0.2em] text-slate-700">{code}</span>
          </p>
        )}
      </div>

      {/* reduced-fee period */}
      <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11.5px] font-bold tracking-[0.18em] text-slate-500">REDUCED-FEE PERIOD</p>
          <span className="flex h-[47.5px] w-[47.5px] shrink-0 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50 text-[#f0a500]">
            <Timer size={22.5} />
          </span>
        </div>
        <p className="mt-1 text-[20.5px] font-bold text-slate-900">
          {unlocked ? "Active" : "Not unlocked"}
        </p>
        <p className="mt-3 text-[14.5px] font-medium leading-relaxed text-slate-500">
          {unlocked && feeUntil
            ? `Your 50% fee discount is active until ${new Date(feeUntil).toLocaleDateString("en-US", { month: "long", day: "numeric" })} on eligible Mobile Money deposits and withdrawals.`
            : "The period starts when your invitee meets the requirements and their account is verified."}
        </p>
        <div className="mt-5 flex items-center gap-2.5 border-t border-slate-200 pt-4 text-[13.5px] font-medium text-slate-500">
          <ShieldCheck size={17.1} /> Program duration: 5 days
        </div>
      </div>

      {/* network */}
      <div className="mt-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white">
        <div className="p-6 pb-5">
          <p className="text-[11.5px] font-bold tracking-[0.18em] text-slate-500">YOUR NETWORK</p>
          <p className="mt-1 text-[20.5px] font-bold text-slate-900">Invited people</p>
          <p className="mt-1 text-[14.5px] font-medium text-slate-500">
            {refs.length} associated account{refs.length === 1 ? "" : "s"}
          </p>
        </div>
        {refs.length === 0 ? (
          <div className="border-t border-slate-200 p-10 text-center">
            <span className="mx-auto flex h-[60.5px] w-[60.5px] items-center justify-center rounded-3xl border border-yellow-200 bg-yellow-50 text-[#f0a500]">
              <Users size={27} />
            </span>
            <p className="mt-4 text-[16.5px] font-bold text-slate-900">Your network starts here</p>
          </div>
        ) : (
          <div className="border-t border-slate-200">
            {refs.map((r, i) => (
              <div key={r.id} className={`flex items-center gap-3 px-6 py-4 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-[13.5px] font-extrabold text-yellow-700">
                  {(r.fullName ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-extrabold">{r.fullName ?? "User"}</p>
                  <p className="text-[10.5px] font-medium text-slate-400">{timeAgo(r.createdAt)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {r.status === "paid" ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* offer */}
      <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
        <p className="text-[19px] font-bold leading-snug text-slate-900">Get 50% off your fees for 5 days!</p>
        <p className="mt-3 text-[14.5px] font-medium leading-relaxed text-slate-500">
          Get a 50% discount on fees for each eligible Mobile Money deposit and withdrawal for 5 days.
        </p>
        <p className="mt-4 text-[14.5px] font-medium leading-relaxed text-slate-500">
          This offer applies only to eligible Mobile Money transactions. It reduces transaction fees; it is not a
          cash payment. USDT transactions are not included.
        </p>
      </div>
    </div>
  );
}
