import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBrands } from "@/lib/db";

export const metadata: Metadata = {
  title: "อะไหล่รถยนต์ทุกยี่ห้อในไทย | AraiRod.com",
  description: "เลือกยี่ห้อรถเพื่อค้นหาอะไหล่ที่ถูกต้อง Toyota, Honda, Isuzu, Mazda, Ford, Mitsubishi",
};

const typeIcons: Record<string, string> = {
  sedan: "Sedan", suv: "SUV", pickup: "Pickup", hatchback: "Hatchback", mpv: "MPV",
};

export default async function BrandsPage() {
  const brandsData = await getBrands();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#F4F4F4] pt-28 pb-14 px-6 text-center">
        <h1 className="text-[#171A20] text-[40px] font-medium mb-3">ยี่ห้อรถยนต์</h1>
        <p className="text-[#5C5E62] text-[14px]">เลือกยี่ห้อเพื่อดูรายการรุ่นและอะไหล่ที่รองรับ</p>
      </section>

      {/* Brands — Tesla vehicle card style */}
      <section className="max-w-[1383px] mx-auto px-6 py-16">
        <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-10 flex-wrap">
          <Link href="/" className="tesla-text-link text-[#8E8E8E]">หน้าแรก</Link>
          <span className="text-[#EEEEEE]">/</span>
          <span className="text-[#171A20]">ยี่ห้อรถ</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brandsData.map((brand) => (
            <Link
              key={brand.id}
              href={`/${brand.id}`}
              id={`brand-card-${brand.id}`}
              className="group border border-[#EEEEEE] hover:border-[#D0D1D2] rounded-[12px] overflow-hidden transition-[border-color] duration-[330ms] block"
            >
              {/* Image area */}
              <div className="relative w-full aspect-video bg-[#F4F4F4] flex items-center justify-center p-8">
                {brand.logo ? (
                  <div className="relative w-full h-16">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain transition-transform duration-[330ms] group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <span className="text-[48px] font-medium text-[#D0D1D2] group-hover:text-[#3E6AE1] transition-colors duration-[330ms]">
                    {brand.name.substring(0, 2)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 border-t border-[#EEEEEE]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="tesla-product-name text-[#171A20]">{brand.name}</h2>
                    <p className="text-[#8E8E8E] text-[13px]">{brand.nameTh} · {brand.models.length} รุ่น</p>
                  </div>
                  <span className="text-[#3E6AE1] text-[13px] group-hover:underline">ดูรุ่น →</span>
                </div>

                <p className="text-[#5C5E62] text-[13px] leading-relaxed mb-4 line-clamp-2">{brand.description}</p>

                <div className="flex flex-wrap gap-2">
                  {brand.models.slice(0, 3).map((m) => (
                    <span key={m.id} className="text-[12px] text-[#5C5E62] border border-[#EEEEEE] px-2 py-1 rounded-[4px]">
                      {m.name} · {typeIcons[m.type] || m.type}
                    </span>
                  ))}
                  {brand.models.length > 3 && (
                    <span className="text-[12px] text-[#8E8E8E] border border-[#EEEEEE] px-2 py-1 rounded-[4px]">
                      +{brand.models.length - 3} อื่นๆ
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
