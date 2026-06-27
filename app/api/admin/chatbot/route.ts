import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getChatbotSettings, saveChatbotSettings } from "@/lib/chatbot-settings";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = getChatbotSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET /api/admin/chatbot error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only administrators can edit chatbot settings
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    
    // Simple validation
    if (!body.name || !body.systemPrompt || !body.model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = saveChatbotSettings({
      name: body.name,
      systemPrompt: body.systemPrompt,
      model: body.model,
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      skills: Array.isArray(body.skills) ? body.skills : [],
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to write settings to disk" }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: getChatbotSettings() });
  } catch (error: any) {
    console.error("POST /api/admin/chatbot error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
