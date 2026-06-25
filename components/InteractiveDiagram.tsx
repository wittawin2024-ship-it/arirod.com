"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface Category {
  id: string;
  nameTh: string;
  nameEn: string;
  icon: string;
  color: string;
  partsCount: number;
}

interface InteractiveDiagramProps {
  brand: string;
  model: string;
  categories: Category[];
  generation?: string;
  carImagePath?: string;
}

// ── SVG Silhouettes for Fallback ──

const SedanSilhouette = () => (
  <svg viewBox="0 0 600 240" className="w-full h-auto max-w-[320px] transition-all duration-[330ms]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="300" cy="205" rx="230" ry="8" fill="rgba(0,0,0,0.06)" />
    <path d="M70 155 Q80 120 140 105 Q190 90 240 85 Q310 78 360 85 Q410 90 450 105 Q495 115 520 140 L530 155 Z" fill="#FFFFFF" stroke="#D0D1D2" strokeWidth="2.5" />
    <path d="M170 105 Q220 70 300 65 Q370 62 410 75 Q440 85 460 100" fill="none" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="165" r="28" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="165" r="14" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
    <circle cx="440" cy="165" r="28" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="440" cy="165" r="14" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
  </svg>
);

const SuvSilhouette = () => (
  <svg viewBox="0 0 600 240" className="w-full h-auto max-w-[320px] transition-all duration-[330ms]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="300" cy="205" rx="230" ry="8" fill="rgba(0,0,0,0.06)" />
    <path d="M70 145 Q75 105 130 95 Q180 90 240 90 Q350 90 440 90 L490 100 L525 120 L530 145 Z" fill="#FFFFFF" stroke="#D0D1D2" strokeWidth="2.5" />
    <path d="M150 95 Q200 60 290 60 L440 60 Q460 60 475 75 L495 100" fill="none" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="160" r="32" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="160" r="16" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
    <circle cx="440" cy="160" r="32" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="440" cy="160" r="16" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
  </svg>
);

const PickupSilhouette = () => (
  <svg viewBox="0 0 600 240" className="w-full h-auto max-w-[320px] transition-all duration-[330ms]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="300" cy="205" rx="230" ry="8" fill="rgba(0,0,0,0.06)" />
    <path d="M70 150 Q75 105 130 95 Q180 90 240 90 H380 V125 H520 L530 150 Z" fill="#FFFFFF" stroke="#D0D1D2" strokeWidth="2.5" />
    <path d="M150 95 Q200 60 295 60 H360 Q375 60 380 75 L380 90" fill="none" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="160" r="30" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="160" r="15" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
    <circle cx="430" cy="160" r="30" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="430" cy="160" r="15" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
  </svg>
);

const HatchbackSilhouette = () => (
  <svg viewBox="0 0 600 240" className="w-full h-auto max-w-[320px] transition-all duration-[330ms]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="300" cy="205" rx="230" ry="8" fill="rgba(0,0,0,0.06)" />
    <path d="M70 155 Q80 120 140 110 Q190 95 240 90 Q300 85 350 90 Q420 95 460 105 Q500 115 520 155 Z" fill="#FFFFFF" stroke="#D0D1D2" strokeWidth="2.5" />
    <path d="M170 110 Q220 70 295 67 Q370 65 420 80 Q465 95 475 110" fill="none" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="165" r="26" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="160" cy="165" r="13" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
    <circle cx="430" cy="165" r="26" fill="#393C41" stroke="#D0D1D2" strokeWidth="2.5" />
    <circle cx="430" cy="165" r="13" fill="#F4F4F4" stroke="#8E8E8E" strokeWidth="2" />
  </svg>
);

const renderVehicleSilhouette = (type: string) => {
  const t = type.toLowerCase();
  if (t === "suv") return <SuvSilhouette />;
  if (t === "pickup") return <PickupSilhouette />;
  if (t === "hatchback") return <HatchbackSilhouette />;
  return <SedanSilhouette />;
};

