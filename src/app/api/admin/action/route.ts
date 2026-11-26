import { eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  adminApiKeys, adminApiRequests, adminAuditLogs, adminCampaigns, adminCatalogItems,
  adminConversations, adminInternalNotes, adminKycSubmissions, adminMembers,
  adminNotifications, adminRefunds, adminReviews, adminSettings, adminTickets,
  adminUpdates, adminWebhookDeliveries, adminWithdrawals,
} from "@/db/schema";
import {
  adminFeatureFlags, adminFeeRules, adminProviderRoutes, adminTeamMembers,
  kycUpdates, notifications as clientNotificationsTable, paymentLinks,
  supportMessages, transactions as clientTransactionsTable, users, wallets,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { randomCode } from "@/lib/format";

type Body = { entity?: string; id?: number; action?: string; payload?: Record<string, unknown> };

const str = (value: unknown, fallback = "") => (value === undefined || value === null ? fallback : String(value));
const num = (value: unknown, fallback = 0) => { const n = Number(value); return Number.isFinite(n) ? n : fallback; };

export async function POST(request: Request) {
  try {
    const result = await requireAdmin();
    if (!("admin" in result)) return result.response;
    const actor = result.admin.email;
    const body = await request.json() as Body;
    const entity = str(body.entity);
    const action = str(body.action);
    const id = num(body.id);
    const payload = body.payload ?? {};
    let target = `${entity}:${id || "new"}`;

    const audit = async (severity = "info") => {
      await db.insert(adminAuditLogs).values({ actor, action: `${entity}.${action}`, target, severity, ip: "127.0.0.1" });
    };

    if (entity === "kyc" && (action === "approve" || action === "reject")) {
      const note = str(payload.note);
      if (action === "reject" && !note.trim()) return Response.json({ error: "Une note est requise pour rejeter" }, { status: 400 });
      await db.update(adminKycSubmissions).set({ status: action === "approve" ? "approved" : "rejected", decisionNote: note, reviewedAt: new Date() }).where(eq(adminKycSubmissions.id, id));
      const [kyc] = await db.select().from(adminKycSubmissions).where(eq(adminKycSubmissions.id, id)).limit(1);
      if (kyc?.memberId) await db.update(adminMembers).set({ accountStatus: action === "approve" ? "Approved" : "Rejected" }).where(eq(adminMembers.id, kyc.memberId));
      target = kyc?.applicantName ?? target;
      await audit(action === "approve" ? "success" : "warning");
      return Response.json({ ok: true });
    }

    if (entity === "members" && (action === "suspend" || action === "activate")) {
      const status = action === "suspend" ? "suspended" : "active";
      await db.update(adminMembers).set({ status, accountStatus: action === "suspend" ? "Suspended" : "Approved" }).where(eq(adminMembers.id, id));
      await audit("warning");
      return Response.json({ ok: true });
    }

    if (entity === "notes" && action === "create") {
      await db.insert(adminInternalNotes).values({ targetType: str(payload.targetType, "member"), targetId: num(payload.targetId), body: str(payload.body), author: actor });
      await audit();
      return Response.json({ ok: true }, { status: 201 });
    }

    if (entity === "apiKeys") {
      if (action === "toggle") {
        const [item] = await db.select().from(adminApiKeys).where(eq(adminApiKeys.id, id)).limit(1);
        const status = item?.status === "active" ? "revoked" : "active";
        await db.update(adminApiKeys).set({ status }).where(eq(adminApiKeys.id, id));
        await audit();
        return Response.json({ ok: true, status });
      }
      if (action === "create") {
        const env = str(payload.environment, "live");
        const prefix = env === "live" ? "pk_live_" : "pk_test_";
        const keyMasked = `${prefix}${randomCode(4)}…${randomCode(3).toUpperCase()}`;
        await db.insert(adminApiKeys).values({ name: str(payload.name, "New key"), environment: env, keyMasked, status: "active" });
        await audit();
        return Response.json({ ok: true }, { status: 201 });
      }
    }

    if (entity === "refunds" && (action === "approve" || action === "reject")) {
      await db.update(adminRefunds).set({ status: action === "approve" ? "approved" : "rejected" }).where(eq(adminRefunds.id, id));
      await audit(action === "approve" ? "success" : "warning");
      return Response.json({ ok: true });
    }

    if (entity === "reviews" && (action === "publish" || action === "hide")) {
      await db.update(adminReviews).set({ status: action === "publish" ? "published" : "hidden" }).where(eq(adminReviews.id, id));
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "updates") {
      if (action === "create") {
        await db.insert(adminUpdates).values({ title: str(payload.title, "Nouvelle publication"), category: str(payload.category, "À venir"), status: str(payload.status, "draft"), mediaCount: num(payload.mediaCount, 1), body: str(payload.body), imageUrl: str(payload.imageUrl, "/images/hero-payments.png"), pinned: Boolean(payload.pinned), scheduledAt: payload.scheduledAt ? new Date(String(payload.scheduledAt)) : null });
        await audit();
        return Response.json({ ok: true }, { status: 201 });
      }
      if (action === "update") {
        await db.update(adminUpdates).set({ title: str(payload.title), category: str(payload.category), body: str(payload.body), mediaCount: num(payload.mediaCount, 1) }).where(eq(adminUpdates.id, id));
        await audit();
        return Response.json({ ok: true });
      }
      if (action === "toggle") {
        const [item] = await db.select().from(adminUpdates).where(eq(adminUpdates.id, id)).limit(1);
        await db.update(adminUpdates).set({ status: item?.status === "published" ? "hidden" : "published" }).where(eq(adminUpdates.id, id));
        await audit();
        return Response.json({ ok: true });
      }
      if (action === "pin") {
        const [item] = await db.select().from(adminUpdates).where(eq(adminUpdates.id, id)).limit(1);
        await db.update(adminUpdates).set({ pinned: !item?.pinned }).where(eq(adminUpdates.id, id));
        await audit();
        return Response.json({ ok: true });
      }
      if (action === "delete") {
        await db.delete(adminUpdates).where(eq(adminUpdates.id, id));
        await audit("warning");
        return Response.json({ ok: true });
      }
    }

    if (entity === "notifications") {
      if (action === "read") await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id));
      else if (action === "readAll") await db.update(adminNotifications).set({ isRead: true });
      else if (action === "delete") await db.delete(adminNotifications).where(eq(adminNotifications.id, id));
      else return Response.json({ error: "Action inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "tickets") {
      if (action === "status") {
        await db.update(adminTickets).set({ status: str(payload.status, "closed") }).where(eq(adminTickets.id, id));
        await audit();
        return Response.json({ ok: true });
      }
      if (action === "reply") {
        await db.update(adminTickets).set({ lastMessage: str(payload.message), status: str(payload.status, "pending") }).where(eq(adminTickets.id, id));
        await audit();
        return Response.json({ ok: true });
      }
    }

    if (entity === "conversations" && action === "reply") {
      await db.update(adminConversations).set({ lastMessage: `Vous : ${str(payload.message)}`, unread: 0, updatedAt: new Date() }).where(eq(adminConversations.id, id));
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "catalogItems") {
      if (action === "create") {
        await db.insert(adminCatalogItems).values({ section: str(payload.section, "requests"), title: str(payload.title, "Nouvel élément"), subtitle: str(payload.subtitle), status: str(payload.status, "active"), amount: num(payload.amount), owner: actor });
        await audit();
        return Response.json({ ok: true }, { status: 201 });
      }
      if (action === "toggle") {
        const [item] = await db.select().from(adminCatalogItems).where(eq(adminCatalogItems.id, id)).limit(1);
        await db.update(adminCatalogItems).set({ status: item?.status === "active" ? "paused" : "active" }).where(eq(adminCatalogItems.id, id));
        await audit();
        return Response.json({ ok: true });
      }
      if (action === "delete") {
        await db.delete(adminCatalogItems).where(eq(adminCatalogItems.id, id));
        await audit("warning");
        return Response.json({ ok: true });
      }
    }

    if (entity === "campaigns" && action === "toggle") {
      const [item] = await db.select().from(adminCampaigns).where(eq(adminCampaigns.id, id)).limit(1);
      await db.update(adminCampaigns).set({ status: item?.status === "active" ? "paused" : "active" }).where(eq(adminCampaigns.id, id));
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "withdrawals" && (action === "approve" || action === "reject")) {
      await db.update(adminWithdrawals).set({ status: action === "approve" ? "processed" : "rejected" }).where(eq(adminWithdrawals.id, id));
      await audit(action === "approve" ? "success" : "warning");
      return Response.json({ ok: true });
    }

    if (entity === "settings" && action === "update") {
      const key = str(payload.key, "maintenanceMode");
      const value = str(payload.value, "false");
      await db.insert(adminSettings).values({ key, value }).onConflictDoUpdate({ target: adminSettings.key, set: { value, updatedAt: new Date() } });
      target = key;
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "monitoring" && action === "purge") {
      const cutoff = new Date(Date.now() - 30 * 86400000);
      await db.delete(adminApiRequests).where(lt(adminApiRequests.createdAt, cutoff));
      await db.delete(adminWebhookDeliveries).where(lt(adminWebhookDeliveries.createdAt, cutoff));
      await db.delete(adminAuditLogs).where(lt(adminAuditLogs.createdAt, cutoff));
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "clientUsers") {
      if (action === "status") await db.update(users).set({ status: str(payload.status, "active") }).where(eq(users.id, id));
      else if (action === "kyc") await db.update(users).set({ kycStatus: str(payload.status, "verified") }).where(eq(users.id, id));
      else if (action === "risk") await db.update(users).set({ riskLevel: str(payload.level, "low") }).where(eq(users.id, id));
      else if (action === "balance") await db.update(users).set({ balance: sql`${users.balance} + ${num(payload.delta)}` }).where(eq(users.id, id));
      else if (action === "regenerateKey") await db.update(users).set({ apiKey: `ak_${randomCode(24)}`, webhookSecret: `whsec_${randomCode(28)}` }).where(eq(users.id, id));
      else return Response.json({ error: "Action utilisateur inconnue" }, { status: 400 });
      await audit(action === "balance" ? "warning" : "info");
      return Response.json({ ok: true });
    }

    if (entity === "clientWallets") {
      if (action === "toggle") {
        const [item] = await db.select().from(wallets).where(eq(wallets.id, id)).limit(1);
        await db.update(wallets).set({ status: item?.status === "active" ? "frozen" : "active" }).where(eq(wallets.id, id));
      } else if (action === "balance") {
        await db.update(wallets).set({ balance: sql`${wallets.balance} + ${num(payload.delta)}` }).where(eq(wallets.id, id));
      } else return Response.json({ error: "Action wallet inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "clientLinks") {
      if (action === "toggle") {
        const [item] = await db.select().from(paymentLinks).where(eq(paymentLinks.id, id)).limit(1);
        await db.update(paymentLinks).set({ status: item?.status === "active" ? "disabled" : "active" }).where(eq(paymentLinks.id, id));
      } else if (action === "delete") {
        await db.delete(paymentLinks).where(eq(paymentLinks.id, id));
      } else return Response.json({ error: "Action lien inconnue" }, { status: 400 });
      await audit(action === "delete" ? "warning" : "info");
      return Response.json({ ok: true });
    }

    if (entity === "clientNotifications") {
      if (action === "read") await db.update(clientNotificationsTable).set({ isRead: true }).where(eq(clientNotificationsTable.id, id));
      else if (action === "delete") await db.delete(clientNotificationsTable).where(eq(clientNotificationsTable.id, id));
      else if (action === "create") await db.insert(clientNotificationsTable).values({ userId: num(payload.userId, 1), title: str(payload.title, "Admin notice"), message: str(payload.message), type: str(payload.type, "info"), link: str(payload.link) });
      else return Response.json({ error: "Action notification inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "clientSupport") {
      if (action === "reply") await db.insert(supportMessages).values({ userId: null, email: actor, subject: str(payload.subject, "Admin reply"), message: str(payload.message), status: "answered", priority: str(payload.priority, "normal") });
      else if (action === "status") await db.update(supportMessages).set({ status: str(payload.status, "closed") }).where(eq(supportMessages.id, id));
      else return Response.json({ error: "Action support inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "clientKyc" && (action === "approve" || action === "reject")) {
      const note = str(payload.note);
      if (action === "reject" && !note.trim()) return Response.json({ error: "Une note est requise" }, { status: 400 });
      await db.update(kycUpdates).set({ status: action === "approve" ? "approved" : "rejected", reviewNote: note, reviewedAt: new Date() }).where(eq(kycUpdates.id, id));
      const [item] = await db.select().from(kycUpdates).where(eq(kycUpdates.id, id)).limit(1);
      if (item?.userId) await db.update(users).set({ kycStatus: action === "approve" ? "verified" : "rejected" }).where(eq(users.id, item.userId));
      await audit(action === "approve" ? "success" : "warning");
      return Response.json({ ok: true });
    }

    if (entity === "featureFlags" && action === "toggle") {
      const [item] = await db.select().from(adminFeatureFlags).where(eq(adminFeatureFlags.key, str(payload.key))).limit(1);
      await db.update(adminFeatureFlags).set({ enabled: !item?.enabled, updatedAt: new Date() }).where(eq(adminFeatureFlags.key, str(payload.key)));
      target = str(payload.key);
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "feeRules" && action === "update") {
      await db.update(adminFeeRules).set({ percent: num(payload.percent), fixed: num(payload.fixed), status: str(payload.status, "active"), updatedAt: new Date() }).where(eq(adminFeeRules.id, id));
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "team") {
      if (action === "toggle") {
        const [item] = await db.select().from(adminTeamMembers).where(eq(adminTeamMembers.id, id)).limit(1);
        await db.update(adminTeamMembers).set({ status: item?.status === "active" ? "suspended" : "active" }).where(eq(adminTeamMembers.id, id));
      } else if (action === "role") {
        await db.update(adminTeamMembers).set({ role: str(payload.role, "analyst") }).where(eq(adminTeamMembers.id, id));
      } else return Response.json({ error: "Action équipe inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "providerRoutes") {
      if (action === "toggle") {
        const [item] = await db.select().from(adminProviderRoutes).where(eq(adminProviderRoutes.id, id)).limit(1);
        await db.update(adminProviderRoutes).set({ status: item?.status === "active" ? "disabled" : "active", updatedAt: new Date() }).where(eq(adminProviderRoutes.id, id));
      } else if (action === "update") {
        await db.update(adminProviderRoutes).set({ primaryProvider: str(payload.primaryProvider, "ashtechpay"), fallbackProvider: str(payload.fallbackProvider, "saaspay"), updatedAt: new Date() }).where(eq(adminProviderRoutes.id, id));
      } else return Response.json({ error: "Action routage inconnue" }, { status: 400 });
      await audit();
      return Response.json({ ok: true });
    }

    if (entity === "reports" && action === "export") {
      await audit();
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Action administrateur inconnue" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Action impossible" }, { status: 500 });
  }
}
