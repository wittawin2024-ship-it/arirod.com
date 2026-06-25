import fs from "fs";
import path from "path";

/**
 * Dynamically retrieves the Gemini API Key directly from .env.local
 * to bypass Next.js runtime environment caching. Falls back to process.env.
 */
export function getDynamicGeminiApiKey(): string {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^GEMINI_API_KEY=(.+)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (e) {
    console.error("Failed to read dynamic Gemini API key from .env.local:", e);
  }
  return process.env.GEMINI_API_KEY || "";
}
