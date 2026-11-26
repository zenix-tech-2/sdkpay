import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  adminApiKeys, adminApiRequests, adminAuditLogs, adminCampaigns, adminCatalogItems,
  adminConversations, adminInternalNotes, adminKycSubmissions, adminMembers,
  adminNotifications, adminRefunds, adminReviews, adminSessions, adminSettings,
  adminTickets, adminTransactions, adminUpdates, adminUsers, adminWebhookDeliveries,
  adminWithdrawals,
} from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { adminExtraStatements, seedAdminExtra } from "@/lib/admin-schema-extra";

export const adminStatements = [
  `CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" serial PRIMARY KEY,
    "email" text NOT NULL,
    "full_name" text NOT NULL,
    "role" text NOT NULL DEFAULT 'super_admin',
    "password_hash" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "last_login_at" timestamptz
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_unique" ON "admin_users" ("email")`,
  `CREATE TABLE IF NOT EXISTS "admin_sessions" (
    "token" text PRIMARY KEY,
    "admin_user_id" integer NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
    "expires_at" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_settings" (
    "key" text PRIMARY KEY,
    "value" text NOT NULL,
    "updated_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_members" (
    "id" serial PRIMARY KEY,
    "full_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text NOT NULL DEFAULT '',
    "country" text NOT NULL DEFAULT 'Cameroon',
    "business" text NOT NULL DEFAULT '',
    "role" text NOT NULL DEFAULT 'user',
    "status" text NOT NULL DEFAULT 'active',
    "account_status" text NOT NULL DEFAULT 'Approved',
    "joined_at" timestamptz NOT NULL DEFAULT now(),
    "last_login_at" timestamptz,
    "active_sessions" integer NOT NULL DEFAULT 0,
    "webhook_url" text NOT NULL DEFAULT '',
    "balances" text NOT NULL DEFAULT '',
    "initials" text NOT NULL DEFAULT '',
    "avatar_color" text NOT NULL DEFAULT '#e11d48'
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_kyc_submissions" (
    "id" serial PRIMARY KEY,
    "member_id" integer,
    "applicant_name" text NOT NULL,
    "email" text NOT NULL,
    "document_type" text NOT NULL DEFAULT 'National Id',
    "document_no" text NOT NULL DEFAULT '',
    "date_of_birth" text NOT NULL DEFAULT '',
    "country" text NOT NULL DEFAULT 'Cameroon',
    "business" text NOT NULL DEFAULT '',
    "website" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'pending',
    "application_text" text NOT NULL DEFAULT '',
    "front_image_url" text NOT NULL DEFAULT '',
    "back_image_url" text NOT NULL DEFAULT '',
    "decision_note" text NOT NULL DEFAULT '',
    "submitted_at" timestamptz NOT NULL DEFAULT now(),
    "reviewed_at" timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_api_keys" (
    "id" serial PRIMARY KEY,
    "member_id" integer,
    "name" text NOT NULL,
    "environment" text NOT NULL DEFAULT 'live',
    "key_masked" text NOT NULL,
    "status" text NOT NULL DEFAULT 'active',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "last_used_at" timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_transactions" (
    "id" serial PRIMARY KEY,
    "reference" text NOT NULL,
    "member_id" integer,
    "member_name" text NOT NULL,
    "amount" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'XAF',
    "status" text NOT NULL DEFAULT 'successful',
    "provider" text NOT NULL DEFAULT 'Ashtechpay',
    "method" text NOT NULL DEFAULT 'Mobile Money',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "admin_transactions_reference_unique" ON "admin_transactions" ("reference")`,
  `CREATE TABLE IF NOT EXISTS "admin_refunds" (
    "id" serial PRIMARY KEY,
    "reference" text NOT NULL,
    "member_name" text NOT NULL,
    "amount" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'XAF',
    "reason" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'pending',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_api_requests" (
    "id" serial PRIMARY KEY,
    "status_code" integer NOT NULL,
    "endpoint" text NOT NULL,
    "env" text NOT NULL DEFAULT 'live',
    "latency" integer NOT NULL DEFAULT 0,
    "error" text NOT NULL DEFAULT '',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_webhook_deliveries" (
    "id" serial PRIMARY KEY,
    "event" text NOT NULL,
    "url" text NOT NULL,
    "http_status" integer NOT NULL DEFAULT 200,
    "attempts" integer NOT NULL DEFAULT 1,
    "status" text NOT NULL DEFAULT 'delivered',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
    "id" serial PRIMARY KEY,
    "actor" text NOT NULL,
    "action" text NOT NULL,
    "target" text NOT NULL DEFAULT '',
    "severity" text NOT NULL DEFAULT 'info',
    "ip" text NOT NULL DEFAULT '127.0.0.1',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_internal_notes" (
    "id" serial PRIMARY KEY,
    "target_type" text NOT NULL,
    "target_id" integer NOT NULL,
    "body" text NOT NULL,
    "author" text NOT NULL DEFAULT 'Admin',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_notifications" (
    "id" serial PRIMARY KEY,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text NOT NULL DEFAULT 'info',
    "is_read" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_tickets" (
    "id" serial PRIMARY KEY,
    "subject" text NOT NULL,
    "requester" text NOT NULL,
    "priority" text NOT NULL DEFAULT 'normal',
    "status" text NOT NULL DEFAULT 'open',
    "last_message" text NOT NULL DEFAULT '',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_reviews" (
    "id" serial PRIMARY KEY,
    "author" text NOT NULL,
    "rating" integer NOT NULL DEFAULT 5,
    "comment" text NOT NULL,
    "status" text NOT NULL DEFAULT 'published',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_updates" (
    "id" serial PRIMARY KEY,
    "title" text NOT NULL,
    "category" text NOT NULL DEFAULT 'À venir',
    "status" text NOT NULL DEFAULT 'published',
    "media_count" integer NOT NULL DEFAULT 1,
    "scheduled_at" timestamptz,
    "body" text NOT NULL DEFAULT '',
    "image_url" text NOT NULL DEFAULT '/images/hero-payments.png',
    "pinned" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_conversations" (
    "id" serial PRIMARY KEY,
    "member_name" text NOT NULL,
    "initials" text NOT NULL,
    "avatar_color" text NOT NULL DEFAULT '#ef4444',
    "last_message" text NOT NULL DEFAULT '',
    "unread" integer NOT NULL DEFAULT 0,
    "updated_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_withdrawals" (
    "id" serial PRIMARY KEY,
    "member_name" text NOT NULL,
    "amount" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'XAF',
    "method" text NOT NULL DEFAULT 'MTN Money',
    "status" text NOT NULL DEFAULT 'pending',
    "requested_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_campaigns" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "status" text NOT NULL DEFAULT 'pending',
    "budget" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "admin_catalog_items" (
    "id" serial PRIMARY KEY,
    "section" text NOT NULL,
    "title" text NOT NULL,
    "subtitle" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'active',
    "amount" integer NOT NULL DEFAULT 0,
    "owner" text NOT NULL DEFAULT 'Admin',
    "created_at" timestamptz NOT NULL DEFAULT now()
  )`,
  ...adminExtraStatements,
];

