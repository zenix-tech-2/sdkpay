# SDK Pay — rules for AI coding agents

You are integrating **SDK Pay** (Mobile Money + USDT + payouts for African markets).
This file is the contract you must respect. Read it before writing any integration code.

## 0. Ground rules
- **Server-side only.** Keys (`ak_`, `sk_`, `hp_`, `whsec_`) never appear in browser bundles,
  mobile apps, repos, logs or support chats. If you are about to hardcode a key — stop.
- **One owner per key.** Profile-scoped routes (`/v1/wallets`, `/v1/collect`, payouts,
  conversions, `/v1/transaction`) require the merchant `user_id`, and it MUST equal the key
  owner's id. Mismatch ⇒ `403 user_id_mismatch`.
- **Async rails.** A `201` from `/v1/collect` means "push delivered to the handset", never
  "paid". Credit your ledger only on a verified webhook or after a server-side
  `GET /v1/transaction/:id` returns `completed`.
- **Idempotency.** The merchant `reference` IS the idempotency key. Retry only with the same
  reference. A different payload with the same reference returns HTTP 409.
- **Failover is not yours to implement.** SDK Pay fails AshTech → SasPay automatically on
  catalog/operator/country failures, 5xx or timeouts. Auth errors (401/403/429) never fail over.

## 1. Rails and base URLs
| Rail | Base | Key |
|---|---|---|
| AshTech Pay (PRIMARY) | https://www.ashtechpay.com/v1 | `ak_live_…` / `ak_test_…` |
| SasPay (BACKUP) | https://api.saspay.me/api/v1 | `sk_live_…` / `sk_test_…` |
| SDK Pay app | https://app.sdkpay.com | — |

Sandbox: https://sandbox.ashtechpay.com/v1 (test keys `ak_test_…`).

## 2. The canonical collect flow
```bash
curl -X POST https://www.ashtechpay.com/v1/collect \
  -H "Authorization: Bearer $ASHTECH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "user_id": "usr_…", "amount": 5000, "currency": "XAF",
        "country_code": "CM", "operator": "MTN Money",
        "phone": "651010478", "reference": "ORDER-1234",
        "notify_url": "https://api.you.app/webhooks/ashtech" }'
```
- `operator` is the EXACT name from `GET /v1/countries` ("MTN Money", "Orange Money", "Wave", …) — never a guessed code.
- `reference` (≤ 191 chars) doubles as your idempotency key.
- Response `201` contains `id` and `status: "pending"`. The customer gets a USSD PIN prompt.

## 3. Webhook verification (mandatory, before any side effect)
```js
const raw  = await getRawBody(req);                    // raw, BEFORE JSON.parse
const sig  = req.headers["x-ashtech-signature"];
const calc = crypto.createHmac("sha256", process.env.ASHTECH_WEBHOOK_SECRET)
                     .update(raw, "utf8").digest("hex");
if (!crypto.timingSafeEqual(
      Buffer.from(calc),
      Buffer.from(String(sig).replace(/^sha256=/, "")))) return res.status(401).end();
const event = JSON.parse(raw);
// dedupe by event.id / transaction_id — deliveries may repeat (up to 8 attempts)
// reload the transaction with GET /v1/transaction/:id — settle exactly once
```
Reject invalid signatures with `401`. Events: `payment.completed`, `payment.failed`,
`payout.processed`, `payout.failed`, `conversion.completed`.

## 4. Flows per operator (branch on /v1/countries — never hardcode)
| Flow | Operator examples | Customer experience | You must |
|---|---|---|---|
| `ussd_push` | MTN, Airtel, most rails | PIN prompt on handset | Wait for webhook/poll |
| `wave_redirect` | Wave (SN, CI, ML, BF, TG) | Wave in-app or redirect | Follow `checkout_url` when returned |
| `otp_prepayment` | Orange CI, Orange BF | Customer dials `*144*…#`, gets OTP | Pass `otp` in the request |
| `otp_sms` | Coris BJ, Wizall SN | OTP after the push | Confirm OTP via provider endpoint |

## 5. Fees & limits (read /v1/fees at runtime)
- Deposits 4.00% (min 10 FCFA) · sends 4.00% · withdrawals 4.00% · links 4.00%
- USDT deposit 2.50% · USDT network 1.00 USDT flat · wallet conversion 1.00%
- Internal SDK Pay → SDK Pay: FREE · cross-border payout 2.00% · failed deposit: FREE
- Limits: min payout 550 XAF / 1 USDT · max 2,000,000 XAF / 1,500 USDT · daily internal 5,000,000 XAF

## 6. Testing
- `GET /v1/countries` requires the Bearer key; catalog is public only via SasPay.
- Sandbox MSISDN last digit decides outcome: …0 success · …1 generic fail · …2 insufficient funds · …9 stays pending.
- Cash round-trip: create → webhook (or poll) → assert single ledger entry.

## 7. Common mistakes that break production
1. Crediting on the redirect/200 — always the webhook.
2. Re-calling /v1/collect on timeout with a NEW reference — creates a second debit. Reuse the reference.
3. Hardcoding fees/operators/currencies — read the catalog.
4. Skipping webhook signature checks — accept nothing unverified.
5. Putting keys in `.env.example`, Slack, or screenshots — rotate them.

## 8. Where the full docs live
- HTML: https://app.sdkpay.com/docs
- Plain text index: https://app.sdkpay.com/llms.txt
- Complete plain text: https://app.sdkpay.com/llms-full.txt
- This file: repo root `AGENTS.md`
