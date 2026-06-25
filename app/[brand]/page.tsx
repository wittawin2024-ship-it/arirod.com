import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/db";

const modelsWithImages = ["toyota-camry", "honda-civic", "isuzu-d-max"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const brandInfo = await getBrand(brand);
  if (!brandInfo) return { title: "ไม่พบยี่ห้อนี้" };

  return {
    title: `อะไหล่ ${brandInfo.name} (${brandInfo.nameTh}) ทุกรุ่น ราคาถูก | AraiRod.com`,
    description: `${brandInfo.description} ค้นหาอะไหล่ ${brandInfo.name} ทุกรุ่น ราคาดีที่สุด`,
    alternates: { canonical: `https://arairod.com/${brand}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const brandInfo = await getBrand(brand);
  if (!brandInfo) notFound();

  const typeIcons: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    pickup: "Pickup",
    hatchback: "Hatchback",
    mpv: "MPV",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative w-full min-h-[50vh] bg-[#F4F4F4] flex flex-col items-center justify-center pt-24 pb-12 px-6">
        {brandInfo.logo && (
          <div className="relative w-20 h-20 mb-4">
            <Image
              src={brandInfo.logo}
              alt={`${brandInfo.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <p className="text-[#8E8E8E] text-[14px] mb-2">AraiRod / {brandInfo.name}</p>
        <h1 className="text-[#171A20] text-[40px] font-medium mb-2">{brandInfo.name}</h1>
        <p className="text-[#5C5E62] text-[14px] max-w-xl text-center leading-relaxed">{brandInfo.description}</p>
      </section>

      {/* Models */}
      <section className="max-w-[1383px] mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-10 flex-wrap">
          <Link href="/" className="tesla-text-link text-[#8E8E8E]">หน้าแรก</Link>
          <span className="text-[#EEEEEE]">/</span>
          <Link href="/brands" className="tesla-text-link text-[#8E8E8E]">ยี่ห้อรถ</Link>
          <span className="text-[#EEEEEE]">/</span>
          <span className="text-[#171A20]">{brandInfo.name}</span>
        </nav>

        <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-[#EEEEEE]">
          <h2 className="text-[#171A20] text-[24px] font-medium">รุ่น {brandInfo.name}</h2>
          <p className="text-[#8E8E8E] text-[14px]">{brandInfo.models.length} รุ่น</p>
        </div>

        {/* Vehicle card grid — Tesla style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {brandInfo.models.map((model: any) => (
            <Link
              key={model.id}
              href={`/${brand}/${model.id}`}
              id={`model-${model.id}`}
              className="group text-center"
            >
              {/* Car image (real photo if available, otherwise fallback emoji) */}
              <div className="relative w-full aspect-video bg-[#F4F4F4] flex items-center justify-center mb-4 rounded-[4px] overflow-hidden">
                {modelsWithImages.includes(`${brand}-${model.id}`) ? (
                  <Image
                    src={`/images/cars/${brand}-${model.id}-v2.png`}
                    alt={model.name}
                    fill
                    className="object-contain p-2 transition-transform duration-[330ms] group-hover:scale-105"
                  />
                ) : (
                  <span className="text-5xl opacity-25">🚗</span>
                )}
              </div>

              <h3 className="tesla-product-name text-[#171A20] mb-1">{model.name}</h3>
              <p className="text-[#8E8E8E] text-[13px] mb-3">{typeIcons[model.type] || model.type} · {model.year}</p>

              <div className="flex items-center justify-center gap-6">
                <span className="tesla-text-link text-[#5C5E62] group-hover:text-[#3E6AE1]">
                  ดูอะไหล่
                </span>
                <span className="tesla-text-link text-[#5C5E62]">
                  สั่งซื้อ
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO content */}
        <div className="mt-20 pt-12 border-t border-[#EEEEEE]">
          <h2 className="text-[#171A20] text-[20px] font-medium mb-4">เกี่ยวกับอะไหล่ {brandInfo.name} ในประเทศไทย</h2>
          <p className="text-[#5C5E62] text-[14px] leading-relaxed max-w-3xl">
            {brandInfo.description} AraiRod.com รวบรวมอะไหล่ {brandInfo.name} ทุกรุ่น ทั้งอะไหล่แท้และเทียบคุณภาพสูง
            พร้อมราคาเปรียบเทียบจาก Shopee และ Lazada เพื่อให้คุณเลือกซื้อได้ในราคาดีที่สุด
          </p>
        </div>
      </section>
    </div>
  );
}
