"use server";

import { db } from "@/db";
import { users, accounts, transactions, notifications, paymentLinks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getSessionUser, sha256 } from "@/lib/session";
import { writeSetting, getReleases, type ReleaseItem } from "@/lib/settings";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/* ================= users ================= */

export async function setUserStatus(id: string, status: "active" | "suspended") {
  const admin = await requireAdmin();
  if (!admin || admin.id === id) return;
  await db.update(users).set({ status }).where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function setUserRole(id: string, role: "user" | "admin") {
  const admin = await requireAdmin();
  if (!admin || admin.id === id) return;
  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function setUserKyc(id: string, kycStatus: "none" | "pending" | "verified" | "rejected") {
  const admin = await requireAdmin();
  if (!admin) return;
  await db.update(users).set({ kycStatus, kycRejectionReason: kycStatus === "rejected" ? "Rejected by operations team" : null }).where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function adjustUserBalance(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };
  const userId = String(formData.get("userId") ?? "");
  const direction = String(formData.get("direction") ?? "credit");
  const amount = Math.abs(num(formData.get("amount")));
  const reason = String(formData.get("reason") ?? "Manual adjustment").trim();
  if (!userId || !(amount > 0)) return { ok: false, error: "Enter a valid amount" };
  const [account] = await db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isPrimary, true))).limit(1);
  if (!account) return { ok: false, error: "Wallet not found" };
  const delta = direction === "debit" ? -amount : amount;
  const before = Number(account.balance);
  if (delta < 0 && before + delta < 0) return { ok: false, error: "Debit exceeds balance" };
  await db.update(accounts).set({ balance: sql`${accounts.balance} + ${delta}` }).where(eq(accounts.id, account.id));
  await db.insert(transactions).values({
    userId,
    ref: `ADJ-${randomBytes(6).toString("hex").toUpperCase()}`,
    type: "adjustment",
    direction: delta >= 0 ? "credit" : "debit",
    status: "completed",
    amount: String(amount),
    fee: "0",
    feePercent: "0",
    net: String(amount),
    currency: account.currency,
    source: "admin",
    recipient: reason,
    balanceBefore: String(before),
    balanceAfter: String(before + delta),
  });
  await db.insert(notifications).values({
    userId,
    title: direction === "debit" ? "Balance adjustment (debit)" : "Balance adjustment (credit)",
    body: `${direction === "debit" ? "-" : "+"}${amount.toLocaleString("fr-FR")} ${account.currency} — ${reason}`,
    kind: "info",
  });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
  return { ok: true };
}

/** Sets a temporary password and returns it ONCE for the admin to relay. */
export async function resetUserPassword(userId: string): Promise<{ ok: boolean; password?: string; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };
  const temp = randomBytes(5).toString("hex") + "!" + Math.floor(Math.random() * 90 + 10);
  await db.update(users).set({ passwordHash: sha256(temp) }).where(eq(users.id, userId));
  return { ok: true, password: temp };
}

