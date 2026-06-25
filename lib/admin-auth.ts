import { cookies } from "next/headers";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "editor";
}

/**
 * Retrieves the current admin/editor session.
 * Cryptographically validates the access token via Supabase Auth
 * and fetches the role from the public.user_roles table.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return null;
    }

    // Cryptographically validate the token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }

    // Query user role from public.user_roles table using admin client (bypasses RLS)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !roleData) {
      console.warn(`User ${user.id} authenticated but has no role in user_roles table.`);
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      role: roleData.role as "admin" | "editor",
    };
  } catch (err) {
    console.error("Error in getAdminSession:", err);
    return null;
  }
}

/**
 * Helper to check if the current user has the 'admin' role.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.role === "admin";
}

/**
 * Helper to check if the current user has at least 'editor' role.
 */
export async function isEditor(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.role === "admin" || session?.role === "editor";
}
