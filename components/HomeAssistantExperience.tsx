"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Quick suggestion chips ──────────────────────────────────────────────────
const QUICK_CHIPS = [
  "รถสตาร์ทไม่ติด",
  "แอร์ไม่เย็น",
  "ไฟเครื่องโชว์",
  "มีเสียงดังใต้รถ",
  "รถสั่นขณะขับ",
  "น้ำมันรั่ว",
];

// ── How-to steps ────────────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "เล่าอาการรถ",
    description:
      "พิมพ์อาการที่สังเกตได้ เช่น เสียงผิดปกติ ไฟโชว์ รถไม่มีแรง ไม่จำเป็นต้องใช้ศัพท์เทคนิค",
  },
  {
    number: "02",
    title: "AI วิเคราะห์สาเหตุ",
    description:
      "ระบบประมวลผลจากอาการ ยี่ห้อ รุ่น และประวัติรถ เพื่อระบุสาเหตุที่เป็นไปได้พร้อมระดับความน่าจะเป็น",
  },
  {
    number: "03",
    title: "รับแผนการซ่อม",
    description:
      "ได้รับคำแนะนำวิธีแก้ไข ระดับความเร่งด่วน ราคาประมาณการ และรายการอะไหล่ที่ต้องใช้",
  },
  {
    number: "04",
    title: "หาอะไหล่หรืออู่",
    description:
      "เชื่อมต่อกับอะไหล่ตรงรุ่นรถหรือค้นหาอู่ซ่อมใกล้คุณที่เชี่ยวชาญปัญหานั้นโดยเฉพาะ",
  },
];

const highlights = [
  "ไม่ต้องมีความรู้ด้านรถ",
  "วิเคราะห์ตามรุ่นรถคุณ",
  "ได้คำตอบภายในวินาที",
];

// ── Urgency badge helper ─────────────────────────────────────────────────────
function UrgencyBadge({ text }: { text: string }) {
  if (text.includes("🔴") || text.toLowerCase().includes("ด่วนมาก")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[12px] font-medium text-red-600 border border-red-100">
        🔴 ด่วนมาก — ห้ามขับต่อ
      </span>
    );
  }
  if (text.includes("🟡") || text.toLowerCase().includes("ปานกลาง")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-[12px] font-medium text-yellow-700 border border-yellow-100">
        🟡 ปานกลาง — ควรซ่อมเร็วๆ นี้
      </span>
    );
  }
  if (text.includes("🟢") || text.toLowerCase().includes("รอได้")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[12px] font-medium text-green-700 border border-green-100">
        🟢 รอได้ — ซ่อมเมื่อสะดวก
      </span>
    );
  }
  return null;
}

