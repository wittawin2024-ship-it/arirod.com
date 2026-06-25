"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Model {
  id: string;
  brand_id: string;
  name: string;
  name_th: string | null;
  years: number[];
  type: string | null;
  active?: boolean;
  brands: {
    name: string;
    active?: boolean;
  } | null;
}

interface Brand {
  id: string;
  name: string;
  active?: boolean;
}

export default function ModelsListPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [userRole, setUserRole] = useState<string>("editor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, brandsRes, modelsRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/admin/brands"),
          fetch("/api/admin/models"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user?.role || "editor");
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        }

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(modelsData.models || []);
        } else {
          throw new Error("ดึงข้อมูลรุ่นรถไม่สำเร็จ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (model: Model) => {
    setSelectedModel(model);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedModel) return;
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/models/${selectedModel.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setModels(models.filter((m) => m.id !== selectedModel.id));
      setIsDeleteOpen(false);
      setSelectedModel(null);
    } catch (err: any) {
      setError(err.message || "ลบรุ่นรถไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (model: Model) => {
    if (model.brands?.active === false) {
      setError(`ไม่สามารถเปิดใช้งานรุ่นรถยนต์ "${model.name}" ได้ เนื่องจากยี่ห้อรถยนต์หลักถูกปิดการแสดงผลอยู่`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setError(""); // Clear any previous errors
    const newActive = model.active === false ? true : false;
    
    // Update local state immediately for snappy UX
    setModels((prev) =>
      prev.map((m) => (m.id === model.id ? { ...m, active: newActive } : m))
    );
    
    try {
      const modelRes = await fetch(`/api/admin/models/${model.id}`);
      if (!modelRes.ok) throw new Error("ไม่สามารถดึงข้อมูลรุ่นรถยนต์ได้");
      const { model: fullModel } = await modelRes.json();

      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: fullModel.brand_id,
          name: fullModel.name,
          name_th: fullModel.name_th,
          years: fullModel.years,
          engine: fullModel.engine,
          transmission: fullModel.transmission,
          type: fullModel.type,
          image: fullModel.image,
          description: fullModel.description,
          specs: fullModel.specs,
          maintenance_tips: fullModel.maintenance_tips,
          seo: fullModel.seo,
          active: newActive,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ไม่สามารถอัปเดตสถานะการแสดงผลได้");
      }
    } catch (err: any) {
      // Rollback state on error
      setModels((prev) =>
        prev.map((m) => (m.id === model.id ? { ...m, active: !newActive } : m))
      );
      setError(err.message || "เกิดข้อผิดพลาดในการตั้งค่าแสดงผล");
    }
  };

  const filteredModels = models.filter((model) => {
    const q = search.toLowerCase();
    const matchesSearch =
      model.id.toLowerCase().includes(q) ||
      model.name.toLowerCase().includes(q) ||
      (model.name_th && model.name_th.toLowerCase().includes(q));

    const matchesBrand =
      !selectedBrandFilter || model.brand_id === selectedBrandFilter;

    const isModelActive = model.active !== false && (!model.brands || model.brands.active !== false);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isModelActive) ||
      (statusFilter === "inactive" && !isModelActive);

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const visibleBrandsForFilter = brands.filter((brand) => {
    const isBrandActive = brand.active !== false;
    if (statusFilter === "active") return isBrandActive;
    if (statusFilter === "inactive") return !isBrandActive;
    return true;
  });

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    if (selectedBrandFilter) {
      const selectedBrand = brands.find((b) => b.id === selectedBrandFilter);
      if (selectedBrand) {
        const isBrandActive = selectedBrand.active !== false;
        if (
          (newStatus === "active" && !isBrandActive) ||
          (newStatus === "inactive" && isBrandActive)
        ) {
          setSelectedBrandFilter("");
        }
      }
    }
  };

  const formatYears = (years: number[]) => {
    if (!years || years.length === 0) return "-";
    if (years.length === 1) return years[0].toString();
    const min = Math.min(...years);
    const max = Math.max(...years);
    return `${min}-${max}`;
  };

  return (
    <div className="space-y-6 font-mitr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            จัดการรุ่นรถยนต์ (Models)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            แก้ไข เพิ่ม ลบ ข้อมูลรุ่นรถยนต์ย่อยและปีรถแยกประเภท
          </p>
        </div>
        <Link
          href="/admin/models/new"
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
          เพิ่มรุ่นรถ
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
          <div className="relative flex-1 max-w-md">
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
              placeholder="ค้นหารุ่นรถยนต์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            />
          </div>

          {/* Visibility filter */}
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            >
              <option value="all">สถานะทั้งหมด (All Status)</option>
              <option value="active">เฉพาะที่แสดงผลอยู่ (Active Only)</option>
              <option value="inactive">เฉพาะที่ปิดการแสดงผล (Inactive Only)</option>
            </select>
          </div>

          {/* Brand select filter */}
          <div className="w-full md:w-64">
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] transition-colors"
            >
              <option value="">ยี่ห้อรถทั้งหมด (All Brands)</option>
              {visibleBrandsForFilter.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.active === false ? " (ปิด)" : ""}
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
                <th className="px-6 py-4">ยี่ห้อ (Brand)</th>
                <th className="px-6 py-4">รหัสรุ่น (ID/Slug)</th>
                <th className="px-6 py-4">ชื่อรุ่น (Name)</th>
                <th className="px-6 py-4">ชื่อไทย</th>
                <th className="px-6 py-4 w-28">ปีที่ผลิต</th>
                <th className="px-6 py-4 w-28">ประเภทรถ</th>
                <th className="px-6 py-4 w-32">แสดงผล</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cloud-gray)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20" />
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
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-12" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const isModelActive = model.active !== false && (!model.brands || model.brands.active !== false);
                  return (
                    <tr 
                      key={model.id} 
                      className={`hover:bg-gray-50/50 transition-all duration-150 ${
                        !isModelActive ? "opacity-50 bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[var(--carbon-dark)] uppercase">
                        <div>{model.brands?.name || model.brand_id}</div>
                        {model.brands?.active === false && (
                          <span className="text-[10px] text-red-500 font-medium block mt-0.5 whitespace-nowrap">
                            (ยี่ห้อรถถูกปิดแสดงผล)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-[var(--pewter)] text-xs">
                        {model.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--graphite)]">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 text-[var(--graphite)]">
                        {model.name_th || "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--carbon-dark)] font-sans">
                        {formatYears(model.years)}
                      </td>
                      <td className="px-6 py-4 text-[var(--pewter)]">
                        {model.type || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(model)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isModelActive ? "bg-[var(--electric-blue)]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isModelActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-xs text-[var(--pewter)] font-medium">
                            {isModelActive ? "เปิด" : "ปิด"}
                          </span>
                        </div>
                      </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/models/${model.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] bg-white text-xs font-semibold rounded text-[var(--graphite)] hover:text-[var(--electric-blue)] focus:outline-none transition-colors"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(model)}
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
                );
              })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[var(--silver-fog)]"
                  >
                    ไม่พบข้อมูลรุ่นรถยนต์ที่ค้นหา
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
          setSelectedModel(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบรุ่นรถยนต์"
        message={`คุณต้องการลบข้อมูลรุ่น "${selectedModel?.name}" หรือไม่? การดำเนินการนี้จะลบข้อมูลอะไหล่รถยนต์ทั้งหมดที่เชื่อมโยงกับรุ่นนี้โดยถาวรและไม่สามารถกู้คืนได้`}
        confirmLabel="ลบข้อมูลรุ่นรถ"
      />
    </div>
  );
}
