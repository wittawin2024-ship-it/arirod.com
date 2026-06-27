import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import fs from "fs";
import path from "path";
import { getChatbotSettings, composeSystemPrompt } from "@/lib/chatbot-settings";

function incrementUsageCount() {
  try {
    const usagePath = path.join(process.cwd(), "data/chatbot-usage.json");
    const today = new Date().toLocaleDateString("en-CA");

    let stats = { date: today, requestCount: 0 };

    if (fs.existsSync(usagePath)) {
      const fileContent = fs.readFileSync(usagePath, "utf-8");
      const data = JSON.parse(fileContent);
      if (data.date === today) {
        stats = data;
      }
    }

    stats.requestCount += 1;

    const dir = path.dirname(usagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(usagePath, JSON.stringify(stats, null, 2), "utf-8");
  } catch (e) {
    console.error("[chat] Failed to log usage stats:", e);
  }
}

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uiMessages = body.messages ?? [];

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "ไม่พบ OpenRouter API Key กรุณาตั้งค่า OPENROUTER_API_KEY ใน .env.local",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ดึงการตั้งค่าแชทบอทล่าสุดจากระบบหลังบ้าน (รวมถึง prompt และ skills ต่างๆ)
    const settings = getChatbotSettings();
    const finalSystemPrompt = composeSystemPrompt(settings);

    // บันทึกปริมาณการใช้งาน
    incrementUsageCount();

    // แปลง UIMessage[] → ModelMessage[]
    const messages = await convertToModelMessages(uiMessages);

    // กำหนดให้ชี้ไปยัง API endpoint ของ OpenRouter
    const openrouter = createOpenAI({
      apiKey: openrouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": "https://arairod.com",
        "X-Title": settings.name || "AraiRod AI",
      },
    });

    const result = streamText({
      model: openrouter.chat(settings.model || "openrouter/free"),
      system: finalSystemPrompt,
      messages,
      temperature: settings.temperature ?? 0.7,
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[chat] Stream error:", error);
        if (error && typeof error === "object") {
          return (error as any).message || JSON.stringify(error);
        }
        return String(error) || "Unknown stream error";
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[chat] Error:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
