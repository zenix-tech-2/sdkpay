import { headers } from "next/headers";

/**
 * The public base URL always follows the domain the app is actually served on,
 * so switching domains never breaks links, docs or provider callbacks.
 * Order: forwarded host of the current request -> Host header -> PUBLIC_BASE_URL -> Vercel production URL.
 */
export function baseFromHeaders(h: Pick<Headers, "get">): string | null {
  const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim();
  if (!host) return null;
  const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host);
  const proto = (h.get("x-forwarded-proto") || (isLocal ? "http" : "https")).split(",")[0].trim();
  return `${proto}://${host}`;
}

export function baseFromRequest(req: Request): string {
  return baseFromHeaders(req.headers) || fallbackBase();
}

function fallbackBase(): string {
  const env = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return v ? `https://${v}` : "http://localhost:3000";
}

/** Server-side: current request's base URL (works in route handlers and server components). */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    return baseFromHeaders(h) || fallbackBase();
  } catch {
    return fallbackBase();
  }
}
