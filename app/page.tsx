import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CarSelector from "@/components/CarSelector";
import HeroSlider from "@/components/HeroSlider";
import { getBrands } from "@/lib/db";

export const metadata: Metadata = {
  title: "AraiRod.com | อะไหล่รถยนต์ทุกยี่ห้อ ราคาถูก ส่งฟรีทั่วไทย",
  description:
    "ค้นหาอะไหล่รถยนต์ทุกยี่ห้อ Toyota, Honda, Isuzu, Mazda, Ford ราคาถูกที่สุด สั่งซื้อผ่าน Shopee Lazada พร้อมคำแนะนำ DIY",
};

const recentArticles = [
  {
    slug: "diy-brake-pad-toyota-camry",
    title: "วิธีเปลี่ยนผ้าเบรก Toyota Camry ด้วยตัวเอง ประหยัดกว่าอู่ 60%",
    category: "DIY",
    readTime: "8 นาที",
    date: "15 มิ.ย. 2567",
    image: "/images/articles/brake-pad.jpg",
  },
  {
    slug: "shock-absorber-warning-signs",
    title: "5 สัญญาณโช้คอัพเสื่อม ที่เจ้าของรถทุกคนควรรู้",
    category: "ความรู้",
    readTime: "5 นาที",
    date: "12 มิ.ย. 2567",
    image: "/images/articles/shock-absorber.jpg",
  },
  {
    slug: "oem-vs-aftermarket-parts",
    title: "อะไหล่แท้ vs อะไหล่เทียบ ซื้ออะไรดีกว่า?",
    category: "เปรียบเทียบ",
    readTime: "6 นาที",
    date: "10 มิ.ย. 2567",
    image: "/images/articles/oem-vs-aftermarket.jpg",
  },
];

export default async function HomePage() {
  const brandsData = await getBrands();
  const popularOrder = ["toyota", "honda", "isuzu", "mazda", "ford", "mitsubishi"];
  const popularBrands = brandsData
    .filter((brand: any) => brand.logo && brand.logo !== "")
    .sort((a: any, b: any) => {
      const indexA = popularOrder.indexOf(a.id.toLowerCase());
      const indexB = popularOrder.indexOf(b.id.toLowerCase());
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* ── SECTION 1: Tesla Slider ── */}
      <HeroSlider />

      {/* ── SECTION 2: Car Selector ── */}
      <section id="search" className="py-16 bg-white border-b border-[#EEEEEE]">
        <div className="max-w-[1383px] mx-auto px-6">
          <CarSelector />
        </div>
      </section>

      {/* ── SECTION 3: Popular Brands ── */}
      <section className="py-20 bg-[#F4F4F4] border-b border-[#EEEEEE]">
        <div className="max-w-[1383px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#171A20] text-[30px] md:text-[32px] font-medium mb-3">
              ยี่ห้อยอดนิยม
            </h2>
            <p className="text-[#5C5E62] text-[14px]">เลือกยี่ห้อรถเพื่อดูรายการชิ้นส่วนอะไหล่ทั้งหมด</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {popularBrands.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/${brand.id}`}
                id={`brand-${brand.id}`}
                className="group bg-white border border-[#EEEEEE] hover:border-[#3E6AE1] rounded-[12px] p-6 text-center transition-[border-color] duration-[330ms] overflow-hidden"
              >
                {/* Logo image */}
                <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain transition-transform duration-[330ms] group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-[22px] font-medium text-[#171A20] group-hover:text-[#3E6AE1] transition-colors duration-[330ms]">
                      {brand.name.substring(0, 2)}
                    </span>
                  )}
                </div>
                <h3 className="tesla-product-name text-[#171A20]">{brand.name}</h3>
                <p className="text-[#8E8E8E] text-[12px] mt-1">{brand.models.length} รุ่น</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/brands" className="tesla-text-link text-[#5C5E62]">
              ดูยี่ห้อรถทั้งหมดทั้งหมด ➔
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: How It Works ── */}
      <section className="py-20 bg-white border-b border-[#EEEEEE]">
        <div className="max-w-[1383px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#171A20] text-[30px] md:text-[32px] font-medium mb-3">
              ขั้นตอนการทำงาน
            </h2>
            <p className="text-[#5C5E62] text-[14px]">ค้นหาอะไหล่ที่ถูกต้องใน 3 ขั้นตอนง่ายๆ</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-6 lg:gap-10">
            {[
              {
                step: "01",
                title: "เลือกรถย่อยของคุณ",
                desc: "เลือกยี่ห้อ รุ่น โฉมปี เกียร์ หรือสีรถยนต์ เพื่อคัดกรองอะไหล่ที่รองรับโดยเฉพาะ",
              },
              {
                step: "02",
                title: "เลือกส่วนที่ต้องการซ่อม",
                desc: "คลิกเลือกหมวดหมู่ชิ้นส่วน เช่น เครื่องยนต์ ระบบเบรก ระบบไฟ หรือระบบระบายความร้อน",
              },
              {
                step: "03",
                title: "เปรียบเทียบราคาและสั่งซื้อ",
                desc: "เปรียบเทียบราคาและข้อเสนอจาก Shopee และ Lazada แล้วกดสั่งซื้อได้ทันที",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="w-[280px] h-[280px] lg:w-[320px] lg:h-[320px] rounded-full border border-[#EEEEEE] bg-[#F8F9FA] hover:border-[#3E6AE1] hover:bg-white transition-all duration-[330ms] flex flex-col justify-center items-center text-center p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
              >
                <span className="text-[#3E6AE1] text-[28px] lg:text-[32px] font-medium mb-2">{item.step}</span>
                <h3 className="text-[#171A20] text-[16px] lg:text-[18px] font-medium mb-3">{item.title}</h3>
                <p className="text-[#5C5E62] text-[12px] lg:text-[13px] leading-relaxed px-3">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/brands" className="btn-tesla-primary">
              เริ่มค้นหาชิ้นส่วนอะไหล่
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Blog Articles ── */}
      <section className="py-20 bg-[#F4F4F4]">
        <div className="max-w-[1383px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#171A20] text-[30px] md:text-[32px] font-medium mb-3">
              บทความและคู่มือการดูแล
            </h2>
            <p className="text-[#5C5E62] text-[14px]">เคล็ดลับการบำรุงรักษารถและ DIY เปลี่ยนอะไหล่ได้ด้วยตนเอง</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                id={`article-${article.slug.substring(0, 20)}`}
                className="group bg-white border border-[#EEEEEE] hover:border-[#D0D1D2] rounded-[12px] overflow-hidden transition-[border-color] duration-[330ms] block"
              >
                {/* Article image */}
                <div className="w-full aspect-video bg-[#EEEEEE] flex items-center justify-center relative overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-[330ms] group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <span className="text-5xl opacity-20">📖</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#3E6AE1] text-[12px] font-medium">{article.category}</span>
                    <span className="text-[#8E8E8E] text-[12px]">{article.readTime}</span>
                  </div>
                  <h3 className="tesla-product-name text-[#171A20] mb-2 group-hover:text-[#3E6AE1] transition-colors duration-[330ms] leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-[#8E8E8E] text-[12px]">{article.date}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog" className="tesla-text-link text-[#5C5E62]">
              ดูบทความทั้งหมด ➔
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AraiRod.com",
            url: "https://arairod.com",
            description: "รวมอะไหล่รถยนต์ทุกยี่ห้อในไทย ราคาถูก",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://arairod.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </div>
  );
}
