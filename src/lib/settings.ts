/**
 * Runtime application settings, stored in app_meta (fees, maintenance, feature
 * flags, announcements, releases). Read through a 30s in-process cache so hot
 * paths don't hit the DB on every render; admin writes revalidate it.
 */
import { db } from "@/db";
import { appMeta } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface FeeSettings {
  deposit_percent: number;
  withdrawal_percent: number;
  send_percent: number;
  crypto_deposit_percent: number;
  crypto_withdrawal_fixed: number;
  conversion_percent: number;
  min_withdrawal: number;
  max_withdrawal: number;
  usdt_min: number;
  usdt_max: number;
  min_deposit: number;
}

export interface MaintenanceSettings {
  mode: "off" | "banner" | "full";
  title: string;
  message: string;
  until: string;
}

export interface FeatureFlags {
  deposits: boolean;
  withdrawals: boolean;
  sends: boolean;
  signups: boolean;
  links: boolean;
}

export interface Announcement {
  active: boolean;
  text: string;
  tone: "info" | "warn" | "critical";
}

export const DEFAULT_FEES: FeeSettings = {
  deposit_percent: 4, withdrawal_percent: 4, send_percent: 4,
  crypto_deposit_percent: 2.5, crypto_withdrawal_fixed: 1, conversion_percent: 1,
  min_withdrawal: 550, max_withdrawal: 2_000_000, usdt_min: 1, usdt_max: 1500, min_deposit: 100,
};
export const DEFAULT_MAINTENANCE: MaintenanceSettings = { mode: "off", title: "Scheduled maintenance", message: "SDK Pay is undergoing scheduled maintenance. We will be back shortly.", until: "" };
export const DEFAULT_FLAGS: FeatureFlags = { deposits: true, withdrawals: true, sends: true, signups: true, links: true };
export const DEFAULT_ANNOUNCEMENT: Announcement = { active: false, text: "", tone: "info" };

type CacheEntry<T> = { at: number; value: T };
const cache = new Map<string, CacheEntry<unknown>>();
const TTL = 30_000;

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  try {
    const [row] = await db.select().from(appMeta).where(eq(appMeta.key, key)).limit(1);
    const value = (row?.value ?? fallback) as T;
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch {
    return fallback;
  }
}

export function clearSettingsCache() {
  cache.clear();
}

export const getFees = () => readSetting<FeeSettings>("fees", DEFAULT_FEES);
export const getMaintenance = () => readSetting<MaintenanceSettings>("maintenance", DEFAULT_MAINTENANCE);
export const getFlags = () => readSetting<FeatureFlags>("flags", DEFAULT_FLAGS);
export const getAnnouncement = () => readSetting<Announcement>("announcement", DEFAULT_ANNOUNCEMENT);

export interface ReleaseItem {
  n: string;
  date: string;
  title: string;
  body: string;
  items: string[];
}
export const getReleases = () => readSetting<ReleaseItem[]>("releases", []);

export async function writeSetting(key: string, value: unknown) {
  await db.insert(appMeta)
    .values({ key, value: value as never })
    .onConflictDoUpdate({ target: appMeta.key, set: { value: value as never } });
  clearSettingsCache();
}
