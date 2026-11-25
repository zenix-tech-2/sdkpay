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
