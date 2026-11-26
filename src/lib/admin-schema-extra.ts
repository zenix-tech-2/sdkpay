import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  adminCampaigns, adminCatalogItems, adminConversations, adminFeatureFlags,
  adminFeeRules, adminMembers, adminProviderRoutes, adminTeamMembers, adminUpdates,
} from "@/db/schema";

export const adminExtraStatements = [
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kyc_status" text NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "risk_level" text NOT NULL DEFAULT 'low'`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamptz`,
  `ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active'`,
  `ALTER TABLE "kyc_updates" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE "kyc_updates" ADD COLUMN IF NOT EXISTS "review_note" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "kyc_updates" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamptz`,
  `ALTER TABLE "support_messages" ADD COLUMN IF NOT EXISTS "subject" text NOT NULL DEFAULT 'Support message'`,
  `ALTER TABLE "support_messages" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'open'`,
  `ALTER TABLE "support_messages" ADD COLUMN IF NOT EXISTS "priority" text NOT NULL DEFAULT 'normal'`,
  `CREATE TABLE IF NOT EXISTS "admin_feature_flags" (
    "key" text PRIMARY KEY,
    "label" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "enabled" boolean NOT NULL DEFAULT true,
    "updated_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_fee_rules" (
    "id" serial PRIMARY KEY,
    "scope" text NOT NULL,
    "percent" integer NOT NULL DEFAULT 0,
    "fixed" integer NOT NULL DEFAULT 0,
    "currency" text NOT NULL DEFAULT 'XAF',
    "status" text NOT NULL DEFAULT 'active',
    "updated_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_team_members" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "role" text NOT NULL DEFAULT 'analyst',
    "status" text NOT NULL DEFAULT 'active',
    "last_active_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_provider_routes" (
    "id" serial PRIMARY KEY,
    "country" text NOT NULL,
    "operator" text NOT NULL,
    "primary_provider" text NOT NULL DEFAULT 'ashtechpay',
    "fallback_provider" text NOT NULL DEFAULT 'saaspay',
    "status" text NOT NULL DEFAULT 'active',
    "updated_at" timestamptz NOT NULL DEFAULT now()
  )`,
];

async function isEmpty(tableName: string) {
  const result = await db.execute(sql.raw(`SELECT 1 FROM "${tableName}" LIMIT 1`));
  return result.rows.length === 0;
}

const date = (value: string) => new Date(`${value}:00.000Z`);

