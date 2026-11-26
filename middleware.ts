import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Deployment targeting (same codebase, separate deployments):
 *  DEPLOY_TARGET=all    (default) -> client app + admin console
 *  DEPLOY_TARGET=client -> client app only (/admin + /api/admin blocked)
 *  DEPLOY_TARGET=admin  -> admin console only (merchant app blocked,
 *                          provider webhooks + health stay reachable)
 */
export function middleware(req: NextRequest) {
  const target = (process.env.DEPLOY_TARGET || "all").toLowerCase();
  const p = req.nextUrl.pathname;

  if (target === "client" && (p === "/admin" || p.startsWith("/admin/") || p.startsWith("/api/admin"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (target === "admin") {
    const allowed =
      p === "/admin" ||
      p.startsWith("/admin/") ||
      p.startsWith("/api/admin") ||
      p.startsWith("/api/webhooks") ||
      p === "/api/health";
    if (!allowed) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)).*)"],
};
