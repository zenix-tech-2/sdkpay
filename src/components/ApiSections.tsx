"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Cloud, Code2, Copy, ExternalLink, Eye, EyeOff, Globe2, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";

function ApiIllustration({ small = false }: { small?: boolean }) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center rounded-[18px] bg-[#e7efff] ${small ? "h-[86px] w-[86px]" : "h-[110px] w-[110px]"}`}>
      <span className="flex h-[58%] w-[68%] items-center justify-center rounded-[10px] border border-dashed border-[#a9bce6] bg-white/50"><Cloud size={small ? 28 : 36} className="text-[#5b8def]" /></span>
      <span className="absolute bottom-[18%] right-[16%] flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-white bg-[#ffb800] text-[8px] font-black text-white shadow"><Code2 size={15} /></span>
    </span>
  );
}

function Skeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
}

type ProviderStatus = {
  primary: { configured: boolean; baseUrl: string };
  backup: { configured: boolean; baseUrl: string };
  routing: { mobileMoneyPrimary: string; mobileMoneyFallback: string; fallbackCondition: string; cryptoProvider: string };
  environment: string;
};

export function ApiHubSection() {
  const { data } = useDashboard();
  if (!data) return <Skeleton />;
  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">API &amp; Integrations</h1>
      <p className="mt-1 text-[14px] text-[#6d7d9e]">Choose how you want to collect payments.</p>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3"><span className="flex h-[70px] w-[70px] items-center justify-center rounded-[16px] bg-[#fff5d9] text-[#e5a300]"><CreditCardGlyph /></span><span className="rounded-full bg-[#e3f6eb] px-3 py-1 text-[11px] font-extrabold text-[#218c55]">Recommended</span></div>
        <h2 className="font-display mt-5 text-[23px] font-extrabold text-[#111b36]">Hosted Checkout</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6d7d9e]">Create a payment link and let SDK Pay host a ready-to-use checkout page for your customers.</p>
        <Link href="/dashboard/links" className="mt-5 inline-flex items-center gap-2 rounded-[12px] border border-[#dce5f3] px-4 py-3 text-[14px] font-bold text-[#17213d]">Explore Hosted Checkout <ArrowRight size={16} /></Link>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <ApiIllustration />
        <h2 className="font-display mt-5 text-[25px] font-extrabold text-[#111b36]">Direct API</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6d7d9e]">Integrate payments directly into your application with your own screens and your own customer experience.</p>
        <div className="mt-5 space-y-3">
          {["Full control over the payment flow", "Mobile Money and crypto APIs", "Documentation, examples and webhooks"].map((item) => (
            <p key={item} className="flex items-start gap-3 text-[15px] font-semibold text-[#17213d]"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#e5a300]" /> {item}</p>
          ))}
        </div>
        <Link href="/dashboard/api/direct" className="brand-btn mt-6 flex h-[58px] items-center justify-center gap-2 rounded-[14px] text-[16px]">Explore Direct API <ArrowRight size={18} /></Link>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <Globe2 size={24} className="mt-1 shrink-0 text-[#5b8def]" />
        <p className="text-[15px] leading-relaxed text-[#5d739c]">Need help choosing? Hosted Checkout is recommended when you want to redirect customers quickly. Direct API is best for teams that want to customize every step.</p>
      </div>
    </div>
  );
}

function CreditCardGlyph() {
  return <span className="text-[28px]">💳</span>;
}

