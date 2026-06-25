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

    const { data: part, error } = await supabaseAdmin
      .from("parts")
      .select("*, models(*, brands(*))")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ part });
  } catch (err: any) {
    console.error("GET Part by ID error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch part details" },
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
    const {
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

    if (!model_id || !name_th || !name_en || !brand || !category) {
      return NextResponse.json(
        { error: "Model ID, Names, Brand, and Category are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("parts")
      .update({
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
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, part: data });
  } catch (err: any) {
    console.error("PUT Part error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update part" },
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

    // Role Enforcement: Editor cannot delete parts
    if (session.role === "editor") {
      return NextResponse.json(
        { error: "สิทธิ์การเข้าใช้งานไม่ถูกต้อง: บรรณาธิการ (Editor) ไม่สามารถลบข้อมูลได้" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("parts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Part error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete part" },
      { status: 500 }
    );
  }
}
