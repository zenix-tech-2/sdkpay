# SDK Pay — Integrate · Pay · Grow

A production-grade **payment platform** for African businesses, built with **Next.js (App Router)**, **PostgreSQL** and **Drizzle ORM** — deployable to **Vercel** with **Supabase** as the managed Postgres.

SDK Pay replicates a full mobile-first fintech experience on the web: dashboard, Mobile Money & crypto deposits, payouts, payment links with hosted checkout and QR codes, internal transfers, referrals, KYC with admin approval, a developer API console and notifications.

> Design reference: product screenshots included in `refs/` (business flows, layout and icons).

---

## Features

**Merchant app**
- Dashboard — balance card, quick actions, payments-volume chart, recent activity, link filters (all live from Postgres)
- Deposits — Mobile Money (MTN, Orange, Wave… per country) & Crypto (USDT · Tron) with fee breakdown, confirm sheet, processing state with expiry countdown and reference
- Withdrawals — Mobile Money & USDT, registered payout numbers, fee payer selection, min/max limits
- Send — Mobile Money, **Internal (free instant transfers between SDK Pay accounts)**, Crypto
- Payment links — 4-step creation wizard, QR code modal, copy/share/download QR, inline rename, toggle, delete; hosted checkout at `/pay/[slug]` (customers pay by Mobile Money, counters update live)
- Transactions — search, type/status/currency filters, grouped history, CSV export, full receipt-style detail (references, fees, balance history)
- Accounts — multi-currency wallets (XAF primary, XOF, USD, EUR, GBP, USDT…), add-account flow with search
- Referrals & earnings, KYC, Fees, Automatic conversion rules, Notifications, Settings (profile, theme, notification prefs, password, PIN, devices, danger zone), Release notes

