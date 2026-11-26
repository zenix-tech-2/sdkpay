import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull().default("CM"),
  dialCode: text("dial_code").notNull().default("+237"),
  referralCode: text("referral_code").notNull(),
  referredBy: text("referred_by"),
  apiKey: text("api_key").notNull(),
  webhookSecret: text("webhook_secret").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  balance: integer("balance").notNull().default(9),
  usdtBalance: doublePrecision("usdt_balance").notNull().default(0),
  theme: text("theme").notNull().default("light"),
  notifyEmail: boolean("notify_email").notNull().default(true),
  notifyPush: boolean("notify_push").notNull().default(false),
  notifySms: boolean("notify_sms").notNull().default(false),
  notifyMarketing: boolean("notify_marketing").notNull().default(false),
  conversionSources: text("conversion_sources").notNull().default('["USD","EUR","XOF","GBP"]'),
  conversionDestination: text("conversion_destination").notNull().default(""),
  conversionActive: boolean("conversion_active").notNull().default(false),
  withdrawalNumbers: text("withdrawal_numbers").notNull().default('["651010478","690326932"]'),
  pinConfigured: boolean("pin_configured").notNull().default(true),
  status: text("status").notNull().default("active"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  riskLevel: text("risk_level").notNull().default("low"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_unique").on(t.email), uniqueIndex("users_username_unique").on(t.username), uniqueIndex("users_referral_unique").on(t.referralCode), uniqueIndex("users_api_key_unique").on(t.apiKey)]);

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentLinks = pgTable("payment_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("XAF"),
  status: text("status").notNull().default("active"),
  views: integer("views").notNull().default(0),
  freeAmount: boolean("free_amount").notNull().default(false),
  pdfUrl: text("pdf_url").notNull().default(""),
  allowedCountries: text("allowed_countries").notNull().default("all"),
  imageUrl: text("image_url").notNull().default(""),
  expiryDate: text("expiry_date").notNull().default(""),
  redirectUrl: text("redirect_url").notNull().default(""),
  iconEmoji: text("icon_emoji").notNull().default("🔗"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("payment_links_slug_unique").on(t.slug)]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  linkId: integer("link_id"),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  amount: integer("amount").notNull(),
  fee: integer("fee").notNull().default(0),
  status: text("status").notNull().default("completed"),
  method: text("method").notNull().default("Mobile Money"),
  counterparty: text("counterparty").notNull().default(""),
  reference: text("reference").notNull(),
  note: text("note").notNull().default(""),
  grossAmount: integer("gross_amount").notNull().default(0),
  balanceBefore: integer("balance_before").notNull().default(0),
  balanceAfter: integer("balance_after").notNull().default(0),
  siteReference: text("site_reference").notNull().default(""),
  recipientName: text("recipient_name").notNull().default(""),
  countryName: text("country_name").notNull().default("Cameroun"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  currency: text("currency").notNull().default("XAF"),
  amountDecimal: doublePrecision("amount_decimal").notNull().default(0),
  feeDecimal: doublePrecision("fee_decimal").notNull().default(0),
  grossDecimal: doublePrecision("gross_decimal").notNull().default(0),
  balanceBeforeDecimal: doublePrecision("balance_before_decimal").notNull().default(0),
  balanceAfterDecimal: doublePrecision("balance_after_decimal").notNull().default(0),
  network: text("network").notNull().default(""),
  walletAddress: text("wallet_address").notNull().default(""),
  depositAddress: text("deposit_address").notNull().default(""),
  providerReference: text("provider_reference").notNull().default(""),
  feePayer: text("fee_payer").notNull().default(""),
  flow: text("flow").notNull().default(""),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  provider: text("provider").notNull().default("ashtechpay"),
  providerExternalId: text("provider_external_id").notNull().default(""),
  providerCheckoutUrl: text("provider_checkout_url").notNull().default(""),
  providerFallback: boolean("provider_fallback").notNull().default(false),
  providerStatus: text("provider_status").notNull().default(""),
}, (t) => [uniqueIndex("transactions_reference_unique").on(t.reference)]);

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: text("email").notNull(),
  subject: text("subject").notNull().default("Support message"),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currency: text("currency").notNull(),
  countryName: text("country_name").notNull(),
  flag: text("flag").notNull().default("🇨🇲"),
  balance: doublePrecision("balance").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("wallets_user_currency_unique").on(t.userId, t.currency)]);

export const kycUpdates = pgTable("kyc_updates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  status: text("status").notNull().default("pending"),
  reviewNote: text("review_note").notNull().default(""),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("super_admin"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
}, (t) => [uniqueIndex("admin_users_email_unique").on(t.email)]);

