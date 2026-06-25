import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("model_id");
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("parts")
      .select("*, models(name, brand_id)")
      .order("created_at", { ascending: false });

    if (modelId) query = query.eq("model_id", modelId);
    if (category) query = query.eq("category", category);

    const { data: parts, error } = await query;
    if (error) throw error;

    return NextResponse.json({ parts });
  } catch (err: any) {
    console.error("GET Parts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch parts list" },
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
    const {
      id,
      model_id,
      name_th,
      name_en,
      brand,
      aftermarket_brand,
      part_number,
      category,
      subcategory,
      description,
      price_min,
      price_max,
      image,
      change_interval,
      difficulty,
      affiliate_links,
      related_article,
      tags,
      active,
    } = body;

    if (!id || !model_id || !name_th || !name_en || !brand || !category) {
      return NextResponse.json(
        { error: "Part ID, Model ID, Names, Brand, and Category are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("parts")
      .insert({
        id: id.toUpperCase().trim(),
        model_id,
        name_th: name_th.trim(),
        name_en: name_en.trim(),
        brand: brand.trim(),
        aftermarket_brand: aftermarket_brand || null,
        part_number: part_number || null,
        category,
        subcategory: subcategory || null,
        description: description || null,
        price_min: price_min ? parseInt(price_min) : null,
        price_max: price_max ? parseInt(price_max) : null,
        image: image || null,
        change_interval: change_interval || null,
        difficulty: difficulty || null,
        affiliate_links: affiliate_links || null,
        related_article: related_article || null,
        tags: tags || [],
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, part: data });
  } catch (err: any) {
    console.error("POST Part error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create part" },
      { status: 500 }
    );
  }
}
