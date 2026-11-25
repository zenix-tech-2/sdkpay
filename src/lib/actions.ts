"use server";

import { db } from "@/db";
import {
  users,
  accounts,
  paymentLinks,
  transactions,
  notifications,
  apiKeys,
  devices,
  conversionRules,
  payoutMethods,
  savedAddresses,
  referrals,
  kycSubmissions,
} from "@/db/schema";

export async function removePayoutMethod(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(payoutMethods).where(and(eq(payoutMethods.id, id), eq(payoutMethods.userId, user.id)));
  revalidatePath("/settings");
}
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { SESSION_COOKIE, getSessionUser, sha256 } from "@/lib/session";
import { randomRef, shortSlug } from "@/lib/format";

const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "0").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ---------------- auth ---------------- */

export async function login(_prev: { error: string | null }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || user.passwordHash !== sha256(password)) {
    return { error: "Invalid email or password. Try the demo account button below." };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/dashboard");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

/* ---------------- payment links ---------------- */

export async function createPaymentLink(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = amountRaw === "" ? null : Number(amountRaw);
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) slug = shortSlug();
  // ensure uniqueness
  const exists = await db.select({ id: paymentLinks.id }).from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
  if (exists.length) slug = `${slug}-${shortSlug().slice(0, 4)}`;
  await db.insert(paymentLinks).values({
    userId: user.id,
    slug,
    title,
    description: String(formData.get("description") ?? "") || null,
    amount: amount === null || Number.isNaN(amount) ? null : String(amount),
    currency: String(formData.get("currency") ?? "XAF"),
    pdfUrl: String(formData.get("pdfUrl") ?? "") || null,
    redirectUrl: String(formData.get("redirectUrl") ?? "") || null,
    expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null,
  });
  revalidatePath("/links");
  redirect("/links");
}

export async function togglePaymentLink(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  const [link] = await db.select().from(paymentLinks).where(and(eq(paymentLinks.id, id), eq(paymentLinks.userId, user.id))).limit(1);
  if (!link) return;
  await db.update(paymentLinks).set({ active: !link.active }).where(eq(paymentLinks.id, id));
  revalidatePath("/links");
}

export async function deletePaymentLink(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(paymentLinks).where(and(eq(paymentLinks.id, id), eq(paymentLinks.userId, user.id)));
  revalidatePath("/links");
}

export async function renamePaymentLink(id: string, title: string) {
  const user = await getSessionUser();
  if (!user) return;
  const clean = title.trim();
  if (!clean) return;
  await db.update(paymentLinks).set({ title: clean }).where(and(eq(paymentLinks.id, id), eq(paymentLinks.userId, user.id)));
  revalidatePath("/links");
}

/* ---------------- balances & transactions ---------------- */

async function getPrimaryBalance(userId: string) {
  const [acc] = await db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isPrimary, true))).limit(1);
  return acc ?? null;
}
async function getUsdtBalance(userId: string) {
  const [acc] = await db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.currency, "USDT"))).limit(1);
  return acc ?? null;
}
async function adjustBalance(accountId: string, delta: number) {
  await db.update(accounts)
    .set({ balance: sql`${accounts.balance} + ${delta}` })
    .where(eq(accounts.id, accountId));
}

export async function createDeposit(input: {
  amount: number;
  fee: number;
  net: number;
  currencyLabel: string;
  country: string;
  operator: string;
  phone: string;
  feePercent?: number;
}): Promise<{ ok: boolean; ref?: string; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  if (!(input.amount > 0)) return { ok: false, error: "Enter a valid amount" };
  const ref = randomRef("ASH-D");
  await db.insert(transactions).values({
    userId: user.id,
    ref,
    type: input.currencyLabel.startsWith("USDT") ? "crypto_deposit" : "deposit",
    direction: "credit",
    status: "pending",
    amount: String(input.amount),
    fee: String(input.fee),
    feePercent: String(input.feePercent ?? 4),
    net: String(input.net),
    currency: input.currencyLabel.startsWith("USDT") ? "USDT" : "XAF",
    operator: input.operator,
    country: input.country,
    recipientPhone: input.phone,
    source: input.currencyLabel.startsWith("USDT") ? "crypto" : "app",
    balanceBefore: null,
    balanceAfter: null,
  });
  await db.insert(notifications).values({
    userId: user.id,
    title: "Deposit pending",
    body: `Your deposit of ${input.net.toLocaleString("fr-FR")} ${input.currencyLabel.startsWith("USDT") ? "USDT" : "XAF"} is being processed.`,
    kind: "deposit_pending",
  });
  revalidatePath("/transactions");
  revalidatePath("/notifications");
  return { ok: true, ref };
}

