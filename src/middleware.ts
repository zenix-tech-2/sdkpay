import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "sdkpay_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminOnly = process.env.ADMIN_ONLY_DEPLOYMENT === "1";
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminLoginApi = pathname === "/api/admin/auth/login";
  const isPublicAsset = pathname.startsWith("/_next")
    || pathname.startsWith("/logos")
    || pathname.startsWith("/images")
    || pathname === "/favicon.svg"
    || pathname === "/favicon.ico"
    || pathname === "/api/health";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (pathname.startsWith("/admin/cfd")) {
    return NextResponse.redirect(new URL(token ? "/admin" : "/admin/login", request.url));
  }

  if (adminOnly && !isAdminPage && !isAdminApi && !isPublicAsset) {
    return NextResponse.redirect(new URL(token ? "/admin" : "/admin/login", request.url));
  }

  if (isAdminPage && !isAdminLogin && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminApi && !isAdminLoginApi && !token) {
    return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|logos|images|api/health).*)"],
};
