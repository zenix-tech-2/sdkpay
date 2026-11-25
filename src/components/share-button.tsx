"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export function ReferralCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold to-gold2 text-[13.5px] font-extrabold text-navy2 shadow transition hover:brightness-105"
    >
      {copied ? <Check size={17} strokeWidth={3} /> : <Copy size={17} />} {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        if (typeof navigator !== "undefined" && navigator.share) {
          try { await navigator.share({ title, text, url }); return; } catch { /* dismissed */ }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[13.5px] font-bold text-slate-700 transition hover:border-slate-300"
    >
      {copied ? <Check size={17} className="text-emerald-600" /> : <Share2 size={17} />} {copied ? "Copied" : "Share"}
    </button>
  );
}
