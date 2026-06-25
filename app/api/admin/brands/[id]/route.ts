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

    const { data: brand, error } = await supabaseAdmin
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ brand });
  } catch (err: any) {
    console.error("GET Brand by ID error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch brand" },
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
    const { name, name_th, logo, color, description, popular_models, active } = body;

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("brands")
      .update({
        name: name.trim(),
        name_th: name_th?.trim() || null,
        logo: logo || null,
        color: color || null,
        description: description || null,
        popular_models: popular_models || [],
        active: active !== undefined ? active : true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (active !== undefined) {
      // 1. Update all models where brand_id = id
      const { data: updatedModels, error: modelsError } = await supabaseAdmin
        .from("models")
        .update({ active })
        .eq("brand_id", id)
        .select("id");

      if (modelsError) throw modelsError;

      if (updatedModels && updatedModels.length > 0) {
        const modelIds = updatedModels.map((m) => m.id);
        // 2. Update all parts where model_id belongs to this brand
        const { error: partsError } = await supabaseAdmin
          .from("parts")
          .update({ active })
          .in("model_id", modelIds);

        if (partsError) throw partsError;
      }
    }

    return NextResponse.json({ success: true, brand: data });
  } catch (err: any) {
    console.error("PUT Brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update brand" },
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

    // Role-based Access Control: Editor cannot delete records
    if (session.role === "editor") {
      return NextResponse.json(
        { error: "สิทธิ์การเข้าใช้งานไม่ถูกต้อง: บรรณาธิการ (Editor) ไม่สามารถลบข้อมูลได้" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("brands")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
