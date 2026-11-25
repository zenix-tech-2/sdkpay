"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw, KeyRound, Loader2 } from "lucide-react";
import { regenerateApiKey, revealWebhookSecret } from "@/lib/actions";

export function ApiKeyCard({ apiKey }: { apiKey: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const masked = `${apiKey.slice(0, 10)}${"•".repeat(10)}${apiKey.slice(-4)}`;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-[15px] font-extrabold text-ink"><KeyRound size={17} className="text-amber-500" /> Your API key</p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold text-ink">{visible ? apiKey : masked}</code>
        <button onClick={() => setVisible(!visible)} aria-label={visible ? "Hide key" : "Show key"} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        <button onClick={async () => { await navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }} aria-label="Copy key" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">{copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}</button>
      </div>
      <p className="mt-4 border-t border-slate-100 pt-4 text-[13px] leading-relaxed text-slate-500">If you regenerate the key, the old one will be immediately invalidated.</p>
      <button
        onClick={() => { if (confirm("Regenerate the API key? The current key stops working immediately.")) start(() => regenerateApiKey()); }}
        disabled={pending}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-[14px] font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />} Regenerate
      </button>
    </div>
  );
}

export function WebhookSecretCard() {
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-[15px] font-extrabold text-ink"><KeyRound size={17} className="text-amber-500" /> Webhook secret</p>
      {secret ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <code className="min-w-0 flex-1 truncate font-mono text-[12px] font-semibold text-amber-900">{secret}</code>
          <button onClick={async () => { await navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }} aria-label="Copy secret" className="rounded-lg p-2 text-amber-700 transition hover:bg-amber-100">{copied ? <Check size={17} /> : <Copy size={17} />}</button>
        </div>
      ) : (
        <button onClick={() => start(async () => setSecret(await revealWebhookSecret()))} disabled={pending} className="mt-3 flex h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-gold to-gold2 px-5 text-[14px] font-extrabold text-navy2 shadow transition hover:brightness-105 disabled:opacity-50">
          {pending ? <Loader2 size={17} className="animate-spin" /> : <Eye size={17} />} Show or generate secret
        </button>
      )}
      <p className="mt-3 text-[11.5px] text-slate-400">Used to verify the <code className="font-mono">X-SDK-Signature</code> header on every webhook we send you. Keep it server-side.</p>
    </div>
  );
}
