import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: articles, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ articles });
  } catch (err: any) {
    console.error("GET Blog Articles error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .insert({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        category: category.trim(),
        content: content,
        image: image || null,
        read_time: read_time ? parseInt(read_time) : 5,
        date: date || new Date().toISOString(),
        status: status || "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, article: data });
  } catch (err: any) {
    console.error("POST Blog Article error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
