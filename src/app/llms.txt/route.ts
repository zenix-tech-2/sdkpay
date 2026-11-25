import { NextResponse } from "next/server";

export const dynamic = "force-static";

const BODY = `# SDK Pay

> One API for African payments: Mobile Money collection and payouts, USDT (Tron), payment links and internal transfers — backed by AshTech Pay (primary) with automatic SasPay failover. Async USSD push, signed webhooks, idempotent ledger.

Base URLs:
- Primary: https://www.ashtechpay.com/v1  (Bearer ak_live_… / ak_test_…)
- Backup (automatic): https://api.saspay.me/api/v1  (Bearer sk_live_… / sk_test_…)
- This app: https://app.sdkpay.com (/docs for HTML, /llms-full.txt for the complete text)

## Getting started
- Docs: /docs
- Quickstart → POST /v1/collect → webhook on payment.completed
- Authentication → Authorization: Bearer <key>; profile-scoped routes also need the merchant user_id (must match the key owner, else 403 user_id_mismatch)
- Environments → production keys ak_live_/hp_live_, sandbox ak_test_/hp_test_ (base: sandbox.ashtechpay.com/v1)

## Endpoints (profile-scoped unless noted)
- GET  /v1/countries              Live catalog of countries, operators, fees and flows (Bearer)
- GET  /v1/fees                   Applicable fee schedule for the account
- GET  /v1/wallets?user_id=…      Wallet balances
- POST /v1/collect                Mobile Money collection (async, USSD push)
- POST /v1/crypto/collect         USDT (Tron) collection — address, amount, expiry
- GET  /v1/crypto/assets          Active crypto networks/assets
- POST /v1/payouts/mobile-money   Payout to a Mobile Money number
- POST /v1/payouts/crypto         Payout to a Tron address
- POST /v1/conversions            Instant wallet-to-wallet conversion
- GET  /v1/transaction/:id?user_id=…  Status of any transaction

## Operational rules
- Collect is async: the HTTP 201/200 is NOT proof of payment. Wait for the webhook, or poll GET /v1/transaction/:id.
- Webhook verification: HMAC-SHA256 over the RAW body with ASHTECH_WEBHOOK_SECRET (hex digest). Reject mismatches with 401. Events: payment.completed | payment.failed | payout.processed | payout.failed | conversion.completed.
- Idempotency: the merchant reference IS the idempotency key. Retry only with the same reference; a different body returns 409.
- Rate limit: 300 authenticated req/min per account — 429 on overflow. Cache /v1/countries and /v1/fees for ≥ 10 min.
- Failover: AshTech → SasPay is automatic (catalog/operator/country 4xx, 5xx, or timeout). Auth errors (401/403/429) never fail over. Never re-implement failover.
- Fees (default): deposits/withdrawals/sends 4.00%, USDT 2.50%, internal free, conversion 1.00%, network 1.00 USDT, failed deposits free.
- Limits: min payout 550 XAF / 1 USDT · max 2,000,000 XAF / 1,500 USDT · daily internal send 5,000,000 XAF.
- Sandbox test MSISDNs by last digit: …0 success · …1 generic fail · …2 insufficient funds · …9 stays pending forever.

## Agent skill
Paste into your agent's system prompt: see AGENTS.md at the repo root, or /docs#ai for the canonical skill text.
`;

export function GET() {
  return new NextResponse(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
