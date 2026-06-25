import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import fs from "fs";
import path from "path";
import { getDynamicGeminiApiKey } from "@/lib/gemini-key";

function incrementUsageCount() {
  try {
    const usagePath = path.join(process.cwd(), "data/chatbot-usage.json");
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    
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

const SYSTEM_PROMPT = `คุณคือ "ไอ้เหล็ก" ผู้ช่วย AI ของเว็บไซต์ AraiRod.com ร้านอะไหล่รถยนต์ออนไลน์

ความเชี่ยวชาญของคุณ:
- วิเคราะห์อาการเสียของรถยนต์จากอาการที่ผู้ใช้บอก
- แนะนำอะไหล่ที่ต้องเปลี่ยนพร้อมชื่อเต็มและรายละเอียด
- ประเมินความเร่งด่วนในการซ่อม
- ให้ข้อมูลราคาและแหล่งซื้ออะไหล่

วิธีตอบ:
1. ถ้ายังไม่รู้ยี่ห้อ/รุ่น/ปีรถ → ถามก่อน 1 ครั้ง (อย่าถามซ้ำ)
2. วิเคราะห์อาการและบอกสาเหตุที่เป็นไปได้ เรียงจากโอกาสมากไปน้อย
3. แนะนำอะไหล่ที่ต้องตรวจสอบและเปลี่ยน
4. บอกระดับความเร่งด่วน:
   🔴 ด่วนมาก - ห้ามขับต่อ
   🟡 ปานกลาง - ควรซ่อมใน 1-2 สัปดาห์
   🟢 รอได้ - ซ่อมเมื่อสะดวก
5. แนะนำให้ดูอะไหล่ที่ AraiRod.com เสมอเมื่อเหมาะสม

กฎสำคัญ:
- ตอบเป็นภาษาไทยเสมอ
- ใช้ emoji เพื่อให้อ่านง่าย
- ห้ามตอบเรื่องที่ไม่เกี่ยวกับรถยนต์
- ถ้าไม่แน่ใจ แนะนำให้พาไปช่างเพื่อตรวจสอบ
- ตอบกระชับ ตรงประเด็น ไม่ยาวเกินไป`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // @ai-sdk/react v3 ส่ง UIMessages (มี parts[]) ใน body.messages
    // ต้องแปลงเป็น ModelMessages ก่อนส่งให้ streamText
    const uiMessages = body.messages ?? [];
    const apiKey = body.apiKey ?? "";

    const geminiApiKey = apiKey || getDynamicGeminiApiKey();

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "ไม่พบ Gemini API Key กรุณาตั้งค่า GEMINI_API_KEY ใน .env.local",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // บันทึกปริมาณการใช้งาน Quota (Increment usage count)
    incrementUsageCount();

    // แปลง UIMessage[] → ModelMessage[] (async ต้อง await)
    const messages = await convertToModelMessages(uiMessages);

    console.log("[chat] uiMessages:", JSON.stringify(uiMessages));
    console.log("[chat] modelMessages:", JSON.stringify(messages));

    const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
    });

    // ai v6 + @ai-sdk/react v3 ใช้ toUIMessageStreamResponse
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        const err = error as Error;
        console.error("[chat] Stream error:", err?.message, err?.stack);
        return err?.message || "Unknown stream error";
      }
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
