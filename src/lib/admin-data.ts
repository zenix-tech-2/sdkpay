import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  adminApiKeys, adminApiRequests, adminAuditLogs, adminCampaigns, adminCatalogItems,
  adminConversations, adminFeatureFlags, adminFeeRules, adminInternalNotes,
  adminKycSubmissions, adminMembers, adminNotifications, adminProviderRoutes,
  adminRefunds, adminReviews, adminSettings, adminTeamMembers, adminTickets,
  adminTransactions, adminUpdates, adminWebhookDeliveries, adminWithdrawals,
  kycUpdates, notifications as clientNotificationsTable, paymentLinks,
  supportMessages, transactions as clientTransactionsTable, users, wallets,
} from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";
import { getProviderStatus } from "@/lib/payment-providers";
import type { AdminBootstrapData } from "@/lib/admin-types";

const iso = (value: Date | null) => value ? value.toISOString() : null;

export async function getAdminBootstrapData(session: AdminBootstrapData["session"]): Promise<AdminBootstrapData> {
  await ensureSchema();
  const [
    members, kyc, apiKeys, transactions, refunds, apiRequests, webhooks, audit,
    notes, notifications, tickets, reviews, updates, conversations, withdrawals,
    campaigns, catalogItems, settings, featureFlags, feeRules, teamMembers,
    providerRoutes, clientLinksRows, clientUserRows, clientWalletRows,
    clientTransactionRows, clientNotificationRows, clientSupportRows, clientKycRows,
  ] = await Promise.all([
    db.select().from(adminMembers).orderBy(adminMembers.id),
    db.select().from(adminKycSubmissions).orderBy(desc(adminKycSubmissions.submittedAt)),
    db.select().from(adminApiKeys).orderBy(desc(adminApiKeys.createdAt)),
    db.select().from(adminTransactions).orderBy(desc(adminTransactions.createdAt)),
    db.select().from(adminRefunds).orderBy(desc(adminRefunds.createdAt)),
    db.select().from(adminApiRequests).orderBy(desc(adminApiRequests.createdAt)).limit(50),
    db.select().from(adminWebhookDeliveries).orderBy(desc(adminWebhookDeliveries.createdAt)).limit(50),
    db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(100),
    db.select().from(adminInternalNotes).orderBy(desc(adminInternalNotes.createdAt)),
    db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)),
    db.select().from(adminTickets).orderBy(desc(adminTickets.createdAt)),
    db.select().from(adminReviews).orderBy(desc(adminReviews.createdAt)),
    db.select().from(adminUpdates).orderBy(desc(adminUpdates.createdAt)),
    db.select().from(adminConversations).orderBy(desc(adminConversations.updatedAt)),
    db.select().from(adminWithdrawals).orderBy(desc(adminWithdrawals.requestedAt)),
    db.select().from(adminCampaigns).orderBy(desc(adminCampaigns.createdAt)),
    db.select().from(adminCatalogItems).orderBy(desc(adminCatalogItems.createdAt)),
    db.select().from(adminSettings),
    db.select().from(adminFeatureFlags).orderBy(adminFeatureFlags.key),
    db.select().from(adminFeeRules).orderBy(adminFeeRules.id),
    db.select().from(adminTeamMembers).orderBy(adminTeamMembers.id),
    db.select().from(adminProviderRoutes).orderBy(adminProviderRoutes.id),
    db.select().from(paymentLinks).orderBy(desc(paymentLinks.createdAt)).limit(50),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(100),
    db.select().from(wallets).orderBy(desc(wallets.createdAt)).limit(100),
    db.select().from(clientTransactionsTable).orderBy(desc(clientTransactionsTable.createdAt)).limit(100),
    db.select().from(clientNotificationsTable).orderBy(desc(clientNotificationsTable.createdAt)).limit(100),
    db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt)).limit(100),
    db.select().from(kycUpdates).orderBy(desc(kycUpdates.createdAt)).limit(100),
  ]);

  let databaseOnline = true;
  let databaseLatency = 27;
  try {
    const start = Date.now();
    await db.execute(sql`select 1`);
    databaseLatency = Math.max(1, Date.now() - start);
  } catch { databaseOnline = false; }
  const provider = getProviderStatus();
  const now = Date.now();
  const requests24h = apiRequests.filter((r) => now - new Date(r.createdAt).getTime() < 86400000);
  const avgLatency = requests24h.length ? Math.round(requests24h.reduce((sum, r) => sum + r.latency, 0) / requests24h.length) : 0;
  const settingsMap = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const adminOnly = process.env.ADMIN_ONLY_DEPLOYMENT === "1";

  const clientLinks = clientLinksRows.map((link) => ({
    id: link.id, slug: link.slug, title: link.title, amount: link.amount, currency: link.currency,
    status: link.status, views: link.views, createdAt: link.createdAt.toISOString(),
  }));
  const clientUsers = clientUserRows.map((user) => ({
    id: user.id, fullName: user.fullName, username: user.username, email: user.email, phone: user.phone,
    dialCode: user.dialCode, countryCode: user.countryCode, status: user.status, kycStatus: user.kycStatus,
    riskLevel: user.riskLevel, balance: user.balance, usdtBalance: user.usdtBalance, apiKey: user.apiKey,
    webhookSecret: user.webhookSecret, lastLoginAt: iso(user.lastLoginAt), createdAt: user.createdAt.toISOString(),
  }));
  const clientWallets = clientWalletRows.map((wallet) => ({
    id: wallet.id, userId: wallet.userId, currency: wallet.currency, countryName: wallet.countryName,
    flag: wallet.flag, balance: wallet.balance, isPrimary: wallet.isPrimary, status: wallet.status,
    createdAt: wallet.createdAt.toISOString(),
  }));
  const clientTransactions = clientTransactionRows.map((tx) => ({
    id: tx.id, reference: tx.reference, userId: tx.userId, type: tx.type, direction: tx.direction,
    amount: tx.currency === "USDT" ? Number(tx.amountDecimal || tx.amount) : tx.amount,
    currency: tx.currency, status: tx.status, provider: tx.provider, method: tx.method, note: tx.note,
    createdAt: tx.createdAt.toISOString(),
  }));
  const clientNotifications = clientNotificationRows.map((item) => ({
    id: item.id, userId: item.userId, title: item.title, message: item.message, type: item.type,
    isRead: item.isRead, link: item.link, createdAt: item.createdAt.toISOString(),
  }));
  const clientSupportMessages = clientSupportRows.map((item) => ({
    id: item.id, userId: item.userId, email: item.email, subject: item.subject, message: item.message,
    status: item.status, priority: item.priority, createdAt: item.createdAt.toISOString(),
  }));
  const clientKycUpdates = clientKycRows.map((item) => ({
    id: item.id, userId: item.userId, fullName: item.fullName, documentType: item.documentType,
    documentNumber: item.documentNumber, status: item.status, reviewNote: item.reviewNote,
    createdAt: item.createdAt.toISOString(), reviewedAt: iso(item.reviewedAt),
  }));

  return {
    session,
    metrics: {
      members: members.length,
      activeMembers: members.filter((m) => m.status === "active").length,
      pendingKyc: kyc.filter((k) => k.status === "pending").length + clientKycUpdates.filter((k) => k.status === "pending").length,
      transactions: transactions.length + clientTransactions.length,
      successfulVolume: transactions.filter((t) => t.status === "successful").reduce((sum, t) => sum + t.amount, 0),
      failedTransactions: transactions.filter((t) => t.status === "failed").length,
      pendingRefunds: refunds.filter((r) => r.status === "pending").length,
      openTickets: tickets.filter((t) => t.status === "open").length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length + clientNotifications.filter((n) => !n.isRead).length,
      pendingWithdrawals: withdrawals.filter((w) => w.status === "pending").length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      payments: transactions.length + clientTransactions.length,
      databaseOnline,
      databaseLatency,
      gatewayStatus: provider.primary.configured ? "online" : "unreachable",
      gatewayLabel: provider.primary.configured ? "Ashtechpay Direct API" : "External timeout",
      mode: settingsMap.gatewayMode || "Operational",
      failedWebhooks: webhooks.filter((w) => w.status === "failed").length,
      requests24h: requests24h.length,
      clientErrors: requests24h.filter((r) => r.statusCode >= 400 && r.statusCode < 500).length,
      serverErrors: requests24h.filter((r) => r.statusCode >= 500).length,
      avgLatency,
      clientUsers: clientUsers.length,
      clientWallets: clientWallets.length,
      clientLinks: clientLinks.length,
      clientTransactions: clientTransactions.length,
      featureFlagsOn: featureFlags.filter((f) => f.enabled).length,
      teamMembers: teamMembers.length,
      providerRoutes: providerRoutes.filter((r) => r.status === "active").length,
    },
    deployment: {
      adminOnly,
      clientAppUrl: process.env.NEXT_PUBLIC_CLIENT_APP_URL ?? settingsMap.clientAppUrl ?? "/",
      databaseMode: adminOnly && process.env.ADMIN_DATABASE_URL ? "admin" : "shared",
      providerPrimaryConfigured: provider.primary.configured,
      providerBackupConfigured: provider.backup.configured,
      environment: provider.environment,
    },
    members, kyc, apiKeys, transactions, refunds, apiRequests, webhooks, audit, notes,
    notifications, tickets, reviews, updates, conversations, withdrawals, campaigns,
    catalogItems, settings,
    featureFlags: featureFlags.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() })),
    feeRules: feeRules.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() })),
    teamMembers: teamMembers.map((item) => ({ ...item, lastActiveAt: iso(item.lastActiveAt), createdAt: item.createdAt.toISOString() })),
    providerRoutes: providerRoutes.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() })),
    clientLinks, clientUsers, clientWallets, clientTransactions, clientNotifications,
    clientSupportMessages, clientKycUpdates,
  };
}
