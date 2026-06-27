"use client";

import React, { useState, useEffect } from "react";

interface KeyConfigData {
  hasKey: boolean;
  maskedKey: string;
  status: "valid" | "exhausted" | "invalid" | "error";
  errorDetails: string | null;
  latencyMs: number | null;
  label: string | null;
  limit: number | null;
  usage: number;
  limitRemaining: number | null;
  localUsage: {
    date: string;
    requestCount: number;
  };
}

export default function ApiKeyPage() {
  const [data, setData] = useState<KeyConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfig = async (isTesting = false) => {
    if (isTesting) {
      setTesting(true);
    } else {
      setLoading(true);
    }
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/api-key");
      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลสถานะ API Key ได้");
      }
      const json = await res.json();
      setData(json);
      if (isTesting) {
        setSuccess("ทดสอบการเชื่อมต่อและดึงข้อมูลอัปเดตสำเร็จ!");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเรียกใช้ API");
    } finally {
      setLoading(false);
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newKey.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึก API Key");
      }

      if (json.isPersistent === false) {
        setSuccess("เชื่อมต่อ OpenRouter API Key สำเร็จแล้ว! (เป็นการบันทึกชั่วคราวในหน่วยความจำเนื่องจากระบบไฟล์บนระบบคลาวด์เป็นแบบ Read-only กรุณาตั้งค่าถาวรที่ Vercel Environment Variables)");
      } else {
        setSuccess("บันทึกและเชื่อมต่อ OpenRouter API Key ใหม่สำเร็จแล้ว!");
      }
      setNewKey("");
      setShowKey(false);
      
      // Refresh configurations with the updated data
      await fetchConfig();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการประมวลผล");
    } finally {
      setUpdating(false);
    }
  };

  // Helper for status badge styling and text
  const getStatusBadge = (status: KeyConfigData["status"]) => {
    switch (status) {
      case "valid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
            ใช้งานได้ปกติ (Active)
          </span>
        );
      case "exhausted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            เครดิต/ความถี่การใช้งานเต็ม (Rate Limit Exceeded)
          </span>
        );
      case "invalid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            API Key ไม่ถูกต้อง (Invalid Key)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            เกิดข้อผิดพลาด (Connection Error)
          </span>
        );
    }
  };

  // Credit calculation
  const hasLimit = data?.limit !== null && data?.limit !== undefined && data.limit > 0;
  const creditUsagePercent = hasLimit && data?.limit
    ? Math.min((data.usage / data.limit) * 100, 100)
    : 0;

  return (
    <div className="space-y-8 font-mitr max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการ OpenRouter API Key & ปริมาณการใช้งาน
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ตรวจสอบความถูกต้องของ OpenRouter API Key ติดตามเครดิตโควตาคงเหลือ และยอดการส่งคำขอแชทบอทวิเคราะห์รถยนต์
          </p>
        </div>
        <button
          onClick={() => fetchConfig(true)}
          disabled={loading || testing || updating}
          className="px-4 py-2 bg-white border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] text-[var(--graphite)] hover:text-[var(--electric-blue)] font-semibold rounded-lg text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {testing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              กำลังตรวจสอบ...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              ตรวจสอบสถานะปัจจุบัน
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ ข้อผิดพลาด:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg text-emerald-700 text-sm shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold">✅ สำเร็จ:</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Status Card & Credit Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Status Detail Card */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4 flex items-center gap-2">
              <span>ข้อมูลสถานะคีย์ (API Key Information)</span>
            </h2>

            {loading ? (
              <div className="space-y-4 py-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-8 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--pewter)] uppercase font-semibold">OpenRouter API Key (Masked)</label>
                    <div className="mt-1 font-mono font-bold text-gray-700 text-sm bg-[var(--light-ash)] px-3 py-1.5 rounded-lg border border-gray-200/50 break-all select-all">
                      {data.hasKey ? data.maskedKey : "ไม่ได้ตั้งค่า API Key"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--pewter)] uppercase font-semibold block">สถานะเชื่อมต่อ</label>
                    <div className="mt-2.5">
                      {getStatusBadge(data.status)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--cloud-gray)] pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.label && (
                    <div>
                      <span className="text-xs text-[var(--pewter)] font-medium block">ชื่อเรียกคีย์ (Key Label):</span>
                      <span className="text-sm font-semibold text-[var(--graphite)]">{data.label}</span>
                    </div>
                  )}
                  {data.latencyMs !== null && (
                    <div>
                      <span className="text-xs text-[var(--pewter)] font-medium block">ความเร็วตอบสนอง (Latency):</span>
                      <span className="inline-block mt-0.5 font-mono font-semibold text-xs text-[var(--graphite)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {data.latencyMs} ms
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-[var(--pewter)] font-medium block">การเรียกใช้แชทบอทของวันนี้:</span>
                    <span className="inline-block mt-0.5 font-mono font-semibold text-xs text-[var(--graphite)] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {data.localUsage.requestCount} ครั้ง
                    </span>
                  </div>
                </div>
                
                {data.status !== "valid" && data.errorDetails && (
                  <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                    <span className="font-bold block mb-1">สาเหตุข้อผิดพลาด:</span>
                    {data.errorDetails}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-[var(--silver-fog)]">ไม่พบข้อมูลการตั้งค่า API Key</div>
            )}
          </div>

          {/* Credit & Budget Limit Card */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4 flex items-center justify-between">
              <span>การเงินและเครดิต API (OpenRouter Balance & Limit)</span>
            </h2>

            {loading ? (
              <div className="space-y-4 py-3 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-sm text-[var(--pewter)] uppercase font-semibold block mb-1">ยอดใช้จ่ายไปแล้ว (Usage)</span>
                      <span className="text-3xl font-extrabold text-[var(--carbon-dark)] font-mono">
                        ${data.usage.toFixed(4)}
                      </span>
                      <span className="text-sm text-[var(--pewter)] ml-2">USD</span>
                    </div>
                    
                    {hasLimit ? (
                      <div className="text-right">
                        <span className="text-xs text-[var(--pewter)] uppercase font-semibold block mb-1">วงเงินจำกัด (Limit)</span>
                        <span className="text-lg font-bold text-gray-700 font-mono">
                          ${data.limit?.toFixed(2)} USD
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs text-[var(--pewter)] uppercase font-semibold block mb-1">วงเงินจำกัด (Limit)</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          ไม่จำกัด (No Limit)
                        </span>
                      </div>
                    )}
                  </div>

                  {hasLimit && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-100 rounded-full h-3 border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                            creditUsagePercent > 90
                              ? "from-rose-500 to-red-600"
                              : creditUsagePercent > 75
                              ? "from-amber-400 to-orange-500"
                              : "from-blue-500 to-indigo-500"
                          }`}
                          style={{ width: `${creditUsagePercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--pewter)] font-medium">
                        <span>ใช้ไปแล้ว {creditUsagePercent.toFixed(1)}%</span>
                        {data.limitRemaining !== null && (
                          <span className="text-indigo-600">คงเหลือใช้งานได้: ${data.limitRemaining.toFixed(4)} USD</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[var(--light-ash)] rounded-lg p-4 text-xs text-[var(--pewter)] space-y-2 border border-gray-200/50 leading-relaxed">
                  <p className="font-semibold text-[var(--graphite)]">
                    📌 คำแนะนำในการจัดการวงเงินเครดิต:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>หากคุณใช้โมเดลฟรี (เช่น <code>openrouter/free</code>, <code>llama-3-8b-instruct:free</code>) ยอดเงินที่ใช้จ่ายจะคงอยู่ที่ <strong>$0.0000 USD เสมอ</strong></li>
                    <li>คุณสามารถสร้างคีย์ใหม่และควบคุมวงเงิน (Limit) ได้โดยตรงที่ระบบความปลอดภัยของ OpenRouter เพื่อป้องกันงบบานปลาย</li>
                    <li>เมื่อยอดคงเหลือไม่พอใช้งาน หรือเรียกใช้ API ถี่เกินไป บอทจะแจ้งข้อผิดพลาด <code>429 (Rate Limit)</code></li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

        </div>

        {/* Update Form & Details */}
        <div className="space-y-6">
          
          {/* Form */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs">
            <form onSubmit={handleUpdateKey} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--carbon-dark)]">เปลี่ยน API Key</h2>
                <p className="text-xs text-[var(--pewter)] mt-1 leading-relaxed">
                  นำ API Key ที่สร้างจากบัญชี OpenRouter มาบันทึก ระบบจะเชื่อมต่อเพื่อตรวจสอบความถูกต้องของคีย์ทันทีก่อนการกดยืนยันบันทึก
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--graphite)] uppercase">กรอก OpenRouter API Key ใหม่</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-[var(--cloud-gray)] focus:border-[var(--electric-blue)] rounded-lg text-sm bg-gray-50/50 focus:bg-white transition-all font-mono outline-hidden disabled:opacity-50"
                    disabled={updating || loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-hidden text-sm"
                    title={showKey ? "ซ่อนคีย์" : "แสดงคีย์"}
                  >
                    {showKey ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--pewter)]">
                  รับคีย์ใช้งานฟรีของคุณได้ที่หน้าแดชบอร์ด{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--electric-blue)] hover:underline font-semibold"
                  >
                    OpenRouter.ai Keys
                  </a>
                </p>
              </div>

              <button
                type="submit"
                disabled={!newKey.trim() || updating || loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังเชื่อมต่อตรวจสอบ...
                  </>
                ) : (
                  <>บันทึก API Key ใหม่</>
                )}
              </button>
            </form>
          </div>

          {/* Model info card */}
          <div className="bg-[var(--carbon-dark)] text-white rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-[var(--electric-blue)]">
              ฟีเจอร์เด่นของ OpenRouter
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="space-y-1">
                <p className="font-semibold text-gray-200">🤖 รวมทุกโมเดลในที่เดียว</p>
                <p className="text-gray-400">ไม่ต้องยุ่งยากผูกสัญญาหลายค่าย สามารถเรียกใช้ได้ทั้ง Google Gemini, Meta Llama, DeepSeek, และ Mistral ผ่าน API Key ตัวเดียว</p>
              </div>

              <div className="pt-2 space-y-1 border-t border-gray-800">
                <p className="font-semibold text-gray-200">⚡ ระบบสลับผู้ให้บริการอัตโนมัติ</p>
                <p className="text-gray-400">มีตัวเลือกโมเดลประเภท <code>openrouter/free</code> เพื่อช่วยจัดการหาช่องสัญญาณโมเดลฟรีที่ทำงานได้ดีที่สุด ณ ขณะนั้นแบบทดแทนกันได้</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
