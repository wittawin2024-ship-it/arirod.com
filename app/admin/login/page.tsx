"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isSignUp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการทำรายการ");
      }

      if (data.requiresVerification) {
        setMessage(data.message);
      } else {
        router.refresh();
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const callbackUrl = new URL("/admin/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", redirectPath);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "ไม่สามารถเชื่อมต่อกับ Google ได้");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-[var(--cloud-gray)] p-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--carbon-dark)] tracking-wider">
          AraiRod <span className="text-[var(--electric-blue)]">Admin</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--pewter)]">
          {isSignUp
            ? "สร้างบัญชีใหม่เพื่อเข้าจัดการระบบ"
            : "เข้าสู่ระบบจัดการสำหรับทีมผู้ดูแลและบรรณาธิการ"}
        </p>
      </div>

      {/* Message / Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          <p className="font-medium">ข้อผิดพลาด</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-700 text-sm">
          <p className="font-medium">แจ้งเตือน</p>
          <p className="mt-1">{message}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--pewter)] mb-1.5"
          >
            อีเมล (Email)
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="admin@arairod.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] focus:ring-1 focus:ring-[var(--electric-blue)] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--pewter)] mb-1.5"
          >
            รหัสผ่าน (Password)
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] focus:ring-1 focus:ring-[var(--electric-blue)] transition-colors"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue-hover)] text-white text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                กำลังประมวลผล...
              </>
            ) : isSignUp ? (
              "ลงทะเบียน (Sign Up)"
            ) : (
              "เข้าสู่ระบบ (Sign In)"
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center justify-between">
        <span className="w-1/5 border-b border-[var(--cloud-gray)]"></span>
        <span className="text-xs text-[var(--silver-fog)] uppercase font-semibold">
          หรือล็อกอินด้วย
        </span>
        <span className="w-1/5 border-b border-[var(--cloud-gray)]"></span>
      </div>

      {/* Google Login */}
      <div>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="w-full py-2.5 px-4 bg-white hover:bg-[var(--light-ash)] border border-[var(--cloud-gray)] text-[var(--graphite)] text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h3.93c2.3-2.12 3.62-5.24 3.62-8.75z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.93-3.13c-1.1.74-2.5 1.18-4.03 1.18-3.1 0-5.73-2.1-6.67-4.93H1.36v3.23A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.33 14.31A7.17 7.17 0 0 1 5 12c0-.8.14-1.59.39-2.31V6.46H1.36A11.95 11.95 0 0 0 0 12c0 1.98.49 3.86 1.36 5.54l3.97-3.23z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 6.64 0 2 4.64 2 10a12 12 0 0 0 1.36 5.54l3.97-3.23c-.94-2.83 1.69-4.93 4.77-4.93z"
            />
          </svg>
          Google Account
        </button>
      </div>

      {/* Switch Signin / Signup */}
      <div className="mt-6 text-center text-sm text-[var(--pewter)]">
        {isSignUp ? (
          <p>
            มีบัญชีผู้ใช้อยู่แล้ว?{" "}
            <button
              onClick={() => setIsSignUp(false)}
              className="text-[var(--electric-blue)] font-semibold hover:underline cursor-pointer"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        ) : (
          <p>
            ต้องการสร้างบัญชีผู้จัดการใหม่?{" "}
            <button
              onClick={() => setIsSignUp(true)}
              className="text-[var(--electric-blue)] font-semibold hover:underline cursor-pointer"
            >
              ลงทะเบียนที่นี่
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--light-ash)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-mitr">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-[var(--cloud-gray)] p-8 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-[var(--electric-blue)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
