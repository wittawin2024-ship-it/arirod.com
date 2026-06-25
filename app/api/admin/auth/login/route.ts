import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { email, password, isSignUp } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (isSignUp) {
      // 1. Register User in Supabase Auth using Admin Client (bypasses email confirmation)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: error?.message || "Registration failed" },
          { status: 400 }
        );
      }

      const user = data.user;

      // 2. Ensure user role is synced (falls back to manual insert if trigger hasn't run yet)
      let { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData) {
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("*", { count: "exact", head: true });

        const defaultRole = (count || 0) === 0 ? "admin" : "editor";

        await supabaseAdmin
          .from("user_roles")
          .insert({
            id: user.id,
            email: user.email || email,
            role: defaultRole,
          });
      }

      // 3. Log in newly created user to get session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        return NextResponse.json(
          { error: signInError?.message || "Auto sign-in failed after registration" },
          { status: 400 }
        );
      }

      const session = signInData.session;
      const response = NextResponse.json({ success: true });
      const cookieStore = await cookies();

      cookieStore.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: session.expires_in,
      });

      cookieStore.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } else {
      // 1. Sign In via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return NextResponse.json(
          { error: error?.message || "Invalid email or password" },
          { status: 400 }
        );
      }

      const user = data.user;
      const session = data.session;

      // 2. Check and sync user roles
      let { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData) {
        // In case the trigger did not fire or database row was missing,
        // create a role for this user using admin client (bypasses RLS).
        // If this is the first user, make them admin, otherwise editor.
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("*", { count: "exact", head: true });

        const defaultRole = (count || 0) === 0 ? "admin" : "editor";

        const { data: newRole, error: insertError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            id: user.id,
            email: user.email || email,
            role: defaultRole,
          })
          .select("role")
          .single();

        if (insertError) {
          console.error("Failed to initialize user role:", insertError.message);
          return NextResponse.json(
            { error: "User role not initialized. Contact Admin." },
            { status: 403 }
          );
        }
        roleData = newRole;
      }

      // 3. Set Session Cookies
      const response = NextResponse.json({ success: true });
      const cookieStore = await cookies();

      cookieStore.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: session.expires_in,
      });

      cookieStore.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }
  } catch (err: any) {
    console.error("Auth login endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