async function isEmpty(tableName: string) {
  const result = await db.execute(sql.raw(`SELECT 1 FROM "${tableName}" LIMIT 1`));
  return result.rows.length === 0;
}

const date = (value: string) => new Date(`${value}:00.000Z`);
const balances = "0.30 USDT · 179 XAF · 1,204 NGN · 0.00 GHS · 0 KES · 0 CDF · 50.00 · 0.00 EUR · 0.00 GBP";

const memberSeed = [
  ["Merchant Alpha", "alpha@sdkpay.com", "+2376502679095", "Cameroon", "SDK Commerce", "user", "active", "Approved", "2026-10-04T09:19", "2026-10-22T18:00", 2, "", balances, "AH", "#ef4444"],
  ["Merchant Beta", "beta@sdkpay.com", "+2376902249632", "Cameroon", "Merchant Beta", "merchant", "active", "Approved", "2026-11-18T19:38", "2026-11-18T20:00", 1, "—", "9,097 XAF", "PP", "#f59e0b"],
  ["Merchant Gamma", "Merchant Gamma@gmail.com", "+237651010478", "Cameroon", "SDK Pay", "user", "active", "Approved", "2026-10-03T12:10", "2026-10-22T09:00", 1, "", balances, "S", "#f97316"],
  ["Merchant Delta", "jameslouis@gmail.com", "+237690326932", "Cameroon", "SDK Commerce", "user", "active", "Approved", "2026-09-21T08:30", "2026-10-21T11:00", 0, "", balances, "JL", "#0f9f6e"],
  ["Awa Sossou", "awa@example.com", "+22997505050", "Benin", "Awa Store", "merchant", "active", "Approved", "2026-09-02T10:00", "2026-10-19T10:00", 1, "https://awa.example/webhook", balances, "AS", "#7c3aed"],
  ["Fatou Diallo", "fatou@example.com", "+221770001122", "Senegal", "Fatou Shop", "user", "active", "Approved", "2026-08-18T09:00", "2026-10-18T09:00", 0, "", balances, "FD", "#0ea5e9"],
  ["Jean Dupont", "jean@example.com", "+22501020304", "Ivory Coast", "Dupont SAS", "merchant", "active", "Approved", "2026-08-01T09:00", "2026-10-17T09:00", 1, "", balances, "JD", "#1d4ed8"],
  ["Marie Claire", "marie@example.com", "+24106010203", "Gabon", "MC Digital", "user", "active", "Approved", "2026-07-20T09:00", "2026-10-16T09:00", 0, "", balances, "MC", "#db2777"],
  ["Koffi Bernard", "koffi@example.com", "+22890010203", "Togo", "Koffi Services", "user", "suspended", "Rejected", "2026-07-11T09:00", "2026-09-30T09:00", 0, "", balances, "KB", "#64748b"],
  ["Chantal Ngo", "chantal@example.com", "+237675371759", "Cameroon", "Ngo Boutique", "merchant", "active", "Approved", "2026-06-28T09:00", "2026-10-15T09:00", 1, "", balances, "CN", "#16a34a"],
  ["Ibrahim Sow", "ibrahim@example.com", "+22376000111", "Mali", "Sow Tech", "user", "active", "Approved", "2026-06-10T09:00", "2026-10-14T09:00", 0, "", balances, "IS", "#ea580c"],
  ["Grace Muthoni", "grace@example.com", "+254700001122", "Kenya", "Grace Collections", "merchant", "active", "Approved", "2026-05-29T09:00", "2026-10-13T09:00", 1, "", balances, "GM", "#0891b2"],
  ["Paul Kamba", "paul@example.com", "+243810001122", "DR Congo", "Kamba Labs", "user", "active", "Approved", "2026-05-12T09:00", "2026-10-12T09:00", 0, "", balances, "PK", "#4f46e5"],
  ["Nadine Fotso", "nadine@example.com", "+237690111222", "Cameroon", "Fotso Media", "merchant", "active", "Approved", "2026-04-30T09:00", "2026-10-11T09:00", 1, "", balances, "NF", "#be123c"],
  ["Samuel Okeke", "samuel@example.com", "+234800001122", "Nigeria", "Okeke Ventures", "user", "active", "Approved", "2026-04-11T09:00", "2026-10-10T09:00", 0, "", balances, "SO", "#0f766e"],
  ["Lina Traoré", "lina@example.com", "+226700001122", "Burkina Faso", "Lina Store", "user", "pending", "Pending", "2026-03-25T09:00", null, 0, "", balances, "LT", "#a16207"],
] as const;

