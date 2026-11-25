import { Section, H3, P, LI, UL, Code, Callout, DocTable, KV } from "@/components/docs/blocks";
import { ArrowRight, Bot, FileText, Braces, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="space-y-10">
      {/* ============ WELCOME ============ */}
      <Section id="welcome" eyebrow="SDK Pay · Developers" title="Integrate payments in an afternoon">
        <P>SDK Pay is one integration for everything a business in Africa sells or pays: <b>Mobile Money collection</b> (MTN, Orange Money, Wave, Airtel, Moov, Celtiis…), <b>USDT (Tron)</b>, <b>outbound payouts</b>, <b>payment links and QR codes</b>, and <b>instant SDK Pay → SDK Pay transfers</b> — backed by a Direct API with signed webhooks.</P>
        <P>Two rails sit behind our API. <b>AshTech Pay is the primary rail</b> (Direct API). <b>SasPay is the automatic backup</b>: if AshTech cannot serve an operator or a country, the same call is transparently retried on SasPay. You never re-architect, you never lose a sale — the router decides, your code doesn&apos;t.</P>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Zap, t: "Quickstart", d: "First collection in under 15 minutes.", href: "#quickstart" },
            { icon: Braces, t: "Direct API", d: "Full reference for collect, payouts & crypto.", href: "#direct-api" },
            { icon: Bot, t: "AI-ready", d: "llms.txt + AGENTS.md for coding assistants.", href: "#ai" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.t} href={c.href} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-md">
                <Icon size={19} className="text-amber-500" />
                <p className="mt-2 text-[13.5px] font-extrabold text-[#141B3D] transition group-hover:text-amber-700">{c.t}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{c.d}</p>
              </a>
            );
          })}
        </div>
        <KV k="Base URL" v={<code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[12px]">https://www.ashtechpay.com/v1</code>} />
        <KV k="Backup rail (automatic)" v={<code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[12px]">https://api.saspay.me/api/v1</code>} />
        <KV k="Auth header" v={<code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[12px]">Authorization: Bearer ak_live_…</code>} />
        <KV k="Content type" v="application/json" />
      </Section>

      {/* ============ QUICKSTART ============ */}
      <Section id="quickstart" eyebrow="Getting started" title="Quickstart — your first collection">
        <P>From zero to a real Mobile Money debit on your phone. You need an SDK Pay account (verified) and the Direct API key from your dashboard.</P>
        <H3>1. Get your keys</H3>
        <P>Dashboard → <b>API &amp; integrations → Direct API</b>. You get a key (<code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">ak_live_…</code>) and can reveal or generate a <b>webhook secret</b> (<code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">whsec_…</code>). Keep both server-side.</P>
        <H3>2. Load the live catalog</H3>
        <P>Operators and countries change — never hardcode them. Fetch the catalog and pick the operator&apos;s exact name:</P>
        <Code title="terminal" code={`curl https://www.ashtechpay.com/v1/countries \\
  -H "Authorization: Bearer ak_live_8e7c4f2a…"`} />
        <H3>3. Collect 500 FCFA — MTN Cameroon</H3>
        <Code title="terminal" code={`curl -X POST https://www.ashtechpay.com/v1/collect \\
  -H "Authorization: Bearer ak_live_8e7c4f2a…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "usr_your_merchant_id",
    "amount": 500,
    "currency": "XAF",
    "country_code": "CM",
    "operator": "MTN Money",
    "phone": "651010478",
    "reference": "ORDER-1234",
    "notify_url": "https://api.you.app/webhooks/ashtech"
  }'`} />
        <Callout tone="tip">The customer receives a USSD PIN prompt on their phone. The payment is asynchronous — <b>never</b> treat the HTTP response as proof of payment. Wait for the webhook, or call <code className="rounded bg-white px-1 font-mono">GET /v1/transaction/ASH-D-…</code>.</Callout>
        <H3>4. Confirm the payment</H3>
        <Code title="terminal" code={`curl "https://www.ashtechpay.com/v1/transaction/ASH-D-30QJ19K9?user_id=usr_your_merchant_id" \\
  -H "Authorization: Bearer ak_live_8e7c4f2a…"`} />
        <Code title="response · 200 OK" code={`{
  "id": "ASH-D-30QJ19K9D9KIH4",
  "status": "completed",
  "amount": 13800,
  "credited_amount": 13248,
  "provider_fee_amount": 0,
  "ashtech_fee_amount": 552,
  "total_fee_amount": 552,
  "provider_tax_rate": 0,
  "provider_tax_amount": 0
}`} />
        <Callout tone="info" title="Fallover built-in">If the operator is not available on the AshTech catalog for a country, SDK Pay transparently retries the same request on <b>SasPay</b> (network code resolved live from <code className="rounded bg-white px-1 font-mono">/countries/</code>). To the customer it is indistinguishable; to your logs it appears as <code className="rounded bg-white px-1 font-mono">provider: &quot;saspay&quot;</code>.</Callout>
      </Section>

      {/* ============ AUTHENTICATION ============ */}
      <Section id="authentication" eyebrow="Getting started" title="Authentication">
        <P>All Direct API routes use a <b>Bearer token</b> in the <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">Authorization</code> header. Keys are bound to your merchant profile; profile-scoped routes also require your <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">user_id</code>.</P>
        <DocTable
          head={["Key", "Prefix", "Scope", "Where to keep it"]}
          rows={[
            [<code key="a" className="font-mono">Direct API key</code>, <code key="b" className="font-mono">ak_live_ / ak_test_</code>, "Collect, crypto, payouts, wallets, transaction status, countries, fees", "Server environment variables only"],
            [<code key="c" className="font-mono">Webhook secret</code>, <code key="d" className="font-mono">whsec_…</code>, "Verifies X-Ashtech-* webhook signatures", "Server environment variables only"],
            [<code key="e" className="font-mono">Hosted Checkout key</code>, <code key="f" className="font-mono">hp_live_ / hp_test_</code>, "Hosted Checkout links only", "Server environment variables only"],
          ]}
        />
        <Callout tone="warn" title="Never ship keys to the browser">Keys in JavaScript, mobile apps or Git are exposed keys — rotate them immediately from the dashboard if that happens. All calls in these docs are server-to-server.</Callout>
        <H3>Authenticated request</H3>
        <Code title="node · fetch" code={`const res = await fetch("https://www.ashtechpay.com/v1/countries", {
  headers: { Authorization: \`Bearer \${process.env.ASHTECH_API_KEY}\` },
});
const countries = await res.json();`} />
        <H3>Unauthenticated responses</H3>
        <KV k="Missing / malformed / unknown key" v="HTTP 401 unauthorized" />
        <KV k="Verified but API access not enabled" v="HTTP 403 forbidden" />
        <KV k="Key used after rotation" v="HTTP 401 — rotate apps immediately" />
      </Section>

      {/* ============ ENVIRONMENTS ============ */}
      <Section id="environments" eyebrow="Getting started" title="Environments & keys">
        <P>SDK Pay has two isolated environments, distinguished by the key prefix. Sandbox never touches real funds and always ends in a predictable state.</P>
        <KV k="Production base URL" v={<code className="font-mono text-[12px]">https://www.ashtechpay.com/v1</code>} />
        <KV k="Production keys" v={<code className="font-mono text-[12px]">ak_live_… · hp_live_…</code>} />
        <KV k="Sandbox base URL" v={<code className="font-mono text-[12px]">https://sandbox.ashtechpay.com/v1</code>} />
        <KV k="Sandbox keys" v={<code className="font-mono text-[12px]">ak_test_… · hp_test_…</code>} />
        <H3>Recommended variables</H3>
        <Code title=".env" code={`ASHTECH_BASE_URL=https://www.ashtechpay.com/v1
ASHTECH_API_KEY=ak_live_…
ASHTECH_USER_ID=usr_…
ASHTECH_WEBHOOK_SECRET=whsec_…
SASPAY_BASE_URL=https://api.saspay.me/api/v1   # automatic backup rail
SASPAY_API_KEY=sk_live_…
APP_URL=https://app.sdkpay.com`} />
        <H3>user_id is mandatory on profile-scoped routes</H3>
        <P>Pass your merchant <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">user_id</code> in the query string or JSON body of profile-scoped calls. It is never trusted for routing: it must equal the key&apos;s owner, otherwise you get <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">403 user_id_mismatch</code>.</P>
      </Section>

      {/* ============ HOSTED CHECKOUT ============ */}
      <Section id="hosted-checkout" eyebrow="Choosing a rail" title="Hosted Checkout (redirect)">
        <P>The fastest path to a live payment: SDK Pay hosts the checkout, you redirect the customer. Ideal for e-commerce and one-off links such as invoices or donations.</P>
        <KV k="When to use it" v="Redirect-friendly customers · no backend work" />
        <KV k="Create" v={<code className="font-mono text-[12px]">POST /v1/checkout-session</code>} />
        <KV k="Result" v="Redirect URL — customer pays, returns to your return_url" />
        <Code title="terminal" code={`curl -X POST https://www.ashtechpay.com/v1/checkout-session \\
  -H "Authorization: Bearer hp_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "description": "Order payment #123",
    "return_url": "https://shop.you.com/thanks",
    "reference": "ORDER-1234"
  }'`} />
        <Callout tone="warn">Per the provider&apos;s own integration tests, some rails (Wave, Orange Money, Djamo) may return a <b>redirect URL</b> instead of an on-phone push. Always test the rail you ship and follow returned URLs programmatically where provided.</Callout>
        <p><Link href="/pay/cozr523d" className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-blue-600 hover:underline">See a live hosted checkout <ArrowRight size={13} /></Link></p>
      </Section>

      {/* ============ DIRECT API OVERVIEW ============ */}
      <Section id="direct-api" eyebrow="Choosing a rail" title="Direct API overview">
        <P>Direct API keeps your screens, your flows and your UX — and uses SDK Pay&apos;s rails underneath. Use it for full-control apps, marketplaces and anything that must collect natively.</P>
        <DocTable
          head={["Method", "Endpoint", "Use"]}
          rows={[
            ["GET", <code key="1" className="font-mono">/v1/countries</code>, "Live catalog of countries & operators (with fees & tax)"],
            ["GET", <code key="2" className="font-mono">/v1/fees</code>, "Applicable fee schedule for your account"],
            ["GET", <code key="3" className="font-mono">/v1/wallets?user_id=…</code>, "Wallet balances of the profile"],
            ["POST", <code key="4" className="font-mono">/v1/collect</code>, "Mobile Money collection — async USSD push"],
            ["POST", <code key="5" className="font-mono">/v1/crypto/collect</code>, "USDT (Tron) collection — address + amount + expiry"],
            ["GET", <code key="6" className="font-mono">/v1/crypto/assets</code>, "Active crypto networks & assets"],
            ["POST", <code key="7" className="font-mono">/v1/payouts/mobile-money</code>, "Send money to a Mobile Money number"],
            ["POST", <code key="8" className="font-mono">/v1/payouts/crypto</code>, "Send USDT to a Tron address"],
            ["POST", <code key="9" className="font-mono">/v1/conversions</code>, "Instant wallet-to-wallet conversion"],
            ["GET", <code key="10" className="font-mono">/v1/transaction/:id?user_id=…</code>, "Status of any transaction"],
            ["GET, POST, DELETE", <code key="11" className="font-mono">/v1/auto-conversion-rules</code>, "Automatic conversion rules"],
          ]}
        />
        <Callout tone="tip">Profile-scoped routes verify <code className="rounded bg-white px-1 font-mono">user_id</code> against the key owner. A mismatch returns <code className="rounded bg-white px-1 font-mono">403 user_id_mismatch</code> — no exceptions.</Callout>
      </Section>

      {/* ============ COLLECT ============ */}
      <Section id="collect" eyebrow="Choosing a rail" title="Mobile Money collect">
        <P>Creates an asynchronous collection: the customer types their PIN on the phone, then your server receives the webhook. SDK Pay handles operator queuing, retries and reconciliation.</P>
        <H3>Request body</H3>
        <DocTable
          head={["Field", "Required", "Notes"]}
          rows={[
            [<code key="a" className="font-mono">user_id</code>, "Yes", "Your merchant profile id (usr_…)"],
            [<code key="b" className="font-mono">amount</code>, "Yes", "Positive number, major units (e.g. 5000 = 5 000 FCFA)"],
            [<code key="c" className="font-mono">currency</code>, "Yes", "Currency of the country, from /v1/countries"],
            [<code key="d" className="font-mono">country_code</code>, "Yes", "ISO country code, e.g. CM"],
            [<code key="e" className="font-mono">operator</code>, "Yes", "Exact operator name from /v1/countries — e.g. “MTN Money”, “Orange Money”, “Wave”, “Mixx By Yas”"],
            [<code key="f" className="font-mono">phone</code>, "Yes", "MSISDN in international or local format — +237… preferred"],
            [<code key="g" className="font-mono">reference</code>, "No", "Your order reference (≤ 191 chars) — used as merchant_reference for idempotency"],
            [<code key="h" className="font-mono">notify_url</code>, "No", "Your webhook URL — otherwise the merchant dashboard default applies"],
          ]}
        />
        <H3>Response — 201 Created</H3>
        <Code title="response" code={`{
  "id": "ASH-D-30QJ19K9D9KIH4",
  "reference": "ORDER-1234",
  "status": "pending",
  "amount": 5000,
  "currency": "XAF",
  "operator": "MTN Money",
  "credited_amount": null,
  "fee_amount": 200,
  "created_at": "2026-11-18T19:47:00Z"
}`} />
        <H3>Status lifecycle</H3>
        <P><code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">pending</code> → <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">completed</code> (PIN approved) · <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">failed</code> (insufficient funds, rejected, timeout, unknown) — final. Any webhook re-delivery is idempotent: dedupe with the transaction id and your reference.</P>
      </Section>

      {/* ============ FLOWS ============ */}
      <Section id="flows" eyebrow="Choosing a rail" title="Payment flows per operator">
        <P>Not every operator behaves the same. <b>Load /v1/countries and branch on the returned flow.</b> The catalog tells you whether the country uses push, OTP pre-authorization or redirects.</P>
        <DocTable
          head={["Flow", "Operators (examples)", "What the customer sees", "Your action"]}
          rows={[
            ["USSD push", "MTN (CM, BJ…), most Airtel", "PIN prompt on the handset", "Wait for webhook — no UI change"],
            ["Wave", "Senegal, Côte d’Ivoire, Mali, Burkina Faso, Togo", "Wave notification in-app, or redirect link", "Follow checkout_url when returned"],
            ["OTP pre-payment", "Orange Côte d’Ivoire, Orange Burkina Faso", "Customer dials *144*…# first, gets an OTP by SMS", "Pass the OTP in the request (422 prepayment_otp_missing otherwise)"],
            ["Post-push SMS OTP", "Coris Bénin, Wizall Sénégal", "SMS OTP after the push, confirm separately", "Confirm via the provider’s OTP endpoint before crediting"],
            ["OTP USSD", "Orange Cameroun & others", "USSD menu with OTP challenge", "Same: pass otp or confirm after the fact"],
          ]}
        />
        <Callout tone="warn" title="Respect the flow, not just the operator">Operators change flow rules. A flow test that passes today may flip after the operator updates — that is why /v1/countries carries the current flow per operator and why sandbox tests should run on each release.</Callout>
      </Section>

      {/* ============ CRYPTO ============ */}
      <Section id="crypto" eyebrow="Choosing a rail" title="Crypto (USDT · Tron)">
        <P>Accept USDT on Tron (TRC20). SDK Pay generates a one-time deposit address, shows the exact amount to send, and watches the chain — crediting net of the 2.5% fee after network confirmation.</P>
        <Code title="POST /v1/crypto/collect" code={`curl -X POST https://www.ashtechpay.com/v1/crypto/collect \\
  -H "Authorization: Bearer ak_live_…" \\
  -d '{
    "user_id": "usr_…",
    "amount": 60,
    "currency": "XAF",
    "reference": "ORDER-5678",
    "refund_address": "TYZQ18SpQTGCiZShoRe5a9i42tf4RsM5Nt",
    "notify_url": "https://api.you.app/webhooks/ashtech"
  }'`} />
        <Code title="response · 201" code={`{
  "id": "ASH-C-91KD20FLMQA277",
  "status": "pending",
  "network": "Tron (TRX)",
  "address": "TYZQ18SpQTGCiZShoRe5a9i42tf4RsM5Nt",
  "send_exact": "60.0000 USDT",
  "total_fees": "1.5000 USDT",
  "net_credited": "58.5000 USDT",
  "expires_at": "2026-11-25T02:11:00Z"
}`} />
        <UL>
          <LI>Fees are deducted from the incoming amount (2.5%).</LI>
          <LI>Exactly one on-chain confirmation is required — usually ~3 minutes.</LI>
          <LI>If not received in 5 minutes the intent expires and becomes <code className="rounded bg-slate-100 px-1 font-mono">expired</code>.</LI>
          <LI>Rate-locked quote: you see the XAF amount credited before the customer sends.</LI>
        </UL>
      </Section>

      {/* ============ PAYOUTS ============ */}
      <Section id="payouts" eyebrow="Choosing a rail" title="Payouts — Mobile Money & crypto">
        <P>Send money out: payroll, suppliers, refunds, withdrawals. Same rails, same idempotency guarantees, with an optional in-app approval PIN for large batches.</P>
        <H3>Mobile Money payout</H3>
        <Code title="POST /v1/payouts/mobile-money" code={`curl -X POST https://www.ashtechpay.com/v1/payouts/mobile-money \\
  -H "Authorization: Bearer ak_live_…" \\
  -d '{
    "user_id": "usr_…",
    "amount": 150000,
    "currency": "XAF",
    "country_code": "CM",
    "operator": "MTN Money",
    "phone": "651010478",
    "recipient_name": "Jean-Marc Fotso",
    "reference": "PAYOUT-2026-0119"
  }'`} />
        <H3>Limits</H3>
        <KV k="Minimum payout" v="550 XAF · 1 USDT" />
        <KV k="Maximum payout" v="2,000,000 XAF · 1,500 USDT" />
        <KV k="Daily internal send limit" v="5,000,000 XAF" />
        <KV k="Fee" v="4.00% Mobile Money · 1.00 USDT network · 0 SDK Pay fee for internal" />
      </Section>

      {/* ============ WEBHOOKS ============ */}
      <Section id="webhooks" eyebrow="Operations" title="Webhooks — the only source of truth">
        <P>AshTech queues notifications before delivery, deduplicates by transaction and event, and signs with your <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">whsec_…</code>. SasPay (backup rail) sends equivalently shaped payloads to the same <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">notify_url</code>.</P>
        <H3>Signature verification (Node)</H3>
        <Code title="webhook.js" code={`const crypto = require("crypto");
const raw = await getRawBody(req);           // BEFORE any JSON.parse
const sig = req.headers["x-ashtech-signature"];
const digest = crypto.createHmac("sha256", process.env.ASHTECH_WEBHOOK_SECRET)
  .update(raw, "utf8").digest("hex");
if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(String(sig).replace(/^sha256=/, ""), "utf8"))) {
  return res.status(401).end();               // reject — never process
}
const event = JSON.parse(raw);
// 1. dedupe with event.id / transaction_id
// 2. reload the transaction server-side
// 3. credit exactly once — settlement here is idempotent`} />
        <H3>Delivery guarantees</H3>
        <UL>
          <LI>Up to 8 attempts with exponential backoff, then permanent failure (visible in the dashboard).</LI>
          <LI>Deduplication by <code className="rounded bg-slate-100 px-1 font-mono">X-Ashtech-Event-Id</code> or transaction id.</LI>
          <LI>Events include separated fees: <code className="rounded bg-slate-100 px-1 font-mono">provider_fee_amount</code>, <code className="rounded bg-slate-100 px-1 font-mono">ashtech_fee_amount</code>, <code className="rounded bg-slate-100 px-1 font-mono">total_fee_amount</code>, plus any operator tax (AfribaPay countries).</LI>
          <LI>Respond <b>2xx fast</b> — do your heavy work asynchronously after acknowledging.</LI>
        </UL>
        <H3>Events</H3>
        <DocTable
          head={["Event", "When"]}
          rows={[
            [<code key="a" className="font-mono">payment.completed</code>, "Customer approved a collection"],
            [<code key="b" className="font-mono">payment.failed</code>, "PIN rejected / insufficient funds / timeout"],
            [<code key="c" className="font-mono">payout.processed</code>, "Payout delivered to the operator"],
            [<code key="d" className="font-mono">payout.failed</code>, "Payout rejected by the operator"],
            [<code key="e" className="font-mono">conversion.completed</code>, "Wallet-to-wallet conversion settled"],
          ]}
        />
      </Section>

      {/* ============ IDEMPOTENCY ============ */}
      <Section id="idempotency" eyebrow="Operations" title="Idempotency">
        <P>Money must move exactly once. SDK Pay treats your <code className="rounded bg-slate-100 px-1.5 font-mono text-[12px]">reference</code> as the idempotency key for collections: re-sending the same reference returns the same transaction instead of debiting twice.</P>
        <Code title="headers" code={`Idempotency-Key: 3fa85f64-5717-4562-b3fc-2c963f66afa6
# Reuse the SAME key when retrying the same logical operation.
# A different body with the same key returns 409.`} />
        <Callout tone="warn" title="Retries are not free">A network timeout does not mean the call failed — the operator may already have debited the customer. Always reuse the reference/key on retry and reconcile via /v1/transaction or the webhook before retrying.</Callout>
      </Section>

      {/* ============ RATE LIMITS ============ */}
      <Section id="rate-limits" eyebrow="Operations" title="Rate limits">
        <KV k="Authenticated calls" v="300 req / min / account (default)" />
        <KV k="Catalog calls (/v1/countries, /v1/fees)" v="Cache for ≥ 10 minutes — they change rarely" />
        <KV k="Exceeding the limit" v="HTTP 429 Too Many Requests — back off exponentially" />
        <KV k="Webhook delivery" v="Not rate limited — but your endpoint must answer 2xx fast" />
        <P>If you need a higher ceiling for batch payout files, contact your account manager — limits are raised on verified, high-volume merchants only.</P>
      </Section>

      {/* ============ COUNTRIES ============ */}
      <Section id="countries" eyebrow="Reference" title="GET /v1/countries — the live catalog">
        <P>Single source of truth for countries, operators, currencies, flows and tax rates. Loaded at app start, refreshed hourly, cached ≥ 10 minutes.</P>
        <Code title="response · trimmed" code={`{
  "data": [
    {
      "iso_code": "CM",
      "name": "Cameroun",
      "currency": "XAF",
      "is_active": true,
      "networks": [
        { "code": "mtn_cm", "name": "MTN Money", "active": true, "flow": "ussd_push",
          "fee_bps": 400, "min_amount": 100, "max_amount": 2000000, "tax_rate": 0 },
        { "code": "orange_cm", "name": "Orange Money", "active": true, "flow": "ussd_push", … }
      ]
    },
    { "iso_code": "BJ", "name": "Bénin", "currency": "XOF", "networks": [ … mtn_bj, moov_bj, coris_bj, celtiis_bj … ] }
  ]
}`} />
        <Callout tone="info">The same catalog powers SDK Pay&apos;s own deposit/withdraw screens — what you see in the app <b>is</b> what the API returns.</Callout>
      </Section>

      {/* ============ FEES ============ */}
      <Section id="fees-ref" eyebrow="Reference" title="GET /v1/fees — the applicable schedule">
        <P>Returns the fee schedule bound to your account and country mix, including referral-reduced tiers. Always render amounts from this endpoint, never from constants.</P>
        <KV k="Mobile Money deposit" v="4.00% · min 10 FCFA" />
        <KV k="Mobile Money withdrawal" v="4.00%" />
        <KV k="Mobile Money send" v="4.00%" />
        <KV k="USDT deposit" v="2.50%" />
        <KV k="USDT network fee" v="1.00 USDT flat" />
        <KV k="Internal SDK Pay → SDK Pay" v="Free" />
        <KV k="Wallet-to-wallet conversion" v="1.00%" />
        <KV k="Cross-border payout" v="2.00%" />
        <KV k="Failed deposit" v="Never charged" />
        <KV k="Referral-reduced period" v="−50% on Mobile Money fees for 5 days (verified invitee)" />
      </Section>

      {/* ============ ERRORS ============ */}
      <Section id="errors" eyebrow="Reference" title="Errors & HTTP statuses">
        <DocTable
          head={["Status", "Meaning", "What to do"]}
          rows={[
            ["200 / 201", "OK / created", "Persist the id, wait for the webhook"],
            ["400", "Validation error — body envelope { field: [msg] }", "Fix the offending field, resend with the same reference"],
            ["401", "Unauthorized — missing/invalid key", "Check Authorization header & key state"],
            ["403", "Forbidden — API not enabled or user_id_mismatch", "Enable Direct API / pass your own user_id"],
            ["404", "Not found — wrong id or route", "Verify the id, the path and the environment"],
            ["409", "Idempotency conflict — same key, different body", "Generate a new key for a new intention"],
            ["422", "Semantic error — e.g. prepayment_otp_missing, amount out of bounds", "Read `code`; gather the missing input"],
            ["429", "Rate limited", "Back off with jitter, re-try later"],
            ["4xx (catalog)", "Operator/country unavailable", "SDK Pay fails over to SasPay automatically"],
            ["5xx", "Provider-side problem", "Retry with the same reference; check status page"],
          ]}
        />
        <H3>Business error envelope</H3>
        <Code title="error" code={`{
  "message": "The operator is not available in this country.",
  "code": "operator_unavailable",       // stable — test against this
  "reference": "ORDER-1234"
}`} />
        <H3>Validation error envelope</H3>
        <Code title="error" code={`{
  "amount": ["Ensure this value is greater than 0."],
  "phone": ["Enter a valid MSISDN."]
}`} />
      </Section>

      {/* ============ SANDBOX ============ */}
      <Section id="sandbox" eyebrow="Reference" title="Sandbox & test numbers">
        <P>The sandbox mirrors production completely — catalog, fees, tax, webhooks — but never moves real funds. Test-phone behavior is determined by the last digit, regardless of country or operator.</P>
        <KV k="…0xxxx0" v="Always succeeds" />
        <KV k="…0xxxx1" v="Fails — generic operator error" />
        <KV k="…0xxxx2" v="Fails — insufficient funds" />
        <KV k="…0xxxx9" v="Stays pending forever (test your timeout/polling)" />
        <KV k="Any other digit" v="Succeeds by default" />
        <Callout tone="tip" title="Reference numbers to test webhooks">Use any reference you like (e.g. <code className="rounded bg-white px-1 font-mono">TEST-123</code>). Each delivery is signed with your test webhook secret; retries follow the same backoff as production.</Callout>
        <P>Run your full suite against the sandbox before every release: catalog fetch → collect → webhook signature → retry/idempotency → payout.</P>
      </Section>

      {/* ============ RELIABILITY ============ */}
      <Section id="reliability" eyebrow="Resources" title="Reliability & automatic failover">
        <P>SDK Pay never returns “operator unavailable” to your customer when a route exists somewhere. Every collect/payout call goes through the provider router:</P>
        <ol className="ml-1 space-y-2">
          <LI>AshTech Pay (primary) is tried first — /v1/collect with your ak_ key.</LI>
          <LI>If AshTech answers with a catalog/operator/country failure (4xx with that wording), a 5xx, or times out — the identical call is retried on <b>SasPay</b>, with the network code resolved live from <code className="rounded bg-slate-100 px-1 font-mono">/countries/</code> (e.g. mtn_bj for MTN Bénin).</LI>
          <LI>Auth errors (401/403/429) are <b>never</b> failed over — they surface immediately so they get fixed.</LI>
          <LI>Your merchant reference travels unchanged, so webhook dedupe works across rails.</LI>
        </ol>
        <KV k="RPO / RTO" v="Ledger replicated synchronously · RTO < 15 min" />
        <KV k="Uptime SLO" v="99.9% monthly" />
        <KV k="Ledger" v="Append-only — settlement is idempotent at exactly-once" />
      </Section>

      {/* ============ SECURITY ============ */}
      <Section id="security" eyebrow="Resources" title="Security">
        <UL>
          <LI><b>Keys stay on servers.</b> No ak_/sk_/hp_/whsec_ value ever belongs in a browser, an app bundle or a repo — that&apos;s what rotated keys are for.</LI>
          <LI><b>Webhooks are verified</b> with HMAC-SHA256 over the raw body. Reject anything else with 401.</LI>
          <LI><b>Contexts differ.</b> KYC verification is required before first withdrawal; some operators require OTP pre-authorization.</LI>
          <LI><b>IP allow-listing</b> is available on request for high-volume payouts; contact your account manager.</LI>
          <LI><b>Report vulnerabilities</b> privately to security@sdkpay.com — responsible disclosure is rewarded.</LI>
        </UL>
      </Section>

      {/* ============ AI ============ */}
      <Section id="ai" eyebrow="Resources" title="For AI assistants">
        <P>SDK Pay ships a machine-readable documentation surface so coding agents (Cursor, Claude, Copilot) can integrate correctly without scraping HTML.</P>
        <DocTable
          head={["Artefact", "URL", "What it is"]}
          rows={[
            [<code key="a" className="font-mono">llms.txt</code>, <code key="b" className="font-mono">/llms.txt</code>, "Index of the documentation in one screen — the map an agent loads first"],
            [<code key="c" className="font-mono">llms-full.txt</code>, <code key="d" className="font-mono">/llms-full.txt</code>, "Complete documentation content, plain text, in one file"],
            [<code key="e" className="font-mono">AGENTS.md</code>, "Repo root", "Integration rules for coding agents — auth, flows, webhooks, idempotency, payload shapes"],
          ]}
        />
        <H3>A canonical system prompt you can paste into any agent</H3>
        <Code title="agent skill" code={`You are integrating SDK Pay (Mobile Money + USDT + payouts for African markets).
Rules:
- Base URL https://www.ashtechpay.com/v1 — Bearer ak_live_… (server-side only).
- Profile-scoped calls require the merchant user_id AND it must equal the key owner.
- Collect is async: wait for the webhook or poll /v1/transaction/:id. Never trust a redirect.
- Verify webhooks with HMAC-SHA256(rawBody, ASHTECH_WEBHOOK_SECRET) before any side effect.
- Reuse the merchant reference across retries (it is the idempotency key).
- If an operator/country is unavailable on AshTech, the platform fails over to SasPay
  automatically — never re-implement failover yourself.
- Fees come from GET /v1/fees at runtime; never hardcode rates.
- Full docs: https://app.sdkpay.com/llms-full.txt`} />
        <P><Link href="/llms-full.txt" className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-blue-600 hover:underline"><FileText size={14} /> Fetch /llms-full.txt <ArrowRight size={13} /></Link> · <Link href="/llms.txt" className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-blue-600 hover:underline">Fetch /llms.txt</Link></P>
      </Section>
    </div>
  );
}