export function DirectApiSection() {
  const { data, refresh } = useDashboard();
  const [revealed, setRevealed] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  useEffect(() => {
    fetch("/api/providers/status").then((res) => res.json()).then(setProviderStatus).catch(() => setProviderStatus(null));
  }, []);
  if (!data) return <Skeleton />;

  const apiKey = data.user.apiKey;
  const masked = apiKey.startsWith("ak_") ? `${apiKey.slice(0, 8)}${"•".repeat(10)}...` : "ak_8e7c4••••••••...";

  function copy(text: string, key: string) {
    void navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  }

  async function regenerate() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/api-key/regenerate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setMessage(json.error ?? "Impossible de régénérer la clé"); return; }
      await refresh();
      setRevealed(true);
      setMessage("✓ New API key generated. The previous key is now invalid.");
    } catch { setMessage("Impossible de contacter le serveur"); }
    finally { setBusy(false); }
  }

  async function showSecret() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/webhook-secret", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setMessage(json.error ?? "Impossible de générer le secret"); return; }
      setSecret(json.secret);
      setSecretRevealed(true);
      await refresh();
    } catch { setMessage("Impossible de contacter le serveur"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/dashboard/api" className="flex items-center gap-2 text-[14px] font-semibold text-[#6d7d9e]"><ArrowLeft size={18} /> Back</Link>
      <div className="mt-6 flex items-start gap-4"><ApiIllustration small /><div><h1 className="font-display text-[30px] font-extrabold text-[#111b36] sm:text-[38px]">Direct API</h1><p className="mt-2 text-[15px] leading-relaxed text-[#6d7d9e]">Integrate Ashtech Pay directly into your application</p></div></div>

      <div className="mt-6 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><KeyRound size={21} className="text-[#e5a300]" /> Your API key</h2>
        <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[#dce5f3] bg-white px-4 py-4">
          <code className="min-w-0 flex-1 truncate text-[16px] font-bold text-[#25314d]">{revealed ? apiKey : masked}</code>
          <button onClick={() => setRevealed(!revealed)} className="text-[#6d7d9e]" aria-label="Afficher">{revealed ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          <button onClick={() => copy(apiKey, "key")} className="text-[#6d7d9e]" aria-label="Copier">{copied === "key" ? <Check size={20} /> : <Copy size={20} />}</button>
        </div>
        <div className="my-5 h-px bg-[#e5ebf5]" />
        <p className="text-[14px] leading-relaxed text-[#6d7d9e]">If you regenerate the key, the old one will be immediately invalidated.</p>
        <button onClick={() => void regenerate()} disabled={busy} className="mt-4 flex h-[54px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#dce5f3] bg-white text-[15px] font-bold text-[#d43838] disabled:opacity-60"><RefreshCw size={17} /> Regenerate</button>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><KeyRound size={21} className="text-[#e5a300]" /> Webhook secret</h2>
        <button onClick={() => void showSecret()} disabled={busy} className="brand-btn mt-4 flex h-[56px] items-center justify-center gap-2 rounded-[12px] text-[15px] disabled:opacity-60"><Eye size={18} /> Show or generate secret</button>
        {secretRevealed && (
          <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[#dce5f3] bg-[#f7f9fd] px-4 py-3"><code className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#25314d]">{secret}</code><button onClick={() => copy(secret, "secret")} className="text-[#6d7d9e]">{copied === "secret" ? <Check size={18} /> : <Copy size={18} />}</button></div>
        )}
      </div>

      <div className="mt-5 rounded-[20px] border border-[#bcd3f5] bg-[#f4f8ff] p-5 sm:p-6">
        <h2 className="text-[19px] font-extrabold text-[#17213d]">Quick example</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6d7d9e]">Use your key only from your server, in the Bearer header of your requests.</p>
        <Link href="/docs/direct" className="mt-4 inline-flex items-center gap-2 rounded-[12px] border border-[#c8d7f2] bg-white px-4 py-3 text-[14px] font-bold text-[#17213d]"><BookOpen size={17} /> Integration documentation</Link>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><ShieldCheck size={20} className="text-[#e5a300]" /> Provider routing</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] bg-[#f7f9fd] p-4"><p className="text-[11px] font-extrabold tracking-wider text-[#8b96b0]">MOBILE MONEY</p><p className="mt-1 text-[14px] font-extrabold text-[#17213d]">Ashtech Pay primary</p><p className="mt-1 text-[11px] font-semibold text-[#6d7d9e]">{providerStatus?.primary.configured ? "Live key" : "Demo mode"}</p></div>
          <div className="rounded-[14px] bg-[#f7f9fd] p-4"><p className="text-[11px] font-extrabold tracking-wider text-[#8b96b0]">BACKUP</p><p className="mt-1 text-[14px] font-extrabold text-[#17213d]">Saaspay.me</p><p className="mt-1 text-[11px] font-semibold text-[#6d7d9e]">{providerStatus?.backup.configured ? "Live key" : "Demo mode"}</p></div>
          <div className="rounded-[14px] bg-[#f7f9fd] p-4"><p className="text-[11px] font-extrabold tracking-wider text-[#8b96b0]">CRYPTO</p><p className="mt-1 text-[14px] font-extrabold text-[#17213d]">Ashtech Pay only</p><p className="mt-1 text-[11px] font-semibold text-[#6d7d9e]">No fallback</p></div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-[#6d7d9e]">{providerStatus?.routing.fallbackCondition ?? "Country or operator unavailable on Ashtechpay"} → Saaspay.me Direct API. Environment: {providerStatus?.environment ?? "demo"}.</p>
        <a href="https://doc.ashtechpay.com" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#e5a300]">Official Ashtech Pay docs <ExternalLink size={14} /></a>
      </div>
      {message && <p className="mt-4 rounded-lg bg-[#e3f6eb] px-3 py-2 text-[12px] font-bold text-[#218c55]">{message}</p>}
    </div>
  );
}
