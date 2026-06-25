"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Part {
  id: string;
  model_id: string;
  name_th: string;
  name_en: string;
  brand: string;
  category: string;
  price_min: number | null;
  price_max: number | null;
  image: string | null;
  active?: boolean;
  models: {
    name: string;
    brand_id: string;
  } | null;
}

interface Brand {
  id: string;
  name: string;
}

export default function PartsListPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [userRole, setUserRole] = useState<string>("editor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, brandsRes, partsRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/admin/brands"),
          fetch("/api/admin/parts"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user?.role || "editor");
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        }

        if (partsRes.ok) {
          const partsData = await partsRes.json();
          setParts(partsData.parts || []);
        } else {
          throw new Error("ดึงข้อมูลอะไหล่ไม่สำเร็จ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (part: Part) => {
    setSelectedPart(part);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPart) return;
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/parts/${selectedPart.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setParts(parts.filter((p) => p.id !== selectedPart.id));
      setIsDeleteOpen(false);
      setSelectedPart(null);
    } catch (err: any) {
      setError(err.message || "ลบอะไหล่ไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (part: Part) => {
    const newActive = part.active === false ? true : false;
    
    // Update local state immediately for snappy UX
    setParts((prev) =>
      prev.map((p) => (p.id === part.id ? { ...p, active: newActive } : p))
    );
    
    try {
      const partRes = await fetch(`/api/admin/parts/${part.id}`);
      if (!partRes.ok) throw new Error("ไม่สามารถดึงข้อมูลอะไหล่ได้");
      const { part: fullPart } = await partRes.json();

      const res = await fetch(`/api/admin/parts/${part.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: fullPart.model_id,
          name_th: fullPart.name_th,
          name_en: fullPart.name_en,
          brand: fullPart.brand,
          aftermarket_brand: fullPart.aftermarket_brand,
          part_number: fullPart.part_number,
          category: fullPart.category,
          subcategory: fullPart.subcategory,
          description: fullPart.description,
          price_min: fullPart.price_min,
          price_max: fullPart.price_max,
          image: fullPart.image,
          change_interval: fullPart.change_interval,
          difficulty: fullPart.difficulty,
          affiliate_links: fullPart.affiliate_links,
          related_article: fullPart.related_article,
          tags: fullPart.tags,
          active: newActive,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ไม่สามารถอัปเดตสถานะการแสดงผลได้");
      }
    } catch (err: any) {
      // Rollback state on error
      setParts((prev) =>
        prev.map((p) => (p.id === part.id ? { ...p, active: !newActive } : p))
      );
      setError(err.message || "เกิดข้อผิดพลาดในการตั้งค่าแสดงผล");
    }
  };

  const categories = [
    { value: "engine", label: "น้ำมันเครื่องและเคมีภัณฑ์" },
    { value: "brakes", label: "ระบบเบรค" },
    { value: "suspension", label: "ระบบช่วงล่างและบังคับเลี้ยว" },
    { value: "filters", label: "กรองต่างๆ (อากาศ, แอร์, น้ำมันเครื่อง)" },
    { value: "electrical", label: "ระบบไฟและเซนเซอร์" },
    { value: "cooling", label: "ระบบระบายความร้อน" },
    { value: "transmission", label: "ระบบส่งกำลังและครัช" },
  ];

  const filteredParts = parts.filter((part) => {
    const q = search.toLowerCase();
    const matchesSearch =
      part.id.toLowerCase().includes(q) ||
      part.name_th.toLowerCase().includes(q) ||
      part.name_en.toLowerCase().includes(q) ||
      part.brand.toLowerCase().includes(q) ||
      (part.models?.name && part.models.name.toLowerCase().includes(q));

    const matchesBrand =
      !selectedBrandFilter || part.models?.brand_id === selectedBrandFilter;

    const matchesCategory =
      !selectedCategoryFilter || part.category === selectedCategoryFilter;

    return matchesSearch && matchesBrand && matchesCategory;
  });

  const formatPrice = (min: number | null, max: number | null) => {
    if (min === null && max === null) return "-";
    if (min !== null && max === null) return `฿${min.toLocaleString()}+`;
    if (min === null && max !== null) return `฿${max.toLocaleString()}`;
    if (min === max) return `฿${min?.toLocaleString()}`;
    return `฿${min?.toLocaleString()} - ฿${max?.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 font-mitr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการอะไหล่รถยนต์ (Parts)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            แก้ไข เพิ่ม ลบ ข้อมูลแคตตาล็อกอะไหล่ พันธมิตรช้อปปิ้งออนไลน์
          </p>
        </div>
        <Link
          href="/admin/parts/new"
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
          เพิ่มอะไหล่
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="bg-white rounded-lg border border-[var(--cloud-gray)] shadow-xs overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-[var(--cloud-gray)] bg-gray-50/50 flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
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
              placeholder="ค้นหาตามรหัสอะไหล่ ชื่อยี่ห้ออะไหล่ ชื่อรุ่นรถ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            />
          </div>

          {/* Brand select filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            >
              <option value="">ยี่ห้อรถทั้งหมด</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Category select filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            >
              <option value="">หมวดหมู่อะไหล่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 w-16">รูป</th>
                <th className="px-6 py-4">รหัสอะไหล่</th>
                <th className="px-6 py-4">รุ่นรถ</th>
                <th className="px-6 py-4">ชื่อไทย / ชื่ออังกฤษ</th>
                <th className="px-6 py-4">ยี่ห้ออะไหล่</th>
                <th className="px-6 py-4 w-32">ช่วงราคา (บาท)</th>
                <th className="px-6 py-4 w-32">แสดงผล</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cloud-gray)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-12" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      {part.image ? (
                        <div className="w-8 h-8 border border-[var(--cloud-gray)] rounded flex items-center justify-center p-0.5 bg-white">
                          <img
                            src={part.image}
                            alt={part.name_th}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[var(--light-ash)] text-[var(--silver-fog)] rounded flex items-center justify-center text-[10px] font-bold border border-[var(--cloud-gray)]">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[var(--pewter)] text-xs">
                      {part.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--carbon-dark)] text-xs">
                      <span className="uppercase text-[var(--pewter)] mr-1">
                        {part.models?.brand_id}
                      </span>
                      <span className="text-gray-700">{part.models?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--graphite)]">
                        {part.name_th}
                      </div>
                      <div className="text-xs text-[var(--silver-fog)]">
                        {part.name_en}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--graphite)]">
                        {part.brand}
                      </div>
                      {part.category && (
                        <span className="inline-flex mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {categories.find((c) => c.value === part.category)?.label ||
                            part.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--carbon-dark)] font-sans">
                      {formatPrice(part.price_min, part.price_max)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(part)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            part.active !== false ? "bg-[var(--electric-blue)]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              part.active !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs text-[var(--pewter)] font-medium">
                          {part.active !== false ? "เปิด" : "ปิด"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/parts/${part.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] bg-white text-xs font-semibold rounded text-[var(--graphite)] hover:text-[var(--electric-blue)] focus:outline-none transition-colors"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(part)}
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
                    colSpan={7}
                    className="px-6 py-12 text-center text-[var(--silver-fog)]"
                  >
                    ไม่พบข้อมูลรายการอะไหล่ตามเงื่อนไขที่เลือก
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
          setSelectedPart(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบอะไหล่รถยนต์"
        message={`คุณต้องการลบข้อมูลอะไหล่ "${selectedPart?.name_th}" ออกจากระบบแคตตาล็อกหรือไม่? การลบข้อมูลนี้จะไม่มีการเชื่อมโยงการแสดงผลแนะนำสินค้าในหน้ารายละเอียดรุ่นรถยนต์`}
        confirmLabel="ลบข้อมูลอะไหล่"
      />
    </div>
  );
}
