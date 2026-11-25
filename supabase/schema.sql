-- ============================================================================
-- SDK Pay — Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor (or `psql -f supabase/schema.sql`).
-- Idempotent: safe to re-run.
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  username      text NOT NULL UNIQUE,
  email         text NOT NULL UNIQUE,
  phone         text,
  country       text DEFAULT 'Cameroun',
  country_code  text DEFAULT 'cm',
  kyc_status    text NOT NULL DEFAULT 'none' CHECK (kyc_status IN ('none','pending','verified','rejected')),
  kyc_rejection_reason text,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  password_hash text NOT NULL,
  public_id     text NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  avatar_color  text DEFAULT '#f6c21a',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- accounts (wallets) ----------
CREATE TABLE IF NOT EXISTS accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency     text NOT NULL,
  country      text NOT NULL,
  country_code text NOT NULL DEFAULT 'cm',
  balance      numeric(16,2) NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);

-- ---------- payment links ----------
CREATE TABLE IF NOT EXISTS payment_links (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug               text NOT NULL UNIQUE,
  title              text NOT NULL,
  description        text,
  amount             numeric(16,2),               -- NULL = payer enters amount
  currency           text NOT NULL DEFAULT 'XAF',
  clicks             integer NOT NULL DEFAULT 0,
  payments_count     integer NOT NULL DEFAULT 0,
  collected          numeric(16,2) NOT NULL DEFAULT 0,
  active             boolean NOT NULL DEFAULT true,
  allowed_countries  text[],                      -- NULL = all countries
  pdf_url            text,
  redirect_url       text,
  expires_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_links_user_id_idx ON payment_links(user_id);

-- ---------- transactions ----------
CREATE TABLE IF NOT EXISTS transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ref             text NOT NULL UNIQUE,
  site_ref        text,
  type            text NOT NULL,   -- deposit | withdrawal | internal_transfer | mobile_money_send | crypto_send | payment_received
  direction       text NOT NULL CHECK (direction IN ('credit','debit')),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  amount          numeric(16,2) NOT NULL,   -- gross amount debited/expected
  fee             numeric(16,2) NOT NULL DEFAULT 0,
  fee_percent     numeric(5,2)  NOT NULL DEFAULT 0,
  net             numeric(16,2) NOT NULL,   -- amount actually received / sent
  currency        text NOT NULL DEFAULT 'XAF',
  operator        text,
  country         text,
  recipient       text,
  recipient_phone text,
  source          text NOT NULL DEFAULT 'app' CHECK (source IN ('app','api','link','crypto')),
  balance_before  numeric(16,2),
  balance_after   numeric(16,2),
  payment_link_id uuid REFERENCES payment_links(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text NOT NULL,
  kind       text NOT NULL DEFAULT 'info',  -- deposit_pending | deposit_rejected | withdrawal_confirmed | info
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- ---------- api keys ----------
CREATE TABLE IF NOT EXISTS api_keys (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  api_key        text NOT NULL,
  webhook_secret text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ---------- connected devices ----------
CREATE TABLE IF NOT EXISTS devices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       text NOT NULL,
  ip          text NOT NULL,
  last_active text NOT NULL,
  current     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- automatic conversion rules ----------
CREATE TABLE IF NOT EXISTS conversion_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sources     text[] NOT NULL,
  destination text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- registered payout numbers ----------
CREATE TABLE IF NOT EXISTS payout_methods (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operator   text NOT NULL,   -- MTN_MONEY | ORANGE_MONEY
  phone      text NOT NULL,
  country    text NOT NULL DEFAULT 'Cameroun',
  label      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- saved crypto addresses ----------
CREATE TABLE IF NOT EXISTS saved_addresses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  network    text NOT NULL DEFAULT 'Tron (TRX)',
  address    text NOT NULL,
  label      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- referral network ----------
CREATE TABLE IF NOT EXISTS referrals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- KYC submissions (identity verification for admin review) ----------
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type         text NOT NULL CHECK (doc_type IN ('national_id','passport','driver_license')),
  doc_number       text NOT NULL,
  full_name        text NOT NULL,
  date_of_birth    text,
  front_image      text NOT NULL,          -- base64 data URL (move to Supabase Storage in production)
  back_image       text,                   -- not required for passports
  selfie_image     text NOT NULL,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by      text,
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kyc_submissions_user_id_idx ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS kyc_submissions_status_idx ON kyc_submissions(status);

-- ---------- app metadata (releases, flags) ----------
CREATE TABLE IF NOT EXISTS app_meta (
  key   text PRIMARY KEY,
  value jsonb
);

INSERT INTO app_meta(key, value) VALUES
  ('releases', '[{"n":"#01","date":"July 2026","title":"Security update","body":"Two-factor prompt on withdrawals, new PIN hashing and stricter session checks on all devices.","items":["New device approval flow","PIN attempts now limited and audited","Automatic sign-out on 30 days of inactivity"]},{"n":"#02","date":"July 2026","title":"Reduced transaction fees","body":"Transaction fees have been lowered in several countries to offer you better rates.","items":["Lower fees for Mobile Money transactions","New competitive rates for cross-border transfers","Minimum fees adjusted for small amounts","Full transparency: fees shown before confirmation"]},{"n":"#03","date":"July 2026","title":"Reduced conversion fees","body":"Currency conversion is now cheaper across supported wallets.","items":["Conversion fees cut by 30% on XAF, XOF and USD pairs","Same-day settlement for wallet-to-wallet conversions","Automatic conversion rules now available on all accounts"]}]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Migration for databases created with an earlier version of this file
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_rejection_reason text;
ALTER TABLE users ALTER COLUMN kyc_status SET DEFAULT 'none';
