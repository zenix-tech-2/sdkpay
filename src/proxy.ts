import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SDK Pay ships as TWO deployments from this one repository:
 *   unset              → everything works (local preview / single deploy)
 *   APP_ROLE=merchant  → the customer app only (admin console → 404)
 *   APP_ROLE=admin     → the admin console only (everything else → /admin)
 *
 * Deploy the same repo twice (e.g. app.sdkpay.com + admin.sdkpay.com)
 * with different APP_ROLE env vars. Auth itself still happens in the app;
 * this proxy is only the outer boundary.
 */
const APP_ROLE = process.env.APP_ROLE || "unified";

const ADMIN_OPEN = /^\/(login|admin|docs)(\/|$)/;       // login + admin + public docs
const ML_FILES = new Set(["/llms.txt", "/llms-full.txt", "/AGENTS.md"]);
const STATIC_OR_API = /^\/(api|_next|icons|icons3d|images|demo)(\/|$)/; // API + asset folders
const ROOT_ASSETS = new Set(["/logo.svg", "/logo-icon.svg", "/mascot.png", "/favicon.ico", "/robots.txt", "/sitemap.xml"]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (APP_ROLE === "admin") {
    if (ADMIN_OPEN.test(pathname) || ML_FILES.has(pathname) || STATIC_OR_API.test(pathname) || ROOT_ASSETS.has(pathname)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // merchant deployment: the entire admin console does not exist
  if (APP_ROLE === "merchant" && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
