"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import InteractiveDiagram from "@/components/InteractiveDiagram";

// ── SVG Silhouettes for Vehicle Types ──

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

// ── Helpers ──

const getNewestGeneration = (generations: string[]): string => {
  if (!generations || generations.length === 0) return "";
  let newestGen = generations[0];
  let maxYear = -1;

  generations.forEach((gen) => {
    const match = gen.match(/ปี\s*(\d{2,4})[-–]\s*(\d{2,4})/);
    if (match) {
      let endYear = parseInt(match[2]);
      if (endYear < 100) {
        endYear = endYear >= 50 ? 1900 + endYear : 2000 + endYear;
      }
      if (endYear > maxYear) {
        maxYear = endYear;
        newestGen = gen;
      }
    }
  });
  return newestGen;
};

const getCarImageForGeneration = (brand: string, model: string, generation: string): string => {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();
  const gen = generation.toLowerCase();

  if (b === "toyota" && m === "camry") {
    if (gen.includes("12-18")) {
      return "/images/cars/toyota-camry-2015.png";
    }
    return "/images/cars/toyota-camry-v2.png";
  }
  if (b === "honda" && m === "civic") {
    return "/images/cars/honda-civic-v2.png";
  }
  if (b === "isuzu" && m === "d-max") {
    return "/images/cars/isuzu-d-max-v2.png";
  }

  return "";
};

interface CarDetailClientProps {
  brand: string;
  model: string;
  modelData: any;
  searchParams: any;
  breadcrumbs: { label: string; href: string }[];
}

export default function CarDetailClient({
  brand,
  model,
  modelData,
  searchParams,
  breadcrumbs,
}: CarDetailClientProps) {
  // Determine initial generation (URL parameter, fallback to newest generation)
  const initialGen = searchParams?.generation || getNewestGeneration(modelData.generations || []);
  const [selectedGeneration, setSelectedGeneration] = useState(initialGen);

  // Update selected generation if searchParams change
  useEffect(() => {
    if (searchParams?.generation) {
      setSelectedGeneration(searchParams.generation);
    }
  }, [searchParams?.generation]);

  // Determine which car image to display
  const carImagePath = getCarImageForGeneration(brand, model, selectedGeneration) || modelData.image;
  const hasImage = !!carImagePath;

  const handleGenChange = (gen: string) => {
    setSelectedGeneration(gen);

    // Update URL query parameters dynamically
    const params = new URLSearchParams(window.location.search);
    params.set("generation", gen);
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Specs Section ── */}
      <section className="bg-white pt-28 pb-16 px-6">
        <div className="max-w-[1383px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-10 flex-wrap">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#EEEEEE]">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-[#171A20] font-medium">{bc.label}</span>
                ) : (
                  <Link href={bc.href} className="tesla-text-link text-[#8E8E8E]">
                    {bc.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Info Column (Left) */}
            <div>
              <p className="text-[#3E6AE1] text-[14px] font-medium mb-2">{modelData.type}</p>
              <h2 className="text-[#171A20] text-[32px] font-medium mb-4">{modelData.nameTh} {selectedGeneration}</h2>
              <p className="text-[#5C5E62] text-[14px] leading-relaxed mb-8">{modelData.description}</p>

              {/* Generation Selector Buttons */}
              {modelData.generations && modelData.generations.length > 0 && (
                <div className="mb-8 p-6 bg-[#F8F9FA] rounded-[16px] border border-[#EEEEEE]">
                  <p className="text-[#171A20] text-[14px] mb-4 font-medium">
                    โฉมรถยนต์:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modelData.generations.map((gen: string) => {
                      const isActive = selectedGeneration === gen;
                      return (
                        <button
                          key={gen}
                          onClick={() => handleGenChange(gen)}
                          className={`px-4 py-2.5 border text-[13px] rounded-[10px] transition-all duration-[330ms] font-medium ${
                            isActive
                              ? "border-[#3E6AE1] bg-[#EEF2FF] text-[#3E6AE1] shadow-sm scale-[1.02]"
                              : "border-[#EEEEEE] bg-white text-[#393C41] hover:border-[#3E6AE1]"
                          }`}
                        >
                          {gen}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-px bg-[#EEEEEE] border border-[#EEEEEE] rounded-[12px] overflow-hidden mb-8">
                {[
                  { label: "เครื่องยนต์ / พลังงาน", value: modelData.engine },
                  { label: "ระบบเกียร์", value: modelData.transmission },
                  { label: "ประเภทเชื้อเพลิง", value: modelData.specs.fuelType },
                  { label: "อัตราสิ้นเปลือง", value: modelData.specs.fuelConsumption },
                  { label: "กำลังแรงม้า", value: modelData.specs.horsePower },
                  { label: "จำนวนที่นั่ง", value: `${modelData.specs.seats} ที่นั่ง` },
                ].map((spec) => (
                  <div key={spec.label} className="bg-white p-4">
                    <p className="text-[#8E8E8E] text-[12px] mb-1">{spec.label}</p>
                    <p className="text-[#171A20] text-[14px] font-medium">{spec.value}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Preview & Maintenance Column (Right) */}
            <div className="flex flex-col gap-8">
              {/* Car Image Box - White Background & Large Sizing */}
              <div className="relative w-full aspect-video bg-white rounded-[12px] border border-[#EEEEEE] overflow-hidden flex items-center justify-center p-4 min-h-[260px] md:min-h-[340px]">
                {hasImage ? (
                  <div className="relative w-full h-full min-h-[220px] md:min-h-[300px] flex items-center justify-center transition-all duration-[330ms] transform hover:scale-[1.03]">
                    <Image
                      src={carImagePath}
                      alt={modelData.nameTh || modelData.name}
                      fill
                      className="object-contain"
                      priority
                    />
                    {/* Shadow underneath */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[12px] bg-black/10 rounded-full blur-[8px]" />
                  </div>
                ) : (
                  <div className="w-full flex justify-center opacity-85 py-6">
                    {renderVehicleSilhouette(modelData.type)}
                  </div>
                )}
              </div>

              {/* Maintenance tips */}
              <div>
                <h3 className="text-[#171A20] text-[17px] font-medium mb-6">ระยะบำรุงรักษาแนะนำ</h3>
                <div className="space-y-3">
                  {modelData.maintenanceTips.map((tip: string) => (
                    <div key={tip} className="flex items-start gap-4 py-3 border-b border-[#EEEEEE]">
                      <div className="w-5 h-5 rounded-full border border-[#3E6AE1] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#3E6AE1]" />
                      </div>
                      <p className="text-[#393C41] text-[14px]">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Diagram ── */}
      <section id="diagram" className="bg-[#F4F4F4] py-20">
        <div className="text-center mb-12 px-6">
          <h2 className="text-[#171A20] text-[32px] font-medium mb-3">เลือกส่วนที่ต้องการอะไหล่</h2>
          <p className="text-[#5C5E62] text-[14px]">กดที่ผังรถหรือเลือกหมวดหมู่ด้านล่าง</p>
        </div>
        <InteractiveDiagram brand={brand} model={model} categories={modelData.categories} generation={selectedGeneration} carImagePath={carImagePath} />
      </section>
    </div>
  );
}