export async function createWithdrawal(input: {
  amount: number;
  fee: number;
  net: number;
  method: "mobile_money" | "crypto";
  operator?: string;
  phone?: string;
  address?: string;
  country?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  const isCrypto = input.method === "crypto";
  const account = isCrypto ? await getUsdtBalance(user.id) : await getPrimaryBalance(user.id);
  if (!account) return { ok: false, error: "Wallet not found" };
  const balance = Number(account.balance);
  if (balance < input.amount) return { ok: false, error: "Insufficient balance" };
  const min = isCrypto ? 1 : 550;
  if (input.amount < min) return { ok: false, error: isCrypto ? "Minimum withdrawal is 1 USDT" : "Minimum withdrawal is 550 XAF" };
  const ref = randomRef("ASH-W");
  await adjustBalance(account.id, -input.amount);
  await db.insert(transactions).values({
    userId: user.id,
    ref,
    type: "withdrawal",
    direction: "debit",
    status: "pending",
    amount: String(input.amount),
    fee: String(input.fee),
    feePercent: isCrypto ? "0" : "4.00",
    net: String(input.net),
    currency: account.currency,
    operator: input.operator ?? null,
    country: input.country ?? "Cameroun",
    recipient: isCrypto ? (input.address?.slice(0, 10) + "…" + input.address?.slice(-4)) : user.fullName,
    recipientPhone: input.phone ?? null,
    source: isCrypto ? "crypto" : "app",
    balanceBefore: String(balance),
    balanceAfter: String(balance - input.amount),
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/withdraw");
  return { ok: true };
}

export async function createInternalTransfer(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  const query = String(formData.get("query") ?? "").trim().toLowerCase();
  const currency = String(formData.get("currency") ?? "XAF");
  const amount = num(formData.get("amount"));
  if (!query || amount <= 0) return { ok: false as const, error: "Enter a recipient and an amount" };
  const [recipient] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${query} or lower(${users.username}) = ${query.replace(/^@/, "")} or ${users.phone} = ${query}`)
    .limit(1);
  if (!recipient) return { ok: false as const, error: "No SDK Pay account found for this identifier" };
  if (recipient.id === user.id) return { ok: false as const, error: "You cannot send money to yourself" };
  const [senderAcc] = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), eq(accounts.currency, currency))).limit(1);
  if (!senderAcc) return { ok: false as const, error: "Wallet not found" };
  const bal = Number(senderAcc.balance);
  if (bal < amount) return { ok: false as const, error: "Insufficient balance" };
  let [recipientAcc] = await db.select().from(accounts).where(and(eq(accounts.userId, recipient.id), eq(accounts.currency, currency))).limit(1);
  if (!recipientAcc) {
    [recipientAcc] = await db.insert(accounts).values({ userId: recipient.id, currency, country: recipient.country ?? "Cameroun", countryCode: recipient.countryCode ?? "cm", balance: "0" }).returning();
  }
  await adjustBalance(senderAcc.id, -amount);
  await adjustBalance(recipientAcc.id, amount);
  const ref = randomRef("ASH-I");
  const now = new Date();
  await db.insert(transactions).values([
    { userId: user.id, ref, type: "internal_transfer", direction: "debit", status: "completed", amount: String(amount), fee: "0", feePercent: "0", net: String(amount), currency, recipient: recipient.fullName, source: "app", balanceBefore: String(bal), balanceAfter: String(bal - amount), createdAt: now },
    { userId: recipient.id, ref: ref + "R", type: "internal_transfer", direction: "credit", status: "completed", amount: String(amount), fee: "0", feePercent: "0", net: String(amount), currency, recipient: user.fullName, source: "app", createdAt: now },
  ]);
  await db.insert(notifications).values({ userId: recipient.id, title: "Money received", body: `${user.fullName} sent you ${amount.toLocaleString("fr-FR")} ${currency} via internal transfer.`, kind: "info" });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true as const, ref };
}

export async function createMobileSend(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  const amount = num(formData.get("amount"));
  const phone = String(formData.get("phone") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const operator = String(formData.get("operator") ?? "");
  const country = String(formData.get("country") ?? "Cameroun");
  if (!(amount > 0) || !phone || !operator) return { ok: false as const, error: "Complete all fields" };
  const fee = Math.round(amount * 0.04 * 100) / 100;
  const account = await getPrimaryBalance(user.id);
  if (!account) return { ok: false as const, error: "Wallet not found" };
  const bal = Number(account.balance);
  if (bal < amount) return { ok: false as const, error: "Insufficient balance" };
  await adjustBalance(account.id, -amount);
  const ref = randomRef("ASH-S");
  await db.insert(transactions).values({
    userId: user.id, ref, type: "mobile_money_send", direction: "debit", status: "pending",
    amount: String(amount), fee: String(fee), feePercent: "4.00", net: String(amount - fee), currency: account.currency,
    operator, country, recipient: name || phone, recipientPhone: phone, source: "app", balanceBefore: String(bal), balanceAfter: String(bal - amount),
  });
  revalidatePath("/transactions");
  return { ok: true as const, ref };
}

export async function createCryptoSend(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  const amount = num(formData.get("amount"));
  const address = String(formData.get("address") ?? "").trim();
  if (!(amount >= 1)) return { ok: false as const, error: "Minimum send is 1.00 USDT" };
  if (!address || address.length < 20) return { ok: false as const, error: "Paste a valid wallet address" };
  const account = await getUsdtBalance(user.id);
  const bal = account ? Number(account.balance) : 0;
  if (bal < amount) return { ok: false as const, error: "Insufficient USDT balance" };
  await adjustBalance(account!.id, -amount);
  const ref = randomRef("ASH-C");
  await db.insert(transactions).values({
    userId: user.id, ref, type: "crypto_send", direction: "debit", status: "pending",
    amount: String(amount), fee: "1.00", feePercent: "0", net: String(Math.max(0, amount - 1)), currency: "USDT",
    recipient: address.slice(0, 10) + "…" + address.slice(-4), source: "crypto", balanceBefore: String(bal), balanceAfter: String(bal - amount),
  });
  revalidatePath("/transactions");
  return { ok: true as const, ref };
}

/* ---------------- conversion rules ---------------- */

export async function createConversionRule(sources: string[], destination: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  if (!sources.length) return { ok: false as const, error: "Select at least one source wallet" };
  await db.insert(conversionRules).values({ userId: user.id, sources, destination, active: true });
  revalidatePath("/conversion");
  return { ok: true as const };
}

export async function toggleConversionRule(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  const [rule] = await db.select().from(conversionRules).where(and(eq(conversionRules.id, id), eq(conversionRules.userId, user.id))).limit(1);
  if (rule) await db.update(conversionRules).set({ active: !rule.active }).where(eq(conversionRules.id, id));
  revalidatePath("/conversion");
}

export async function deleteConversionRule(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(conversionRules).where(and(eq(conversionRules.id, id), eq(conversionRules.userId, user.id)));
  revalidatePath("/conversion");
}

/* ---------------- notifications ---------------- */

export async function markAllNotificationsRead() {
  const user = await getSessionUser();
  if (!user) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
  revalidatePath("/notifications");
}

export async function markNotificationRead(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath("/notifications");
}

export async function deleteNotification(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath("/notifications");
}

export async function deleteAllNotifications() {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(notifications).where(eq(notifications.userId, user.id));
  revalidatePath("/notifications");
}

/* ---------------- API keys & webhooks ---------------- */

export async function regenerateApiKey() {
  const user = await getSessionUser();
  if (!user) return;
  const key = "ak_" + randomBytes(20).toString("hex");
  await db.insert(apiKeys)
    .values({ userId: user.id, apiKey: key })
    .onConflictDoUpdate({ target: apiKeys.userId, set: { apiKey: key } });
  revalidatePath("/api");
}

export async function revealWebhookSecret(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const [row] = await db.select().from(apiKeys).where(eq(apiKeys.userId, user.id)).limit(1);
  if (row?.webhookSecret) return row.webhookSecret;
  const secret = "whsec_" + randomBytes(24).toString("hex");
  if (row) {
    await db.update(apiKeys).set({ webhookSecret: secret }).where(eq(apiKeys.userId, user.id));
  } else {
    await db.insert(apiKeys).values({ userId: user.id, apiKey: "ak_" + randomBytes(20).toString("hex"), webhookSecret: secret });
  }
  revalidatePath("/api");
  return secret;
}

/* ---------------- wallets ---------------- */

export async function createWallet(input: { code: string; name: string; currency: string }) {
  const user = await getSessionUser();
  if (!user) return;
  await db.insert(accounts).values({
    userId: user.id,
    currency: input.currency,
    country: input.name,
    countryCode: input.code,
    balance: "0.00",
    isPrimary: false,
  });
  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function saveCryptoAddress(label: string, address: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  if (!label.trim() || address.trim().length < 20) return { ok: false as const, error: "Invalid label or address" };
  await db.insert(savedAddresses).values({ userId: user.id, address: address.trim(), label: label.trim() });
  return { ok: true as const };
}

export async function addPayoutMethod(operator: string, phone: string, label: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.insert(payoutMethods).values({ userId: user.id, operator, phone, label: label || null });
  revalidatePath("/settings");
}

/* ---------------- profile & security ---------------- */

export async function updateProfile(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName) return;
  await db.update(users).set({ fullName, phone }).where(eq(users.id, user.id));
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function changePassword(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (sha256(current) !== user.passwordHash) return { ok: false, error: "Current password is incorrect" };
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters" };
  await db.update(users).set({ passwordHash: sha256(next) }).where(eq(users.id, user.id));
  return { ok: true };
}

export async function submitKyc(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;
  const docId = String(formData.get("docId") ?? "").trim();
  if (!docId) return;
  await db.update(users).set({ kycStatus: "pending" }).where(eq(users.id, user.id));
  revalidatePath("/kyc");
  revalidatePath("/settings");
}

export async function disconnectDevice(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(devices).where(and(eq(devices.id, id), eq(devices.userId, user.id), eq(devices.current, false)));
  revalidatePath("/settings");
}

export async function disconnectOtherDevices() {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(devices).where(and(eq(devices.userId, user.id), eq(devices.current, false)));
  revalidatePath("/settings");
}

export async function deleteAccount() {
  const user = await getSessionUser();
  if (!user) return;
  await db.delete(users).where(eq(users.id, user.id));
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

/* ---------------- public hosted checkout ---------------- */

export async function submitPublicPayment(input: {
  slug: string;
  amount: number;
  operator: string;
  phone: string;
  payerName: string;
}): Promise<{ ok: boolean; ref?: string; error?: string }> {
  const [link] = await db.select().from(paymentLinks).where(eq(paymentLinks.slug, input.slug)).limit(1);
  if (!link || !link.active) return { ok: false, error: "This payment link is unavailable" };
  const amount = link.amount !== null ? Number(link.amount) : input.amount;
  if (!(amount > 0)) return { ok: false, error: "Enter a valid amount" };
  if (input.phone.replace(/\D/g, "").length < 8) return { ok: false, error: "Enter a valid Mobile Money number" };
  const ref = randomRef("ASH-L");
  await db.insert(transactions).values({
    userId: link.userId,
    ref,
    type: "payment_received",
    direction: "credit",
    status: "completed",
    amount: String(amount),
    fee: "0",
    feePercent: "0",
    net: String(amount),
    currency: link.currency,
    operator: input.operator,
    country: "Cameroun",
    recipient: input.payerName || null,
    recipientPhone: input.phone,
    source: "link",
    paymentLinkId: link.id,
  });
  await db.update(paymentLinks)
    .set({ paymentsCount: sql`${paymentLinks.paymentsCount} + 1`, collected: sql`${paymentLinks.collected} + ${amount}`, clicks: sql`${paymentLinks.clicks} + 1` })
    .where(eq(paymentLinks.id, link.id));
  await db.insert(notifications).values({
    userId: link.userId,
    title: "Payment received",
    body: `${amount.toLocaleString("fr-FR")} ${link.currency} received via "${link.title}" (${input.operator.replace(/_/g, " ")} · ${input.phone}).`,
    kind: "payment_received",
  });
  revalidatePath("/notifications");
  return { ok: true, ref };
}

export async function trackLinkClick(slug: string) {
  await db.update(paymentLinks).set({ clicks: sql`${paymentLinks.clicks} + 1` }).where(eq(paymentLinks.slug, slug));
}

/* ---------------- sign up ---------------- */

export async function signup(_prev: { error: string | null }, formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "Cameroun");
  const password = String(formData.get("password") ?? "");
  if (!fullName || !username || !email || password.length < 8) {
    return { error: "Fill in every field. Password must be at least 8 characters." };
  }
  const existing = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email} or lower(${users.username}) = ${username}`).limit(1);
  if (existing.length) return { error: "An account with this email or username already exists." };
  const id = crypto.randomUUID();
  const suffix = String(Math.floor(10000000 + Math.random() * 89999999));
  await db.insert(users).values({
    id, fullName, username, email, phone, country, countryCode: "cm",
    kycStatus: "none", role: "user", passwordHash: sha256(password),
    publicId: `SDKPAY${suffix}`, referralCode: `${username.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}${Math.floor(Math.random() * 90 + 10)}`,
  });
  await db.insert(accounts).values([
    { userId: id, currency: "XAF", country: "Cameroon", countryCode: "cm", balance: "0.00", isPrimary: true },
    { userId: id, currency: "USDT", country: "Crypto · Tron", countryCode: "xx", balance: "0.00", isPrimary: false },
  ]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/kyc");
}

/* ---------------- KYC submissions ---------------- */

const dataUrlOk = (v: unknown): v is string => typeof v === "string" && v.startsWith("data:image/") && v.length < 4_500_000;

export async function submitKycDocuments(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  const docType = String(formData.get("docType") ?? "");
  if (!["national_id", "passport", "driver_license"].includes(docType)) return { ok: false, error: "Choose a document type" };
  const docNumber = String(formData.get("docNumber") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "") || null;
  const frontImage = formData.get("frontImage");
  const backImage = formData.get("backImage");
  const selfieImage = formData.get("selfieImage");
  if (!docNumber || !fullName) return { ok: false, error: "Enter your full name and document number" };
  if (!dataUrlOk(frontImage)) return { ok: false, error: "Front image is missing or too large" };
  if (docType !== "passport" && !dataUrlOk(backImage)) return { ok: false, error: "Back image is missing or too large" };
  if (!dataUrlOk(selfieImage)) return { ok: false, error: "Selfie image is missing or too large" };
  await db.insert(kycSubmissions).values({
    userId: user.id, docType, docNumber, fullName, dateOfBirth,
    frontImage, backImage: docType === "passport" ? null : (backImage as string), selfieImage: selfieImage as string,
    status: "pending",
  });
  await db.update(users).set({ kycStatus: "pending", kycRejectionReason: null }).where(eq(users.id, user.id));
  await db.insert(notifications).values({ userId: user.id, title: "KYC submitted", body: "Your identity documents were received and are awaiting review. This usually takes less than 24 business hours.", kind: "info" });
  revalidatePath("/kyc");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ---------------- admin: KYC review ---------------- */

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function approveKyc(submissionId: string) {
  const admin = await requireAdmin();
  if (!admin) return;
  const [sub] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, submissionId)).limit(1);
  if (!sub) return;
  await db.update(kycSubmissions).set({ status: "approved", reviewedBy: admin.email, reviewedAt: new Date() }).where(eq(kycSubmissions.id, submissionId));
  await db.update(users).set({ kycStatus: "verified", kycRejectionReason: null }).where(eq(users.id, sub.userId));
  await db.insert(notifications).values({ userId: sub.userId, title: "KYC approved", body: "Your identity has been verified. All features are now unlocked, including withdrawals and payment links.", kind: "withdrawal_confirmed" });
  revalidatePath("/admin/kyc");
  revalidatePath("/admin");
}

export async function rejectKyc(submissionId: string, reason: string) {
  const admin = await requireAdmin();
  if (!admin) return;
  const clean = reason.trim();
  if (!clean) return;
  const [sub] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, submissionId)).limit(1);
  if (!sub) return;
  await db.update(kycSubmissions).set({ status: "rejected", rejectionReason: clean, reviewedBy: admin.email, reviewedAt: new Date() }).where(eq(kycSubmissions.id, submissionId));
  await db.update(users).set({ kycStatus: "rejected", kycRejectionReason: clean }).where(eq(users.id, sub.userId));
  await db.insert(notifications).values({ userId: sub.userId, title: "KYC rejected", body: `Your verification was rejected: ${clean}. Please update your documents and resubmit.`, kind: "deposit_rejected" });
  revalidatePath("/admin/kyc");
  revalidatePath("/admin");
}
