import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  country: text("country").default("Cameroun"),
  countryCode: text("country_code").default("cm"),
  kycStatus: text("kyc_status").notNull().default("none"), // none | pending | verified | rejected
  role: text("role").notNull().default("user"), // user | admin
  kycRejectionReason: text("kyc_rejection_reason"),
  passwordHash: text("password_hash").notNull(),
  publicId: text("public_id").notNull().unique(), // e.g. SDKPAY53769259
  referralCode: text("referral_code").notNull().unique(),
  avatarColor: text("avatar_color").default("#f6c21a"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  currency: text("currency").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull().default("cm"),
  balance: numeric("balance", { precision: 16, scale: 2 }).notNull().default("0"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentLinks = pgTable("payment_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 16, scale: 2 }), // NULL = free amount
  currency: text("currency").notNull().default("XAF"),
  clicks: integer("clicks").notNull().default(0),
  paymentsCount: integer("payments_count").notNull().default(0),
  collected: numeric("collected", { precision: 16, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  allowedCountries: text("allowed_countries").array(), // NULL = all countries
  pdfUrl: text("pdf_url"),
  redirectUrl: text("redirect_url"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ref: text("ref").notNull().unique(),
  siteRef: text("site_ref"),
  type: text("type").notNull(), // deposit | withdrawal | internal_transfer | mobile_money_send | crypto_send | payment_received
  direction: text("direction").notNull(), // credit | debit
  status: text("status").notNull().default("pending"), // pending | completed | failed
  amount: numeric("amount", { precision: 16, scale: 2 }).notNull(), // debited amount
  fee: numeric("fee", { precision: 16, scale: 2 }).notNull().default("0"),
  feePercent: numeric("fee_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  net: numeric("net", { precision: 16, scale: 2 }).notNull(), // received / sent to recipient
  currency: text("currency").notNull().default("XAF"),
  operator: text("operator"),
  country: text("country"),
  recipient: text("recipient"),
  recipientPhone: text("recipient_phone"),
  source: text("source").notNull().default("app"), // app | api | link | crypto
  balanceBefore: numeric("balance_before", { precision: 16, scale: 2 }),
  balanceAfter: numeric("balance_after", { precision: 16, scale: 2 }),
  paymentLinkId: uuid("payment_link_id").references(() => paymentLinks.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("info"), // deposit_pending | deposit_rejected | withdrawal_confirmed | info
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  apiKey: text("api_key").notNull(),
  webhookSecret: text("webhook_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  ip: text("ip").notNull(),
  lastActive: text("last_active").notNull(),
  current: boolean("current").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversionRules = pgTable("conversion_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sources: text("sources").array().notNull(),
  destination: text("destination").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payoutMethods = pgTable("payout_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  operator: text("operator").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull().default("Cameroun"),
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull(), // national_id | passport | driver_license
  docNumber: text("doc_number").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  frontImage: text("front_image").notNull(), // base64 data URL
  backImage: text("back_image"), // not required for passports
  selfieImage: text("selfie_image").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// wallet saved-for-later crypto addresses + referral network
export const savedAddresses = pgTable("saved_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  network: text("network").notNull().default("Tron (TRX)"),
  address: text("address").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: uuid("referrer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"), // pending | verified
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: jsonb("value"),
});