export async function seedAdminData() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@sdkpay.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  const adminName = process.env.ADMIN_FULL_NAME ?? "SDK Pay Admin";
  const passwordHash = hashPassword(adminPassword);
  await db.insert(adminUsers).values({ email: adminEmail, fullName: adminName, role: "super_admin", passwordHash }).onConflictDoNothing();
  await db.update(adminUsers).set({ passwordHash, fullName: adminName, role: "super_admin" }).where(eq(adminUsers.email, adminEmail));
  await db.insert(adminSettings).values([
    { key: "maintenanceMode", value: "false" },
    { key: "supportEmail", value: "support@sdkpay.com" },
    { key: "gatewayMode", value: "Operational" },
    { key: "clientAppUrl", value: process.env.NEXT_PUBLIC_CLIENT_APP_URL ?? "/" },
  ]).onConflictDoNothing();

  if (await isEmpty("admin_members")) {
    await db.insert(adminMembers).values(memberSeed.map((m) => ({
      fullName: m[0], email: m[1], phone: m[2], country: m[3], business: m[4], role: m[5], status: m[6], accountStatus: m[7],
      joinedAt: date(m[8]), lastLoginAt: m[9] ? date(m[9]) : null, activeSessions: m[10], webhookUrl: m[11], balances: m[12], initials: m[13], avatarColor: m[14],
    })));
  }

  if (await isEmpty("admin_kyc_submissions")) {
    await db.insert(adminKycSubmissions).values([
      { memberId: 2, applicantName: "Project", email: "beta@sdkpay.com", documentType: "National Id", documentNo: "—", dateOfBirth: "—", country: "Cameroon", business: "Merchant Beta", website: "—", status: "approved", applicationText: "Test jhgffhryhgsyndsssgigpanflttzkyuritfpxcncmocynicrooddguhndgtlgttfiggivk, Digizow", submittedAt: date("2026-11-18T19:59"), reviewedAt: date("2026-11-18T20:30") },
      { memberId: 1, applicantName: "Merchant Alpha", email: "alpha@sdkpay.com", documentType: "National Id", status: "approved", submittedAt: date("2026-10-13T09:27"), reviewedAt: date("2026-10-13T10:00") },
      { memberId: 1, applicantName: "Merchant Alpha", email: "gamma@sdkpay.com", documentType: "National Id", status: "approved", submittedAt: date("2026-10-03T09:00"), reviewedAt: date("2026-10-03T10:00") },
      { memberId: 1, applicantName: "Merchant Alpha", email: "delta@sdkpay.com", documentType: "National Id", status: "approved", submittedAt: date("2026-10-03T08:00"), reviewedAt: date("2026-10-03T09:00") },
      { memberId: 16, applicantName: "Lina Traoré", email: "lina@example.com", documentType: "Passport", status: "pending", submittedAt: date("2026-11-20T08:15") },
      { memberId: 9, applicantName: "Koffi Bernard", email: "koffi@example.com", documentType: "National Id", status: "rejected", decisionNote: "Document illisible", submittedAt: date("2026-11-19T14:10"), reviewedAt: date("2026-11-19T15:00") },
    ]);
  }

  if (await isEmpty("admin_api_keys")) {
    await db.insert(adminApiKeys).values([
      { memberId: 1, name: "How", environment: "live", keyMasked: "pk_live_ucto…28B", status: "active", createdAt: date("2026-10-04T09:30"), lastUsedAt: date("2026-11-18T20:00") },
      { memberId: 2, name: "Merchant Beta", environment: "test", keyMasked: "pk_test_prj…9Q2", status: "active", createdAt: date("2026-11-18T19:40") },
      { memberId: 5, name: "Awa Store", environment: "live", keyMasked: "ak_live_awa…D41", status: "revoked", createdAt: date("2026-09-03T09:00") },
    ]);
  }

  if (await isEmpty("admin_transactions")) {
    await db.insert(adminTransactions).values([
      ["PLK-5BYXAP4Z2X5OM", 1, "Merchant Alpha", 1000, "successful", "Ashtechpay", "MTN Money", "2026-11-18T18:00"],
      ["PLK-0JRUNNCZ6MP", 1, "Merchant Alpha", 1000, "failed", "Saaspay.me", "Orange Money", "2026-11-18T17:50"],
      ["PLK-PM4RDR0PCT", 1, "Merchant Alpha", 10000, "failed", "Ashtechpay", "MTN Money", "2026-11-18T17:40"],
      ["PLK-XMDE9CY55", 1, "Merchant Alpha", 500, "failed", "Saaspay.me", "Wave", "2026-11-18T17:30"],
      ["PLK-5BY-AEEXTRURN", 1, "Merchant Alpha", 2000, "pending", "Ashtechpay", "Orange Money", "2026-10-16T12:00"],
      ["PLK-11K-XAF-001", 2, "Merchant Beta", 11000, "successful", "Ashtechpay", "MTN Money", "2026-11-15T10:00"],
      ["PLK-1500-XAF-002", 2, "Merchant Beta", 1500, "successful", "Ashtechpay", "Orange Money", "2026-11-15T09:30"],
      ["PLK-200-XAF-003", 3, "Merchant Gamma", 200, "failed", "Saaspay.me", "Celtiis Money", "2026-11-12T09:00"],
      ["PLK-500-XAF-004", 4, "Merchant Delta", 500, "failed", "Ashtechpay", "MTN Money", "2026-11-12T08:30"],
      ["PLK-100-XAF-005", 5, "Awa Sossou", 100, "failed", "Saaspay.me", "Moov Money", "2026-11-12T08:00"],
    ].map((t) => ({ reference: String(t[0]), memberId: Number(t[1]), memberName: String(t[2]), amount: Number(t[3]), currency: "XAF", status: String(t[4]), provider: String(t[5]), method: String(t[6]), createdAt: date(String(t[7])) }))).onConflictDoNothing();
  }

  if (await isEmpty("admin_refunds")) {
    await db.insert(adminRefunds).values([
      { reference: "RFD-001", memberName: "Merchant Alpha", amount: 1000, reason: "Paiement échoué débité", status: "pending", createdAt: date("2026-11-18T18:10") },
      { reference: "RFD-002", memberName: "Awa Sossou", amount: 5000, reason: "Demande client", status: "approved", createdAt: date("2026-11-16T10:00") },
      { reference: "RFD-003", memberName: "Koffi Bernard", amount: 2500, reason: "Litige Mobile Money", status: "rejected", createdAt: date("2026-11-15T10:00") },
    ]);
  }

  if (await isEmpty("admin_audit_logs")) {
    await db.insert(adminAuditLogs).values([
      { actor: adminEmail, action: "KYC approved", target: "Project", severity: "success", ip: "162.251.62.98", createdAt: date("2026-11-18T20:30") },
      { actor: adminEmail, action: "User viewed", target: "Merchant Alpha", severity: "info", ip: "162.251.62.98", createdAt: date("2026-11-18T20:20") },
      { actor: "system", action: "Gateway timeout", target: "Ashtechpay Direct API", severity: "warning", ip: "10.0.0.2", createdAt: date("2026-11-18T19:45") },
      { actor: adminEmail, action: "Refund approved", target: "RFD-002", severity: "success", ip: "86.105.212.251", createdAt: date("2026-11-16T10:05") },
      { actor: "system", action: "Webhook retry", target: "payment.succeeded", severity: "info", ip: "10.0.0.4", createdAt: date("2026-11-15T09:00") },
      { actor: adminEmail, action: "Account suspended", target: "Koffi Bernard", severity: "warning", ip: "216.106.182.83", createdAt: date("2026-11-14T09:00") },
      { actor: "system", action: "Old log purge", target: "api_requests", severity: "info", ip: "127.0.0.1", createdAt: date("2026-10-01T09:00") },
    ]);
  }

  if (await isEmpty("admin_internal_notes")) {
    await db.insert(adminInternalNotes).values([{ targetType: "member", targetId: 1, body: "✅Verified✅", author: adminEmail, createdAt: date("2026-10-22T18:10") }]);
  }

  if (await isEmpty("admin_notifications")) {
    await db.insert(adminNotifications).values([
      { title: "New KYC submission", message: "Lina Traoré submitted a passport for review.", type: "kyc", isRead: false, createdAt: date("2026-11-20T08:15") },
      { title: "Gateway timeout", message: "Ashtechpay Mobile Money gateway did not respond.", type: "alert", isRead: false, createdAt: date("2026-11-18T19:45") },
      { title: "New dispute", message: "A refund request is waiting for a decision.", type: "dispute", isRead: false, createdAt: date("2026-11-18T18:10") },
      { title: "Daily report ready", message: "Yesterday's payment report is available.", type: "info", isRead: true, createdAt: date("2026-11-17T07:00") },
    ]);
  }

  if (await isEmpty("admin_tickets")) {
    await db.insert(adminTickets).values([
      { subject: "Dépôt non crédité", requester: "Merchant Alpha", priority: "high", status: "open", lastMessage: "Bonjour, mon dépôt de 1 000 XAF n'apparaît pas.", createdAt: date("2026-11-18T18:20") },
      { subject: "Retrait en attente", requester: "Merchant Beta", priority: "normal", status: "open", lastMessage: "Le retrait est en attente de validation.", createdAt: date("2026-11-18T17:00") },
      { subject: "Clé API invalide", requester: "Awa Sossou", priority: "high", status: "pending", lastMessage: "Merci de régénérer la clé.", createdAt: date("2026-11-17T09:00") },
      { subject: "Question KYC", requester: "Merchant Delta", priority: "low", status: "open", lastMessage: "Quels documents sont acceptés ?", createdAt: date("2026-11-16T09:00") },
    ]);
  }

  if (await isEmpty("admin_reviews")) {
    await db.insert(adminReviews).values([
      { author: "Awa Sossou", rating: 5, comment: "Paiements rapides et dashboard clair.", status: "published", createdAt: date("2026-11-18T09:00") },
      { author: "Jean Dupont", rating: 4, comment: "Très bon support, quelques lenteurs le soir.", status: "published", createdAt: date("2026-11-17T09:00") },
      { author: "Koffi Bernard", rating: 2, comment: "Retrait bloqué.", status: "hidden", createdAt: date("2026-11-15T09:00") },
    ]);
  }

  if (await isEmpty("admin_updates")) {
    await db.insert(adminUpdates).values([
      { title: "Nouveau design SDK Pay", category: "À venir", status: "published", mediaCount: 1, scheduledAt: date("2026-11-05T09:00"), body: "Annonce des prochaines mises à jour SDK Pay avec photos et vidéos.", imageUrl: "/images/hero-payments.png", pinned: true, createdAt: date("2026-11-05T09:00") },
    ]);
  }

  if (await isEmpty("admin_conversations")) {
    await db.insert(adminConversations).values([
      { memberName: "Merchant Alpha", initials: "AH", avatarColor: "#ef4444", lastMessage: "Vous : Bonjour", unread: 0, updatedAt: date("2026-11-12T18:00") },
      { memberName: "Merchant Gamma", initials: "S", avatarColor: "#f97316", lastMessage: "Aucun message", unread: 0, updatedAt: date("2026-11-05T18:00") },
      { memberName: "Merchant Delta", initials: "JL", avatarColor: "#0f9f6e", lastMessage: "Aucun message", unread: 0, updatedAt: date("2026-11-05T17:00") },
      { memberName: "Merchant Alpha", initials: "AH", avatarColor: "#ef4444", lastMessage: "Aucun message", unread: 0, updatedAt: date("2026-11-05T16:00") },
    ]);
  }

  if (await isEmpty("admin_withdrawals")) {
    await db.insert(adminWithdrawals).values([
      { memberName: "Merchant Beta", amount: 12710, currency: "XAF", method: "MTN Money", status: "processed", requestedAt: date("2026-11-18T19:49") },
      { memberName: "Awa Sossou", amount: 5000, currency: "XAF", method: "Orange Money", status: "processed", requestedAt: date("2026-11-16T10:00") },
    ]);
  }

  if (await isEmpty("admin_campaigns")) {
    await db.insert(adminCampaigns).values([
      { name: "SDK Pay Campaigns · Novembre", status: "active", budget: 150000, createdAt: date("2026-11-01T09:00") },
    ]);
  }

  if (await isEmpty("admin_catalog_items")) {
    const catalog: Array<[string, string, string, string, number]> = [
      ["services", "Instagram Followers", "Service SMM · 1 000 vues", "active", 2500],
      ["services", "TikTok Likes", "Service SMM · livraison 24h", "active", 1800],
      ["formations", "Paiements en ligne", "Formation · 12 modules", "published", 15000],
      ["formations", "Mobile Money avancé", "Formation · 8 modules", "published", 12000],
      ["ebooks", "Guide SDK Pay", "PDF · 84 pages", "published", 0],
      ["ebooks", "Playbook SDK Pay", "PDF · 52 pages", "published", 5000],
      ["products", "Cash-flow digital", "Produit digital", "active", 4500],
      ["products", "InstantBoost wallet top-up", "Recharge", "active", 6000],
      ["sales", "Vente publique #18", "Campagne flash", "active", 11000],
      ["sales", "Offre Black Friday", "Remise 30%", "draft", 9000],
      ["virtual-number", "+237 690 000 001", "Numéro virtuel · Cameroun", "active", 0],
      ["virtual-number", "+229 970 000 002", "Numéro virtuel · Bénin", "active", 0],
      ["files", "hero-payments.png", "Cloudinary · image", "active", 0],
      ["files", "merchant.png", "Cloudinary · image", "active", 0],
      ["premium-apps", "Analytics Pro", "Application premium", "active", 25000],
      ["premium-apps", "Automation Studio", "Application premium", "draft", 30000],
      ["projects", "SDK Commerce checkout", "Projet client", "active", 120000],
      ["projects", "SDK Pay Campaigns", "Projet interne", "active", 80000],
      ["ai", "Réponse support KYC", "Prompt assistant IA", "active", 0],
      ["ai", "Résumé transaction", "Prompt assistant IA", "active", 0],
      ["social", "Annonce novembre", "Publication sociale", "published", 0],
      ["social", "Maintenance planifiée", "Publication sociale", "draft", 0],
      ["bugs", "QR code lent", "Bug signalé · priorité normale", "open", 0],
      ["bugs", "OTP non reçu", "Bug signalé · priorité haute", "investigating", 0],
      ["referrals", "Alpha → Delta", "Gain de parrainage", "paid", 500],
      ["referrals", "Awa → Fatou", "Gain de parrainage", "pending", 500],
      ["requests", "Demande de retrait #12", "Vérification manuelle requise", "pending", 2500],
      ["requests", "Activation compte #8", "Vérification manuelle requise", "pending", 0],
    ];
    await db.insert(adminCatalogItems).values(catalog.map(([section, title, subtitle, status, amount]) => ({ section, title, subtitle, status, amount, owner: "Admin", createdAt: date("2026-11-10T09:00") })));
  }
  await seedAdminExtra();
}
