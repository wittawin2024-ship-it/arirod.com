import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  } catch (err) {
    console.error("Auth me endpoint error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
