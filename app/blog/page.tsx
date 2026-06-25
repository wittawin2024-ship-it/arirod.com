import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "บทความอะไหล่รถยนต์ คู่มือ DIY | AraiRod.com",
  description: "บทความแนะนำวิธีเปลี่ยนอะไหล่รถยนต์เอง ความรู้เรื่องอะไหล่ และเคล็ดลับบำรุงรักษารถยนต์",
};

const articles = [
  {
    slug: "diy-brake-pad-toyota-camry",
    title: "วิธีเปลี่ยนผ้าเบรก Toyota Camry ด้วยตัวเอง ประหยัดกว่าอู่ 60%",
    excerpt: "การเปลี่ยนผ้าเบรกเองไม่ใช่เรื่องยากอย่างที่คิด ทำตามขั้นตอนนี้ได้เลยพร้อมอุปกรณ์ที่จำเป็น",
    category: "DIY",
    readTime: "8 นาที",
    date: "15 มิ.ย. 2567",
    featured: true,
    image: "/images/articles/brake-pad.jpg",
  },
  {
    slug: "shock-absorber-warning-signs",
    title: "5 สัญญาณโช้คอัพเสื่อม ที่เจ้าของรถทุกคนควรรู้",
    excerpt: "โช้คอัพเสื่อมส่งผลต่อความปลอดภัยในการขับขี่ รู้จักสัญญาณเตือนก่อนที่จะสายเกินไป",
    category: "ความรู้",
    readTime: "5 นาที",
    date: "12 มิ.ย. 2567",
    featured: false,
    image: "/images/articles/shock-absorber.jpg",
  },
  {
    slug: "oem-vs-aftermarket-parts",
    title: "อะไหล่แท้ vs อะไหล่เทียบ ซื้ออะไรดีกว่า?",
    excerpt: "เปรียบราคา คุณภาพ และอายุการใช้งานอย่างละเอียด",
    category: "เปรียบเทียบ",
    readTime: "6 นาที",
    date: "10 มิ.ย. 2567",
    featured: false,
    image: "/images/articles/oem-vs-aftermarket.jpg",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[1383px] mx-auto px-6 pt-24 pb-16">
        <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-10 flex-wrap">
          <Link href="/" className="tesla-text-link text-[#8E8E8E]">หน้าแรก</Link>
          <span className="text-[#EEEEEE]">/</span>
          <span className="text-[#171A20]">บทความ</span>
        </nav>

        {/* Article Grid - Uniform 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              id={`article-${article.slug}`}
              className="group border border-[#EEEEEE] hover:border-[#D0D1D2] rounded-[12px] overflow-hidden transition-[border-color] duration-[330ms] block bg-white"
            >
              <div className="aspect-video relative bg-[#F4F4F4] overflow-hidden">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-[330ms] group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[50px] opacity-15">📖</span>
                  </div>
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
                <p className="text-[#5C5E62] text-[13px] leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#EEEEEE]">
                  <span className="text-[#8E8E8E] text-[12px]">{article.date}</span>
                  <span className="tesla-text-link text-[#5C5E62] text-[13px]">อ่าน →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
