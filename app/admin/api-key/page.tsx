"use client";

import React, { useState, useEffect } from "react";

interface KeyConfigData {
  hasKey: boolean;
  maskedKey: string;
  status: "valid" | "exhausted" | "invalid" | "error";
  errorDetails: string | null;
  latencyMs: number | null;
  usage: {
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
      const res = await fetch("/api/admin/gemini-key");
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
      const res = await fetch("/api/admin/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newKey.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึก API Key");
      }

      setSuccess("บันทึกและเชื่อมต่อ Gemini API Key ใหม่สำเร็จแล้ว!");
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
            โควตาเต็มชั่วคราว (Quota Exhausted)
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

  // Limit constants for Gemini Free Tier
  const DAILY_LIMIT = 1500;
  const currentCount = data?.usage?.requestCount || 0;
  const usagePercentage = Math.min((currentCount / DAILY_LIMIT) * 100, 100);

  return (
    <div className="space-y-8 font-mitr max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการ API Key & ปริมาณ Quota (Gemini API Settings)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ตรวจสอบสถานะความเชื่อมต่อของ Gemini API บันทึกคีย์การตอบกลับของแชทบอทไอ้เหล็ก และติดตามโควตาการใช้งาน
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
              กำลังทดสอบ...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              ทดสอบการเชื่อมต่อใหม่
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

      {/* Main Grid: Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* API Status Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Status Detail Card */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4 flex items-center gap-2">
              <span>สถานะคีย์ที่ใช้งานอยู่ (Active API Key)</span>
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
                    <label className="text-xs text-[var(--pewter)] uppercase font-semibold">Gemini API Key (Masked)</label>
                    <div className="mt-1 font-mono font-bold text-gray-700 text-lg bg-[var(--light-ash)] px-3 py-1.5 rounded-lg border border-gray-200/50 break-all select-all">
                      {data.hasKey ? data.maskedKey : "ไม่ได้ตั้งค่า API Key"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--pewter)] uppercase font-semibold block">สถานะการเชื่อมต่อ</label>
                    <div className="mt-2.5">
                      {getStatusBadge(data.status)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--cloud-gray)] pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.latencyMs !== null && (
                    <div>
                      <span className="text-sm text-[var(--pewter)] font-medium">ความเร็วตอบสนอง (API Latency):</span>
                      <span className="ml-2 font-mono font-semibold text-[var(--graphite)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {data.latencyMs} ms
                      </span>
                    </div>
                  )}
                  {data.status !== "valid" && data.errorDetails && (
                    <div className="col-span-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                      <span className="font-bold block mb-1">สาเหตุความล้มเหลว:</span>
                      {data.errorDetails}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[var(--silver-fog)]">ไม่พบข้อมูลการตั้งค่า API Key</div>
            )}
          </div>

          {/* Quota Progress Card */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4 flex items-center justify-between">
              <span>ปริมาณโควตาที่ใช้งานในวันนี้ (Today's Quota Consumption)</span>
              {data && (
                <span className="text-xs text-[var(--pewter)] font-normal font-mono bg-gray-50 px-2 py-0.5 rounded border">
                  วันที่: {data.usage.date}
                </span>
              )}
            </h2>

            {loading ? (
              <div className="space-y-4 py-3 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-3xl font-extrabold text-[var(--carbon-dark)] font-mono">
                        {currentCount.toLocaleString()}
                      </span>
                      <span className="text-sm text-[var(--pewter)] ml-2">/ {DAILY_LIMIT.toLocaleString()} คำขอ (Requests)</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-[var(--electric-blue)]">
                      {usagePercentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                        usagePercentage > 90
                          ? "from-rose-500 to-red-600"
                          : usagePercentage > 75
                          ? "from-amber-400 to-orange-500"
                          : "from-blue-500 to-[var(--electric-blue)]"
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[var(--light-ash)] rounded-lg p-4 text-xs text-[var(--pewter)] space-y-2 border border-gray-200/50 leading-relaxed">
                  <p className="font-semibold text-[var(--graphite)]">
                    📌 ข้อมูลเกี่ยวกับโควตาสำหรับ Gemini Free Tier (คำขอเริ่มต้น):
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>จำกัดสูงสุด <strong>1,500 คำขอต่อวัน (Requests Per Day - RPD)</strong></li>
                    <li>จำกัดความถี่สูงสุด <strong>15 คำขอต่อนาที (Requests Per Minute - RPM)</strong></li>
                    <li>หากใช้งานเกินขีดจำกัด บอทจะพบข้อผิดพลาด <code>RESOURCE_EXHAUSTED (429)</code> ชั่วคราว และจะรีเซ็ตอัตโนมัติเมื่อพ้นรอบเวลานาทีถัดไปหรือวันใหม่</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

        </div>

        {/* Update Key Section */}
        <div className="space-y-6">
          
          {/* Update Key Form Card */}
          <div className="bg-white rounded-xl border border-[var(--cloud-gray)] p-6 shadow-xs flex flex-col justify-between">
            <form onSubmit={handleUpdateKey} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--carbon-dark)]">เปลี่ยน API Key ใหม่</h2>
                <p className="text-xs text-[var(--pewter)] mt-1 leading-relaxed">
                  เมื่อคุณใส่ API Key ใหม่ ระบบจะทำการตรวจสอบความถูกต้องโดยเชื่อมต่อกับเซิร์ฟเวอร์ Google เสมอก่อนที่จะบันทึกคีย์
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--graphite)] uppercase">กรอก Gemini API Key ใหม่</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="AQ.Ab8RN6L1ZI..."
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
                  ต้องการรับ API Key ใหม่ฟรี? ไปที่{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--electric-blue)] hover:underline font-semibold"
                  >
                    Google AI Studio
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
                    กำลังบันทึกและตรวจสอบ...
                  </>
                ) : (
                  <>บันทึก API Key ใหม่</>
                )}
              </button>
            </form>
          </div>

          {/* Quota Comparison Card */}
          <div className="bg-[var(--carbon-dark)] text-white rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-[var(--electric-blue)]">
              เปรียบเทียบโควตาสิทธิประโยชน์
            </h3>
            
            <div className="space-y-4 divide-y divide-gray-800 text-xs">
              <div className="pt-2 first:pt-0 space-y-1">
                <p className="font-semibold text-gray-200">Gemini 2.0 Flash (Free Tier)</p>
                <div className="flex justify-between text-gray-400">
                  <span>คำขอสูงสุดต่อนาที (RPM):</span>
                  <span className="font-mono text-white">15 RPM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>คำขอสูงสุดต่อวัน (RPD):</span>
                  <span className="font-mono text-white">1,500 RPD</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ความเร็ว Tokens (TPM):</span>
                  <span className="font-mono text-white">1M TPM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>อัตราค่าบริการ:</span>
                  <span className="text-emerald-400 font-semibold">ฟรีไม่มีค่าใช้จ่าย</span>
                </div>
              </div>

              <div className="pt-4 space-y-1">
                <p className="font-semibold text-gray-200">Gemini 2.0 Flash (Pay-as-you-go)</p>
                <div className="flex justify-between text-gray-400">
                  <span>คำขอสูงสุดต่อนาที (RPM):</span>
                  <span className="font-mono text-white">1,000 RPM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>คำขอสูงสุดต่อวัน (RPD):</span>
                  <span className="font-mono text-white">ไม่จำกัด</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ความเร็ว Tokens (TPM):</span>
                  <span className="font-mono text-white">4M TPM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>อัตราค่าบริการ:</span>
                  <span className="text-blue-400 font-semibold">จ่ายตามการใช้จริง</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
