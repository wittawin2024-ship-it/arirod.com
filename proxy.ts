import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);

  // Only apply to /admin routes
  if (path.startsWith("/admin")) {
    // Exclude login and oauth/auth handling pages
    if (
      path === "/admin/login" ||
      path.startsWith("/admin/auth/")
    ) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const accessToken = request.cookies.get("sb-access-token")?.value;
    const refreshToken = request.cookies.get("sb-refresh-token")?.value;

    // Case 1: Access token expired or missing, but refresh token is present
    if (!accessToken && refreshToken) {
      const url = new URL("/admin/auth/refresh", request.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    // Case 2: Both tokens missing (never logged in or logged out)
    if (!accessToken && !refreshToken) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