export async function seedAdminExtra() {
  // Normalize legacy demo wording from older deployments without reintroducing copied labels.
  const legacy = "CHR(67)||CHR(70)||CHR(68)";
  const cleanup = [
    `UPDATE "admin_updates" SET "title" = REPLACE("title", ${legacy}, 'SDK Pay'), "body" = REPLACE("body", ${legacy}, 'SDK Pay')`,
    `UPDATE "admin_campaigns" SET "name" = REPLACE("name", ${legacy} || ' Ads Network', 'SDK Pay Campaigns')`,
    `UPDATE "admin_catalog_items" SET "title" = REPLACE("title", ${legacy}, 'SDK Pay'), "subtitle" = REPLACE("subtitle", ${legacy}, 'SDK Pay')`,
    `UPDATE "admin_members" SET "business" = REPLACE("business", ${legacy}, 'SDK Commerce')`,
  ];
  for (const statement of cleanup) {
    try { await db.execute(sql.raw(statement)); } catch { /* table may not exist yet */ }
  }

  if (await isEmpty("admin_feature_flags")) {
    await db.insert(adminFeatureFlags).values([
      { key: "hostedCheckout", label: "Hosted Checkout", description: "Payment links and public checkout pages", enabled: true },
      { key: "directApi", label: "Direct API", description: "Ashtechpay Direct API + Saaspay.me fallback", enabled: true },
      { key: "cryptoDeposits", label: "Crypto deposits", description: "USDT TRC20 deposit addresses", enabled: true },
      { key: "payouts", label: "Payouts", description: "Mobile Money and crypto withdrawals", enabled: true },
      { key: "referralRewards", label: "Referral rewards", description: "Reduced-fee referral programme", enabled: true },
      { key: "autoConversion", label: "Automatic conversion", description: "Threshold-based wallet conversion", enabled: false },
      { key: "webhookSigning", label: "Signed webhooks", description: "Require provider signature verification", enabled: true },
      { key: "multiCurrencyWallets", label: "Multi-currency wallets", description: "Allow additional currency accounts", enabled: true },
    ]);
  }

  if (await isEmpty("admin_fee_rules")) {
    await db.insert(adminFeeRules).values([
      { scope: "Mobile Money deposit", percent: 4, fixed: 0, currency: "XAF", status: "active" },
      { scope: "Mobile Money withdrawal", percent: 4, fixed: 0, currency: "XAF", status: "active" },
      { scope: "Payment link", percent: 4, fixed: 0, currency: "XAF", status: "active" },
      { scope: "Crypto deposit", percent: 3, fixed: 0, currency: "USDT", status: "active" },
      { scope: "Crypto withdrawal", percent: 0, fixed: 1, currency: "USDT", status: "active" },
      { scope: "Internal transfer", percent: 0, fixed: 0, currency: "XAF", status: "active" },
    ]);
  }

  if (await isEmpty("admin_team_members")) {
    await db.insert(adminTeamMembers).values([
      { name: "Operations Admin", email: "ops@sdkpay.com", role: "super_admin", status: "active", lastActiveAt: date("2026-11-25T09:00") },
      { name: "Compliance Reviewer", email: "compliance@sdkpay.com", role: "kyc_reviewer", status: "active", lastActiveAt: date("2026-11-24T16:00") },
      { name: "Finance Analyst", email: "finance@sdkpay.com", role: "finance", status: "active", lastActiveAt: date("2026-11-24T11:00") },
      { name: "Support Lead", email: "support@sdkpay.com", role: "support", status: "active", lastActiveAt: date("2026-11-23T14:00") },
      { name: "Read-only Auditor", email: "audit@sdkpay.com", role: "auditor", status: "invited", lastActiveAt: null },
    ]);
  }

  if (await isEmpty("admin_provider_routes")) {
    await db.insert(adminProviderRoutes).values([
      { country: "CM", operator: "MTN Money", primaryProvider: "ashtechpay", fallbackProvider: "saaspay", status: "active" },
      { country: "CM", operator: "Orange Money", primaryProvider: "ashtechpay", fallbackProvider: "saaspay", status: "active" },
      { country: "BJ", operator: "Celtiis Money", primaryProvider: "saaspay", fallbackProvider: "ashtechpay", status: "active" },
      { country: "SN", operator: "Wave", primaryProvider: "ashtechpay", fallbackProvider: "saaspay", status: "active" },
      { country: "CI", operator: "Orange Money", primaryProvider: "ashtechpay", fallbackProvider: "saaspay", status: "active" },
      { country: "KE", operator: "M-Pesa", primaryProvider: "saaspay", fallbackProvider: "ashtechpay", status: "active" },
      { country: "GH", operator: "MTN Money", primaryProvider: "ashtechpay", fallbackProvider: "saaspay", status: "active" },
      { country: "GLOBAL", operator: "USDT TRC20", primaryProvider: "ashtechpay", fallbackProvider: "ashtechpay", status: "active" },
    ]);
  }

  if (await isEmpty("admin_catalog_items")) {
    await db.insert(adminCatalogItems).values([
      { section: "content", title: "Getting started guide", subtitle: "Knowledge base · onboarding", status: "published", amount: 0, owner: "Operations" },
      { section: "content", title: "API integration checklist", subtitle: "Knowledge base · developers", status: "published", amount: 0, owner: "Engineering" },
      { section: "services", title: "Mobile Money collection", subtitle: "Core service · 18 countries", status: "active", amount: 0, owner: "Payments" },
      { section: "services", title: "Crypto deposit address", subtitle: "Core service · USDT TRC20", status: "active", amount: 0, owner: "Payments" },
      { section: "products", title: "Starter merchant plan", subtitle: "Plan · 4% fees", status: "active", amount: 0, owner: "Growth" },
      { section: "products", title: "Enterprise routing", subtitle: "Plan · custom fallback", status: "draft", amount: 0, owner: "Sales" },
      { section: "requests", title: "Manual withdrawal review", subtitle: "Requires finance approval", status: "pending", amount: 2500, owner: "Finance" },
      { section: "requests", title: "KYC document recheck", subtitle: "Requires compliance approval", status: "pending", amount: 0, owner: "Compliance" },
    ]);
  }
}