const getModelType = (m: string) => {
  const modelLower = m.toLowerCase();
  if (modelLower.includes("d-max") || modelLower.includes("revo") || modelLower.includes("hilux")) return "pickup";
  if (modelLower.includes("fortuner") || modelLower.includes("cross") || modelLower.includes("cr-v") || modelLower.includes("hr-v")) return "suv";
  if (modelLower.includes("yaris") || modelLower.includes("jazz") || modelLower.includes("city hatchback")) return "hatchback";
  return "sedan";
};

export default function InteractiveDiagram({ brand, model, categories, generation, carImagePath }: InteractiveDiagramProps) {
  const queryStr = generation ? `?generation=${encodeURIComponent(generation)}` : "";
  const modelType = getModelType(model);
  const hasRealImage = !!carImagePath;

  // ── States & Refs for Hover & Preview Caching ──
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [partsCache, setPartsCache] = useState<Record<string, any[]>>({});
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (catId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCategoryId(catId);

    // Fetch and cache parts for the category if not already cached
    if (!partsCache[catId]) {
      setLoadingCategoryId(catId);
      fetch(`/api/parts?brand=${brand}&model=${model}&category=${catId}`)
        .then((res) => res.json())
        .then((data) => {
          setPartsCache((prev) => ({ ...prev, [catId]: data }));
          setLoadingCategoryId(null);
        })
        .catch((err) => {
          console.error("Failed to load parts preview:", err);
          setPartsCache((prev) => ({ ...prev, [catId]: [] }));
          setLoadingCategoryId(null);
        });
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategoryId(null);
    }, 150);
  };

  // Divide the 8 categories into Left Column and Right Column
  const leftIds = ["engine", "cooling", "transmission", "filter"];
  const rightIds = ["electrical", "suspension", "brake", "exterior"];

  const leftCats = leftIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean) as Category[];
  const rightCats = rightIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean) as Category[];

  // Render a single category card with floating hover tooltip
  const renderCategoryCard = (cat: Category, side: "left" | "right" | "mobile") => {
    const isHovered = hoveredCategoryId === cat.id;
    const parts = partsCache[cat.id] || [];
    const isLoading = loadingCategoryId === cat.id;

    // Determine tooltip placement direction
    const tooltipClass = side === "left"
      ? "absolute left-full top-0 ml-4 z-50 pointer-events-auto"
      : "absolute right-full top-0 mr-4 z-50 pointer-events-auto";

    return (
      <div
        key={cat.id}
        className="relative"
        onMouseEnter={() => handleMouseEnter(cat.id)}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={`/${brand}/${model}/${cat.id}${queryStr}`}
          id={`category-${cat.id}`}
          className={`flex items-center gap-4 border rounded-[16px] p-5 transition-all duration-[330ms] bg-white/90 backdrop-blur-sm shadow-sm min-h-[96px] select-none ${
            isHovered
              ? "shadow-[0_16px_28px_rgba(0,0,0,0.08)] -translate-y-0.5 scale-[1.01] bg-white"
              : "border-[#EEEEEE] hover:border-[#3E6AE1] hover:bg-white"
          }`}
          style={{
            borderColor: isHovered ? cat.color : "#EEEEEE",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-300"
            style={{
              backgroundColor: `${cat.color}12`,
              color: cat.color,
              transform: isHovered ? "scale(1.1)" : "scale(1)"
            }}
          >
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#171A20] text-[15px] truncate">{cat.nameTh}</h4>
            <p className="text-[#5C5E62] text-[12px] truncate">{cat.nameEn}</p>
            <span className="text-[#8E8E8E] text-[11px] font-medium block mt-1">
              {cat.partsCount} รายการ
            </span>
          </div>
          <span
            className="text-[14px] font-bold transition-transform duration-300"
            style={{
              color: cat.color,
              transform: isHovered ? "translateX(4px)" : "translateX(0)"
            }}
          >
            →
          </span>
        </Link>

        {/* Floating Tooltip Panel (Desktop only) */}
        {isHovered && side !== "mobile" && (
          <div
            className={`${tooltipClass} w-[340px] bg-white rounded-[16px] border border-[#EEEEEE] shadow-[0_16px_36px_rgba(0,0,0,0.12)] p-5 tooltip-animate overflow-hidden`}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              setHoveredCategoryId(cat.id);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Tooltip top border indicator */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: cat.color }}
            />

            <div className="flex items-center justify-between border-b border-[#F8F9FA] pb-3 mb-3">
              <span className="font-bold text-[#171A20] text-[14px]">
                ตัวอย่างอะไหล่ {cat.nameTh}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                {cat.partsCount} รายการ
              </span>
            </div>

            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${cat.color}50`, borderTopColor: cat.color }} />
                <span className="text-[12px] text-[#8E8E8E]">กำลังโหลดข้อมูล...</span>
              </div>
            ) : parts.length > 0 ? (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-none text-left">
                {parts.slice(0, 4).map((part: any) => (
                  <div key={part.id} className="border-b border-[#F8F9FA] pb-2 last:border-0 last:pb-0">
                    <h5 className="font-medium text-[#171A20] text-[13px] line-clamp-1">{part.nameTh}</h5>
                    <div className="flex justify-between items-center mt-1 text-[11px] text-[#8E8E8E]">
                      <span>{part.brand} {part.partNumber ? `• ${part.partNumber}` : ""}</span>
                      <span className="font-semibold text-[#171A20]">
                        ฿{part.priceRange.min.toLocaleString()} - ฿{part.priceRange.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {parts.length > 4 && (
                  <div className="text-center text-[11px] text-[#8E8E8E] pt-1">
                    และอะไหล่อื่นๆ อีก {parts.length - 4} รายการ
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[12px] text-[#8E8E8E] mb-2">ยังไม่มีรายการอะไหล่ตรงรุ่นในระบบ</p>
                <span className="text-[11px] text-[#3E6AE1] font-medium">คลิกเพื่อเข้าสู่โหมดเปรียบเทียบราคาด่วน</span>
              </div>
            )}

            <Link
              href={`/${brand}/${model}/${cat.id}${queryStr}`}
              className="mt-4 w-full py-2.5 rounded-[10px] text-center text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 hover:brightness-95"
              style={{ backgroundColor: cat.color }}
            >
              ดูรายละเอียดอะไหล่ทั้งหมด ➔
            </Link>
          </div>
        )}
      </div>
    );
  };

  const styleText = `
    @keyframes tooltip-fade-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .tooltip-animate {
      animation: tooltip-fade-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <div className="w-full relative py-8 overflow-hidden min-h-[500px] flex items-center">
      <style>{styleText}</style>

      {/* Full-screen Background Watermark Image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {hasRealImage ? (
          <div className="relative w-full h-[90%] max-w-7xl opacity-[0.07] grayscale contrast-125 mix-blend-multiply">
            <img src={carImagePath} alt={`${brand} ${model}`} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-full max-w-[700px] flex items-center justify-center opacity-[0.05]">
            {renderVehicleSilhouette(modelType)}
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div className="w-full max-w-[1383px] mx-auto px-6 relative z-10">
        {/* Desktop View: 12-column Grid with Spacer */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center">
          {/* Left Column (4 cards) */}
          <div className="col-span-5 flex flex-col gap-6">
            {leftCats.map((cat) => renderCategoryCard(cat, "left"))}
          </div>

          {/* Spacer Column in the center */}
          <div className="col-span-2" />

          {/* Right Column (4 cards) */}
          <div className="col-span-5 flex flex-col gap-6">
            {rightCats.map((cat) => renderCategoryCard(cat, "right"))}
          </div>
        </div>

        {/* Mobile/Tablet View: Grid of all categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {categories.map((cat) => renderCategoryCard(cat, "mobile"))}
        </div>
      </div>
    </div>
  );
}
