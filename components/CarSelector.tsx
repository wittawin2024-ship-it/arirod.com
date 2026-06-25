"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import brandsData from "@/data/brands.json";
import searchTreeData from "@/data/one2car_search_tree.json";
import Image from "next/image";

interface Model {
  id: string;
  name: string;
  nameTh: string;
  year: string;
  type: string;
}

interface Brand {
  id: string;
  name: string;
  nameTh: string;
  logo?: string;
  color?: string;
  description?: string;
  models: Model[];
}

interface SearchTreeModel {
  Generations: string[];
  Variants: string[];
  Years: number[];
  Fuel_Types: string[];
  Transmissions: string[];
  Body_Types: string[];
  Colors: string[];
  Driven_Wheels: string[];
  Brand_Slug: string;
  Model_Slug: string;
  Listing_Count: number;
}

interface SearchTree {
  [brand: string]: {
    [model: string]: SearchTreeModel;
  };
}

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

export default function CarSelector() {
  const router = useRouter();
  
  // Core selectors
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  
  // Advanced selectors
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedDrivenWheels, setSelectedDrivenWheels] = useState("");

  // Available options lists
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [availableGenerations, setAvailableGenerations] = useState<string[]>([]);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableFuels, setAvailableFuels] = useState<string[]>([]);
  const [availableTransmissions, setAvailableTransmissions] = useState<string[]>([]);
  const [availableBodies, setAvailableBodies] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableDrivenWheels, setAvailableDrivenWheels] = useState<string[]>([]);

  // Advanced toggles
  const [showAdvanced, setShowAdvanced] = useState(false);

  const brands = brandsData as Brand[];
  const searchTree = searchTreeData as SearchTree;

  // Handle Brand Change
  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find((b) => b.id.toLowerCase() === selectedBrand.toLowerCase());
      setAvailableModels(brand?.models || []);
      
      // Reset all subsequent states
      setSelectedModel("");
      resetAdvancedStates();
    } else {
      setAvailableModels([]);
      setSelectedModel("");
      resetAdvancedStates();
    }
  }, [selectedBrand]);

  // Handle Model Change -> Load dynamic lists from search tree
  useEffect(() => {
    if (selectedBrand && selectedModel) {
      resetAdvancedStates();
      
      // Find Brand key case-insensitively in search tree
      const brandKey = Object.keys(searchTree).find(
        (b) => b.toLowerCase() === selectedBrand.toLowerCase()
      );
      
      if (brandKey) {
        const brandModels = searchTree[brandKey];
        // Find Model key case-insensitively, matching either key name or simplified Model_Slug
        const modelKey = Object.keys(brandModels).find((m) => {
          const mData = brandModels[m];
          const slug = mData.Model_Slug || m;
          const simpleSlug = slug.split("/").pop() || "";
          return (
            m.toLowerCase() === selectedModel.toLowerCase() ||
            simpleSlug.toLowerCase() === selectedModel.toLowerCase()
          );
        });

        if (modelKey) {
          const modelData = brandModels[modelKey];
          
          setAvailableGenerations(modelData.Generations || []);
          setAvailableVariants(modelData.Variants || []);
          
          // Ensure years are sorted descending
          const sortedYears = [...(modelData.Years || [])]
            .map(Number)
            .filter((y) => !isNaN(y))
            .sort((a, b) => b - a);
          setAvailableYears(sortedYears);
          
          setAvailableFuels(modelData.Fuel_Types || []);
          setAvailableTransmissions(modelData.Transmissions || []);
          setAvailableBodies(modelData.Body_Types || []);
          setAvailableColors(modelData.Colors || []);
          setAvailableDrivenWheels(modelData.Driven_Wheels || []);
          return;
        }
      }
      
      // Fallback if not found in search tree (use basic years)
      const brand = brands.find((b) => b.id === selectedBrand);
      const model = brand?.models.find((m) => m.id === selectedModel);
      if (model?.year) {
        const [startYear, endYear] = model.year.split("-").map(Number);
        const years: number[] = [];
        for (let y = endYear; y >= startYear; y--) years.push(y);
        setAvailableYears(years);
      }
    } else {
      resetAdvancedStates();
    }
  }, [selectedModel]);

  const resetAdvancedStates = () => {
    setSelectedGeneration("");
    setSelectedVariant("");
    setSelectedYear("");
    setSelectedFuel("");
    setSelectedTransmission("");
    setSelectedBodyType("");
    setSelectedColor("");
    setSelectedDrivenWheels("");

    setAvailableGenerations([]);
    setAvailableVariants([]);
    setAvailableYears([]);
    setAvailableFuels([]);
    setAvailableTransmissions([]);
    setAvailableBodies([]);
    setAvailableColors([]);
    setAvailableDrivenWheels([]);
  };

  const handleSearch = () => {
    if (selectedBrand && selectedModel) {
      const params = new URLSearchParams();
      let genToUse = selectedGeneration;
      if (!genToUse && availableGenerations.length > 0) {
        genToUse = getNewestGeneration(availableGenerations);
      }
      if (genToUse) params.append("generation", genToUse);
      if (selectedVariant) params.append("variant", selectedVariant);
      if (selectedYear) params.append("year", selectedYear);
      if (selectedFuel) params.append("fuel", selectedFuel);
      if (selectedTransmission) params.append("transmission", selectedTransmission);
      if (selectedBodyType) params.append("body", selectedBodyType);
      if (selectedColor) params.append("color", selectedColor);
      if (selectedDrivenWheels) params.append("driven", selectedDrivenWheels);

      const queryString = params.toString();
      const path = queryString
        ? `/${selectedBrand}/${selectedModel}?${queryString}`
        : `/${selectedBrand}/${selectedModel}`;
      router.push(path);
    }
  };

  const currentBrandInfo = brands.find((b) => b.id.toLowerCase() === selectedBrand.toLowerCase());
  const currentModelInfo = currentBrandInfo?.models.find((m) => m.id.toLowerCase() === selectedModel.toLowerCase());
  const modelType = currentModelInfo?.type || "";

  const hasRealImage = selectedBrand && selectedModel && ["toyota-camry", "honda-civic", "isuzu-d-max"].includes(`${selectedBrand.toLowerCase()}-${selectedModel.toLowerCase()}`);
  const realImagePath = hasRealImage ? `/images/cars/${selectedBrand.toLowerCase()}-${selectedModel.toLowerCase()}-v2.png` : "";

  const selectClass =
    "w-full bg-white border border-[#D0D1D2] text-[#171A20] text-[14px] rounded-[10px] px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:border-[#3E6AE1] transition-[border-color] duration-[330ms] disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-[#8E8E8E]";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white p-6 md:p-10 border border-[#EEEEEE] rounded-[16px] grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Column: Search Form */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-[#171A20] text-[22px] font-medium mb-2 text-left">ค้นหาอะไหล่รถของคุณ</h2>
            <p className="text-[#5C5E62] text-[14px] mb-8 text-left">
              เลือกข้อมูลรถยนต์เพื่อดูรายการชิ้นส่วนอะไหล่ที่ตรงรุ่นโดยเฉพาะ
            </p>

            {/* Core Selectors */}
            <div className="flex flex-col gap-4 mb-4">
              {/* Brand */}
              <div className="relative">
                <select
                  id="brand-select"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className={selectClass}
                >
                  <option value="">ยี่ห้อรถ (Brand)</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} ({brand.nameTh})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C5E62]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Model */}
              <div className="relative">
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedBrand}
                  className={selectClass}
                >
                  <option value="">รุ่นรถ (Model)</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.nameTh ? `(${model.nameTh})` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C5E62]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Advanced Filter Toggle */}
            {selectedModel && (
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[#3E6AE1] text-[13px] hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  {showAdvanced ? "💡 ซ่อนตัวเลือกกรองละเอียด" : "🔧 แสดงตัวเลือกกรองละเอียดเพิ่มเติม"}
                </button>
              </div>
            )}

            {/* Advanced Selectors Grid */}
            {selectedModel && showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#F8F9FA] rounded-[12px] border border-[#EEEEEE] mb-6 animate-fade-in">

                {/* Generation */}
                {availableGenerations.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">โฉมรถยนต์ (Generation)</label>
                    <select
                      value={selectedGeneration}
                      onChange={(e) => setSelectedGeneration(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableGenerations.map((gen) => (
                        <option key={gen} value={gen}>
                          {gen}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variant */}
                {availableVariants.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">รุ่นย่อย (Variant)</label>
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableVariants.map((varItem) => (
                        <option key={varItem} value={varItem}>
                          {varItem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Year */}
                {availableYears.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">ปีที่ผลิต (Year)</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fuel Type */}
                {availableFuels.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">เชื้อเพลิง (Fuel)</label>
                    <select
                      value={selectedFuel}
                      onChange={(e) => setSelectedFuel(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableFuels.map((fuel) => (
                        <option key={fuel} value={fuel}>
                          {fuel}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Transmission */}
                {availableTransmissions.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">ระบบเกียร์</label>
                    <select
                      value={selectedTransmission}
                      onChange={(e) => setSelectedTransmission(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableTransmissions.map((trans) => (
                        <option key={trans} value={trans}>
                          {trans}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Body Type */}
                {availableBodies.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">ประเภทตัวถัง</label>
                    <select
                      value={selectedBodyType}
                      onChange={(e) => setSelectedBodyType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableBodies.map((body) => (
                        <option key={body} value={body}>
                          {body}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Color */}
                {availableColors.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">สีที่จำหน่าย</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableColors.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Driven Wheels */}
                {availableDrivenWheels.length > 0 && (
                  <div className="relative">
                    <label className="text-[11px] text-[#8E8E8E] block mb-1">ระบบขับเคลื่อน</label>
                    <select
                      value={selectedDrivenWheels}
                      onChange={(e) => setSelectedDrivenWheels(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">ทั้งหมด</option>
                      {availableDrivenWheels.map((dw) => (
                        <option key={dw} value={dw}>
                          {dw}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              id="search-parts-btn"
              onClick={handleSearch}
              disabled={!selectedBrand || !selectedModel}
              className="btn-tesla-primary w-full disabled:opacity-40 disabled:cursor-not-allowed py-3.5 rounded-[10px] font-medium"
            >
              ค้นหาอะไหล่ที่เข้ากันได้
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Car Preview */}
        <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-[380px] transition-all duration-330">
          
          {/* Top Info Area */}
          <div className="flex justify-between items-start w-full z-10">
            <div>
              {currentBrandInfo ? (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E8E8E] font-medium">
                    {currentBrandInfo.name}
                  </span>
                  <h3 className="text-[#171A20] text-[18px] md:text-[20px] font-medium leading-tight mt-0.5">
                    {currentModelInfo ? `${currentBrandInfo.name} ${currentModelInfo.name}` : "เลือกรุ่นรถยนต์"}
                  </h3>
                  {currentModelInfo && (
                    <p className="text-[12px] text-[#5C5E62] mt-1">
                      ปีผลิต {currentModelInfo.year} · {currentModelInfo.type.toUpperCase()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E8E8E] font-medium">
                    PREVIEW
                  </span>
                  <h3 className="text-[#171A20] text-[18px] md:text-[20px] font-medium leading-tight mt-0.5">
                    เลือกรถยนต์ของคุณ
                  </h3>
                </div>
              )}
            </div>

            {/* Brand Logo */}
            {currentBrandInfo?.logo && (
              <div className="relative w-14 h-14 flex items-center justify-center">
                <Image
                  src={currentBrandInfo.logo}
                  alt={`${currentBrandInfo.name} logo`}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Center Image/Silhouette Display */}
          <div className="flex-1 flex items-center justify-center py-2 w-full z-10 relative">
            {hasRealImage ? (
              <div className="relative w-full h-full min-h-[220px] md:min-h-[280px] flex items-center justify-center transition-all duration-[330ms] transform hover:scale-[1.03]">
                <Image
                  src={realImagePath}
                  alt={`${currentBrandInfo?.name} ${currentModelInfo?.name}`}
                  fill
                  className="object-contain"
                  priority
                />
                {/* Floor shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[12px] bg-black/10 rounded-full blur-[8px]" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center w-full animate-fade-in">
                {currentBrandInfo ? (
                  <div className="w-full flex justify-center opacity-85">
                    {renderVehicleSilhouette(modelType)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-full flex justify-center opacity-30 mb-4">
                      <SedanSilhouette />
                    </div>
                    <p className="text-[#8E8E8E] text-[13px] font-normal">
                      เลือกยี่ห้อและรุ่นรถยนต์เพื่อดูตัวอย่างจำลอง
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Metainfo */}
          <div className="border-t border-[#EEEEEE] pt-4 mt-2 flex justify-between items-center text-[12px] text-[#8E8E8E] z-10">
            <span>
              {hasRealImage ? "✨ ภาพถ่ายสินค้าจริง" : "📐 โมเดลจำลองดีไซน์ 50:50"}
            </span>
            {currentModelInfo && (
              <span className="text-[#3E6AE1] font-medium">
                พร้อมแสดงชิ้นส่วนตรงสเปก
              </span>
            )}
          </div>

          {/* Background Watermark */}
          {!hasRealImage && currentBrandInfo?.logo && (
            <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-5 pointer-events-none select-none">
              <Image
                src={currentBrandInfo.logo}
                alt=""
                fill
                className="object-contain filter grayscale"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
