import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: brands, error } = await supabaseAdmin
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ brands });
  } catch (err: any) {
    console.error("GET Brands error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch brands" },
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
    const { id, name, name_th, logo, color, description, popular_models, active } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Brand ID and English Name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("brands")
      .insert({
        id: id.toLowerCase().trim(),
        name: name.trim(),
        name_th: name_th?.trim() || null,
        logo: logo || null,
        color: color || null,
        description: description || null,
        popular_models: popular_models || [],
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, brand: data });
  } catch (err: any) {
    console.error("POST Brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
