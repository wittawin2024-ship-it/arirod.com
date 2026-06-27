import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";
import { getDynamicOpenRouterApiKey } from "@/lib/api-key";

// Helper to check OpenRouter key status & details from official API
async function verifyOpenRouterKey(apiKey: string): Promise<{
  status: "valid" | "exhausted" | "invalid" | "error";
  errorDetails?: string;
  latencyMs?: number;
  label?: string;
  limit?: number | null;
  usage?: number;
  limitRemaining?: number | null;
}> {
  if (!apiKey) {
    return { status: "invalid", errorDetails: "No API Key provided" };
  }

  const start = Date.now();
  try {
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const latencyMs = Date.now() - start;

    if (response.ok) {
      const json = await response.json();
      const data = json.data || {};
      
      // OpenRouter returns usage in USD credits
      return {
        status: "valid",
        latencyMs,
        label: data.label || "Untitled Key",
        limit: data.limit !== undefined ? data.limit : null,
        usage: data.usage || 0,
        limitRemaining: data.limit_remaining !== undefined ? data.limit_remaining : null,
      };
    }

    const errorJson = await response.json().catch(() => ({}));
    const errorMessage = errorJson?.error?.message || response.statusText;

    if (response.status === 401 || response.status === 403) {
      return { status: "invalid", errorDetails: `API Key ไม่ถูกต้อง: ${errorMessage}`, latencyMs };
    }

    if (response.status === 429) {
      return { status: "exhausted", errorDetails: "อัตราการเรียกใช้งานเกินจำกัด (Rate Limit Exceeded)", latencyMs };
    }

    return { status: "error", errorDetails: `เกิดข้อผิดพลาด (${response.status}): ${errorMessage}`, latencyMs };
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return { status: "error", errorDetails: `ไม่สามารถเชื่อมต่อ OpenRouter ได้: ${error?.message || "Unknown Network Error"}`, latencyMs };
  }
}

// Helper to read and format local chatbot usage statistics
function getUsageStats() {
  const usagePath = path.join(process.cwd(), "data/chatbot-usage.json");
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  try {
    if (fs.existsSync(usagePath)) {
      const data = JSON.parse(fs.readFileSync(usagePath, "utf-8"));
      if (data.date === today) {
        return data;
      }
    }
  } catch (e) {
    console.error("Error reading usage statistics:", e);
  }

  return { date: today, requestCount: 0 };
}

// Masking utility
function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 16) return "••••••••••••";
  return `${key.substring(0, 8)}••••••••${key.substring(key.length - 8)}`;
}

// GET: Check API Key status, details, usage, and local daily request count
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const currentKey = getDynamicOpenRouterApiKey();
    const maskedKey = maskKey(currentKey);

    const verification = currentKey 
      ? await verifyOpenRouterKey(currentKey)
      : { status: "invalid" as const, errorDetails: "ไม่พบ OpenRouter API Key ในระบบ" };

    const localUsage = getUsageStats();

    return NextResponse.json({
      hasKey: !!currentKey,
      maskedKey,
      status: verification.status,
      errorDetails: verification.errorDetails || null,
      latencyMs: verification.latencyMs || null,
      label: verification.label || null,
      limit: verification.limit !== undefined ? verification.limit : null,
      usage: verification.usage || 0,
      limitRemaining: verification.limitRemaining !== undefined ? verification.limitRemaining : null,
      localUsage,
    });
  } catch (error: any) {
    console.error("GET API Key Config error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch configuration" }, { status: 500 });
  }
}

// POST: Update OpenRouter API Key in .env.local
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "กรุณาระบุ API Key" }, { status: 400 });
    }

    // 1. Verify key before saving
    const verification = await verifyOpenRouterKey(apiKey);
    if (verification.status === "invalid") {
      return NextResponse.json({ 
        error: `ตรวจสอบคีย์ล้มเหลว: API Key ไม่ถูกต้อง (${verification.errorDetails})` 
      }, { status: 400 });
    }

    // 2. Write key to .env.local
    let isPersistent = true;
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      let envContent = "";
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      // Remove GEMINI_API_KEY reference if we want to replace it
      const geminiLineRegex = /^GEMINI_API_KEY=.*$/m;
      if (geminiLineRegex.test(envContent)) {
        envContent = envContent.replace(geminiLineRegex, "");
      }

      const keyLineRegex = /^OPENROUTER_API_KEY=.*$/m;
      const newLine = `OPENROUTER_API_KEY=${apiKey}`;

      if (keyLineRegex.test(envContent)) {
        envContent = envContent.replace(keyLineRegex, newLine);
      } else {
        // Append key to env file
        envContent = envContent.trim() + `\n\n# OpenRouter API Key\n${newLine}\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (fsError: any) {
      console.warn("Failed to write to .env.local:", fsError.message);
      isPersistent = false;
    }

    // 3. Update the key in memory immediately for the running server process
    process.env.OPENROUTER_API_KEY = apiKey;

    return NextResponse.json({ 
      success: true, 
      status: verification.status,
      latencyMs: verification.latencyMs,
      maskedKey: maskKey(apiKey),
      isPersistent
    });
  } catch (error: any) {
    console.error("POST API Key Config error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update API Key" }, { status: 500 });
  }
}
