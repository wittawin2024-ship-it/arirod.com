"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  brand_id: string;
  name: string;
}

export default function EditPartPage() {
  const router = useRouter();
  const params = useParams();
  const partId = params.id as string;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [formData, setFormData] = useState({
    model_id: "",
    name_th: "",
    name_en: "",
    brand: "",
    aftermarket_brand: "",
    part_number: "",
    category: "engine",
    subcategory: "",
    description: "",
    price_min: "",
    price_max: "",
    image: "",
    change_interval: "",
    difficulty: "Easy",
    shopee_link: "",
    lazada_link: "",
    tagsInput: "",
    related_article: "",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [brandsRes, modelsRes, partRes] = await Promise.all([
          fetch("/api/admin/brands"),
          fetch("/api/admin/models"),
          fetch(`/api/admin/parts/${partId}`),
        ]);

        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setBrands(data.brands || []);
        }

        let modelsData: Model[] = [];
        if (modelsRes.ok) {
          const data = await modelsRes.json();
          modelsData = data.models || [];
          setAllModels(modelsData);
        }

        if (partRes.ok) {
          const data = await partRes.json();
          const p = data.part;

          // Find brand of this part's model
          const modelObj = modelsData.find((m) => m.id === p.model_id);
          if (modelObj) {
            setSelectedBrandId(modelObj.brand_id);
          }

          setFormData({
            model_id: p.model_id || "",
            name_th: p.name_th || "",
            name_en: p.name_en || "",
            brand: p.brand || "",
            aftermarket_brand: p.aftermarket_brand || "",
            part_number: p.part_number || "",
            category: p.category || "engine",
            subcategory: p.subcategory || "",
            description: p.description || "",
            price_min: p.price_min ? p.price_min.toString() : "",
            price_max: p.price_max ? p.price_max.toString() : "",
            image: p.image || "",
            change_interval: p.change_interval || "",
            difficulty: p.difficulty || "Easy",
            shopee_link: p.affiliate_links?.shopee || "",
            lazada_link: p.affiliate_links?.lazada || "",
            tagsInput: p.tags ? p.tags.join(", ") : "",
            related_article: p.related_article || "",
            active: p.active !== false,
          });
        } else {
          throw new Error("ดึงข้อมูลอะไหล่ไม่สำเร็จ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    if (partId) {
      loadData();
    }
  }, [partId]);

  // Filter models when brand selection is updated
  useEffect(() => {
    if (selectedBrandId) {
      const filtered = allModels.filter((m) => m.brand_id === selectedBrandId);
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [selectedBrandId, allModels]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!formData.model_id) {
      setError("กรุณาเลือกรุ่นรถยนต์");
      setSaving(false);
      return;
    }

    // Build affiliate links JSON
    const affiliate_links = {
      shopee: formData.shopee_link.trim() || null,
      lazada: formData.lazada_link.trim() || null,
    };

    // Parse tags
    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/admin/parts/${partId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price_min: formData.price_min ? parseInt(formData.price_min) : null,
          price_max: formData.price_max ? parseInt(formData.price_max) : null,
          affiliate_links,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");

      router.push("/admin/parts");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { value: "engine", label: "น้ำมันเครื่องและเคมีภัณฑ์" },
    { value: "brakes", label: "ระบบเบรค" },
    { value: "suspension", label: "ระบบช่วงล่างและบังคับเลี้ยว" },
    { value: "filters", label: "กรองต่างๆ (อากาศ, แอร์, น้ำมัน)" },
    { value: "electrical", label: "ระบบไฟและเซนเซอร์" },
    { value: "cooling", label: "ระบบระบายความร้อน" },
    { value: "transmission", label: "ระบบส่งกำลังและครัช" },
  ];

  const difficulties = [
    { value: "Easy", label: "ง่าย (เปลี่ยนเองได้สะดวก)" },
    { value: "Medium", label: "ปานกลาง (ต้องใช้เครื่องมือและทักษะช่าง)" },
    { value: "Hard", label: "ยาก (แนะนำให้เปลี่ยนโดยช่างผู้เชี่ยวชาญ)" },
  ];

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
          <span className="text-sm text-[var(--pewter)]">กำลังโหลดข้อมูลอะไหล่...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mitr max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/parts"
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
            แก้ไขข้อมูลอะไหล่ (Edit Part: {partId})
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ปรับเปลี่ยนคุณสมบัติ แบรนด์เทียบ ราคา และอัปเดตลิงก์สินค้า
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
        {/* Model Chained Dropdowns */}
        <div className="border-b border-[var(--cloud-gray)] pb-4 space-y-4">
          <h3 className="text-sm font-bold text-[var(--carbon-dark)]">ข้อมูลการเชื่อมโยงรถยนต์</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--pewter)] mb-1.5">
                ยี่ห้อรถยนต์ (Brand Filter) *
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)]"
              >
                <option value="">-- เลือกยี่ห้อเพื่อกรองรุ่นรถ --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="รุ่นรถยนต์ที่รองรับ (Model) *"
              id="model_id"
              name="model_id"
              type="select"
              value={formData.model_id}
              onChange={handleChange}
              required
              placeholder="-- เลือกรุ่นรถยนต์ --"
              options={filteredModels.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
            />
          </div>
        </div>

        {/* Primary Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--silver-fog)] mb-1.5">
              รหัสอะไหล่ (Part ID / SKU) - ห้ามแก้ไข
            </label>
            <input
              type="text"
              value={partId}
              disabled
              className="w-full px-4 py-2.5 bg-[var(--light-ash)] border border-[var(--cloud-gray)] rounded-md text-[var(--silver-fog)] text-sm cursor-not-allowed uppercase"
            />
          </div>

          <FormField
            label="ยี่ห้อสินค้า / แบรนด์ผู้ผลิตอะไหล่ *"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            placeholder="e.g. Toyota, Brembo, Bosch"
          />

          <FormField
            label="ชื่ออะไหล่ภาษาไทย *"
            id="name_th"
            name="name_th"
            value={formData.name_th}
            onChange={handleChange}
            required
            placeholder="e.g. กรองน้ำมันเครื่องแท้"
          />

          <FormField
            label="ชื่ออะไหล่ภาษาอังกฤษ *"
            id="name_en"
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            required
            placeholder="e.g. Engine Oil Filter (OEM)"
          />

          <FormField
            label="แบรนด์ทางเลือก (Aftermarket Brand)"
            id="aftermarket_brand"
            name="aftermarket_brand"
            value={formData.aftermarket_brand}
            onChange={handleChange}
            placeholder="e.g. Aisin, Sakura, TRW"
          />

          <FormField
            label="หมายเลขอะไหล่ผู้ผลิต (Part Number)"
            id="part_number"
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            placeholder="e.g. 90915-YZZE1"
          />

          <FormField
            label="หมวดหมู่อะไหล่ *"
            id="category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            options={categories}
          />

          <FormField
            label="หมวดหมู่ย่อย (Subcategory)"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            placeholder="e.g. ไส้กรองเบนซิน, ผ้าเบรคหน้า"
          />

          <FormField
            label="ราคาเริ่มต้นต่ำสุด (Price Min)"
            id="price_min"
            name="price_min"
            type="number"
            value={formData.price_min}
            onChange={handleChange}
            placeholder="e.g. 150"
          />

          <FormField
            label="ราคาเริ่มสูงสุด (Price Max)"
            id="price_max"
            name="price_max"
            type="number"
            value={formData.price_max}
            onChange={handleChange}
            placeholder="e.g. 250"
          />

          <FormField
            label="ระยะเวลาเปลี่ยนถ่าย (Change Interval)"
            id="change_interval"
            name="change_interval"
            value={formData.change_interval}
            onChange={handleChange}
            placeholder="e.g. 10,000 กม. หรือ 6 เดือน"
          />

          <FormField
            label="ความยากในการเปลี่ยน (Difficulty)"
            id="difficulty"
            name="difficulty"
            type="select"
            value={formData.difficulty}
            onChange={handleChange}
            options={difficulties}
          />
        </div>

        <ImageUpload
          label="รูปภาพอะไหล่ (Part Image)"
          value={formData.image}
          onChange={handleImageChange}
          bucket="product-images"
        />

        <FormField
          label="คำอธิบายรายละเอียดอะไหล่"
          id="description"
          name="description"
          type="textarea"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="คุณสมบัติเฉพาะ วิธีเปลี่ยนสินค้า หรือคำเตือนความเข้ากันได้..."
        />

        {/* Affiliate Links */}
        <div className="border-t border-[var(--cloud-gray)] pt-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--carbon-dark)]">ลิงก์ร้านค้าพันธมิตร (Affiliate Links)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="ลิงก์สินค้าบน Shopee"
              id="shopee_link"
              name="shopee_link"
              value={formData.shopee_link}
              onChange={handleChange}
              placeholder="e.g. https://shopee.co.th/product-slug-id..."
            />
            <FormField
              label="ลิงก์สินค้าบน Lazada"
              id="lazada_link"
              name="lazada_link"
              value={formData.lazada_link}
              onChange={handleChange}
              placeholder="e.g. https://lazada.co.th/product-slug-id..."
            />
          </div>
        </div>

        {/* Tags and related article */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[var(--cloud-gray)] pt-6">
          <FormField
            label="แท็กสินค้า (Tags)"
            id="tagsInput"
            name="tagsInput"
            value={formData.tagsInput}
            onChange={handleChange}
            placeholder="e.g. กรองเครื่อง, กรองน้ำมันเครื่อง, อะไหล่แท้"
            hint="คั่นหัวข้อแท็กด้วยเครื่องหมายจุลภาค (,)"
          />

          <FormField
            label="ลิงก์บทความซ่อมบำรุง (Related Article Slug)"
            id="related_article"
            name="related_article"
            value={formData.related_article}
            onChange={handleChange}
            placeholder="e.g. how-to-change-oil-filter"
            hint="ระบุรหัส slug ของบทความที่เกี่ยวข้องในบล็อก"
          />
        </div>

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
              หากเปิดใช้งาน อะไหล่ชิ้นนี้จะแสดงในหน้ารายละเอียดรุ่นรถยนต์ตามหมวดหมู่
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--cloud-gray)]">
          <Link
            href="/admin/parts"
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
