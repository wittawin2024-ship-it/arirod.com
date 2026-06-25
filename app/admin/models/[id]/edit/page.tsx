"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

export default function EditModelPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;

  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    brand_id: "",
    name: "",
    name_th: "",
    yearsInput: "",
    engine: "",
    transmission: "",
    type: "Sedan",
    image: "",
    description: "",
    maintenanceTipsInput: "",
    // specs JSON fields
    fuelType: "",
    horsePower: "",
    seats: "",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [brandsRes, modelRes] = await Promise.all([
          fetch("/api/admin/brands"),
          fetch(`/api/admin/models/${modelId}`),
        ]);

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        }

        if (modelRes.ok) {
          const modelData = await modelRes.json();
          const m = modelData.model;
          setFormData({
            brand_id: m.brand_id || "",
            name: m.name || "",
            name_th: m.name_th || "",
            yearsInput: m.years ? m.years.join(", ") : "",
            engine: m.engine || "",
            transmission: m.transmission || "",
            type: m.type || "Sedan",
            image: m.image || "",
            description: m.description || "",
            maintenanceTipsInput: m.maintenance_tips ? m.maintenance_tips.join("\n") : "",
            fuelType: m.specs?.fuelType || "",
            horsePower: m.specs?.horsePower ? m.specs.horsePower.toString() : "",
            seats: m.specs?.seats ? m.specs.seats.toString() : "",
            active: m.active !== false,
          });
        } else {
          throw new Error("ดึงข้อมูลรุ่นรถยนต์ไม่สำเร็จ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    if (modelId) {
      loadData();
    }
  }, [modelId]);

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

    if (!formData.brand_id) {
      setError("กรุณาเลือกยี่ห้อรถยนต์");
      setSaving(false);
      return;
    }

    // Parse years array
    let years: number[] = [];
    try {
      const input = formData.yearsInput.trim();
      if (input.includes("-")) {
        const [start, end] = input.split("-").map((y) => parseInt(y.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let y = start; y <= end; y++) {
            years.push(y);
          }
        }
      } else if (input) {
        years = input
          .split(",")
          .map((y) => parseInt(y.trim()))
          .filter((y) => !isNaN(y));
      }
    } catch (err) {
      console.warn("Failed to parse years:", err);
    }

    // Parse maintenance tips
    const maintenance_tips = formData.maintenanceTipsInput
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    // Build specs JSON
    const specs = {
      fuelType: formData.fuelType || null,
      horsePower: formData.horsePower ? parseInt(formData.horsePower) : null,
      seats: formData.seats ? parseInt(formData.seats) : null,
    };

    try {
      const res = await fetch(`/api/admin/models/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: formData.brand_id,
          name: formData.name,
          name_th: formData.name_th,
          years,
          engine: formData.engine,
          transmission: formData.transmission,
          type: formData.type,
          image: formData.image,
          description: formData.description,
          specs,
          maintenance_tips,
          active: formData.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

      router.push("/admin/models");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { value: "Sedan", label: "เก๋ง 4 ประตู (Sedan)" },
    { value: "Hatchback", label: "เก๋ง 5 ประตู (Hatchback)" },
    { value: "SUV", label: "เอสยูวี (SUV / PPV)" },
    { value: "Pickup", label: "กระบะ (Pickup)" },
    { value: "Van", label: "ตู้ (Van / MPV)" },
    { value: "Coupe", label: "คูเป้ (Coupe / Sport)" },
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
          <span className="text-sm text-[var(--pewter)]">กำลังโหลดข้อมูลรุ่นรถยนต์...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mitr max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/models"
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
            แก้ไขข้อมูลรุ่นรถยนต์ (Edit Model: {modelId})
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            ปรับปรุงรายละเอียด รุ่น สเปคเครื่องยนต์ และคำแนะนำดูแลรักษา
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
            label="ยี่ห้อรถยนต์ (Brand)"
            id="brand_id"
            name="brand_id"
            type="select"
            value={formData.brand_id}
            onChange={handleChange}
            required
            placeholder="-- เลือกยี่ห้อรถยนต์ --"
            options={brands.map((b) => ({ value: b.id, label: b.name.toUpperCase() }))}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--silver-fog)] mb-1.5">
              รหัสรุ่น (Model Slug ID) - ห้ามแก้ไข
            </label>
            <input
              type="text"
              value={modelId}
              disabled
              className="w-full px-4 py-2.5 bg-[var(--light-ash)] border border-[var(--cloud-gray)] rounded-md text-[var(--silver-fog)] text-sm cursor-not-allowed"
            />
          </div>

          <FormField
            label="ชื่อรุ่นภาษาอังกฤษ (Model Name)"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Camry, Civic, D-Max"
          />

          <FormField
            label="ชื่อรุ่นภาษาไทย (Thai Name)"
            id="name_th"
            name="name_th"
            value={formData.name_th}
            onChange={handleChange}
            placeholder="e.g. คัมรี่, ซีวิค, ดีแมกซ์"
          />

          <FormField
            label="ปีที่ผลิต (Years)"
            id="yearsInput"
            name="yearsInput"
            value={formData.yearsInput}
            onChange={handleChange}
            placeholder="e.g. 2018-2024 หรือ 2012, 2013, 2014"
            hint="ระบุช่วงปี (เช่น 2015-2022) หรือแบ่งปีด้วยเครื่องหมายจุลภาค"
          />

          <FormField
            label="ประเภทโครงสร้าง (Body Type)"
            id="type"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
          />

          <FormField
            label="ขนาดเครื่องยนต์ (Engine Specs)"
            id="engine"
            name="engine"
            value={formData.engine}
            onChange={handleChange}
            placeholder="e.g. 2.0L Hybrid / 2.5L เบนซิน"
          />

          <FormField
            label="ระบบเกียร์ (Transmission)"
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            placeholder="e.g. E-CVT อัตโนมัติ"
          />
        </div>

        <ImageUpload
          label="รูปภาพรุ่นรถยนต์ (Model Image)"
          value={formData.image}
          onChange={handleImageChange}
          bucket="product-images"
        />

        <FormField
          label="คำอธิบายรุ่นรถ (Description)"
          id="description"
          name="description"
          type="textarea"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="รายละเอียดทั่วไปของรุ่นรถยนต์ ประวัติ หรือจุดขาย..."
        />

        {/* Specs JSON Area */}
        <div className="border-t border-[var(--cloud-gray)] pt-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--carbon-dark)]">ข้อมูลสเปครุ่นย่อยเพิ่มเติม (Specs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="ประเภทเชื้อเพลิง (Fuel Type)"
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              placeholder="e.g. เบนซิน, ดีเซล, ไฟฟ้า"
            />
            <FormField
              label="กำลังแรงม้า (Horse Power)"
              id="horsePower"
              name="horsePower"
              type="number"
              value={formData.horsePower}
              onChange={handleChange}
              placeholder="e.g. 150"
            />
            <FormField
              label="จำนวนที่นั่ง (Seats)"
              id="seats"
              name="seats"
              type="number"
              value={formData.seats}
              onChange={handleChange}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        {/* Maintenance Tips */}
        <div className="border-t border-[var(--cloud-gray)] pt-6 space-y-2">
          <label className="block text-sm font-medium text-[var(--pewter)] mb-1.5">
            คำแนะนำการบำรุงรักษา (Maintenance Tips)
          </label>
          <textarea
            id="maintenanceTipsInput"
            name="maintenanceTipsInput"
            rows={4}
            value={formData.maintenanceTipsInput}
            onChange={handleChange}
            placeholder="ระบุคำแนะนำ 1 ข้อต่อ 1 บรรทัด เช่น&#10;เปลี่ยนน้ำมันเครื่องทุกๆ 10,000 กม.&#10;ตรวจสอบผ้าเบรคหน้าทุก 20,000 กม."
            className="w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)]"
          />
          <p className="text-xs text-[var(--silver-fog)] mt-1">เขียนแต่ละหัวข้อขึ้นบรรทัดใหม่ (จะแปลงเป็นรายการข้อ)</p>
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
              หากเปิดใช้งาน รุ่นรถนี้จะแสดงในหน้ารายละเอียดแบรนด์และระบบค้นหา
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--cloud-gray)]">
          <Link
            href="/admin/models"
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
