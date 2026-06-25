"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "ความรู้ทั่วไป",
    content: "",
    image: "",
    read_time: "5",
    date: new Date().toISOString().split("T")[0],
    status: "draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-generate slug from English title if user has not manually modified slug
      if (name === "title" && !prev.slug) {
        const generatedSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
          .trim()
          .replace(/\s+/g, "-"); // Replace spaces with dashes
        updated.slug = generatedSlug;
      }

      return updated;
    });
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug.trim())) {
      setError("รหัสบล็อก (Slug URL) ต้องเป็นภาษาอังกฤษพิมพ์เล็ก ตัวเลข หรือขีดกลาง (-) เท่านั้น เช่น how-to-change-brake-pads");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug.toLowerCase().trim(),
          read_time: parseInt(formData.read_time) || 5,
          date: new Date(formData.date).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกบทความ");

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "ความรู้ทั่วไป", label: "ความรู้ทั่วไป (General Knowledge)" },
    { value: "คู่มือซ่อมบำรุง", label: "คู่มือซ่อมบำรุงด้วยตัวเอง (DIY Guides)" },
    { value: "รีวิวอะไหล่", label: "รีวิวอะไหล่และอุปกรณ์ (Part Reviews)" },
    { value: "เทคนิคยืดอายุการใช้งาน", label: "เทคนิคยืดอายุการใช้งาน (Tips)" },
  ];

  const statusOptions = [
    { value: "draft", label: "แบบร่าง (Draft)" },
    { value: "published", label: "เผยแพร่ทันที (Published)" },
  ];

  return (
    <div className="space-y-6 font-mitr max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
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
            เขียนบทความใหม่ (New Article)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            สร้างเนื้อหาบทความบล็อก แนะนำเทคนิคสำหรับผู้ใช้รถยนต์และโปรโมทอะไหล่
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
          <div className="md:col-span-2">
            <FormField
              label="หัวข้อบทความ (Article Title) *"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. วิธีตรวจเช็คและเปลี่ยนผ้าเบรครถยนต์ด้วยตัวเอง"
            />
          </div>

          <FormField
            label="ลิงก์บทความ (URL Slug ID) *"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="e.g. how-to-change-car-brake-pads"
            hint="ภาษาอังกฤษพิมพ์เล็กและขีดกลางเท่านั้น จะปรากฏที่ arairod.com/blog/[slug]"
          />

          <FormField
            label="หมวดหมู่บล็อก (Category) *"
            id="category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
          />

          <FormField
            label="เวลาในการอ่านโดยประมาณ (นาที)"
            id="read_time"
            name="read_time"
            type="number"
            value={formData.read_time}
            onChange={handleChange}
            placeholder="e.g. 5"
          />

          <FormField
            label="วันที่ลงบทความ (Publish Date)"
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <FormField
              label="สถานะบทความ (Status) *"
              id="status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />
          </div>
        </div>

        <ImageUpload
          label="รูปหน้าปกบทความ (Cover Image)"
          value={formData.image}
          onChange={handleImageChange}
          bucket="blog-images"
        />

        <div className="border-t border-[var(--cloud-gray)] pt-6 space-y-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-[var(--pewter)]">
              เนื้อหาบทความ (Article Content - Markdown) *
            </label>
            <span className="text-xs text-[var(--silver-fog)]">รองรับการเขียนแบบ Markdown</span>
          </div>
          <textarea
            id="content"
            name="content"
            rows={15}
            required
            value={formData.content}
            onChange={handleChange}
            placeholder="# พาดหัวหลัก&#10;&#10;เนื้อหาบทความเริ่มต้นตรงนี้...&#10;&#10;## พาดหัวรอง&#10;- รายการข้อความ&#10;- อีกหนึ่งรายการ&#10;&#10;[ข้อความลิงก์](https://arairod.com)"
            className="w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] font-mono"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--cloud-gray)]">
          <Link
            href="/admin/blog"
            className="px-5 py-2.5 border border-[var(--cloud-gray)] bg-white text-sm font-semibold rounded-md text-[var(--graphite)] hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue-hover)] text-white text-sm font-semibold rounded-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "กำลังบันทึกบทความ..." : "บันทึกบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}
