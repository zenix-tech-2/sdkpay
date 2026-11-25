import { NextResponse } from "next/server";

export const dynamic = "force-static";

const BODY = `# SDK Pay — Complete developer documentation (plain text)
Version 2026-11-25 · app.sdkpay.com · Contact: developers@sdkpay.com

================================================================
0. WHAT SDK PAY IS
================================================================
One API for African payments: Mobile Money collection and payouts, USDT (Tron),
payment links and internal SDK Pay -> SDK Pay transfers. Behind it sit two rails:

  PRIMARY  AshTech Pay   https://www.ashtechpay.com/v1   Bearer ak_live_… / ak_test_…
  BACKUP   SasPay        https://api.saspay.me/api/v1    Bearer sk_live_… / sk_test_…

SDK Pay fails over automatically: a call goes to AshTech first; if AshTech
answers a catalog/operator/country failure (4xx with that wording), a 5xx, or
the request times out, the IDENTICAL request is retried on SasPay with the
network code resolved live from SasPay's public GET /countries/ (e.g. mtn_bj).
Authentication errors (401/403/429) never fail over. Your merchant reference is
preserved across rails so webhook dedupe and reconciliation keep working.

================================================================
1. AUTHENTICATION
================================================================
Authorization: Bearer <key>            (all Direct API routes)
Content-Type: application/json
Profile-scoped routes ALSO require the merchant user_id, passed as a query
parameter or in the JSON body. It must equal the key owner's id; otherwise
403 user_id_mismatch. A missing user_id returns 400 user_id_required.

Keys:
  Direct API key    ak_live_… / ak_test_…   collect, crypto, payouts, wallets, status, countries, fees
  Webhook secret    whsec_…                 signs every webhook (X-Ashtech-* headers)
  Hosted Checkout   hp_live_… / hp_test_…   checkout-session links only

Errors: 401 unauthorized (bad/absent key) · 403 forbidden (API not enabled for
the account, or user_id mismatch). NEVER expose keys client-side. Rotate
immediately from the dashboard if a key leaks.

================================================================
2. ENVIRONMENTS
================================================================
Production  https://www.ashtechpay.com/v1     ak_live_…  hp_live_…
Sandbox     https://sandbox.ashtechpay.com/v1 ak_test_…  hp_test_…
Optional host override for the backup rail: SASPAY_BASE_URL (defaults to
https://api.saspay.me/api/v1).

Sandbox mirrors production completely (catalog, fees, tax, webhooks) and never
moves real funds. Test MSISDNs by LAST DIGIT regardless of operator/country:
  …0 always succeeds · …1 generic failure · …2 insufficient funds · …9 pending forever

================================================================
3. ENDPOINT REFERENCE
================================================================
GET  /v1/countries
  Live catalog. Bearer required. Use it for countries, operators, currencies,
  flows (ussd_push | wave_redirect | otp_prepayment | otp_sms), fee_bps,
  min/max amounts and tax rates. Cache >= 10 minutes. Response (trimmed):
  { "data": [ { "iso_code":"CM","name":"Cameroun","currency":"XAF",
    "networks":[{"code":"mtn_cm","name":"MTN Money","active":true,"flow":"ussd_push",
      "fee_bps":400,"min_amount":100,"max_amount":2000000,"tax_rate":0}] } ] }

GET  /v1/fees
  The fee schedule bound to your account and country mix, incl. referral-reduced
  tiers. Never hardcode fees — read them here (or at /fees in the app).

GET  /v1/wallets?user_id=usr_…
  Balances of every wallet on the profile.

POST /v1/collect
  Mobile Money collection — ASYNCHRONOUS.
  Body: { user_id, amount (major units), currency, country_code,
          operator (exact name from /v1/countries), phone (MSISDN, +237…),
          reference? (<=191 chars, merchant_reference), notify_url? }
  Response 201: { id, reference, status:"pending", amount, currency,
                  operator, fee_amount, created_at }
  The customer receives a USSD PIN prompt on the handset. The HTTP response is
  NOT proof of payment — wait for the webhook or poll GET /v1/transaction/:id.

POST /v1/crypto/collect
  USDT (Tron, TRC20) collection.
  Body: { user_id, amount, currency, reference?, refund_address?, notify_url? }
  Response 201: { id, status:"pending", network:"Tron (TRX)",
                  address, send_exact:"60.0000 USDT",
                  total_fees:"1.5000 USDT", net_credited:"58.5000 USDT",
                  expires_at }
  One on-chain confirmation (~3 min) required. 2.5% fee deducted from the amount.

GET  /v1/crypto/assets
  Active crypto networks and assets.

POST /v1/payouts/mobile-money
  Body: { user_id, amount, currency, country_code, operator, phone,
          recipient_name?, reference?, notify_url? }

POST /v1/payouts/crypto
  Body: { user_id, amount (major units), currency:"USDT", network:"TRC20",
          address, reference? }

POST /v1/conversions
  Instant wallet-to-wallet conversion. GET /v1/conversions/:id?user_id=… for status.

GET  /v1/transaction/:id?user_id=usr_…
  Status lookup — includes separated fee fields:
  { id, status, amount, credited_amount,
    provider_fee_amount, ashtech_fee_amount, total_fee_amount,
    provider_tax_rate, provider_tax_amount }
  Status: pending | completed | failed (failed = PIN rejected / insufficient
  funds / timeout / expired — final).

GET, POST, DELETE  /v1/auto-conversion-rules
  Automatic conversion rules between wallets.

================================================================
4. PAYMENT FLOWS PER OPERATOR
================================================================
Always branch on the flow returned by /v1/countries. Operators change rules.

  ussd_push        MTN, Airtel and most rails — customer gets a PIN prompt.
                   Your app: show "Approve on your phone", wait for webhook.
  wave_redirect    Wave (SN, CI, ML, BF, TG) — may return checkout_url.
                   Follow the redirect URL programmatically when present.
  otp_prepayment   Orange CI, Orange BF — customer dials *144*…# first and
                   receives an OTP by SMS; YOU must pass it in the request.
                   Missing OTP => 422 prepayment_otp_missing.
  otp_sms          Coris BJ, Wizall SN — OTP sent AFTER the push; confirm it
                   via the provider's OTP endpoint before crediting.

================================================================
5. WEBHOOKS — the only source of truth
================================================================
Headers (candidates seen in the wild; verify all): x-ashtech-signature,
ashtech-signature, x-signature, x-webhook-signature, x-saspay-signature,
saspay-signature.
Verification (Node):
  const raw  = await getRawBody(req);              // BEFORE parsing
  const sig  = req.headers["x-ashtech-signature"];
  const calc = crypto.createHmac("sha256", process.env.ASHTECH_WEBHOOK_SECRET)
                       .update(raw, "utf8").digest("hex");
  if (!timingSafeEqual(Buffer.from(calc), Buffer.from(stripPrefix(sig)))) reject 401;

Rules: 2xx fast · verify BEFORE any side effect · dedupe by X-Ashtech-Event-Id
or transaction id · reload the transaction server-side · settle exactly once
(idempotency via your ledger) · max 8 delivery attempts with backoff.
Events: payment.completed | payment.failed | payout.processed | payout.failed |
conversion.completed.

================================================================
6. IDEMPOTENCY
================================================================
The merchant reference IS the idempotency key. Retrying with the same reference
returns the same transaction. A different payload with the same key/reference
returns HTTP 409. A timeout is NOT proof of failure — always reconcile via
webhook or /v1/transaction before retrying.

================================================================
7. RATE LIMITS
================================================================
300 authenticated requests/minute/account. 429 on overflow — back off with
jitter. Cache /v1/countries and /v1/fees >= 10 minutes.

================================================================
8. FEES AND LIMITS (DEFAULT SCHEDULE)
================================================================
Deposit (top-up) 4.00% (min 10 FCFA) · Mobile Money send 4.00% ·
Withdrawal 4.00% · Payment-link sale 4.00% · USDT deposit 2.50% ·
USDT network 1.00 USDT flat · Internal SDK Pay -> SDK Pay FREE ·
wallet conversion 1.00% · cross-border payout 2.00% · failed deposits NEVER charged.
Limits: min payout 550 XAF / 1 USDT · max 2,000,000 XAF / 1,500 USDT ·
internal daily send 5,000,000 XAF · unverified accounts: deposits capped
at 50,000 XAF/day · verified accounts: no daily cap.
Promotions: verified referral friend => 50% off Mobile Money fees for 5 days.

================================================================
9. COMMON ERRORS
================================================================
400  validation envelope { field: [msg] }
401  unauthorized — fix the key
403  API not enabled / user_id_mismatch / user_id_required
404  wrong id or environment
409  idempotency conflict
422  prepayment_otp_missing · amount out of bounds · unknown operator
429  rate limited
4xx  operator/country unavailable -> SDK Pay fails over automatically
5xx  provider problem — retry with the SAME reference

Business error envelope: { "message": "…", "code": "operator_unavailable",
"reference": "…" }  — always test against the stable "code" field.
SDK Pay's own deployment uses the same rules: its server-side provider router
(ashtech.ts -> saspay.ts) applies this exact failover policy.

================================================================
10. RELIABILITY
================================================================
Synchronous ledger replication, append-only settlements, exactly-once credit.
SLO 99.9% monthly. RTO < 15 min. Status page: status.sdkpay.com.
Reconciliation tooling: CSV export at /api/export/csv (merchant ledger);
admin console exposes the same ledger with settlement status.

================================================================
11. SECURITY
================================================================
Keys stay server-side. Webhooks verified by HMAC. KYC required before first
withdrawal. TLS everywhere. Key rotation instant from dashboard.
Report vulnerabilities: security@sdkpay.com.

================================================================
12. FOR AI AGENTS
================================================================
Read /llms.txt for the map, then this file. Canonical agent rules:
- Never expose ak_/sk_/hp_/whsec_ keys in client code or commits.
- Server-to-server only. Profile-scoped routes: pass user_id matching the key owner.
- Collect is async: never trust an HTTP 2xx/redirect as proof of payment.
- Verify webhooks (HMAC raw body) BEFORE crediting; dedupe; settle once.
- Reuse the merchant reference on retries.
- Read fees from /v1/fees, never hardcode.
- Respect the operator flow from /v1/countries (push vs OTP vs redirect).
- On 4xx catalog errors, failover is automatic — don't double-charge.
Full rules: AGENTS.md at the repository root.
`;

export function GET() {
  return new NextResponse(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
