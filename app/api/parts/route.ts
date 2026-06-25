import { NextRequest, NextResponse } from "next/server";
import { getParts } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const brand = searchParams.get("brand");
    const model = searchParams.get("model");
    const category = searchParams.get("category");

    if (!brand || !model || !category) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const parts = await getParts(brand, model, category);
    return NextResponse.json(parts);
  } catch (error) {
    console.error("Error loading parts data:", error);
    return NextResponse.json([], { status: 500 });
  }
}

