"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CodeXml, KeyRound, Eye, EyeOff, Copy, Check, RefreshCw, Webhook, Loader2, BookOpen } from "lucide-react";

const GOLD = "#f0a500";

function ProvidersCard() {
  const [data, setData] = useState<{
    mode: string;
    providers: { name: string; label: string; role: string; configured: boolean; sandbox: boolean; coverage: { countries: string[] } }[];
    rules: string[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/providers/status")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  return (
    <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
      <p className="text-[19.5px] font-bold text-slate-900">Payment providers</p>
      <p className="text-[12.5px] font-medium text-slate-500">Routing mode: <span className="font-extrabold text-slate-700">{data.mode}</span></p>
      <div className="mt-3 space-y-2.5">
        {data.providers.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5">
            <span className={`h-3 w-3 shrink-0 rounded-full ${p.configured ? "bg-green-500" : "bg-slate-300"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold">{p.label}</p>
              <p className="truncate text-[10.5px] font-medium text-slate-400">{p.role} • {p.coverage.countries.length} countries</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${p.configured ? (p.sandbox ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700") : "bg-slate-100 text-slate-500"}`}>
              {p.configured ? (p.sandbox ? "SANDBOX" : "LIVE") : "DEMO"}
            </span>
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.rules.map((r) => (
          <li key={r} className="flex items-start gap-2 text-[11px] font-medium text-slate-500">
            <Check size={12} className="mt-0.5 shrink-0 text-green-500" /> {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DirectApiPage() {
  const [masked, setMasked] = useState<string | null>(null);
  const [fullKey, setFullKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyMsg, setKeyMsg] = useState("");
  const [copied, setCopied] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  // webhook
  const [whMasked, setWhMasked] = useState<string | null>(null);
  const [whFull, setWhFull] = useState("");
  const [whShow, setWhShow] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whUrlSaved, setWhUrlSaved] = useState(false);
  const [whLoading, setWhLoading] = useState(false);

  async function loadKey() {
    const r = await fetch("/api/api-keys");
    const d = await r.json();
    const direct = (d.keys ?? []).find((k: { name: string }) => k.name === "Direct API");
    setMasked(direct ? `ak_••••••••${direct.keyPrefix}` : null);
  }

  async function loadWebhook() {
    const r = await fetch("/api/webhook");
    const d = await r.json();
    setWhMasked(d.masked ?? null);
    setWhUrl(d.url ?? "");
  }

  useEffect(() => {
    loadKey();
    loadWebhook();
  }, []);

  async function regenerate() {
    if (!confirm("Regenerate your API key? The old one will be immediately invalidated.")) return;
    setRegenLoading(true);
    setKeyMsg("");
    try {
      const r = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Direct API", prefix: "ak", replaceName: "Direct API" }),
      });
      const d = await r.json();
      if (d.ok) {
        setFullKey(d.key);
        setShowKey(true);
        setKeyMsg("New key generated — copy it now, it won't be shown again.");
        loadKey();
      }
    } finally {
      setRegenLoading(false);
    }
  }

  function copy(text: string, k: string) {
    navigator.clipboard.writeText(text);
    setCopied(k);
    setTimeout(() => setCopied(""), 1500);
  }

  async function genSecret() {
    setWhLoading(true);
    try {
      const r = await fetch("/api/webhook", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setWhFull(d.secret);
        setWhShow(true);
        loadWebhook();
      }
    } finally {
      setWhLoading(false);
    }
  }

  async function saveUrl() {
    await fetch("/api/webhook", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: whUrl }),
    });
    setWhUrlSaved(true);
    setTimeout(() => setWhUrlSaved(false), 1500);
  }

  const keyDisplay = showKey && fullKey ? fullKey : masked ?? "No key yet — generate one below";

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/api" className="flex items-center gap-1.5 text-[16px] font-medium text-slate-500">
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="mt-3 flex items-center gap-4">
        <span className="flex h-[74px] w-[84.5px] shrink-0 items-center justify-center rounded-[28px] bg-blue-50">
          <CodeXml size={39} className="text-[#f0a500]" strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Direct API</h1>
          <p className="text-[16px] font-medium leading-snug text-slate-500">
            Integrate SDK Pay directly into your application
          </p>
        </div>
      </div>

      {/* API key */}
      <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2.5 text-[21px] font-bold text-slate-900">
          <KeyRound size={21} className="text-[#f0a500]" /> Your API key
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-slate-300 px-5 py-[16px]">
          <span className="min-w-0 flex-1 truncate font-mono text-[16.5px] font-medium text-slate-900">{keyDisplay}</span>
          <button
            onClick={() => {
              if (!fullKey) {
                setKeyMsg("The full key is only shown once, right after generation. Regenerate to get a new one.");
                return;
              }
              setShowKey(!showKey);
            }}
            className="shrink-0 p-1 text-slate-900"
            aria-label="toggle visibility"
          >
            {showKey && fullKey ? <EyeOff size={21} /> : <Eye size={21} />}
          </button>
          <button
            onClick={() => {
              if (fullKey) copy(fullKey, "key");
              else setKeyMsg("Nothing to copy yet — regenerate to get a new key.");
            }}
            className="shrink-0 p-1 text-slate-900"
            aria-label="copy"
          >
            {copied === "key" ? <Check size={21} className="text-green-500" /> : <Copy size={21} />}
          </button>
        </div>
        {keyMsg && <p className="mt-2.5 text-[12.5px] font-bold text-slate-600">{keyMsg}</p>}
        <div className="my-4 border-t border-slate-200" />
        <p className="text-[16px] font-medium leading-snug text-slate-500">
          If you regenerate the key, the old one will be immediately invalidated.
        </p>
        <button
          onClick={regenerate}
          disabled={regenLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-slate-300 bg-white py-3.5 text-[16.5px] font-medium text-red-700 disabled:opacity-60"
        >
          {regenLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          Regenerate
        </button>
      </div>

      {/* webhook secret */}
      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2.5 text-[21px] font-bold text-slate-900">
          <KeyRound size={21} className="text-[#f0a500]" /> Webhook secret
        </p>
        {whShow && whFull ? (
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-[18px] border border-slate-300 px-5 py-[14px]">
              <span className="min-w-0 flex-1 truncate font-mono text-[14px] font-medium">{whFull}</span>
              <button onClick={() => copy(whFull, "wh")} className="shrink-0">
                {copied === "wh" ? <Check size={19} className="text-green-500" /> : <Copy size={19} />}
              </button>
            </div>
            <p className="mt-2 text-[12px] font-bold text-slate-600">Copy it now — shown only once. Use it to verify X-SDK-Signature headers.</p>
          </div>
        ) : whMasked ? (
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-[18px] bg-slate-100 px-5 py-[14px]">
              <span className="min-w-0 flex-1 truncate font-mono text-[14px] font-medium text-slate-500">{whMasked}</span>
            </div>
            <button onClick={genSecret} disabled={whLoading} className="mt-3 text-[13px] font-extrabold text-red-600 hover:underline disabled:opacity-60">
              {whLoading ? "Generating..." : "Generate a new secret"}
            </button>
          </div>
        ) : (
          <button
            onClick={genSecret}
            disabled={whLoading}
            className="mt-4 flex items-center gap-2.5 rounded-[14px] px-6 py-3.5 text-[16.5px] font-bold text-white disabled:opacity-60"
            style={{ background: GOLD }}
          >
            {whLoading ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
            Show or generate secret
          </button>
        )}
      </div>

      {/* webhook url */}
      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2.5 text-[21px] font-bold text-slate-900">
          <Webhook size={21} className="text-[#f0a500]" /> Webhook URL
        </p>
        <p className="mt-1 text-[13px] font-medium text-slate-500">Receive payment.success / payment.failed events in real time.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={whUrl}
            onChange={(e) => setWhUrl(e.target.value)}
            placeholder="https://monsite.com/webhooks/sdkpay"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-mono text-[11.5px] font-bold"
          />
          <button onClick={saveUrl} className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-[12px] font-extrabold text-white">
            {whUrlSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* providers */}
      <ProvidersCard />

      {/* quick example */}
      <div className="mt-4 rounded-[24px] border border-slate-200 bg-[#eef4ff] p-6">
        <p className="text-[19.5px] font-bold text-slate-900">Quick example</p>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          Use your key only from your server, in the Authorization header.
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl bg-[#0d1117] p-4 font-mono text-[11px] leading-relaxed">
          <p><span className="text-sky-300">POST</span> <span className="text-green-300">https://sdkpay.com/v1/collect</span></p>
          <pre className="mt-1 whitespace-pre-wrap text-slate-300">{`Authorization: Bearer ak_••••••

{
  "amount": 5000,
  "currency": "XAF",
  "phone": "237600000000",
  "operator": "MTN Money"
}`}</pre>
        </div>
        <Link
          href="/docs"
          className="mt-4 inline-flex items-center gap-2.5 rounded-[14px] border border-slate-300 bg-white px-6 py-3 text-[16.5px] font-medium text-slate-900"
        >
          <BookOpen size={19} /> Integration documentation
        </Link>
      </div>
    </div>
  );
}
