"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  status: string;
  read_time: number;
}

export default function BlogListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [userRole, setUserRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, blogRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/admin/blog"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user?.role || "editor");
        }

        if (blogRes.ok) {
          const data = await blogRes.json();
          setArticles(data.articles || []);
        } else {
          throw new Error("ดึงข้อมูลบทความไม่สำเร็จ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArticle) return;
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/blog/${selectedArticle.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setArticles(articles.filter((a) => a.id !== selectedArticle.id));
      setIsDeleteOpen(false);
      setSelectedArticle(null);
    } catch (err: any) {
      setError(err.message || "ลบบทความไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredArticles = articles.filter((art) => {
    const q = search.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.slug.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 font-mitr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการบทความบล็อก (Articles)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            เขียนเนื้อหาบทความ ให้คำแนะนำการซ่อมรถ และจัดการเผยแพร่บล็อก
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue-hover)] text-white text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          เขียนบทความใหม่
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="bg-white rounded-lg border border-[var(--cloud-gray)] shadow-xs overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-[var(--cloud-gray)] bg-gray-50/50">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--silver-fog)]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อบทความ สลักไอดี (Slug) หมวดหมู่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">หัวข้อบทความ (Title)</th>
                <th className="px-6 py-4 w-40">หมวดหมู่</th>
                <th className="px-6 py-4 w-28">เวลาอ่าน</th>
                <th className="px-6 py-4 w-32">วันที่เผยแพร่</th>
                <th className="px-6 py-4 w-28">สถานะ</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cloud-gray)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-64" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--carbon-dark)] max-w-sm truncate" title={art.title}>
                        {art.title}
                      </div>
                      <div className="text-xs text-[var(--silver-fog)] font-mono truncate max-w-sm">
                        /blog/{art.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--graphite)] font-medium">
                      {art.category}
                    </td>
                    <td className="px-6 py-4 text-[var(--pewter)] font-sans font-medium">
                      {art.read_time} นาที
                    </td>
                    <td className="px-6 py-4 text-[var(--pewter)] text-xs">
                      {formatDate(art.date)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={art.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/blog/${art.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] bg-white text-xs font-semibold rounded text-[var(--graphite)] hover:text-[var(--electric-blue)] focus:outline-none transition-colors"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(art)}
                        disabled={userRole === "editor"}
                        className={`inline-flex items-center px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-transparent text-xs font-semibold rounded focus:outline-none transition-all cursor-pointer ${
                          userRole === "editor"
                            ? "opacity-40 cursor-not-allowed hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                            : ""
                        }`}
                        title={
                          userRole === "editor"
                            ? "สิทธิ์ของบรรณาธิการไม่สามารถลบข้อมูลได้"
                            : "ลบข้อมูล"
                        }
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[var(--silver-fog)]"
                  >
                    ไม่พบข้อมูลบทความตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        isLoading={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedArticle(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบบทความบล็อก"
        message={`คุณต้องการลบบทความเรื่อง "${selectedArticle?.title}" หรือไม่? การลบข้อมูลนี้จะนำบทความออกจากหน้าบล็อกสาธารณะทันทีและไม่สามารถกู้คืนได้`}
        confirmLabel="ลบบทความ"
      />
    </div>
  );
}
