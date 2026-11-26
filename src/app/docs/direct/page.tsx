"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Code2, ExternalLink, Monitor, Moon, MoreVertical, ShieldCheck, Sun, X } from "lucide-react";
import { BrandMark } from "@/components/Logo";

const menu = [
  { section: "Démarrer", items: ["Bienvenue sur AshTech Pay", "Démarrage rapide", "Authentification"] },
  { section: "Checkout", items: ["Hosted Checkout par redirection"] },
  { section: "Integration", items: ["AshTech Pay AI Integration Skills"] },
  { section: "Direct API", items: ["Direct API", "Mobile Money", "Flux de paiement Mobile Money", "Paiements crypto", "Wallets et conversions", "Payouts", "Webhooks"] },
  { section: "Référence", items: ["GET /v1/countries", "GET /v1/transaction/:id", "GET /v1/fees", "Erreurs et statuts HTTP"] },
  { section: "Ressources", items: ["Sandbox et tests", "Sécurité"] },
];

type ProviderStatus = {
  primary: { configured: boolean; baseUrl: string; collectPath: string; cryptoPath: string };
  backup: { configured: boolean; baseUrl: string; collectPath: string };
  routing: { mobileMoneyPrimary: string; mobileMoneyFallback: string; fallbackCondition: string; cryptoProvider: string };
  supportedCountries: string[];
  supportedOperators: string[];
  environment: string;
};

