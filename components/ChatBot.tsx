"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { DefaultChatTransport } from "ai";

const QUICK_CHIPS = [
  "🌡️ ไฟอุณหภูมิขึ้นสูง",
  "🔊 มีเสียงดังผิดปกติ",
  "💨 ควันออกจากท่อไอเสีย",
  "🔑 สตาร์ทไม่ติด",
  "🚗 รถสั่นขณะขับ",
  "💡 ไฟเตือนบนหน้าปัด",
  "🛢️ น้ำมันรั่วใต้รถ",
  "🔋 แบตเตอรี่หมด",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // @ai-sdk/react v6 API: using DefaultChatTransport for custom endpoint/body options
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { apiKey },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  };

  const handleQuickChip = (chip: string) => {
    sendMessage({ text: chip });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="chatbot-fab"
        aria-label="เปิดผู้ช่วย AI"
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="chatbot-fab-label">{isOpen ? "ปิด" : "ผู้ช่วย AI"}</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={`chatbot-panel ${isMinimized ? "chatbot-minimized" : ""}`} id="chatbot-panel">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🔧</div>
              <div>
                <div className="chatbot-name">ไอ้เหล็ก</div>
                <div className="chatbot-status">
                  <span className="chatbot-status-dot" />
                  ผู้ช่วยวิเคราะห์รถยนต์
                </div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="chatbot-action-btn"
                title="ตั้งค่า API Key"
                id="chatbot-apikey-btn"
              >
                ⚙️
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="chatbot-action-btn"
                title={isMinimized ? "ขยาย" : "ย่อ"}
                id="chatbot-minimize-btn"
              >
                {isMinimized ? "▲" : "▼"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-action-btn"
                title="ปิด"
                id="chatbot-close-btn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {showApiKeyInput && !isMinimized && (
            <div className="chatbot-apikey-section">
              <input
                type="password"
                placeholder="ใส่ Gemini API Key ของคุณ..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="chatbot-apikey-input"
                id="chatbot-apikey-input"
              />
              <p className="chatbot-apikey-hint">
                รับ API Key ฟรีที่{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="chatbot-messages" id="chatbot-messages">

                {/* Welcome + quick chips (แสดงตอนไม่มีข้อความ) */}
                {messages.length === 0 && (
                  <div className="chatbot-welcome">
                    <div className="chatbot-message-row chatbot-message-bot">
                      <div className="chatbot-msg-avatar">🔧</div>
                      <div className="chatbot-bubble chatbot-bubble-bot">
                        <span>สวัสดีครับ! ผมไอ้เหล็ก 🔧</span>
                        <span>บอกอาการเสียของรถได้เลยครับ จะช่วยวิเคราะห์และแนะนำอะไหล่ที่ต้องเปลี่ยนให้</span>
                      </div>
                    </div>
                    <div className="chatbot-chips">
                      {QUICK_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleQuickChip(chip)}
                          className="chatbot-chip"
                          disabled={isLoading}
                          id={`chip-${chip.replace(/[^\w]/g, "-")}`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chatbot-message-row ${msg.role === "user" ? "chatbot-message-user" : "chatbot-message-bot"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="chatbot-msg-avatar">🔧</div>
                    )}
                    <div className={`chatbot-bubble ${msg.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-bot"}`}>
                      {msg.parts
                        ? msg.parts.map((p, i) => {
                            if (p.type === "text") {
                              return <span key={i}>{p.text}</span>;
                            }
                            return null;
                          })
                        : (msg as { content?: string }).content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="chatbot-message-row chatbot-message-bot">
                    <div className="chatbot-msg-avatar">🔧</div>
                    <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="chatbot-error">
                    ⚠️ เกิดข้อผิดพลาด: {error.message}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chatbot-input-form" id="chatbot-form">
                <input
                  ref={inputRef}
                  id="chatbot-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="บอกอาการเสียของรถ..."
                  className="chatbot-input"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="chatbot-send-btn"
                  disabled={isLoading || !inputValue.trim()}
                  id="chatbot-send-btn"
                  aria-label="ส่ง"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2z" strokeLinejoin="round" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