export const adminSessions = pgTable("admin_sessions", {
  token: text("token").primaryKey(),
  adminUserId: integer("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminMembers = pgTable("admin_members", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  country: text("country").notNull().default("Cameroon"),
  business: text("business").notNull().default(""),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  accountStatus: text("account_status").notNull().default("Approved"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  activeSessions: integer("active_sessions").notNull().default(0),
  webhookUrl: text("webhook_url").notNull().default(""),
  balances: text("balances").notNull().default(""),
  initials: text("initials").notNull().default(""),
  avatarColor: text("avatar_color").notNull().default("#e11d48"),
});

export const adminKycSubmissions = pgTable("admin_kyc_submissions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id"),
  applicantName: text("applicant_name").notNull(),
  email: text("email").notNull(),
  documentType: text("document_type").notNull().default("National Id"),
  documentNo: text("document_no").notNull().default(""),
  dateOfBirth: text("date_of_birth").notNull().default(""),
  country: text("country").notNull().default("Cameroon"),
  business: text("business").notNull().default(""),
  website: text("website").notNull().default(""),
  status: text("status").notNull().default("pending"),
  applicationText: text("application_text").notNull().default(""),
  frontImageUrl: text("front_image_url").notNull().default(""),
  backImageUrl: text("back_image_url").notNull().default(""),
  decisionNote: text("decision_note").notNull().default(""),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const adminApiKeys = pgTable("admin_api_keys", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id"),
  name: text("name").notNull(),
  environment: text("environment").notNull().default("live"),
  keyMasked: text("key_masked").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
});

export const adminTransactions = pgTable("admin_transactions", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  memberId: integer("member_id"),
  memberName: text("member_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("XAF"),
  status: text("status").notNull().default("successful"),
  provider: text("provider").notNull().default("Ashtechpay"),
  method: text("method").notNull().default("Mobile Money"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("admin_transactions_reference_unique").on(t.reference)]);

export const adminRefunds = pgTable("admin_refunds", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  memberName: text("member_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("XAF"),
  reason: text("reason").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminApiRequests = pgTable("admin_api_requests", {
  id: serial("id").primaryKey(),
  statusCode: integer("status_code").notNull(),
  endpoint: text("endpoint").notNull(),
  env: text("env").notNull().default("live"),
  latency: integer("latency").notNull().default(0),
  error: text("error").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminWebhookDeliveries = pgTable("admin_webhook_deliveries", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  url: text("url").notNull(),
  httpStatus: integer("http_status").notNull().default(200),
  attempts: integer("attempts").notNull().default(1),
  status: text("status").notNull().default("delivered"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull().default(""),
  severity: text("severity").notNull().default("info"),
  ip: text("ip").notNull().default("127.0.0.1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminInternalNotes = pgTable("admin_internal_notes", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull().default("Admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminTickets = pgTable("admin_tickets", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  requester: text("requester").notNull(),
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("open"),
  lastMessage: text("last_message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminReviews = pgTable("admin_reviews", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUpdates = pgTable("admin_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("À venir"),
  status: text("status").notNull().default("published"),
  mediaCount: integer("media_count").notNull().default(1),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url").notNull().default("/images/hero-payments.png"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminConversations = pgTable("admin_conversations", {
  id: serial("id").primaryKey(),
  memberName: text("member_name").notNull(),
  initials: text("initials").notNull(),
  avatarColor: text("avatar_color").notNull().default("#ef4444"),
  lastMessage: text("last_message").notNull().default(""),
  unread: integer("unread").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminWithdrawals = pgTable("admin_withdrawals", {
  id: serial("id").primaryKey(),
  memberName: text("member_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("XAF"),
  method: text("method").notNull().default("MTN Money"),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminCampaigns = pgTable("admin_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  budget: integer("budget").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminCatalogItems = pgTable("admin_catalog_items", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  status: text("status").notNull().default("active"),
  amount: integer("amount").notNull().default(0),
  owner: text("owner").notNull().default("Admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminFeatureFlags = pgTable("admin_feature_flags", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminFeeRules = pgTable("admin_fee_rules", {
  id: serial("id").primaryKey(),
  scope: text("scope").notNull(),
  percent: integer("percent").notNull().default(0),
  fixed: integer("fixed").notNull().default(0),
  currency: text("currency").notNull().default("XAF"),
  status: text("status").notNull().default("active"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminTeamMembers = pgTable("admin_team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("analyst"),
  status: text("status").notNull().default("active"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminProviderRoutes = pgTable("admin_provider_routes", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  operator: text("operator").notNull(),
  primaryProvider: text("primary_provider").notNull().default("ashtechpay"),
  fallbackProvider: text("fallback_provider").notNull().default("saaspay"),
  status: text("status").notNull().default("active"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type PaymentLink = typeof paymentLinks.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
