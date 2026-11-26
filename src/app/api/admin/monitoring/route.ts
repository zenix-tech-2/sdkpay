import { NextResponse } from "next/server";
import { adminFromRequest, audit } from "@/lib/admin-auth";
import { db, pool } from "@/db";
import { providerEvents, transactions } from "@/db/schema";
import { gte, desc, sql, count, eq, and, lt } from "drizzle-orm";

async function checkDb(): Promise<{ ok: boolean; ms: number }> {
  const t0 = Date.now();
  try {
    await pool.query("select 1");
    return { ok: true, ms: Date.now() - t0 };
  } catch {
    return { ok: false, ms: -1 };
  }
}

async function checkProvider(kind: "ashtechpay" | "saaspay"): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  try {
    if (kind === "saaspay") {
      const base = (process.env.SASPAY_BASE_URL || "https://api.saspay.me/api/v1").replace(/\/$/, "");
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${base}/countries/`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, ms: Date.now() - t0, detail: process.env.SASPAY_SECRET_KEY ? "key set" : "no key (demo)" };
    }
    const base = (process.env.ASHTECHPAY_BASE_URL || "https://ashtechpay.com/v1").replace(/\/$/, "");
    const key = process.env.ASHTECHPAY_API_KEY || "";
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${base}/countries`, {
      signal: ctrl.signal,
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    });
    clearTimeout(t);
    if (!res.ok && res.status !== 401 && res.status !== 403) throw new Error(`HTTP ${res.status}`);
    return { ok: res.ok, ms: Date.now() - t0, detail: key ? (res.ok ? "reachable" : `HTTP ${res.status}`) : "no key (demo)" };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: e instanceof Error ? e.message : "unreachable" };
  }
}

export async function GET() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [dbStatus, ash, ssp] = await Promise.all([checkDb(), checkProvider("ashtechpay"), checkProvider("saaspay")]);
  const d24 = new Date(Date.now() - 86400000);

  const [calls24] = await db.select({ c: count() }).from(providerEvents).where(gte(providerEvents.createdAt, d24));
  const [errs24] = await db
    .select({ c: count() })
    .from(providerEvents)
    .where(and(gte(providerEvents.createdAt, d24), eq(providerEvents.status, "error")));
  const [failedWh] = await db
    .select({ c: count() })
    .from(providerEvents)
    .where(and(eq(providerEvents.action, "webhook"), eq(providerEvents.status, "error")));
  const [tx24] = await db.select({ c: count() }).from(transactions).where(gte(transactions.createdAt, d24));
  const [txFail24] = await db
    .select({ c: count() })
    .from(transactions)
    .where(and(gte(transactions.createdAt, d24), eq(transactions.status, "failed")));

  const topActions = await db
    .select({ action: providerEvents.action, provider: providerEvents.provider, c: count() })
    .from(providerEvents)
    .where(gte(providerEvents.createdAt, d24))
    .groupBy(providerEvents.action, providerEvents.provider)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const failedDeliveries = await db
    .select()
    .from(providerEvents)
    .where(eq(providerEvents.status, "error"))
    .orderBy(desc(providerEvents.createdAt))
    .limit(15);

  const latest = await db.select().from(providerEvents).orderBy(desc(providerEvents.createdAt)).limit(20);

  return NextResponse.json({
    db: dbStatus,
    providers: { ashtechpay: ash, saaspay: ssp },
    mode: process.env.PROVIDER_MODE || "auto",
    stats: {
      calls24h: Number(calls24.c),
      errors24h: Number(errs24.c),
      failedWebhooks: Number(failedWh.c),
      tx24h: Number(tx24.c),
      txFailed24h: Number(txFail24.c),
    },
    topActions: topActions.map((r) => ({ action: r.action, provider: r.provider, count: Number(r.c) })),
    failedDeliveries,
    latest,
  });
}

export async function DELETE() {
  const admin = await adminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const res = await db.delete(providerEvents).where(lt(providerEvents.createdAt, cutoff)).returning({ id: providerEvents.id });
  await audit(admin, "monitoring.purge", "provider_events", `purged ${res.length} events older than 30 days`);
  return NextResponse.json({ ok: true, purged: res.length });
}
