import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (accessToken) {
      // Call Supabase Auth to invalidate session on the server
      await supabase.auth.signOut();
    }

    const response = NextResponse.json({ success: true });

    // Clear session cookies in the browser
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");

    return response;
  } catch (err) {
    console.error("Logout API error:", err);
    return NextResponse.json(
      { error: "Failed to complete logout" },
      { status: 500 }
    );
  }
}
