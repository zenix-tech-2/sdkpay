import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, paymentLinks, transactions, users, wallets } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { adminStatements, seedAdminData } from "@/lib/admin-schema";

const statements = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY,
    "full_name" text NOT NULL,
    "username" text NOT NULL,
    "email" text NOT NULL,
    "phone" text NOT NULL,
    "country_code" text NOT NULL DEFAULT 'CM',
    "dial_code" text NOT NULL DEFAULT '+237',
    "referral_code" text NOT NULL,
    "referred_by" text,
    "api_key" text NOT NULL,
    "webhook_secret" text NOT NULL DEFAULT '',
    "password_hash" text NOT NULL,
    "balance" integer NOT NULL DEFAULT 9,
    "usdt_balance" double precision NOT NULL DEFAULT 0,
    "theme" text NOT NULL DEFAULT 'light',
    "notify_email" boolean NOT NULL DEFAULT true,
    "notify_push" boolean NOT NULL DEFAULT false,
    "notify_sms" boolean NOT NULL DEFAULT false,
    "notify_marketing" boolean NOT NULL DEFAULT false,
    "conversion_sources" text NOT NULL DEFAULT '["USD","EUR","XOF","GBP"]',
    "conversion_destination" text NOT NULL DEFAULT '',
    "conversion_active" boolean NOT NULL DEFAULT false,
    "withdrawal_numbers" text NOT NULL DEFAULT '["651010478","690326932"]',
    "pin_configured" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "usdt_balance" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webhook_secret" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme" text NOT NULL DEFAULT 'light'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notify_email" boolean NOT NULL DEFAULT true`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notify_push" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notify_sms" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notify_marketing" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "conversion_sources" text NOT NULL DEFAULT '["USD","EUR","XOF","GBP"]'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "conversion_destination" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "conversion_active" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "withdrawal_numbers" text NOT NULL DEFAULT '["651010478","690326932"]'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pin_configured" boolean NOT NULL DEFAULT true`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_unique" ON "users" ("referral_code")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_api_key_unique" ON "users" ("api_key")`,
  `CREATE TABLE IF NOT EXISTS "sessions" (
    "token" text PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires_at" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "payment_links" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "slug" text NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "amount" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'XAF',
    "status" text NOT NULL DEFAULT 'active',
    "views" integer NOT NULL DEFAULT 0,
    "free_amount" boolean NOT NULL DEFAULT false,
    "pdf_url" text NOT NULL DEFAULT '',
    "allowed_countries" text NOT NULL DEFAULT 'all',
    "image_url" text NOT NULL DEFAULT '',
    "expiry_date" text NOT NULL DEFAULT '',
    "redirect_url" text NOT NULL DEFAULT '',
    "icon_emoji" text NOT NULL DEFAULT '🔗',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "payment_links_slug_unique" ON "payment_links" ("slug")`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "free_amount" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "pdf_url" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "allowed_countries" text NOT NULL DEFAULT 'all'`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "image_url" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "expiry_date" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "redirect_url" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "payment_links" ADD COLUMN IF NOT EXISTS "icon_emoji" text NOT NULL DEFAULT '🔗'`,
  `CREATE TABLE IF NOT EXISTS "transactions" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "link_id" integer,
    "type" text NOT NULL,
    "direction" text NOT NULL,
    "amount" integer NOT NULL,
    "fee" integer NOT NULL DEFAULT 0,
    "status" text NOT NULL DEFAULT 'completed',
    "method" text NOT NULL DEFAULT 'Mobile Money',
    "counterparty" text NOT NULL DEFAULT '',
    "reference" text NOT NULL,
    "note" text NOT NULL DEFAULT '',
    "gross_amount" integer NOT NULL DEFAULT 0,
    "balance_before" integer NOT NULL DEFAULT 0,
    "balance_after" integer NOT NULL DEFAULT 0,
    "site_reference" text NOT NULL DEFAULT '',
    "recipient_name" text NOT NULL DEFAULT '',
    "country_name" text NOT NULL DEFAULT 'Cameroun',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "currency" text NOT NULL DEFAULT 'XAF',
    "amount_decimal" double precision NOT NULL DEFAULT 0,
    "fee_decimal" double precision NOT NULL DEFAULT 0,
    "gross_decimal" double precision NOT NULL DEFAULT 0,
    "balance_before_decimal" double precision NOT NULL DEFAULT 0,
    "balance_after_decimal" double precision NOT NULL DEFAULT 0,
    "network" text NOT NULL DEFAULT '',
    "wallet_address" text NOT NULL DEFAULT '',
    "deposit_address" text NOT NULL DEFAULT '',
    "provider_reference" text NOT NULL DEFAULT '',
    "fee_payer" text NOT NULL DEFAULT '',
    "flow" text NOT NULL DEFAULT '',
    "expires_at" timestamptz,
    "provider" text NOT NULL DEFAULT 'ashtechpay',
    "provider_external_id" text NOT NULL DEFAULT '',
    "provider_checkout_url" text NOT NULL DEFAULT '',
    "provider_fallback" boolean NOT NULL DEFAULT false,
    "provider_status" text NOT NULL DEFAULT ''
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "transactions_reference_unique" ON "transactions" ("reference")`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "gross_amount" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "balance_before" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "balance_after" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "site_reference" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "recipient_name" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "country_name" text NOT NULL DEFAULT 'Cameroun'`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now()`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'XAF'`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "amount_decimal" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "fee_decimal" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "gross_decimal" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "balance_before_decimal" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "balance_after_decimal" double precision NOT NULL DEFAULT 0`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "network" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "wallet_address" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "deposit_address" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider_reference" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "fee_payer" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "flow" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "expires_at" timestamptz`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider" text NOT NULL DEFAULT 'ashtechpay'`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider_external_id" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider_checkout_url" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider_fallback" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "provider_status" text NOT NULL DEFAULT ''`,
  `CREATE TABLE IF NOT EXISTS "support_messages" (
    "id" serial PRIMARY KEY,
    "user_id" integer,
    "email" text NOT NULL,
    "message" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "wallets" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "currency" text NOT NULL,
    "country_name" text NOT NULL,
    "flag" text NOT NULL DEFAULT '🇨🇲',
    "balance" double precision NOT NULL DEFAULT 0,
    "is_primary" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wallets_user_currency_unique" ON "wallets" ("user_id", "currency")`,
  `CREATE TABLE IF NOT EXISTS "kyc_updates" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "full_name" text NOT NULL,
    "document_type" text NOT NULL,
    "document_number" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text NOT NULL DEFAULT 'info',
    "is_read" boolean NOT NULL DEFAULT false,
    "link" text NOT NULL DEFAULT '',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  ...adminStatements,
];

const demoLinks = [
  { slug: "don-cashflow", title: "Cash-flow digital", description: "Produit digital", amount: 4500, views: 0, freeAmount: false, iconEmoji: "💰" },
  { slug: "hp-online", title: "InstantBoost wallet top-up", description: "Recharge wallet", amount: 6000, views: 2, freeAmount: false, iconEmoji: "🔗" },
  { slug: "hp-home", title: "InstantBoost wallet top-up", description: "Recharge wallet", amount: 6000, views: 2, freeAmount: false, iconEmoji: "🔗" },
  { slug: "Pqa", title: "Paiment", description: "Montant libre", amount: 0, views: 2, freeAmount: true, iconEmoji: "🔗" },
];

const demoNotifications = [
  { title: "Deposit pending", message: "Your deposit of 480 XAF is being processed.", type: "pending", isRead: false, link: "/dashboard/transactions", createdAt: new Date("2026-11-25T01:11:00.000Z") },
  { title: "Deposit rejected", message: "Your deposit was rejected or failed. No amount was debited.", type: "rejected", isRead: false, link: "/dashboard/transactions/5", createdAt: new Date("2026-11-18T22:50:00.000Z") },
  { title: "Deposit rejected", message: "Your deposit was rejected or failed. No amount was debited.", type: "rejected", isRead: false, link: "/dashboard/transactions/6", createdAt: new Date("2026-11-18T22:48:00.000Z") },
  { title: "Withdrawal confirmed", message: "Votre retrait de 12710.40 XAF a été validé manuellement.", type: "confirmed", isRead: true, link: "/dashboard/transactions/7", createdAt: new Date("2026-11-18T20:24:00.000Z") },
  { title: "Retrait en attente", message: "Votre retrait de 13,240 XAF est en attente de vérification par...", type: "pending", isRead: true, link: "/dashboard/transactions/7", createdAt: new Date("2026-11-18T19:49:00.000Z") },
];

const history: [string, string, string, string, number, string, string, string][] = [
  ["2026-11-18", "22:50", "api_payment", "in", 576, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-18", "22:48", "api_payment", "in", 2863, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-18", "19:49", "withdraw", "out", 12710, "completed", "MTN Money", "Withdrawal"],
  ["2026-11-18", "19:47", "deposit", "in", 13248, "completed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-13", "22:20", "api_payment", "in", 2808, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-13", "22:17", "api_payment", "in", 2808, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-13", "18:05", "deposit", "in", 1450, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-13", "17:42", "api_payment", "in", 990, "failed", "MTN Money", "Mobile Money Deposit"],
  ["2026-11-12", "20:31", "deposit", "in", 725, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-12", "12:18", "send", "out", 2100, "failed", "Wave", "Transfer"],
  ["2026-11-10", "09:44", "api_payment", "in", 3100, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-10", "09:12", "deposit", "in", 1800, "failed", "MTN Money", "Mobile Money Deposit"],
  ["2026-11-08", "16:27", "withdraw", "out", 4500, "failed", "MTN Money", "Withdrawal"],
  ["2026-11-08", "15:03", "deposit", "in", 600, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-05", "11:55", "api_payment", "in", 2100, "failed", "Wave", "Mobile Money Deposit"],
  ["2026-11-05", "10:20", "send", "out", 950, "failed", "Orange Money", "Transfer"],
  ["2026-11-03", "14:11", "deposit", "in", 3400, "failed", "MTN Money", "Mobile Money Deposit"],
  ["2026-11-02", "08:36", "deposit", "in", 1250, "failed", "Orange Money", "Mobile Money Deposit"],
  ["2026-11-01", "19:08", "api_payment", "in", 500, "failed", "MTN Money", "Mobile Money Deposit"],
];

type HistoryMeta = {
  reference?: string;
  siteReference?: string;
  grossAmount?: number;
  fee?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  recipientName?: string;
  countryName?: string;
  counterparty?: string;
  updatedAt?: Date;
};

const historyMeta: Record<number, HistoryMeta> = {
  0: {
    reference: "SDK-D-3RV1CNVF1064GP",
    siteReference: "IB-MMMNN1NW-IWLPA",
    grossAmount: 600,
    fee: 24,
    balanceBefore: 9,
    balanceAfter: 9,
    counterparty: "675371759",
    countryName: "Cameroun",
    updatedAt: new Date("2026-11-18T22:50:00.000Z"),
  },
  2: {
    reference: "SDK-W-C65LWTXFOXUOKN",
    siteReference: "IB-W-C65LWTXFOXUOKN",
    grossAmount: 13240,
    fee: 530,
    balanceBefore: 13249,
    balanceAfter: 9,
    recipientName: "Honest techs",
    counterparty: "651010478",
    countryName: "Cameroun",
    updatedAt: new Date("2026-11-18T20:24:00.000Z"),
  },
  3: {
    reference: "SDK-D-30QJ19K9D9KIH4",
    siteReference: "IB-D-30QJ19K9D9KIH4",
    grossAmount: 13800,
    fee: 552,
    balanceBefore: 1,
    balanceAfter: 13249,
    counterparty: "690326932",
    countryName: "Cameroun",
    updatedAt: new Date("2026-11-18T19:47:00.000Z"),
  },
};

function buildHistoryRows(userId: number) {
  return history.map(([day, time, type, direction, amount, status, method, note], index) => {
    const pad = String(index + 1).padStart(2, "0");
    const createdAt = new Date(`${day}T${time}:00.000Z`);
    const meta = historyMeta[index] ?? {};
    return {
      userId,
      linkId: null,
      type,
      direction,
      amount,
      fee: meta.fee ?? 0,
      status,
      method,
      counterparty: meta.counterparty ?? "+237690000000",
      reference: meta.reference ?? `DEMO-2026-${pad}`,
      note,
      grossAmount: meta.grossAmount ?? amount,
      balanceBefore: meta.balanceBefore ?? 9,
      balanceAfter: meta.balanceAfter ?? 9,
      siteReference: meta.siteReference ?? `IB-DEMO-${pad}-SDKPAY`,
      recipientName: meta.recipientName ?? "",
      countryName: meta.countryName ?? "Cameroun",
      createdAt,
      updatedAt: meta.updatedAt ?? createdAt,
    };
  });
}

const globalForSchema = globalThis as typeof globalThis & { __sdkPaySchemaReady?: Promise<void> };

async function bootstrap() {
  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }
  const demo = await db.select().from(users).where(eq(users.email, "demo@sdkpay.com")).limit(1);
  if (demo.length === 0) {
    await db.insert(users).values({
      fullName: "Honest techs",
      username: "honesttechs",
      email: "demo@sdkpay.com",
      phone: "690000000",
      countryCode: "CM",
      dialCode: "+237",
      referralCode: "sdk2026",
      apiKey: "sk_test_demo_sdkpay_2026",
      passwordHash: hashPassword("demo1234"),
      balance: 9,
    }).onConflictDoNothing();
  }
  const [account] = await db.select({ id: users.id }).from(users).where(eq(users.email, "demo@sdkpay.com")).limit(1);
  if (!account) return;

  await db.insert(wallets).values({
    userId: account.id,
    currency: "XAF",
    countryName: "Cameroon XAF",
    flag: "🇨🇲",
    balance: 9.44,
    isPrimary: true,
  }).onConflictDoNothing();

  await db.insert(paymentLinks).values([
    {
      userId: account.id,
      slug: "welcome-demo",
      title: "Produit de démonstration",
      description: "Découvrez le checkout SDK Pay : ce paiement de démonstration crédite instantanément le wallet du marchand.",
      amount: 2500,
      currency: "XAF",
      status: "active",
      createdAt: new Date("2026-10-28T09:00:00.000Z"),
    },
    ...demoLinks.map((link, index) => ({
      userId: account.id,
      currency: "XAF",
      status: "active",
      ...link,
      createdAt: new Date(Date.UTC(2026, 10, 18, 10, 0 - index)),
    })),
  ]).onConflictDoNothing();
  await db.update(paymentLinks).set({ createdAt: new Date("2026-10-28T09:00:00.000Z") }).where(eq(paymentLinks.slug, "welcome-demo"));
  for (let index = 0; index < demoLinks.length; index++) {
    await db.update(paymentLinks)
      .set({ createdAt: new Date(Date.UTC(2026, 10, 18, 10, -index)) })
      .where(eq(paymentLinks.slug, demoLinks[index].slug));
  }

  const existingTransactions = await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.userId, account.id)).limit(1);
  const historyRows = buildHistoryRows(account.id);
  if (existingTransactions.length === 0) {
    await db.insert(transactions).values(historyRows).onConflictDoNothing();
  } else {
    for (let index = 0; index < historyRows.length; index++) {
      const oldReference = `DEMO-2026-${String(index + 1).padStart(2, "0")}`;
      await db.update(transactions).set(historyRows[index]).where(eq(transactions.reference, oldReference));
    }
  }

  const existingNotifications = await db.select({ id: notifications.id }).from(notifications).where(eq(notifications.userId, account.id)).limit(1);
  if (existingNotifications.length === 0) {
    await db.insert(notifications).values(demoNotifications.map((item) => ({ userId: account.id, ...item })));
  }

  await seedAdminData();
}

export function ensureSchema() {
  if (!globalForSchema.__sdkPaySchemaReady) {
    globalForSchema.__sdkPaySchemaReady = bootstrap().catch((error) => {
      globalForSchema.__sdkPaySchemaReady = undefined;
      throw error;
    });
  }
  return globalForSchema.__sdkPaySchemaReady;
}
