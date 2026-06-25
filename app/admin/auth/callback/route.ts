import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/admin/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=No+code+provided", request.url)
    );
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error("Error exchanging code for session:", error?.message);
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=${encodeURIComponent(
            error?.message || "Authentication failed"
          )}`,
          request.url
        )
      );
    }

    const { session } = data;
    const response = NextResponse.redirect(new URL(next, request.url));

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
    console.error("Auth callback exception:", err);
    return NextResponse.redirect(
      new URL("/admin/login?error=Unexpected+callback+error", request.url)
    );
  }
}
