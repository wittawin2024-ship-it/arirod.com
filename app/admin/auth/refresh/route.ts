import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  if (!refreshToken) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    return response;
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.warn("Failed to refresh session:", error?.message);
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    const { session } = data;
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.set("sb-access-token", session.access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: session.expires_in,
    });

    response.cookies.set("sb-refresh-token", session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Error refreshing session:", err);
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    return response;
  }
}
