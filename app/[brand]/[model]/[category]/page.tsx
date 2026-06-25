import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PartCard from "@/components/PartCard";
import brandsData from "@/data/brands.json";
import fs from "fs";
import path from "path";

const categoryNames: Record<string, { nameTh: string; nameEn: string; icon: string }> = {
  engine: { nameTh: "เครื่องยนต์", nameEn: "Engine", icon: "⚙️" },
  brake: { nameTh: "ระบบเบรก", nameEn: "Brake System", icon: "🛑" },
  suspension: { nameTh: "ระบบกันสะเทือน", nameEn: "Suspension", icon: "🔧" },
  electrical: { nameTh: "ระบบไฟฟ้า", nameEn: "Electrical", icon: "⚡" },
  exterior: { nameTh: "ตัวถัง & กระจก", nameEn: "Exterior", icon: "🚗" },
  filter: { nameTh: "ฟิลเตอร์ & น้ำมัน", nameEn: "Filter & Fluid", icon: "🧴" },
  transmission: { nameTh: "ระบบส่งกำลัง", nameEn: "Transmission", icon: "⚙️" },
  cooling: { nameTh: "ระบบระบายความร้อน", nameEn: "Cooling", icon: "💧" },
};

async function getPartsData(brand: string, model: string, category: string) {
  try {
    const data = await import(`@/data/parts/${brand}-${model}-${category}.json`);
    return data.default;
  } catch {
    return [];
  }
}

async function getModelData(brand: string, model: string) {
  try {
    const data = await import(`@/data/models/${brand}-${model}.json`);
    return data.default;
  } catch {
    // Fallback: load dynamically from search tree
    try {
      const filePath = path.join(process.cwd(), "data/one2car_search_tree.json");
      const fileContent = fs.readFileSync(filePath, "utf8");
      const searchTree = JSON.parse(fileContent);

      const brandKey = Object.keys(searchTree).find(
        (b) => b.toLowerCase() === brand.toLowerCase()
      );
      if (!brandKey) return null;

      const brandData = searchTree[brandKey];
      const modelKey = Object.keys(brandData).find((m) => {
        const mData = brandData[m];
        const modelSlug = mData.Model_Slug || m;
        const simpleSlug = modelSlug.split("/").pop() || "";
        return (
          m.toLowerCase() === model.toLowerCase() ||
          simpleSlug.toLowerCase() === model.toLowerCase()
        );
      });

      if (!modelKey) return null;

      const mData = brandData[modelKey];
      return {
        id: `${brand}-${model}`,
        brand: brand.toLowerCase(),
        brandName: brandKey,
        model: model.toLowerCase(),
        name: modelKey,
        nameTh: `${brandKey} ${modelKey}`,
        years: mData.Years || [],
        engine: mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : "N/A",
        transmission: mData.Transmissions ? mData.Transmissions.join(" / ") : "N/A",
        type: mData.Body_Types ? mData.Body_Types.join(" / ") : "N/A",
        image: null,
        description: `${brandKey} ${modelKey} ค้นหาสเปกและชิ้นส่วนอะไหล่แท้/เทียบที่ต้องการอย่างถูกต้อง ผ่านตัวเลือกฟิลเตอร์ระบบค้นหาอัจฉวิยะ`,
        specs: {
          length: "N/A",
          width: "N/A",
          height: "N/A",
          wheelbase: "N/A",
          fuelType: mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : "N/A",
          fuelConsumption: "N/A",
          horsePower: "N/A",
          seats: 5,
        },
        categories: [
          { "id": "engine", "nameTh": "เครื่องยนต์", "nameEn": "Engine", "icon": "⚙️", "color": "#ef4444", "partsCount": 24 },
          { "id": "brake", "nameTh": "ระบบเบรก", "nameEn": "Brake System", "icon": "🛑", "color": "#f97316", "partsCount": 18 },
          { "id": "suspension", "nameTh": "ระบบกันสะเทือน", "nameEn": "Suspension", "icon": "🔧", "color": "#eab308", "partsCount": 15 },
          { "id": "electrical", "nameTh": "ระบบไฟฟ้า", "nameEn": "Electrical", "icon": "⚡", "color": "#3b82f6", "partsCount": 20 },
          { "id": "exterior", "nameTh": "ตัวถัง & กระจก", "nameEn": "Exterior & Glass", "icon": "🚗", "color": "#8b5cf6", "partsCount": 30 },
          { "id": "filter", "nameTh": "ฟิลเตอร์ & น้ำมัน", "nameEn": "Filter & Fluid", "icon": "🧴", "color": "#10b981", "partsCount": 12 },
          { "id": "transmission", "nameTh": "ระบบส่งกำลัง", "nameEn": "Transmission", "icon": "⚙️", "color": "#6366f1", "partsCount": 10 },
          { "id": "cooling", "nameTh": "ระบบระบายความร้อน", "nameEn": "Cooling System", "icon": "💧", "color": "#0ea5e9", "partsCount": 8 }
        ],
        seo: {
          title: `อะไหล่ ${brandKey} ${modelKey} ทุกโฉมและรุ่นย่อย ราคาถูก | AraiRod.com`,
          description: `แหล่งรวมอะไหล่ ${brandKey} ${modelKey} เปรียบเทียบราคาอะไหล่แท้ อะไหล่เทียบจากช้อปปี้ ลาซาด้า ส่งฟรีทั่วไทย`,
          keywords: [`อะไหล่ ${brandKey} ${modelKey}`, `ราคาอะไหล่ ${modelKey}`, `ซื้ออะไหล่ ${modelKey}`],
        },
        maintenanceTips: [
          "เปลี่ยนถ่ายน้ำมันเครื่องตามระยะเวลาปกติที่แนะนำ",
          "ตรวจสอบระบบผ้าเบรกและจานเบรกเป็นประจำทุก 20,000 กม.",
          "เปลี่ยนไส้กรองอากาศและกรองแอร์ทุก 20,000-40,000 กม.",
          "ตรวจสภาพการสึกหรอของหน้ายางและเช็คลมยางอย่างสม่ำเสมอ",
        ],
      };
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string; category: string }>;
}): Promise<Metadata> {
  const { brand, model, category } = await params;
  const catInfo = categoryNames[category];
  const modelData = await getModelData(brand, model);
  if (!catInfo || !modelData) return { title: "ไม่พบหมวดหมู่นี้" };

  const brandInfo = brandsData.find((b) => b.id === brand);
  const title = `อะไหล่${catInfo.nameTh} ${brandInfo?.name || brand.toUpperCase()} ${modelData.name} ราคาถูก | AraiRod.com`;
  const description = `รวมอะไหล่${catInfo.nameTh}สำหรับ ${modelData.nameTh} ราคาดีที่สุด สั่งซื้อผ่าน Shopee Lazada ส่งฟรีทั่วไทย`;

  return {
    title,
    description,
    alternates: { canonical: `https://arairod.com/${brand}/${model}/${category}` },
  };
}

