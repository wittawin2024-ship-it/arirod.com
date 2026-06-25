"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

export default function NewBrandPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    name_th: "",
    logo: "",
    color: "",
    description: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);
    setError("");

    // Validate ID format (must be alphanumeric or dashes)
    const idRegex = /^[a-z0-9-]+$/;
    if (!idRegex.test(formData.id.trim())) {
      setError("รหัสยี่ห้อ (ID) ต้องเป็นภาษาอังกฤษตัวเล็ก ตัวเลข หรือเครื่องหมายขีด (-) เท่านั้น เช่น toyota, mercedes-benz");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: formData.id.toLowerCase().trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

      router.push("/admin/brands");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

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
            เพิ่มยี่ห้อรถยนต์ใหม่ (Create Brand)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ใส่รายละเอียดข้อมูลผู้ผลิตรถยนต์เพื่อใช้งานเป็นความสัมพันธ์ของรุ่นและอะไหล่
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
          <FormField
            label="รหัสยี่ห้อ (ID/Slug)"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            placeholder="e.g. toyota, honda, isuzu"
            hint="ภาษาอังกฤษพิมพ์เล็กและขีดกลางเท่านั้น ห้ามแก้ไขหลังจากสร้างเสร็จ"
          />

          <FormField
            label="ชื่อยี่ห้อภาษาอังกฤษ (Name)"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Toyota, Honda, Isuzu"
          />

          <FormField
            label="ชื่อยี่ห้อภาษาไทย (Thai Name)"
            id="name_th"
            name="name_th"
            value={formData.name_th}
            onChange={handleChange}
            placeholder="e.g. โตโยต้า, ฮอนด้า, อีซูซุ"
          />

          <FormField
            label="โทนสีแบรนด์ (Color Hex)"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g. #EB0A1E"
            hint="ใช้แสดงเป็นสีพื้นหลังในหน้าต่างแบรนด์รถยนต์"
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
            disabled={loading}
            className="px-5 py-2.5 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue-hover)] text-white text-sm font-semibold rounded-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "กำลังบันทึกข้อมูล..." : "บันทึกยี่ห้อรถยนต์"}
          </button>
        </div>
      </form>
    </div>
  );
}
