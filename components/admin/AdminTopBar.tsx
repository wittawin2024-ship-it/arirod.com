"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface AdminTopBarProps {
  userEmail?: string;
}

export default function AdminTopBar({ userEmail }: AdminTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Generate breadcrumb links from the pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    if (segment === "admin") label = "หน้าแรก";
    else if (segment === "dashboard") label = "แดชบอร์ด";
    else if (segment === "brands") label = "ยี่ห้อรถ";
    else if (segment === "models") label = "รุ่นรถ";
    else if (segment === "parts") label = "อะไหล่";
    else if (segment === "blog") label = "บทความ";
    else if (segment === "users") label = "ผู้ใช้งาน";
    else if (segment === "new") label = "เพิ่มใหม่";
    else if (segment === "edit") label = "แก้ไข";

    return { label, href, isLast: index === pathSegments.length - 1 };
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
        router.push("/admin/login");
      } else {
        alert("ออกจากระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--cloud-gray)] flex items-center justify-between px-8 sticky top-0 z-20 shadow-xs">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[var(--pewter)] font-medium">
        <Link
          href="/admin/dashboard"
          className="hover:text-[var(--electric-blue)] transition-colors"
        >
          ระบบหลังบ้าน
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            {crumb.isLast ? (
              <span className="text-[var(--carbon-dark)] font-semibold">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-[var(--electric-blue)] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Logout & Profile */}
      <div className="flex items-center gap-4">
        {userEmail && (
          <span
            className="text-xs text-[var(--pewter)] bg-[var(--light-ash)] px-3 py-1 rounded-md font-mono max-w-[180px] truncate"
            title={userEmail}
          >
            {userEmail}
          </span>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span>กำลังออก...</span>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              ออกจากระบบ
            </>
          )}
        </button>
      </div>
    </header>
  );
}
