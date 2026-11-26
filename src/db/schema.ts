import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("sdkpay_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  username: varchar("username", { length: 60 }).notNull().unique(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }).notNull(),
  countryCode: varchar("country_code", { length: 10 }).notNull().default("+237"),
  country: varchar("country", { length: 80 }).notNull().default("Cameroun"),
  referralCode: varchar("referral_code", { length: 10 }).notNull().unique(),
  referredBy: varchar("referred_by", { length: 10 }),
  passwordHash: text("password_hash").notNull(),
  balanceXaf: integer("balance_xaf").notNull().default(0),
  balanceXof: integer("balance_xof").notNull().default(0),
  balanceUsdt: integer("balance_usdt").notNull().default(0),
  reducedFeeUntil: timestamp("reduced_fee_until"),
  webhookSecret: text("webhook_secret"),
  webhookUrl: text("webhook_url"),
  pinHash: text("pin_hash"),
  notifPrefs: text("notif_prefs"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  internalNote: text("internal_note"),
  lastLoginAt: timestamp("last_login_at"),
  kycStatus: varchar("kyc_status", { length: 20 }).notNull().default("pending"),
  language: varchar("language", { length: 5 }).notNull().default("fr"),
  avatarColor: varchar("avatar_color", { length: 20 }).notNull().default("amber"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sdkpay_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  tokenId: varchar("token_id", { length: 64 }).notNull().unique(),
  device: varchar("device", { length: 120 }),
  ip: varchar("ip", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentLinks = pgTable("sdkpay_payment_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  amount: integer("amount"),
  currency: varchar("currency", { length: 8 }).notNull().default("XAF"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  views: integer("views").notNull().default(0),
  totalCollected: integer("total_collected").notNull().default(0),
  paymentsCount: integer("payments_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  imageUrl: text("image_url"),
  pdfUrl: text("pdf_url"),
  redirectUrl: text("redirect_url"),
  allowedCountries: varchar("allowed_countries", { length: 200 }).notNull().default("ALL"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("sdkpay_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("XAF"),
  fee: integer("fee").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("success"),
  operator: varchar("operator", { length: 60 }),
  phone: varchar("phone", { length: 40 }),
  reference: varchar("reference", { length: 60 }).notNull(),
  label: varchar("label", { length: 200 }),
  paymentLinkId: uuid("payment_link_id"),
  counterparty: varchar("counterparty", { length: 120 }),
  channel: varchar("channel", { length: 20 }).notNull().default("dashboard"),
  provider: varchar("provider", { length: 20 }),
  providerRef: varchar("provider_ref", { length: 120 }),
  country: varchar("country", { length: 80 }),
  balanceBefore: integer("balance_before"),
  balanceAfter: integer("balance_after"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("sdkpay_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("sdkpay_referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerId: uuid("referrer_id").notNull(),
  referredId: uuid("referred_id").notNull(),
  reward: integer("reward").notNull().default(500),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("sdkpay_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 80 }).notNull().default("Clé principale"),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  keyHash: text("key_hash").notNull(),
  isLive: boolean("is_live").notNull().default(false),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payoutNumbers = pgTable("sdkpay_payout_numbers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  kind: varchar("kind", { length: 10 }).notNull().default("momo"),
  label: varchar("label", { length: 80 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  operator: varchar("operator", { length: 60 }),
  network: varchar("network", { length: 20 }),
  country: varchar("country", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("sdkpay_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  walletCode: varchar("wallet_code", { length: 10 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  countryCode: varchar("country_code", { length: 10 }).notNull(),
  flag: varchar("flag", { length: 10 }).notNull().default("🌍"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("sdkpay_support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  category: varchar("category", { length: 40 }).notNull().default("general"),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const providerEvents = pgTable("sdkpay_provider_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  txId: uuid("tx_id"),
  userId: uuid("user_id"),
  provider: varchar("provider", { length: 20 }).notNull(),
  action: varchar("action", { length: 40 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("ok"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversionRules = pgTable("sdkpay_conversion_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  sources: text("sources").notNull(),
  destination: varchar("destination", { length: 10 }).notNull(),
  threshold: integer("threshold").notNull().default(500),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("sdkpay_admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("support"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("sdkpay_admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").notNull(),
  tokenId: varchar("token_id", { length: 64 }).notNull().unique(),
  device: varchar("device", { length: 120 }),
  ip: varchar("ip", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminAudit = pgTable("sdkpay_admin_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id"),
  adminEmail: varchar("admin_email", { length: 160 }),
  action: varchar("action", { length: 80 }).notNull(),
  target: varchar("target", { length: 200 }),
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kycSubmissions = pgTable("sdkpay_kyc_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  idType: varchar("id_type", { length: 40 }).notNull(),
  idNumber: varchar("id_number", { length: 80 }).notNull(),
  frontName: varchar("front_name", { length: 160 }),
  backName: varchar("back_name", { length: 160 }),
  frontUrl: text("front_url"),
  backUrl: text("back_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewNote: text("review_note"),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refunds = pgTable("sdkpay_refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull().default("refund"),
  userId: uuid("user_id").notNull(),
  txId: uuid("tx_id"),
  reference: varchar("reference", { length: 60 }).notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("XAF"),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  decidedBy: uuid("decided_by"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("sdkpay_announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  bullets: text("bullets"),
  mediaUrl: text("media_url"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketReplies = pgTable("sdkpay_ticket_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull(),
  author: varchar("author", { length: 10 }).notNull(),
  adminId: uuid("admin_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platformSettings = pgTable("sdkpay_platform_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("sdkpay_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
