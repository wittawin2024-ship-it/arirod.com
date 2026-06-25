"use client";

import React, { useState, useRef } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: "brand-logos" | "product-images" | "blog-images";
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  bucket = "product-images",
  label = "รูปภาพ",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--pewter)] mb-1.5">
        {label}
      </label>

      {value ? (
        <div className="relative w-40 h-40 border border-[var(--cloud-gray)] rounded-md overflow-hidden bg-gray-50 flex items-center justify-center group">
          <img
            src={value}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
              title="ลบรูปภาพ"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-md h-40 border-2 border-dashed border-[var(--silver-fog)] hover:border-[var(--electric-blue)] rounded-md flex flex-col items-center justify-center bg-white cursor-pointer transition-colors p-4 text-center ${
            isUploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
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
              <span className="text-xs text-[var(--pewter)] font-medium">
                กำลังอัปโหลด...
              </span>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-[var(--silver-fog)] mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm font-semibold text-[var(--graphite)]">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </span>
              <span className="text-xs text-[var(--silver-fog)] mt-1">
                รองรับไฟล์ JPEG, PNG, WEBP, SVG (สูงสุด 5MB)
              </span>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
