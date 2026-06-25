"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    name_th: "",
    logo: "",
    color: "",
    description: "",
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await fetch(`/api/admin/brands/${brandId}`);
        if (!res.ok) {
          throw new Error("ดึงข้อมูลยี่ห้อรถยนต์ไม่สำเร็จ");
        }
        const data = await res.json();
        const b = data.brand;
        setFormData({
          name: b.name || "",
          name_th: b.name_th || "",
          logo: b.logo || "",
          color: b.color || "",
          description: b.description || "",
          active: b.active !== false,
        });
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    if (brandId) {
      loadBrand();
    }
  }, [brandId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/brands/${brandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "แก้ไขข้อมูลไม่สำเร็จ");

      router.push("/admin/brands");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-mitr">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[var(--electric-blue)]"
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
          <span className="text-sm text-[var(--pewter)]">กำลังโหลดข้อมูลยี่ห้อรถยนต์...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mitr max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brands"
          className="p-2 border border-[var(--cloud-gray)] hover:border-gray-400 bg-white rounded-md transition-colors"
        >
          <svg
            className="w-5 h-5 text-[var(--graphite)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            แก้ไขข้อมูลยี่ห้อรถยนต์ (Edit Brand: {brandId})
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ปรับเปลี่ยนข้อมูลผู้ผลิต รายละเอียดสี และโลโก้
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-[var(--cloud-gray)] shadow-xs p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--silver-fog)] mb-1.5">
              รหัสยี่ห้อ (ID/Slug) - ห้ามแก้ไข
            </label>
            <input
              type="text"
              value={brandId}
              disabled
              className="w-full px-4 py-2.5 bg-[var(--light-ash)] border border-[var(--cloud-gray)] rounded-md text-[var(--silver-fog)] text-sm cursor-not-allowed"
            />
          </div>

          <FormField
            label="ชื่อยี่ห้อภาษาอังกฤษ (Name)"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Toyota, Honda"
          />

          <FormField
            label="ชื่อยี่ห้อภาษาไทย (Thai Name)"
            id="name_th"
            name="name_th"
            value={formData.name_th}
            onChange={handleChange}
            placeholder="e.g. โตโยต้า, ฮอนด้า"
          />

          <FormField
            label="โทนสีแบรนด์ (Color Hex)"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g. #EB0A1E"
            hint="ใช้รหัสสีฐานสิบหก (Hex Color) เช่น #EB0A1E"
          />
        </div>

        <ImageUpload
          label="โลโก้ยี่ห้อรถยนต์ (Brand Logo)"
          value={formData.logo}
          onChange={handleLogoChange}
          bucket="brand-logos"
        />

        <FormField
          label="คำอธิบายแบรนด์ (Description)"
          id="description"
          name="description"
          type="textarea"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="ข้อมูลพื้นฐาน ประวัติ หรือประเด็นสำคัญของยี่ห้อรถยนต์ยี่ห้อนี้..."
        />

        <div className="border-t border-[var(--cloud-gray)] pt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.active ? "bg-[var(--electric-blue)]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                formData.active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <div>
            <span className="text-sm font-semibold text-[var(--carbon-dark)] block">
              เปิดการแสดงผล (Active)
            </span>
            <span className="text-xs text-[var(--pewter)]">
              หากเปิดใช้งาน ยี่ห้อรถนี้จะแสดงบนหน้าหลักของเว็บไซต์และระบบค้นหา
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--cloud-gray)]">
          <Link
            href="/admin/brands"
            className="px-5 py-2.5 border border-[var(--cloud-gray)] bg-white text-sm font-semibold rounded-md text-[var(--graphite)] hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue-hover)] text-white text-sm font-semibold rounded-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? "กำลังบันทึกข้อมูล..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </div>
  );
}