export default function DirectDocsPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [active, setActive] = useState("Direct API");
  const [status, setStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    fetch("/api/providers/status").then((res) => res.json()).then(setStatus).catch(() => setStatus(null));
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fd]">
      <header className="flex h-[92px] items-center gap-3 bg-[#ffb800] px-5 text-[#17213d]">
        <button onClick={() => router.back()} aria-label="Close"><X size={28} strokeWidth={2.5} /></button>
        <div className="min-w-0 flex-1"><p className="truncate text-[16px] font-bold">Direct API - AshTech Pay Developers</p><p className="truncate text-[12px] font-medium">doc.ashtechpay.com</p></div>
        <button onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Menu"><MoreVertical size={24} /></button>
      </header>

      <div className="relative min-h-[calc(100vh-92px)]">
        {drawerOpen && <button className="absolute inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />}
        {drawerOpen && (
          <aside className="motion-slide absolute left-0 top-0 z-20 h-full w-[86%] max-w-[390px] overflow-y-auto bg-white px-6 pb-10 pt-7 shadow-2xl lg:w-[360px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><BrandMark size={54} /><span className="relative leading-none"><span className="text-[26px] font-extrabold tracking-[-0.05em] text-[#17213d]">Ash<span className="text-[#22b8e6]">Tech</span></span><span className="absolute -bottom-[14px] right-0 text-[12px] font-extrabold text-[#ffb800]">Pay</span></span></div>
              <div className="flex items-center gap-1 rounded-full border border-[#dce5f3] p-1">
                {([["system", Monitor], ["light", Sun], ["dark", Moon]] as const).map(([value, Icon]) => <button key={value} onClick={() => setTheme(value)} className={`flex h-8 w-8 items-center justify-center rounded-full ${theme === value ? "bg-[#eef2fa] text-[#17213d]" : "text-[#8b96b0]"}`}><Icon size={16} /></button>)}
              </div>
            </div>
            <nav className="mt-12 space-y-7">
              {menu.map((group) => (
                <div key={group.section}><p className="text-[16px] font-extrabold text-[#17213d]">{group.section}</p><div className="mt-3 space-y-1">{group.items.map((item) => <button key={item} onClick={() => setActive(item)} className={`block w-full rounded-[10px] px-3 py-2.5 text-left text-[15px] ${active === item ? "bg-[#fff6df] font-bold text-[#e5a300]" : "text-[#17213d] hover:bg-[#f5f8ff]"}`}>{item}</button>)}</div></div>
              ))}
            </nav>
          </aside>
        )}

        <section className="motion-up px-5 py-8 lg:ml-[380px] lg:px-10">
          <div className="mx-auto max-w-[820px]">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[12px] font-extrabold tracking-[.15em] text-[#8b96b0]">DIRECT API</p><h1 className="font-display mt-2 text-[32px] font-extrabold text-[#111b36] sm:text-[42px]">{active}</h1></div><a href="https://doc.ashtechpay.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[12px] border border-[#dce5f3] bg-white px-4 py-3 text-[13px] font-bold text-[#17213d]">Official docs <ExternalLink size={15} /></a></div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6d7d9e]">SDK Pay uses Ashtech Pay Direct API as the primary payment rail. SasPay.me Direct API is used only as a backup when a country or Mobile Money operator is unavailable on Ashtech Pay. Crypto payments always stay on Ashtech Pay Direct API.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[18px] border border-[#dce5f3] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff5d9] text-[#e5a300]"><Code2 size={20} /></span><h2 className="mt-4 text-[16px] font-extrabold text-[#17213d]">Mobile Money</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">Primary: Ashtech Pay <code className="font-bold">/v1/collect</code>. Backup: SasPay.me <code className="font-bold">/payments/softpay/</code>.</p></div>
              <div className="rounded-[18px] border border-[#dce5f3] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#1d63b8]"><ShieldCheck size={20} /></span><h2 className="mt-4 text-[16px] font-extrabold text-[#17213d]">Fallback rule</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">{status?.routing.fallbackCondition ?? "Country or operator unavailable on Ashtechpay"} → Saaspay.me.</p></div>
              <div className="rounded-[18px] border border-[#dce5f3] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f8ee] text-[#12a150]"><CheckCircle2 size={20} /></span><h2 className="mt-4 text-[16px] font-extrabold text-[#17213d]">Crypto</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">Always Ashtech Pay <code className="font-bold">/v1/crypto/collect</code>. No Saaspay fallback.</p></div>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#dce5f3] bg-white p-5">
              <h2 className="text-[18px] font-extrabold text-[#17213d]">Runtime configuration</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] bg-[#f7f9fd] p-4"><p className="text-[12px] font-bold text-[#8b96b0]">ASHTECHPAY DIRECT</p><p className="mt-1 text-[15px] font-extrabold text-[#17213d]">{status?.primary.configured ? "Live key configured" : "Demo mode"}</p><p className="mt-1 break-all text-[11px] text-[#6d7d9e]">{status?.primary.baseUrl ?? "https://www.ashtechpay.com"}{status?.primary.collectPath ?? "/v1/collect"}</p></div>
                <div className="rounded-[12px] bg-[#f7f9fd] p-4"><p className="text-[12px] font-bold text-[#8b96b0]">SAASPAY.ME BACKUP</p><p className="mt-1 text-[15px] font-extrabold text-[#17213d]">{status?.backup.configured ? "Live key configured" : "Demo mode"}</p><p className="mt-1 break-all text-[11px] text-[#6d7d9e]">{status?.backup.baseUrl ?? "https://api.saspay.me/api/v1"}{status?.backup.collectPath ?? "/payments/softpay/"}</p></div>
              </div>
              <p className="mt-4 text-[12px] text-[#8b96b0]">Environment: {status?.environment ?? "demo"} · Ashtech catalog: {(status?.supportedCountries ?? []).join(", ")}</p>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#bcd3f5] bg-[#f4f8ff] p-5">
              <h2 className="text-[18px] font-extrabold text-[#17213d]">Authentication</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6d7d9e]">Use the <code className="font-bold">ak_...</code> Direct API key only from your server, in the Bearer header. Never expose provider keys in client-side code.</p>
              <pre className="code-window mt-4 overflow-x-auto rounded-[14px] p-4 text-[11px] leading-relaxed"><code>{`Authorization: Bearer ak_xxxxxxxxxxxxxxxx
Content-Type: application/json

POST /v1/collect
{
  "amount": 2500,
  "currency": "XAF",
  "country_code": "CM",
  "operator": "MTN Money",
  "phone": "23700000000",
  "reference": "ORDER-123"
}`}</code></pre>
              <a href="https://docs.saspay.me/quickstart" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#e5a300]">Saaspay.me backup docs <ArrowRight size={15} /></a>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#dce5f3] bg-white p-5">
              <h2 className="text-[18px] font-extrabold text-[#17213d]">Reference endpoints</h2>
              <div className="mt-3 space-y-2 text-[13px] text-[#3c4966]">{["GET /v1/countries", "GET /v1/transaction/:id", "GET /v1/fees", "POST /v1/crypto/collect", "POST /v1/collect"].map((endpoint) => <div key={endpoint} className="rounded-[10px] bg-[#f7f9fd] px-3 py-2 font-mono">{endpoint}</div>)}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
