-- ============================================================================
-- SDK Pay — demo seed data (matches the product screenshots)
-- Demo login → email: honestansah@gmail.com   password: demo1234
-- Run AFTER supabase/schema.sql
-- ============================================================================

BEGIN;

-- ---------- demo user ----------
INSERT INTO users (id, full_name, username, email, phone, country, country_code, kyc_status, password_hash, public_id, referral_code)
VALUES ('11111111-1111-4111-8111-111111111111', 'Honest techs', 'raymond', 'honestansah@gmail.com', '651010478', 'Cameroun', 'cm', 'verified',
        '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'SDKPAY53769259', 'RAYMOND50')
ON CONFLICT (id) DO NOTHING;

-- ---------- wallets ----------
INSERT INTO accounts (id, user_id, currency, country, country_code, balance, is_primary) VALUES
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111111', 'XAF',  'Cameroon',      'cm', 9.44,  true),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'XOFB', 'Bénin',         'bj', 0.00,  false),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111111', 'USDT', 'Crypto · Tron', 'xx', 0.00,  false)
ON CONFLICT (id) DO NOTHING;

-- ---------- payment links ----------
INSERT INTO payment_links (id, user_id, slug, title, description, amount, currency, clicks, payments_count, collected, active) VALUES
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', 'cash-flow-d0881k', 'Cash-flow digital',          'Payment for digital services subscription', 4500, 'XAF', 0, 0, 0, true),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111111', 'hp-o9281d',        'InstantBoost wallet top-up', 'Wallet top-up for InstantBoost users',     6000, 'XAF', 2, 0, 0, true),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'hp-h3812d',        'InstantBoost wallet top-up', 'Wallet top-up for InstantBoost users',     6000, 'XAF', 2, 0, 0, true),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111111', 'Pqa91x',           'Paiement',                   NULL,                                       NULL, 'XAF', 2, 0, 0, true),
  ('33333333-3333-4333-8333-333333333335', '11111111-1111-4111-8111-111111111111', 'cozr523d',         'My app',                     'Payment for my app',                       NULL, 'XAF', 0, 0, 0, true)
ON CONFLICT (id) DO NOTHING;

-- ---------- transactions ----------
INSERT INTO transactions
  (user_id, ref, site_ref, type, direction, status, amount, fee, fee_percent, net, currency, operator, country, recipient, recipient_phone, source, balance_before, balance_after, created_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-1QUW4CGT6LMGCF', NULL, 'deposit', 'credit', 'pending', 500, 20, 4.00, 480, 'XAF', 'MTN_MONEY', 'Cameroun', NULL, '651010478', 'app', 9.44, 9.44, '2026-11-25 01:11:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-3RV1CNVF1064GP', 'IB-MWMNN1NW-IWLPA', 'deposit', 'credit', 'failed', 600, 24, 4.00, 576, 'XAF', 'ORANGE_MONEY', 'Cameroun', NULL, '675371759', 'api', 9.44, 9.44, '2026-11-18 22:50:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-8T2KQR11MA22XN', 'IB-7FQ2MWXA-992LB', 'deposit', 'credit', 'failed', 2982, 119, 4.00, 2863, 'XAF', 'ORANGE_MONEY', 'Cameroun', NULL, '690326932', 'api', 9.44, 9.44, '2026-11-18 22:48:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-W-C65LWTXFOXUOKN', NULL, 'withdrawal', 'debit', 'completed', 13240, 530, 4.00, 12710, 'XAF', 'MTN_MONEY', 'Cameroun', 'Honest techs', '651010478', 'app', 13249.44, 9.44, '2026-11-18 19:49:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-30QJ19K9D9KIH4', NULL, 'deposit', 'credit', 'completed', 13800, 552, 4.00, 13248, 'XAF', 'ORANGE_MONEY', 'Cameroun', NULL, '690326932', 'app', 1.44, 13249.44, '2026-11-18 19:47:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-2F7KQV93MB31ZT', 'IB-2XKB91LM-QPW10', 'deposit', 'credit', 'failed', 2925, 117, 4.00, 2808, 'XAF', 'ORANGE_MONEY', 'Cameroun', NULL, '675371759', 'api', 1.44, 1.44, '2026-11-13 22:20:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'ASH-D-7AH4RD19QW55MZ', 'IB-2XKB91LM-QPX11', 'deposit', 'credit', 'failed', 2925, 117, 4.00, 2808, 'XAF', 'ORANGE_MONEY', 'Cameroun', NULL, '675371759', 'api', 1.44, 1.44, '2026-11-13 22:17:00+00')
ON CONFLICT (ref) DO NOTHING;

-- ---------- notifications ----------
INSERT INTO notifications (user_id, title, body, kind, read, created_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Deposit pending',   'Your deposit of 480 XAF is being processed.', 'deposit_pending',  false, '2026-11-25 01:11:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Deposit rejected',  'Your deposit was rejected or failed. No amount was debited.', 'deposit_rejected', false, '2026-11-18 22:50:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Deposit rejected',  'Your deposit was rejected or failed. No amount was debited.', 'deposit_rejected', false, '2026-11-18 22:48:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Withdrawal confirmed', 'Votre retrait de 12710.40 XAF a été validé manuellement.', 'withdrawal_confirmed', true, '2026-11-18 20:24:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Retrait en attente', 'Votre retrait de 13,240 XAF est en attente de vérification par nos équipes.', 'withdrawal_confirmed', true, '2026-11-18 19:49:00+00')
ON CONFLICT DO NOTHING;

-- ---------- api key ----------
INSERT INTO api_keys (user_id, api_key, webhook_secret)
VALUES ('11111111-1111-4111-8111-111111111111', 'ak_8e7c4f2a9b41d0c35e6f7a8b9c0d1e2f3a4b5c6d7', NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ---------- connected devices ----------
INSERT INTO devices (user_id, label, ip, last_active, current) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Mobile · Chrome', '162.251.62.98',  '2 days ago',  true),
  ('11111111-1111-4111-8111-111111111111', 'Mobile · Chrome', '86.105.212.251', '6 days ago',  false),
  ('11111111-1111-4111-8111-111111111111', 'Mobile · Chrome', '86.105.212.251', '11 days ago', false),
  ('11111111-1111-4111-8111-111111111111', 'Mobile · Chrome', '216.106.182.83', '20 days ago', false)
ON CONFLICT DO NOTHING;

-- ---------- registered payout numbers ----------
INSERT INTO payout_methods (user_id, operator, phone, country, label) VALUES
  ('11111111-1111-4111-8111-111111111111', 'MTN_MONEY',    '651010478', 'Cameroun', 'Main number'),
  ('11111111-1111-4111-8111-111111111111', 'ORANGE_MONEY', '690326932', 'Cameroun', 'Orange number')
ON CONFLICT DO NOTHING;

-- ---------- saved crypto addresses ----------
INSERT INTO saved_addresses (user_id, network, address, label) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Tron (TRX) · USDT.TRC20', 'TYZQ18SpQTGCiZShoRe5a9i42tf4RsM5Nt', 'Main wallet')
ON CONFLICT DO NOTHING;

COMMIT;

-- ---------- admin user (admin console at /admin) ----------
INSERT INTO users (id, full_name, username, email, phone, country, country_code, kyc_status, role, password_hash, public_id, referral_code)
VALUES ('44444444-4444-4444-8444-444444444444', 'SDK Pay Admin', 'admin', 'admin@sdkpay.com', '600000000', 'Cameroun', 'cm', 'verified', 'admin',
        'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270', 'SDKPAY00000001', 'ADMIN001')
ON CONFLICT (id) DO NOTHING;
