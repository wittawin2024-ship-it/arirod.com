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
    const brandId = searchParams.get("brand_id");

    let query = supabaseAdmin
      .from("models")
      .select("*, brands(name, active)")
      .order("name", { ascending: true });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data: models, error } = await query;
    if (error) throw error;

    return NextResponse.json({ models });
  } catch (err: any) {
    console.error("GET Models error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch models" },
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
      brand_id,
      name,
      name_th,
      years,
      engine,
      transmission,
      type,
      image,
      description,
      specs,
      maintenance_tips,
      seo,
      active,
    } = body;

    if (!id || !brand_id || !name) {
      return NextResponse.json(
        { error: "Model ID, Brand association, and Model Name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("models")
      .insert({
        id: id.toLowerCase().trim(),
        brand_id,
        name: name.trim(),
        name_th: name_th?.trim() || null,
        years: years || [],
        engine: engine || null,
        transmission: transmission || null,
        type: type || null,
        image: image || null,
        description: description || null,
        specs: specs || null,
        maintenance_tips: maintenance_tips || [],
        seo: seo || null,
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, model: data });
  } catch (err: any) {
    console.error("POST Model error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create model" },
      { status: 500 }
    );
  }
}
