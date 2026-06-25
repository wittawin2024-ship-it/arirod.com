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

    const { data: model, error } = await supabaseAdmin
      .from("models")
      .select("*, brands(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ model });
  } catch (err: any) {
    console.error("GET Model by ID error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch model details" },
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

    if (!brand_id || !name) {
      return NextResponse.json(
        { error: "Brand and Model Name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("models")
      .update({
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
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (active !== undefined) {
      // Update all parts under this model to match the model's active status
      const { error: partsError } = await supabaseAdmin
        .from("parts")
        .update({ active })
        .eq("model_id", id);

      if (partsError) throw partsError;
    }

    return NextResponse.json({ success: true, model: data });
  } catch (err: any) {
    console.error("PUT Model error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update model" },
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

    // Role Enforcement: Editor cannot delete models
    if (session.role === "editor") {
      return NextResponse.json(
        { error: "สิทธิ์การเข้าใช้งานไม่ถูกต้อง: บรรณาธิการ (Editor) ไม่สามารถลบข้อมูลได้" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("models")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Model error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete model" },
      { status: 500 }
    );
  }
}
