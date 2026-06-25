import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: article, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ article });
  } catch (err: any) {
    console.error("GET Article by ID error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, category, content, image, read_time, date, status } = body;

    if (!title || !slug || !category || !content) {
      return NextResponse.json(
        { error: "Title, Slug, Category, and Content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        category: category.trim(),
        content: content,
        image: image || null,
        read_time: read_time ? parseInt(read_time) : 5,
        date: date || new Date().toISOString(),
        status: status || "draft",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, article: data });
  } catch (err: any) {
    console.error("PUT Article error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role Enforcement: Editor cannot delete articles
    if (session.role === "editor") {
      return NextResponse.json(
        { error: "สิทธิ์การเข้าใช้งานไม่ถูกต้อง: บรรณาธิการ (Editor) ไม่สามารถลบข้อมูลได้" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Article error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
