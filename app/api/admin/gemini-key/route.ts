import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

// Helper to check Gemini key status & quota via countTokens API
async function verifyApiKey(apiKey: string): Promise<{
  status: "valid" | "exhausted" | "invalid" | "error";
  errorDetails?: string;
  latencyMs?: number;
}> {
  if (!apiKey) {
    return { status: "invalid", errorDetails: "No API Key provided" };
  }

  const start = Date.now();
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:countTokens?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }],
        }),
      }
    );

    const latencyMs = Date.now() - start;

    if (response.ok) {
      return { status: "valid", latencyMs };
    }

    const errorJson = await response.json().catch(() => ({}));
    const errorMessage = errorJson?.error?.message || response.statusText;
    const errorCode = errorJson?.error?.status || "";

    if (response.status === 429 || errorCode === "RESOURCE_EXHAUSTED" || errorMessage.toLowerCase().includes("quota")) {
      return { status: "exhausted", errorDetails: "Quota Exceeded (โควตาหมดชั่วคราว)", latencyMs };
    }

    if (response.status === 400 || response.status === 403 || errorMessage.toLowerCase().includes("key not valid") || errorMessage.toLowerCase().includes("invalid")) {
      return { status: "invalid", errorDetails: `API Key ไม่ถูกต้อง: ${errorMessage}`, latencyMs };
    }

    return { status: "error", errorDetails: `เกิดข้อผิดพลาด (${response.status}): ${errorMessage}`, latencyMs };
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return { status: "error", errorDetails: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ${error?.message || "Unknown Network Error"}`, latencyMs };
  }
}

// Helper to read and format usage statistics
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
  if (key.length <= 12) return "••••••••••••";
  return `${key.substring(0, 6)}••••••••${key.substring(key.length - 6)}`;
}

// GET: Check API Key status, latency, and current quota usage
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const currentKey = process.env.GEMINI_API_KEY || "";
    const maskedKey = maskKey(currentKey);

    const verification = currentKey 
      ? await verifyApiKey(currentKey)
      : { status: "invalid" as const, errorDetails: "ไม่พบ Gemini API Key ในระบบ" };

    const usage = getUsageStats();

    return NextResponse.json({
      hasKey: !!currentKey,
      maskedKey,
      status: verification.status,
      errorDetails: verification.errorDetails || null,
      latencyMs: verification.latencyMs || null,
      usage,
    });
  } catch (error: any) {
    console.error("GET Gemini Key Config error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch configuration" }, { status: 500 });
  }
}

// POST: Update Gemini API Key in .env.local
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
    const verification = await verifyApiKey(apiKey);
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

      const keyLineRegex = /^GEMINI_API_KEY=.*$/m;
      const newLine = `GEMINI_API_KEY=${apiKey}`;

      if (keyLineRegex.test(envContent)) {
        envContent = envContent.replace(keyLineRegex, newLine);
      } else {
        // Append key to env file
        envContent = envContent.trim() + `\n\n# Google Gemini API Key\n${newLine}\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (fsError: any) {
      console.warn("Failed to write to .env.local (read-only filesystem on cloud hosts like Vercel):", fsError.message);
      isPersistent = false;
    }

    // 3. Update the key in memory immediately for the running server process
    process.env.GEMINI_API_KEY = apiKey;

    return NextResponse.json({ 
      success: true, 
      status: verification.status,
      latencyMs: verification.latencyMs,
      maskedKey: maskKey(apiKey),
      isPersistent
    });
  } catch (error: any) {
    console.error("POST Gemini Key Config error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update API Key" }, { status: 500 });
  }
}
