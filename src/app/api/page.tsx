import Link from "next/link";
import { ChevronLeft, CloudCog, BookOpen, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import Gate from "@/components/gate";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ApiKeyCard, WebhookSecretCard } from "@/components/api-cards";
import { CopyButton } from "@/components/bits";

export default async function ApiPage() {
  const user = await requireUser();
  const [row] = await db.select().from(apiKeys).where(eq(apiKeys.userId, user.id)).limit(1);
  const apiKey = row?.apiKey ?? "ak_not_generated_yet";

  // provider configuration status (values themselves never leave the server)
  const ashtechOn = !!process.env.ASHTECH_API_KEY;
  const ashtechUser = !!process.env.ASHTECH_USER_ID;
  const ashtechHook = !!process.env.ASHTECH_WEBHOOK_SECRET;
  const saspayOn = !!process.env.SASPAY_API_KEY;
  const saspayHook = !!process.env.SASPAY_WEBHOOK_SECRET;
  const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");
  const ashtechHookUrl = appUrl ? `${appUrl}/api/webhooks/ashtech` : "https://your-domain.com/api/webhooks/ashtech";
  const saspayHookUrl = appUrl ? `${appUrl}/api/webhooks/saspay` : "https://your-domain.com/api/webhooks/saspay";

  const docSections = [
    { group: "Démarrer", items: ["Bienvenue sur SDK Pay", "Démarrage rapide", "Authentification"] },
    { group: "Checkout", items: ["Hosted Checkout par redirection"] },
    { group: "Direct API", items: ["Direct API", "Mobile Money", "Flux de paiement Mobile Money", "Paiements crypto", "Wallets et conversions", "Payouts", "Webhooks"] },
    { group: "Référence", items: ["GET /v1/countries", "GET /v1/transaction/:id", "GET /v1/fees", "Erreurs et statuts HTTP"] },
    { group: "Ressources", items: ["Sandbox et tests", "Sécurité"] },
  ];

  return (
    <Gate>
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-ink"><ChevronLeft size={16} /> Back</Link>

      <div className="mt-3 flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500"><CloudCog size={30} strokeWidth={1.7} /></span>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Direct API</h1>
          <p className="text-[13px] text-slate-500">Integrate SDK Pay directly into your application</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ApiKeyCard apiKey={apiKey} />
        <WebhookSecretCard />
        {/* quick example */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 lg:col-span-2">
          <p className="text-[14.5px] font-extrabold text-navy2">Quick example</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">Use your key only from your server, in the Bearer header of your requests.</p>
          <Link href="/docs" className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-gold"><BookOpen size={16} /> Full developer documentation</Link>
        </div>
      </div>

      {/* payment providers — primary / backup routing */}
      <div id="providers" className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">Payment providers</p>
            <p className="mt-0.5 text-[12.5px] text-slate-500">Every Mobile Money collection and payout tries <b>AshTech Pay Direct API</b> first; if the operator or country is unavailable there, the call fails over automatically to <b>SasPay</b>. No hosted checkout — direct USSD push only.</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Failover: <b className="text-ink">AshTech → SasPay</b></span>
        </div>

        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {/* PRIMARY — AshTech */}
          <div className="rounded-2xl border border-navy/15 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2.5 text-[14.5px] font-extrabold text-ink"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-[10px] font-black text-gold">AT</span> AshTech Pay <span className="rounded-md bg-navy px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-gold">Primary</span></p>
              {ashtechOn ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600">Connected</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700">Not configured</span>}
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              {[["ASHTECH_API_KEY", ashtechOn], ["ASHTECH_USER_ID", ashtechUser], ["ASHTECH_WEBHOOK_SECRET", ashtechHook]].map(([k, ok]) => (
                <div key={k as string} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5"><dt className="font-mono text-[11px] text-slate-500">{k as string}</dt><dd className={`text-[11px] font-extrabold ${ok ? "text-emerald-600" : "text-amber-600"}`}>{ok ? "Set" : "Missing"}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">Webhook endpoint (notify_url)</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><code className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-600">{ashtechHookUrl}</code><CopyButton text={ashtechHookUrl} label="Copy AshTech webhook URL" /></div>
            <p className="mt-2 text-[11px] text-slate-400">POST /v1/collect · GET /v1/transaction/:id · POST /v1/payouts/mobile-money · POST /v1/crypto/collect</p>
          </div>

          {/* BACKUP — SasPay */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2.5 text-[14.5px] font-extrabold text-ink"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-[10px] font-black text-white">SP</span> SasPay <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-violet-700">Backup</span></p>
              {saspayOn ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600">Connected</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700">Not configured</span>}
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              {[["SASPAY_API_KEY", saspayOn], ["SASPAY_WEBHOOK_SECRET", saspayHook]].map(([k, ok]) => (
                <div key={k as string} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5"><dt className="font-mono text-[11px] text-slate-500">{k as string}</dt><dd className={`text-[11px] font-extrabold ${ok ? "text-emerald-600" : "text-amber-600"}`}>{ok ? "Set" : "Missing"}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">Webhook endpoint</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><code className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-600">{saspayHookUrl}</code><CopyButton text={saspayHookUrl} label="Copy SasPay webhook URL" /></div>
            <p className="mt-2 text-[11px] text-slate-400">POST /payments/softpay/ · GET /payments/:id/verify/ · GET /countries/ — auto-used when AshTech can&apos;t serve the operator/country</p>
          </div>
        </div>
      </div>

      {/* docs */}
      <div id="docs" className="mt-6 scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <p className="text-[15px] font-extrabold text-ink">SDK Pay API — Documentation</p>
          <p className="text-[12px] text-slate-500">api.sdkpay.com · v1 · updated November 2026</p>
        </div>
        <div className="grid md:grid-cols-[230px_1fr]">
          <nav className="border-b border-slate-100 p-4 md:border-b-0 md:border-r">
            {docSections.map((s) => (
              <div key={s.group} className="mb-3">
                <p className="px-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{s.group}</p>
                {s.items.map((item) => (
                  <p key={item} className={`mt-0.5 cursor-pointer rounded-lg px-2 py-1.5 text-[12px] font-medium ${item === "Direct API" ? "bg-amber-50 font-bold text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}>{item}</p>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-6">
            <p className="text-[19px] font-extrabold text-ink">Create a Mobile Money payment</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">POST <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11.5px]">/v1/payments</code> — initiate a collection. The customer receives a USSD/PIN prompt; your server receives a signed webhook on every status change.</p>
            <pre className="slim-scroll mt-4 overflow-x-auto rounded-2xl bg-[#0e1a38] p-4 text-[11px] leading-relaxed text-sky-100"><code>{`curl -X POST https://api.sdkpay.com/v1/payments \\
  -H "Authorization: Bearer ak_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "operator": "ORANGE_MONEY",
    "phone": "690326932",
    "site_reference": "IB-MWMNN1NW-IWLPA"
  }'`}</code></pre>
            <p className="mt-3 text-[12px] font-bold uppercase tracking-widest text-slate-400">Response · 201 Created</p>
            <pre className="slim-scroll mt-1.5 overflow-x-auto rounded-2xl bg-[#0e1a38] p-4 text-[11px] leading-relaxed text-emerald-100"><code>{`{
  "reference": "ASH-D-30QJ19K9D9KIH4",
  "status": "pending",
  "amount": 5000,
  "fees": 200,
  "net": 4800,
  "created_at": "2026-11-18T19:47:00Z"
}`}</code></pre>
            <ul className="mt-4 space-y-1.5 text-[12.5px] text-slate-600">
              {["Webhooks are HMAC-SHA256 signed with your webhook secret", "Retries: 3 attempts with exponential backoff", "Sandbox keys are prefixed ak_test_ and never move real funds"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />{t}</li>
              ))}
            </ul>
            <a href="mailto:developers@sdkpay.com" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:underline">developers@sdkpay.com <ChevronRight size={15} /></a>
          </div>
        </div>
      </div>

      {/* chooser hint */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-[12px] leading-relaxed text-slate-500">
        <Info size={17} className="mt-0.5 shrink-0 text-slate-400" />
        <p><b className="text-ink">Need help choosing?</b> Hosted Checkout is recommended when you want to redirect customers quickly. Direct API is best for teams that want to customize every step.</p>
      </div>
    </Gate>
  );
}