export async function deleteUserAdmin(id: string) {
  const admin = await requireAdmin();
  if (!admin || admin.id === id) return;
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
  if (target?.role === "admin") return; // never delete admins from the panel
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

/* ================= fees ================= */

export async function saveFees(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const read = (k: string, d: number) => {
    const v = Number(String(formData.get(k) ?? ""));
    return Number.isFinite(v) && v >= 0 ? v : d;
  };
  await writeSetting("fees", {
    deposit_percent: read("deposit_percent", 4),
    withdrawal_percent: read("withdrawal_percent", 4),
    send_percent: read("send_percent", 4),
    crypto_deposit_percent: read("crypto_deposit_percent", 2.5),
    crypto_withdrawal_fixed: read("crypto_withdrawal_fixed", 1),
    conversion_percent: read("conversion_percent", 1),
    min_withdrawal: read("min_withdrawal", 550),
    max_withdrawal: read("max_withdrawal", 2_000_000),
    usdt_min: read("usdt_min", 1),
    usdt_max: read("usdt_max", 1500),
    min_deposit: read("min_deposit", 100),
  });
  revalidatePath("/admin/fees");
  revalidatePath("/fees");
  revalidatePath("/deposit");
  revalidatePath("/withdraw");
}

/* ================= maintenance, flags, announcement ================= */

export async function saveMaintenance(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const mode = String(formData.get("mode") ?? "off");
  await writeSetting("maintenance", {
    mode: ["off", "banner", "full"].includes(mode) ? mode : "off",
    title: String(formData.get("title") ?? "").trim() || "Scheduled maintenance",
    message: String(formData.get("message") ?? "").trim() || "SDK Pay is undergoing scheduled maintenance. We will be back shortly.",
    until: String(formData.get("until") ?? "").trim(),
  });
  revalidatePath("/admin/control");
}

export async function saveFlags(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  await writeSetting("flags", {
    deposits: formData.get("deposits") === "on",
    withdrawals: formData.get("withdrawals") === "on",
    sends: formData.get("sends") === "on",
    signups: formData.get("signups") === "on",
    links: formData.get("links") === "on",
  });
  revalidatePath("/admin/control");
}

export async function saveAnnouncement(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const tone = String(formData.get("tone") ?? "info");
  await writeSetting("announcement", {
    active: formData.get("active") === "on",
    text: String(formData.get("text") ?? "").trim(),
    tone: ["info", "warn", "critical"].includes(tone) ? tone : "info",
  });
  revalidatePath("/admin/control");
}

/* ================= broadcast ================= */

export async function broadcastNotification(formData: FormData): Promise<{ ok: boolean; sent?: number; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const target = String(formData.get("target") ?? "all");
  if (title.length < 3 || body.length < 5) return { ok: false, error: "Write a proper title and message." };
  const all = await db.select({ id: users.id, role: users.role, kycStatus: users.kycStatus, status: users.status }).from(users);
  const recipients = all.filter((u) => {
    if (u.role === "admin" && target !== "admins") return false; // never spam admins with user broadcasts
    switch (target) {
      case "all": return true;
      case "verified": return u.kycStatus === "verified";
      case "pending": return u.kycStatus === "pending" || u.kycStatus === "none";
      case "suspended": return u.status === "suspended";
      case "admins": return u.role === "admin";
      default: return true;
    }
  });
  if (recipients.length === 0) return { ok: false, error: "No recipients match this audience." };
  const rows = recipients.map((u) => ({ userId: u.id, title, body, kind: "info" as const }));
  // chunk inserts to keep payload sizes sane
  for (let i = 0; i < rows.length; i += 200) {
    await db.insert(notifications).values(rows.slice(i, i + 200));
  }
  revalidatePath("/notifications");
  return { ok: true, sent: rows.length };
}

/* ================= release notes ================= */

export async function addRelease(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "");
  if (!title || !body) return;
  const date = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const releases = await getReleases();
  const maxN = releases.reduce((m, r) => Math.max(m, parseInt(r.n.replace(/\D/g, "") || "0", 10)), 0);
  const items = itemsRaw.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 12);
  const next: ReleaseItem = { n: `#${String(maxN + 1).padStart(2, "0")}`, date, title, body, items };
  await writeSetting("releases", [...releases, next]);
  revalidatePath("/updates");
  revalidatePath("/admin/updates");
}

export async function deleteRelease(n: string) {
  const admin = await requireAdmin();
  if (!admin) return;
  const releases = await getReleases();
  await writeSetting("releases", releases.filter((r) => r.n !== n));
  revalidatePath("/updates");
  revalidatePath("/admin/updates");
}

/* ================= payment links (admin) ================= */

export async function adminToggleLink(id: string) {
  const admin = await requireAdmin();
  if (!admin) return;
  const [link] = await db.select().from(paymentLinks).where(eq(paymentLinks.id, id)).limit(1);
  if (!link) return;
  await db.update(paymentLinks).set({ active: !link.active }).where(eq(paymentLinks.id, id));
  revalidatePath("/admin/links");
}

export async function adminDeleteLink(id: string) {
  const admin = await requireAdmin();
  if (!admin) return;
  await db.delete(paymentLinks).where(eq(paymentLinks.id, id));
  revalidatePath("/admin/links");
}
