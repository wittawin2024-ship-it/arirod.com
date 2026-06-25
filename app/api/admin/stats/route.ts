import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query stats in parallel using admin client (bypasses RLS)
    const [brandsCount, modelsCount, partsCount, articlesCount] = await Promise.all([
      supabaseAdmin.from("brands").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("models").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("parts").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("articles").select("*", { count: "exact", head: true }),
    ]);

    // Query recent parts added
    const { data: recentParts, error: partsErr } = await supabaseAdmin
      .from("parts")
      .select("id, name_th, brand, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (partsErr) console.warn("Error fetching recent parts:", partsErr.message);

    // Query recent blog articles
    const { data: recentArticles, error: articlesErr } = await supabaseAdmin
      .from("articles")
      .select("id, title, category, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (articlesErr) console.warn("Error fetching recent articles:", articlesErr.message);

    return NextResponse.json({
      stats: {
        brands: brandsCount.count || 0,
        models: modelsCount.count || 0,
        parts: partsCount.count || 0,
        articles: articlesCount.count || 0,
      },
      recentParts: recentParts || [],
      recentArticles: recentArticles || [],
      systemStatus: {
        database: "online",
        latency: "good",
      },
    });
  } catch (err: any) {
    console.error("Dashboard stats endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
