"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Brand {
  id: string;
  name: string;
  name_th: string | null;
  logo: string | null;
  color: string | null;
  description: string | null;
  active?: boolean;
}

export default function BrandsListPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [userRole, setUserRole] = useState<string>("editor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, brandsRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/admin/brands"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user?.role || "editor");
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        } else {
          throw new Error("ไม่สามารถโหลดข้อมูลยี่ห้อรถได้");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return;
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/brands/${selectedBrand.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setBrands(brands.filter((b) => b.id !== selectedBrand.id));
      setIsDeleteOpen(false);
      setSelectedBrand(null);
    } catch (err: any) {
      setError(err.message || "ลบยี่ห้อรถไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    const newActive = brand.active === false ? true : false;
    
    // Update local state immediately for snappy UX
    setBrands((prev) =>
      prev.map((b) => (b.id === brand.id ? { ...b, active: newActive } : b))
    );
    
    try {
      const res = await fetch(`/api/admin/brands/${brand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brand.name,
          name_th: brand.name_th,
          logo: brand.logo,
          color: brand.color,
          description: brand.description,
          active: newActive,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ไม่สามารถอัปเดตสถานะการแสดงผลได้");
      }
    } catch (err: any) {
      // Rollback state on error
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, active: !newActive } : b))
      );
      setError(err.message || "เกิดข้อผิดพลาดในการตั้งค่าแสดงผล");
    }
  };

  const filteredBrands = brands.filter((brand) => {
    const q = search.toLowerCase();
    const matchesSearch =
      brand.id.toLowerCase().includes(q) ||
      brand.name.toLowerCase().includes(q) ||
      (brand.name_th && brand.name_th.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && brand.active !== false) ||
      (statusFilter === "inactive" && brand.active === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mitr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการยี่ห้อรถยนต์ (Brands)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            แก้ไข เพิ่ม ลบ ข้อมูลผู้ผลิตและโลโก้ยี่ห้อรถยนต์
          </p>
        </div>
        <Link
          href="/admin/brands/new"
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
          เพิ่มยี่ห้อรถ
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search and Table Card */}
      <div className="bg-white rounded-lg border border-[var(--cloud-gray)] shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--cloud-gray)] bg-gray-50/50 flex flex-col md:flex-row gap-4">
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
              placeholder="ค้นหายี่ห้อรถยนต์ (เช่น Toyota, โตโยต้า)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            >
              <option value="all">ยี่ห้อรถทั้งหมด (All Brands)</option>
              <option value="active">เฉพาะที่แสดงผลอยู่ (Active Only)</option>
              <option value="inactive">เฉพาะที่ปิดการแสดงผล (Inactive Only)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 w-20">โลโก้</th>
                <th className="px-6 py-4 w-40">รหัสยี่ห้อ (ID/Slug)</th>
                <th className="px-6 py-4">ชื่ออังกฤษ (Name)</th>
                <th className="px-6 py-4">ชื่อไทย (Thai Name)</th>
                <th className="px-6 py-4 w-32">แสดงผล</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cloud-gray)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-12" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <tr 
                    key={brand.id} 
                    className={`hover:bg-gray-50/50 transition-all duration-150 ${
                      brand.active === false ? "opacity-50 bg-gray-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      {brand.logo ? (
                        <div className="w-10 h-10 border border-[var(--cloud-gray)] rounded-md flex items-center justify-center p-1 bg-white">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[var(--light-ash)] text-[var(--silver-fog)] rounded-md flex items-center justify-center text-xs font-semibold uppercase border border-[var(--cloud-gray)]">
                          {brand.name.substring(0, 2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[var(--pewter)]">
                      {brand.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--carbon-dark)]">
                      {brand.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--graphite)]">
                      {brand.name_th || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(brand)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            brand.active !== false ? "bg-[var(--electric-blue)]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              brand.active !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs text-[var(--pewter)] font-medium">
                          {brand.active !== false ? "เปิด" : "ปิด"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/brands/${brand.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] bg-white text-xs font-semibold rounded text-[var(--graphite)] hover:text-[var(--electric-blue)] focus:outline-none transition-colors"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(brand)}
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
                    ไม่พบข้อมูลยี่ห้อรถยนต์ตามเงื่อนไขที่ค้นหา
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
          setSelectedBrand(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบยี่ห้อรถยนต์"
        message={`คุณต้องการลบข้อมูลยี่ห้อ "${selectedBrand?.name}" หรือไม่? การดำเนินการนี้จะลบข้อมูลรุ่นรถและอะไหล่ทั้งหมดที่เชื่อมโยงกับยี่ห้อนี้โดยถาวรและไม่สามารถกู้คืนได้`}
        confirmLabel="ลบข้อมูลยี่ห้อ"
      />
    </div>
  );
}
