import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

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
  const body = await req.json();

  // @ai-sdk/react v3 ส่ง messages ใน body.messages
  const messages = body.messages ?? [];
  const apiKey = body.apiKey ?? "";

  const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return new Response(
      JSON.stringify({
        error: "ไม่พบ Gemini API Key กรุณาตั้งค่า GEMINI_API_KEY ใน .env.local",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: SYSTEM_PROMPT,
    messages,
    temperature: 0.7,
  });

  // ai v6 + @ai-sdk/react v3 ใช้ toUIMessageStreamResponse
  return result.toUIMessageStreamResponse();
}
