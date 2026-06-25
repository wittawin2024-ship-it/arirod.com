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
        <div className="chatbot-panel" id="chatbot-panel">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="12" cy="8" r="2" />
                  <circle cx="9" cy="14" r="2" />
                  <circle cx="15" cy="14" r="2" />
                  <path d="M12 10v2M10.5 13L12 12m1.5 1L12 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className="chatbot-name">ผู้ช่วยไอ้เหล็ก Support</div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="chatbot-action-btn"
                title="ตั้งค่า API Key"
                id="chatbot-apikey-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-action-btn"
                title="ปิด"
                id="chatbot-close-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {showApiKeyInput && (
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
          <div className="chatbot-messages" id="chatbot-messages">
            {/* Date separator */}
            <div className="chatbot-date-separator">Today</div>

            {/* Welcome + quick chips (แสดงตอนไม่มีข้อความ) */}
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="chatbot-message-row chatbot-message-bot">
                  <div className="chatbot-msg-avatar">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                      <circle cx="12" cy="8" r="2" />
                      <circle cx="9" cy="14" r="2" />
                      <circle cx="15" cy="14" r="2" />
                      <path d="M12 10v2M10.5 13L12 12m1.5 1L12 12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
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
                  <div className="chatbot-msg-avatar">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                      <circle cx="12" cy="8" r="2" />
                      <circle cx="9" cy="14" r="2" />
                      <circle cx="15" cy="14" r="2" />
                      <path d="M12 10v2M10.5 13L12 12m1.5 1L12 12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
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
                {msg.role === "user" && (
                  <div className="chatbot-user-avatar">👱‍♀️</div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chatbot-message-row chatbot-message-bot">
                <div className="chatbot-msg-avatar">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="12" cy="8" r="2" />
                    <circle cx="9" cy="14" r="2" />
                    <circle cx="15" cy="14" r="2" />
                    <path d="M12 10v2M10.5 13L12 12m1.5 1L12 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
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
              placeholder="Ask anything..."
              className="chatbot-input"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="button"
              className="chatbot-attachment-btn"
              title="แนบไฟล์"
              aria-label="แนบไฟล์"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.575 6.575a4.101 4.101 0 105.798 5.798l7.136-7.136A6.101 6.101 0 1012.9 3.602l-7.935 7.935a8.101 8.101 0 1011.455 11.455l8.136-8.136" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="chatbot-send-btn"
              disabled={isLoading || !inputValue.trim()}
              id="chatbot-send-btn"
              aria-label="ส่ง"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.4 22a.84.84 0 01-.65-.28.79.79 0 01-.16-.68l1.7-6.35c.08-.28.3-.5.58-.56L14 12 4.87 9.87a.8.8 0 01-.58-.56L2.59 2.96a.79.79 0 01.16-.68.84.84 0 01.65-.28.91.91 0 01.35.08l17 8.5a.8.8 0 010 1.44l-17 8.5a.91.91 0 01-.35.08z" />
              </svg>
            </button>
          </div>

        </div>
      )}
    </>
  );
}
