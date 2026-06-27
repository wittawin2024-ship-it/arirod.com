import fs from "fs";
import path from "path";

export interface ChatbotSkill {
  id: string;
  title: string;
  description: string;
  prompt: string;
  enabled: boolean;
}

export interface ChatbotSettings {
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  skills: ChatbotSkill[];
}

const DEFAULT_SYSTEM_PROMPT = `คุณคือ "AraiRod AI" ผู้ช่วย AI ของเว็บไซต์ AraiRod.com ร้านอะไหล่รถยนต์ออนไลน์

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

const DEFAULT_SETTINGS: ChatbotSettings = {
  name: "AraiRod AI",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  model: "openrouter/free",
  temperature: 0.7,
  skills: [
    {
      id: "concise-answers",
      title: "ตอบคำถามอย่างกระชับ (Concise)",
      description: "บังคับให้ AI วิเคราะห์สั้นตรงประเด็น ไม่ยืดเยื้อ",
      prompt: "จงตอบแบบกระชับ ตรงประเด็นที่สุด หลีกเลี่ยงประโยคอารัมภบทซ้ำซาก ให้เริ่มเข้าประเด็นวิเคราะห์ทันที",
      enabled: true,
    },
    {
      id: "price-estimates",
      title: "ประเมินราคากลาง (Price Estimates)",
      description: "แนะนำให้ระบุราคากลางของค่าซ่อม/อะไหล่เป็นเงินบาท",
      prompt: "ในการวิเคราะห์ปัญหาและแนะนำอะไหล่ทุกครั้ง ให้ระบุราคากลางของอะไหล่หรือการซ่อมแซมนั้นเป็นเงินบาทไทย (เช่น 1,500 - 3,000 บาท) เพื่อให้ลูกค้าเห็นภาพงบประมาณเบื้องต้น",
      enabled: true,
    },
    {
      id: "urgency-emphasis",
      title: "เน้นระดับความเร่งด่วน (Urgency)",
      description: "เน้นสัญลักษณ์ระดับความเร่งด่วน (🔴, 🟡, 🟢) ในบรรทัดแรกๆ ให้เด่นชัด",
      prompt: "แสดงระดับความเร่งด่วนในการซ่อม (🔴 🟡 🟢) ให้ชัดเจนที่สุดในส่วนเริ่มต้นคำตอบ เพื่อให้ผู้ใช้ตระหนักถึงความปลอดภัย",
      enabled: false,
    }
  ]
};

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data/chatbot-settings.json");

export function getChatbotSettings(): ChatbotSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const loaded = JSON.parse(content);
      
      // Ensure basic structure is intact, fallback missing values
      return {
        name: loaded.name || DEFAULT_SETTINGS.name,
        systemPrompt: loaded.systemPrompt || DEFAULT_SETTINGS.systemPrompt,
        model: loaded.model || DEFAULT_SETTINGS.model,
        temperature: typeof loaded.temperature === "number" ? loaded.temperature : DEFAULT_SETTINGS.temperature,
        skills: Array.isArray(loaded.skills) ? loaded.skills : DEFAULT_SETTINGS.skills,
      };
    }
  } catch (error) {
    console.error("Failed to read chatbot settings, using defaults:", error);
  }
  return DEFAULT_SETTINGS;
}

export function saveChatbotSettings(settings: ChatbotSettings): boolean {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write chatbot settings:", error);
    return false;
  }
}

export function composeSystemPrompt(settings: ChatbotSettings): string {
  let prompt = settings.systemPrompt;
  
  const activeSkills = settings.skills.filter(skill => skill.enabled);
  if (activeSkills.length > 0) {
    prompt += "\n\nคำแนะนำและทักษะพิเศษเพิ่มเติม (Skills):\n";
    activeSkills.forEach((skill, index) => {
      prompt += `${index + 1}. [ทักษะ: ${skill.title}] - ${skill.prompt}\n`;
    });
  }
  
  return prompt;
}
