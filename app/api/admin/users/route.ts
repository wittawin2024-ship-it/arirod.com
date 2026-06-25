import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: List all users (admin-only)
export async function GET() {
  try {
    const session = await getAdminSession();

    // Check if authenticated and is an admin
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("GET Users API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT: Update user role (admin-only)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();

    // Check if authenticated and is an admin
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id, role } = await request.json();

    if (!id || !role || !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Invalid user ID or role parameter" }, { status: 400 });
    }

    // Prevent modifying own role to avoid self-lockout
    if (id === session.id) {
      return NextResponse.json({ error: "You cannot modify your own role" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error("PUT Users API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (admin-only)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();

    // Check if authenticated and is an admin
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === session.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Delete user from Supabase Auth (which cascades to public.user_roles due to FK cascade)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.warn("Failed to delete from auth users directly, falling back to public.user_roles deletion:", deleteAuthError.message);
      
      // Fallback: delete only from user_roles if Auth API delete fails
      const { error: dbError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("id", userId);
        
      if (dbError) throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE User API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