export default async function PartsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; model: string; category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { brand, model, category } = await params;
  const sParams = await searchParams;
  
  const catInfo = categoryNames[category];
  if (!catInfo) notFound();

  const [parts, modelData] = await Promise.all([
    getPartsData(brand, model, category),
    getModelData(brand, model),
  ]);

  if (!modelData) notFound();

  const brandInfo = brandsData.find((b) => b.id === brand);
  const brandName = brandInfo?.name || brand.toUpperCase();
  const modelName = modelData.name;

  // Extract filter parameters for customization
  const generation = typeof sParams.generation === "string" ? sParams.generation : "";
  const variant = typeof sParams.variant === "string" ? sParams.variant : "";
  const year = typeof sParams.year === "string" ? sParams.year : "";
  const transmission = typeof sParams.transmission === "string" ? sParams.transmission : "";
  const fuel = typeof sParams.fuel === "string" ? sParams.fuel : "";

  // Dynamic search keyword construction for empty list fallbacks
  // E.g. "อะไหล่เครื่องยนต์ Toyota Camry ACV70 เกียร์อัตโนมัติ"
  // Clean generation string to remove year range if we want cleaner keywords, or just include it
  const cleanGen = generation ? generation.split(" (ปี")[0].trim() : "";
  const searchKeyword = `อะไหล่${catInfo.nameTh} ${brandName} ${modelName} ${cleanGen} ${variant} ${transmission}`.replace(/\s+/g, " ").trim();

  const shopeeSearchUrl = `https://shopee.co.th/search?keyword=${encodeURIComponent(searchKeyword)}`;
  const lazadaSearchUrl = `https://www.lazada.co.th/catalog/?q=${encodeURIComponent(searchKeyword)}`;

  const breadcrumbs = [
    { label: "หน้าแรก", href: "/" },
    { label: brandName, href: `/${brand}` },
    { label: modelName, href: `/${brand}/${model}` },
    { label: catInfo.nameTh, href: `/${brand}/${model}/${category}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-20 bg-white">
        <div className="max-w-[1383px] mx-auto px-6 pt-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-8 flex-wrap">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#EEEEEE]">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-[#171A20]">{bc.label}</span>
                ) : (
                  <Link href={bc.href} className="tesla-text-link text-[#8E8E8E]">
                    {bc.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Title */}
          <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#EEEEEE]">
            <div>
              <p className="text-[#5C5E62] text-[14px] mb-1">
                {modelData.nameTh} {cleanGen ? `โฉม ${cleanGen}` : ""}
              </p>
              <h1 className="text-[#171A20] text-[32px] font-medium">
                {catInfo.icon} {catInfo.nameTh}
              </h1>
            </div>
            <p className="text-[#8E8E8E] text-[14px]">
              {parts.length > 0 ? `${parts.length} รายการ` : "ดึงลิงก์ซื้ออะไหล่ด่วน"}
            </p>
          </div>

          {/* Category tabs */}
          {modelData.categories && (
            <div className="flex flex-wrap gap-2 mb-10">
              {modelData.categories.map((cat: { id: string; nameTh: string; icon: string }) => (
                <Link
                  key={cat.id}
                  href={`/${brand}/${model}/${cat.id}`}
                  className={`px-4 py-2 text-[13px] rounded-[4px] border transition-[background-color,border-color,color] duration-[330ms] ${
                    cat.id === category
                      ? "bg-[#3E6AE1] text-white border-[#3E6AE1]"
                      : "bg-white text-[#393C41] border-[#D0D1D2] hover:border-[#3E6AE1] hover:text-[#3E6AE1]"
                  }`}
                >
                  {cat.icon} {cat.nameTh}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Parts Grid or Fallback Dynamic Affiliate Search Card */}
      <div className="max-w-[1383px] mx-auto px-6 pb-20">
        {/* Affiliate notice */}
        <div className="border-l-4 border-[#3E6AE1] pl-4 py-2 mb-8">
          <p className="text-[#5C5E62] text-[13px]">
            ระบบค้นหาด่วนแบบเปรียบเทียบราคา AraiRod.com ร่วมมือกับพันธมิตรร้านค้าเพื่อส่งมอบสินค้าที่ดีที่สุดแก่คุณ
          </p>
        </div>

        {parts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#EEEEEE] border border-[#EEEEEE] rounded-[4px] overflow-hidden">
            {parts.map((part: Parameters<typeof PartCard>[0]["part"]) => (
              <div key={part.id} className="bg-white">
                <PartCard part={part} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#EEEEEE] rounded-[8px] py-16 px-8 text-center max-w-2xl mx-auto bg-[#F8F9FA]">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-[#171A20] text-[20px] font-medium mb-3">
              ค้นหาอะไหล่ {catInfo.nameTh} สำหรับ {brandName} {modelName}
            </h2>
            <p className="text-[#5C5E62] text-[14px] leading-relaxed mb-6">
              เนื่องจากเรายังไม่มีรายการสินค้าชิ้นส่วน {catInfo.nameTh} ของรุ่นนี้ระบุในระบบต้นทางโดยตรง 
              แต่คุณสามารถเปรียบเทียบราคาและเลือกซื้อชิ้นส่วนแท้/เทียบที่เข้ากันได้จาก Shopee และ Lazada ผ่านลิงก์ค้นหาด่วนที่เราจัดสรรคำค้นหาให้ตรงรุ่นของคุณได้ทันที:
            </p>
            
            <div className="bg-white p-4 border border-[#EEEEEE] rounded-[4px] mb-8">
              <span className="text-[11px] text-[#8E8E8E] block mb-1">คำค้นหาแนะนำ</span>
              <strong className="text-[#171A20] text-[15px] font-medium font-mono">{searchKeyword}</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <a
                href={shopeeSearchUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-tesla-primary justify-center px-8 py-3 rounded-[4px] font-medium text-[14px]"
              >
                ค้นหาใน Shopee ➔
              </a>
              <a
                href={lazadaSearchUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-tesla-secondary-dark border border-[#D0D1D2] justify-center px-8 py-3 rounded-[4px] font-medium text-[14px]"
              >
                ค้นหาใน Lazada ➔
              </a>
            </div>

            <Link href={`/${brand}/${model}`} className="tesla-text-link text-[#5C5E62] text-[13px]">
              ← กลับไปเลือกหมวดหมู่อะไหล่อื่น
            </Link>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link href={`/${brand}/${model}`} className="tesla-text-link text-[#5C5E62]">
            ← กลับไปดูผังรถ {modelName}
          </Link>
        </div>
      </div>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((bc, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: bc.label,
              item: `https://arairod.com${bc.href}`,
            })),
          }),
        }}
      />
    </div>
  );
}
