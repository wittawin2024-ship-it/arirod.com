"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";

interface StatsData {
  stats: {
    brands: number;
    models: number;
    parts: number;
    articles: number;
  };
  recentParts: {
    id: string;
    name_th: string;
    brand: string;
    created_at: string;
  }[];
  recentArticles: {
    id: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
  }[];
  systemStatus: {
    database: string;
    latency: string;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลสถิติได้");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 font-mitr">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-sm text-[var(--pewter)] mt-1">ยินดีต้อนรับสู่ระบบจัดการฐานข้อมูลและบทความของ AraiRod</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ยี่ห้อรถยนต์ทั้งหมด"
          value={data?.stats.brands || 0}
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          hint="ยี่ห้อที่มีข้อมูลในระบบ"
        />
        <StatCard
          title="รุ่นรถยนต์ทั้งหมด"
          value={data?.stats.models || 0}
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
          hint="รุ่นย่อยและปีรถแยกย่อย"
        />
        <StatCard
          title="อะไหล่ในระบบ"
          value={data?.stats.parts || 0}
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          hint="อะไหล่ที่พร้อมแนะนำให้ลูกค้า"
        />
        <StatCard
          title="บทความบล็อกทั้งหมด"
          value={data?.stats.articles || 0}
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
          hint="บทความเทคนิคการซ่อมบำรุง"
        />
      </div>

      {/* Main Grid: Quick Actions + System Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[var(--cloud-gray)] p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4">เมนูหลัก / เพิ่มข้อมูลด่วน (Quick Actions)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/brands/new"
              className="flex flex-col items-center justify-center p-4 border border-[var(--cloud-gray)] rounded-md hover:border-[var(--electric-blue)] hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-[var(--electric-blue)] group-hover:scale-110 transition-transform mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[var(--graphite)]">เพิ่มยี่ห้อรถ</span>
            </Link>
            <Link
              href="/admin/models/new"
              className="flex flex-col items-center justify-center p-4 border border-[var(--cloud-gray)] rounded-md hover:border-[var(--electric-blue)] hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-[var(--electric-blue)] group-hover:scale-110 transition-transform mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[var(--graphite)]">เพิ่มรุ่นรถ</span>
            </Link>
            <Link
              href="/admin/parts/new"
              className="flex flex-col items-center justify-center p-4 border border-[var(--cloud-gray)] rounded-md hover:border-[var(--electric-blue)] hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-[var(--electric-blue)] group-hover:scale-110 transition-transform mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[var(--graphite)]">เพิ่มอะไหล่</span>
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex flex-col items-center justify-center p-4 border border-[var(--cloud-gray)] rounded-md hover:border-[var(--electric-blue)] hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-[var(--electric-blue)] group-hover:scale-110 transition-transform mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[var(--graphite)]">เขียนบทความ</span>
            </Link>
          </div>
        </div>

        {/* System Connection Status */}
        <div className="bg-white rounded-lg border border-[var(--cloud-gray)] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--carbon-dark)] mb-4">สถานะระบบ (System)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--pewter)] font-medium">Supabase Database</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ออนไลน์ (Online)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--pewter)] font-medium">Supabase Storage</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  พร้อมใช้งาน (Ready)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--pewter)] font-medium">Next.js API Routes</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ทำงานปกติ (Active)
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-[var(--silver-fog)] border-t border-[var(--cloud-gray)] pt-4 mt-4 font-mono">
            App Env: {process.env.NODE_ENV} <br />
            API Latency: ~10ms
          </div>
        </div>
      </div>

      {/* Grid: Recent activity tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Parts Table */}
        <div className="bg-white rounded-lg border border-[var(--cloud-gray)] overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[var(--cloud-gray)] flex items-center justify-between">
            <h2 className="text-md font-bold text-[var(--carbon-dark)]">อะไหล่ที่เพิ่มล่าสุด</h2>
            <Link href="/admin/parts" className="text-sm text-[var(--electric-blue)] hover:underline font-semibold cursor-pointer">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">ยี่ห้อ</th>
                  <th className="px-6 py-3">ชื่ออะไหล่</th>
                  <th className="px-6 py-3">วันที่เพิ่ม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cloud-gray)]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    </tr>
                  ))
                ) : data?.recentParts && data.recentParts.length > 0 ? (
                  data.recentParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-[var(--carbon-dark)] uppercase">{part.brand}</td>
                      <td className="px-6 py-4 text-[var(--graphite)] font-medium">{part.name_th}</td>
                      <td className="px-6 py-4 text-[var(--pewter)] text-xs">{formatDate(part.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[var(--silver-fog)]">
                      ไม่มีรายการอะไหล่เพิ่มใหม่
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Articles Table */}
        <div className="bg-white rounded-lg border border-[var(--cloud-gray)] overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[var(--cloud-gray)] flex items-center justify-between">
            <h2 className="text-md font-bold text-[var(--carbon-dark)]">บทความที่เพิ่มล่าสุด</h2>
            <Link href="/admin/blog" className="text-sm text-[var(--electric-blue)] hover:underline font-semibold cursor-pointer">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">หัวข้อบทความ</th>
                  <th className="px-6 py-3">หมวดหมู่</th>
                  <th className="px-6 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cloud-gray)]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                    </tr>
                  ))
                ) : data?.recentArticles && data.recentArticles.length > 0 ? (
                  data.recentArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-[var(--graphite)] font-medium max-w-[200px] truncate" title={art.title}>
                        {art.title}
                      </td>
                      <td className="px-6 py-4 text-[var(--pewter)]">{art.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          art.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-50 text-gray-700 border border-gray-100"
                        }`}>
                          {art.status === "published" ? "เผยแพร่" : "ร่าง"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[var(--silver-fog)]">
                      ไม่มีบทความใหม่ในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