// ── Render AI message text (preserve line breaks + detect urgency) ────────────
function AIMessageContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const badge = <UrgencyBadge key={`badge-${i}`} text={line} />;
        const badgeEl = badge.props.children ? badge : null;
        if (
          line.includes("🔴") ||
          line.includes("🟡") ||
          line.includes("🟢")
        ) {
          return (
            <div key={i} className="mt-2">
              {badgeEl || <span>{line}</span>}
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-[14px] leading-relaxed text-[#393C41]">
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function HomeAssistantExperience() {
  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const hasMessages = messages.length > 0;

  // Scoped scroll: scroll only the chat history box, keeping the main page scroll position fixed
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (chip: string) => {
    sendMessage({ text: chip });
  };

  const scrollToChat = () => {
    const el = document.getElementById("chat-input");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLTextAreaElement | null)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#171A20]">
      {/* ── Hero + Chat ─────────────────────────────────────────── */}
      <section className="px-5 pt-24 pb-10 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-5xl flex flex-col items-center">

          {/* Title */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[34px] font-medium leading-tight text-[#171A20] md:text-[56px]">
              ผู้ช่วยดูแลรถยนต์ของคุณ
            </h1>
            <p className="mt-4 text-[15px] text-[#8E8E8E] md:text-[17px]">
              วิเคราะห์ปัญหา · แนะนำวิธีแก้ไข · ค้นหาอะไหล่ที่เหมาะสม
            </p>
          </div>

          {/* ── Chat Container ─────────────────────────────────── */}
          <div className="mx-auto mt-8 w-full max-w-3xl md:mt-10">
            <div className="rounded-[26px] border border-[#DADAD6] bg-white shadow-[0_18px_55px_rgba(23,26,32,0.08)] overflow-hidden transition-shadow focus-within:shadow-[0_22px_70px_rgba(23,26,32,0.12)]">

              {/* Message History */}
              {hasMessages && (
                <div
                  ref={chatContainerRef}
                  className="max-h-[480px] overflow-y-auto px-5 py-5 md:px-6 space-y-5 scroll-smooth"
                >
                  {messages.map((msg) => {
                    const textContent = msg.parts
                      ? msg.parts
                          .filter((p) => p.type === "text")
                          .map((p) => (p as { type: "text"; text: string }).text)
                          .join("")
                      : (msg as { content?: string }).content ?? "";

                    if (msg.role === "user") {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[78%] rounded-[18px] rounded-tr-[6px] bg-[#171A20] px-4 py-3">
                            <p className="text-[14px] leading-relaxed text-white">
                              {textContent}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // AI message
                    return (
                      <div key={msg.id} className="flex justify-start gap-3">
                        {/* Avatar */}
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#171A20] text-[13px]">
                          🔧
                        </div>
                        <div className="max-w-[82%] rounded-[18px] rounded-tl-[6px] border border-[#EEEEEA] bg-[#F8F8F6] px-4 py-3">
                          <AIMessageContent text={textContent} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming / Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#171A20] text-[13px]">
                        🔧
                      </div>
                      <div className="rounded-[18px] rounded-tl-[6px] border border-[#EEEEEA] bg-[#F8F8F6] px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A0A09C] [animation-delay:0ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A0A09C] [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A0A09C] [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                      ⚠️ {error.message}
                    </div>
                  )}
                </div>
              )}



              {/* Input area */}
              <div className={hasMessages ? "border-t border-[#EEEEEA]" : ""}>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  disabled={isLoading}
                  className="block min-h-[100px] w-full resize-none bg-white px-5 pb-3 pt-5 text-[16px] leading-7 text-[#171A20] outline-none placeholder:text-[#8E8E8E] md:min-h-[116px] md:px-6 md:pt-5 md:text-[17px] disabled:opacity-60"
                  placeholder={
                    hasMessages
                      ? "ถามต่อได้เลยครับ..."
                      : "รถของคุณมีปัญหาอะไรครับ?"
                  }
                />
                <div className="flex items-center justify-end gap-2 border-t border-[#EEEEEA] px-4 py-3">
                  <p className="hidden flex-1 text-[12px] text-[#A0A09C] sm:block">
                    กด Enter เพื่อส่ง · Shift+Enter ขึ้นบรรทัดใหม่
                  </p>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="ส่งข้อความ"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#171A20] text-[18px] text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:bg-[#D0D1D2]"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>

            {/* Quick chips — outside chat box */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChip(chip)}
                  disabled={isLoading}
                  className="rounded-full border border-[#E7E7E3] bg-white px-4 py-2 text-[13px] text-[#5C5E62] transition-colors hover:border-[#171A20] hover:text-[#171A20] disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="mt-4 text-center text-[11px] text-[#C4C4C0]">
              AraiRod AI วิเคราะห์เบื้องต้น — ควรให้ช่างผู้เชี่ยวชาญตรวจสอบก่อนซ่อม
            </p>
          </div>
        </div>
      </section>

      {/* ── How-to-Use ──────────────────────────────────────────── */}
      <section className="w-full px-5 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl flex flex-col items-center">

          {/* Section Header */}
          <div className="mb-12 text-center md:mb-16">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#8E8E8E]">
              วิธีใช้งาน
            </p>
            <h2 className="text-[26px] font-medium text-[#171A20] md:text-[36px]">
              ง่ายแค่ 4 ขั้นตอน
            </h2>
          </div>

          {/* Step Cards */}
          <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center rounded-[20px] border border-[#E7E7E3] bg-white px-6 py-7 transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(23,26,32,0.07)] md:px-7 md:py-8"
              >
                <p className="mb-5 text-[28px] font-semibold leading-none text-[#171A20]">
                  {step.number}
                </p>
                <h3 className="mb-3 text-[17px] font-semibold leading-snug text-[#171A20] md:text-[18px]">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.75] text-[#A0A09C]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="mt-5 w-full grid gap-3 sm:grid-cols-3">
            {highlights.map((text) => (
              <div
                key={text}
                className="flex items-center justify-center gap-3 rounded-[18px] border border-[#E7E7E3] bg-white px-5 py-4"
              >
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#171A20]" />
                <span className="text-[14px] text-[#393C41]">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={scrollToChat}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171A20] px-7 text-[14px] font-medium text-white transition-transform hover:scale-[1.03]"
            >
              เริ่มเล่าอาการรถ
              <span className="text-[16px]">↑</span>
            </button>
            <p className="mt-3 text-[12px] text-[#8E8E8E]">ฟรี ไม่ต้องสมัครสมาชิก</p>
          </div>
        </div>
      </section>
    </div>
  );
}