**Identity & admin**
- Self-serve **KYC**: document type (National ID / Passport / Driver's licence), document front/back upload, **live selfie capture** (camera) or upload, client-side image compression, 4-step wizard
- **Admin compliance console** (`/admin`) — overview KPIs, KYC review queue with filters, document viewer, approve/reject with reasons; the user is notified instantly; rejected users can resubmit
- Role-based access: `user` and `admin`

**Platform**
- Auth — email/password (SHA-256 demo hashing — swap for bcrypt/Argon2 in production), HTTP-only session cookie
- Supabase-ready schema (`supabase/schema.sql`) and seed (`supabase/seed.sql`)
- Mobile-first responsive UI faithful to the product screenshots, dark-navy + gold brand system with the SDK Pay logo

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Drizzle ORM (`pg`) |
| Auth | Cookie session (`sdk_session`), SHA-256 password hash |
| Icons | lucide-react |
| QR codes | `qrcode` |
| Images | client-side canvas resize (KYC), SVG assets in `public/` |

---

## Project structure

```
src/
  app/
    page.tsx               # redirects to /dashboard
    login/  signup/        # auth screens
    dashboard/             # home
    deposit/ withdraw/ send/
    transactions/ [id]/    # history + receipt
    links/ new/            # payment links + 4-step wizard
    pay/[slug]/            # public hosted checkout
    accounts/ new/         # wallets
    referrals/ fees/ kyc/ api/ support/ settings/
    notifications/ conversion/ updates/
    admin/                 # compliance console (role = admin)
      kyc/ [id]/           # review queue + document viewer
    api/health/ api/export/csv/
  components/              # shell, gates, flows (client), admin widgets
  db/                      # drizzle client + schema
  lib/                     # actions (server), session, data, format, countries
supabase/
  schema.sql               # DDL — run in Supabase SQL editor
  seed.sql                 # demo data (user + admin + links + transactions)
scripts/
  seed-kyc-demo.mjs        # seeds a pending KYC submission (jeanmarc@sdkpay.com)
```

---

## Quick start (local, with Docker-less local Postgres)

```bash
# 1. Install
npm install

# 2. Create & seed the database
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/schema.sql -f supabase/seed.sql
node scripts/seed-kyc-demo.mjs   # optional: pending KYC demo submission

# 3. Configure env
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db' > .env

# 4. Run
npm run dev        # → http://localhost:3000
```

### Demo accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Merchant | `honestansah@gmail.com` | `demo1234` | XAF wallet 9.44, links, transactions, KYC verified |
| Admin | `admin@sdkpay.com` | `admin1234` | `/admin` compliance console |
| Pending KYC | `jeanmarc@sdkpay.com` | `demo1234` | Documents awaiting review (after running `scripts/seed-kyc-demo.mjs`) |

---

## Supabase setup (production database)

1. Create a project at [supabase.com](https://supabase.com) → note the **project ref** and DB password.
2. Open **SQL Editor** and run the full contents of [`supabase/schema.sql`](supabase/schema.sql) (idempotent — safe to re-run), then [`supabase/seed.sql`](supabase/seed.sql) for demo data (skip in real production).
3. Copy the **connection string**: *Project Settings → Database → Connection string*. Prefer the **connection pooler** (Supavisor, port `6543`) for serverless:
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```
4. Set it as `DATABASE_URL` in your host (Vercel) or `.env.local` locally.
5. Optional but recommended for KYC images at scale: create a **private Storage bucket** `kyc` and swap the base64 `text` columns for storage paths (kept as base64 in this codebase for zero-config portability).
6. Security hardening before real money: enable **RLS** on all tables with per-user policies (`auth.uid()`), or route all access through a service-role key used only server-side (current design).

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. Vercel → **Add New → Project** → import the repo (framework: Next.js, auto-detected).
3. **Environment variables** (Production + Preview):
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Supabase pooler connection string (see above) |
4. Deploy. The build runs `next build`; no extra steps needed.
5. Post-deploy smoke test: `GET /api/health` → `{ "status": "ok", "database": "up" }`.
6. Point a custom domain (e.g. `app.sdkpay.com`) to the project; set `APP_URL` if you fork link generation (`/pay/...` uses `window.location.origin` client-side, so it works out of the box).

---

## Architecture notes

- **Server Components by default**; client components only where interactivity demands it (`"use client"` flows: deposit/withdraw/send/wizard/chat/toggles).
- **Server Actions** (`src/lib/actions.ts`) own all mutations: auth, transfers, link CRUD, KYC submit, admin approve/reject — every action re-checks the session server-side; admin actions additionally require `role = 'admin'`.
- **Money math** — amounts are `numeric(16,2)`; fees computed server-side; balances adjusted atomically in the same action as the ledger insert.
- **Session** — `sdk_session` HTTP-only cookie holding the user id; `requireUser()`/`getSessionUser()` gate every protected page and action.
- **KYC images** — resized client-side (≤1280px, JPEG q≈0.78) and stored as data URLs; suitable for demo and small deployments, move to Supabase Storage for high volume (swap `front_image`/`back_image`/`selfie_image` to storage keys).
- **CSV export** — `/api/export/csv` streams the caller's ledger.
- **Hosted checkout** — `/pay/[slug]` is public by design; paying inserts a `payment_received` ledger entry, increments link counters and notifies the merchant.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npx drizzle-kit push` | Push Drizzle schema to the DB (alternative to `schema.sql`) |
| `node scripts/seed-kyc-demo.mjs` | Seed a pending KYC demo user |

## Security checklist for production

- [ ] Replace SHA-256 demo hashing with bcrypt/argon2 + rate limiting on `/login` and `/signup`
- [ ] Enable RLS or keep all DB access behind server actions (current) — never expose `DATABASE_URL`
- [ ] Move KYC images to private Storage with signed URLs
- [ ] Webhook signatures (`X-SDK-Signature`) for `POST /v1/*` — HMAC-SHA256 with per-merchant secret (UI included at `/api`)
- [ ] Rotate `API keys` regularly; sandbox keys (`ak_test_`) for testing
- [ ] Add CSRF protection for cookie-authenticated mutations (SameSite=Lax already set)

## License

Proprietary — © 2026 SDK Pay Inc. All rights reserved.

---

## Payment providers — AshTech Pay (primary) + SasPay (backup)

SDK Pay does **not** use hosted checkout. All Mobile Money collections and payouts go through **Direct APIs**, server-side, with raw-body HMAC-SHA256 webhook verification.

```
Deposit / Send / Payout
        │
        ▼
┌───────────────────────┐   unavailable    ┌───────────────────────┐
│  AshTech Pay          │ ───────────────▶ │  SasPay               │
│  POST /v1/collect     │  (op/country not │  POST /payments/      │
│  POST /v1/payouts/…   │   in AshTech     │   softpay/            │
│  GET  /v1/transaction │   or 5xx/timeout)│  GET  /payments/:id/  │
└───────────────────────┘                  │       verify/          │
                                           └───────────────────────┘
        │
        ▼
   Ledger + balance update (idempotent, webhook-driven)
```

### How it works

- **Primary** — AshTech Pay Direct API (`ASHTECH_API_KEY`, `ASHTECH_USER_ID`): `POST /v1/collect` for Mobile Money pushes, `POST /v1/crypto/collect` for USDT, `POST /v1/payouts/mobile-money` for withdrawals, `GET /v1/transaction/:id` for status, `GET /v1/countries` + `GET /v1/fees` for the live catalog. `notify_url` is set automatically from `APP_URL`.
- **Backup** — SasPay (`SASPAY_API_KEY`): `POST /payments/softpay/` (network codes resolved live from `GET /countries/`, matched by country + operator keywords, e.g. `mtn_bj`), `POST /payouts/initialize/`, `GET /payments/:id/verify/`. Used automatically when AshTech reports the operator/country as unavailable (4xx catalog errors, 5xx or timeouts). Auth errors (401/403/429) never fail over — they surface so they can be fixed.
- **Webhooks** — `/api/webhooks/ashtech` and `/api/webhooks/saspay`: raw-body HMAC-SHA256 verification (hex or base64, `sha256=`-prefix tolerated, several signature-header candidates), then the transaction is settled exactly once via the ledger (`settleCredit`/`settleFailure` are idempotent; payment-link sales bump their counters too).
- **Demo mode** — with no provider keys set, the app behaves exactly as before: top-ups settle a few seconds after submission (clearly badged "Demo mode" on the processing screen) so the full UX can be exercised without credentials.
- **Public hosted checkout** (`/pay/[slug]`) — also provider-routed; payers get a "Confirm on your phone" screen and the page flips to success when the webhook/poll confirms.

### Going live

1. Set `ASHTECH_API_KEY`, `ASHTECH_USER_ID`, `ASHTECH_WEBHOOK_SECRET` (+ `SASPAY_API_KEY`, `SASPAY_WEBHOOK_SECRET` as backup) and `APP_URL` in Vercel.
2. In your AshTech dashboard, set the Direct API webhook URL to `https://<domain>/api/webhooks/ashtech` (secret = `ASHTECH_WEBHOOK_SECRET`). Same for SasPay → `/api/webhooks/saspay`.
3. Verify with a small live collection (500 FCFA) before enabling for users.

See `.env.example` for the full variable list and `src/lib/providers/` for the adapters (`types.ts`, `ashtech.ts`, `saspay.ts`, `index.ts` router, `src/lib/ledger.ts` for idempotent settlement).

---

## Two deployments, one codebase — merchant app + admin console

SDK Pay deploys as **two independent apps** from this same repository, gated by `APP_ROLE`:

| Deployment | APP_ROLE | Domain | Serves |
|---|---|---|---|
| Merchant app | `merchant` | `app.sdkpay.com` (or preview default) | Customer app. `/admin/*` returns **404** — hidden entirely. |
| Admin console | `admin` | `admin.sdkpay.com` | `/admin/*` + `/login` + API/assets only. Everything else redirects to `/admin`. |
| Local / preview | *(unset)* | localhost / e2b preview | Unified — both apps work, like before. |

### Steps
1. Push the repo to GitHub (already done for the preview).
2. Vercel → New Project → import the repo → **name**: `sdkpay-app`. Env: `DATABASE_URL`, `APP_ROLE=merchant`, provider keys. Deploy.
3. Vercel → New Project → import the same repo again → **name**: `sdkpay-admin`. Env: identical keys + `APP_ROLE=admin`. Deploy.
4. Point domains: `app.sdkpay.com` → `sdkpay-app`, `admin.sdkpay.com` → `sdkpay-admin`.
5. Admin signs in at `admin.sdkpay.com/login` with an admin account (`admin@sdkpay.com` / `admin1234` for the demo) — lands directly on the control plane.

The merchant deployment can't see the console (route physically returns 404); the admin deployment can't serve customer pages. Auth and admin-role checks are enforced inside both apps independently — the proxy is only the outer boundary.

## Admin control plane (`/admin`)

Dark, ledger-first console — intentionally a different product from the merchant app:

- **Overview** — KYC queue, verified/suspended counts, fees collected, incoming-volume chart, custody totals (XAF & USDT), payment-link sales, latest transactions & verification queue, one-tap jumps
- **KYC reviews** — pending/approved/rejected queue with document viewer (front/back/selfie, zoom), approve or reject with quick-reason chips; customers are notified instantly
- **User control** — search & filter every account (name/email/username/phone, KYC/status/role), paginated table; per-user page: suspend/restore, promote to admin, KYC override, **audited balance adjustment** (writes a ledger entry + notifies the user), password reset (shown once), permanent delete; wallets, transaction history, KYC submissions
- **Finance** — **Fees & limits editor** (deposit/withdrawal/send/crypto/conversion %, withdrawal min/max, min deposit — server-side enforced, live everywhere instantly), **Transactions** explorer (search/filter/paginate/read-only, full ledger detail), **Payment links** moderation (activate/deactivate/delete)
- **App control** — **Maintenance mode** (off / banner / full lockout for non-admins) with editable title, message and expected-back time; **feature kill-switches** (deposits, withdrawals, sends, signups, payment links); **announcement banner** with tone (info/warn/critical)
- **Broadcast** — one message into every customer's notification bell, targeted at all / verified / pending / suspended / admins, with live preview and delivery count
- **Release notes** — publish/manage what appears at `/updates` in the app

Both deployments share the same Postgres (Supabase) and the same session cookies are per-domain, so admins simply log in on the admin domain.
