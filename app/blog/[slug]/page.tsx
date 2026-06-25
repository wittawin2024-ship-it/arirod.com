import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

// ─── Article Data (ASCII slugs only) ────────────────────────────────────────
const articles: Record<string, {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  brand?: string;
  model?: string;
  sections: {
    heading?: string;
    subheading?: string;
    body: string;
    type?: "warning" | "tip" | "list";
    items?: string[];
  }[];
}> = {

  // ─── บทความ 1: ผ้าเบรก ─────────────────────────────────────────────────────
  "diy-brake-pad-toyota-camry": {
    title: "วิธีเปลี่ยนผ้าเบรก Toyota Camry ด้วยตัวเอง ประหยัดกว่าอู่ 60%",
    excerpt: "การเปลี่ยนผ้าเบรกเองไม่ใช่เรื่องยาก ทำตามขั้นตอนนี้ได้เลย ประหยัดค่าแรงได้มากถึง 500–1,500 บาท",
    date: "15 มิถุนายน 2567",
    readTime: "8 นาที",
    category: "DIY",
    tags: ["ผ้าเบรก", "Toyota Camry", "DIY", "ประหยัดค่าซ่อม"],
    image: "/images/articles/brake-pad.jpg",
    brand: "toyota",
    model: "camry",
    sections: [
      {
        heading: "ทำไมต้องเปลี่ยนผ้าเบรกเอง?",
        body: "การเปลี่ยนผ้าเบรกที่อู่จะมีค่าแรงประมาณ 500–1,500 บาทต่อครั้ง หากทำเองได้คุณจะประหยัดได้มากถึง 60% นอกจากนี้ยังรู้แน่ชัดว่าอะไหล่ที่ใช้มีคุณภาพดีแค่ไหน และสามารถเลือกแบรนด์ที่ไว้ใจได้เอง",
      },
      {
        heading: "อุปกรณ์ที่ต้องการ",
        body: "",
        type: "list",
        items: [
          "ผ้าเบรกหน้า สำหรับ Toyota Camry (รหัส 04465-33471)",
          "แม่แรงตั้งพื้น (Floor Jack)",
          "สแตนด์รองรถ 2 ตัว",
          "ประแจ 10mm, 12mm, 14mm",
          "ไขควงปากแบน",
          "ปืนอัดจาระบี (ไม่บังคับ)",
        ],
      },
      {
        heading: "ขั้นตอนการเปลี่ยน",
        body: "",
      },
      {
        subheading: "1. เตรียมรถ",
        body: "จอดรถบนพื้นราบ ดึงเบรกมือ และสวมถุงมือยางเพื่อความปลอดภัย ปิดเครื่องยนต์แล้วรอให้ระบบเบรกเย็นลงก่อนอย่างน้อย 30 นาที",
      },
      {
        subheading: "2. ยกรถและถอดล้อ",
        body: "ใช้แม่แรงยกรถบริเวณจุด Jack Point ที่ถูกต้อง วางสแตนด์รองไว้ให้มั่นคง แล้วถอดน็อตล้อออกด้วยประแจ จากนั้นดึงล้อออกมาวางข้างๆ",
      },
      {
        subheading: "3. ถอดปั๊มเบรก (Caliper)",
        body: "ถอดน็อต 2 ตัวที่ยึดปั๊มเบรก ค่อยๆ ดึงออกมา ระวังอย่าให้สายเบรกน้ำมันรับน้ำหนักของปั๊ม ใช้เชือกหรือลวดแขวนไว้กับสปริงช่วงล่าง",
      },
      {
        subheading: "4. ถอดผ้าเบรกเก่า",
        body: "ดันผ้าเบรกออกจากปั๊ม สังเกตความหนาที่เหลือ — ถ้าน้อยกว่า 3mm ต้องเปลี่ยนทันที หากผ้าเบรกหนาพอแต่มีรอยแตกร้าวหรือผิวไม่สม่ำเสมอก็ควรเปลี่ยนเช่นกัน",
      },
      {
        subheading: "5. ดันลูกสูบปั๊มเบรกกลับ",
        body: "ใช้ไขควงปากแบนหรือ C-Clamp ค่อยๆ ดันลูกสูบกลับเข้า ก่อนทำเปิดฝาถังน้ำมันเบรกก่อนเสมอ เพราะน้ำมันจะไหลกลับขึ้นถัง ซับน้ำมันที่ล้นออกมาทันที",
      },
      {
        subheading: "6. ใส่ผ้าเบรกใหม่",
        body: "ทาจาระบีเล็กน้อยที่ขอบสัมผัสระหว่างผ้าเบรกกับ Caliper Bracket ใส่ผ้าเบรกใหม่เข้าที่ให้แน่ใจว่าเข้าร่องถูกต้องและแน่นดีก่อนประกอบปั๊มกลับ",
      },
      {
        subheading: "7. ประกอบและทดสอบ",
        body: "ประกอบปั๊มเบรก → ใส่ล้อ → ขันน็อตตามแรงบิดมาตรฐาน (85–115 Nm) ก่อนขับออก กดเบรกหลายๆ ครั้งจนรู้สึกว่าแป้นเบรกแข็งขึ้น เพื่อให้ลูกสูบดันผ้าเบรกออกมาชิดจานเบรก",
      },
      {
        body: "ตรวจสอบระดับน้ำมันเบรกหลังเปลี่ยน และทดสอบเบรกในที่ปลอดภัยก่อนออกถนน ควรเปลี่ยนพร้อมกันทั้งหน้าหรือทั้งหลัง ไม่ควรเปลี่ยนเพียงข้างเดียว",
        type: "warning",
      },
      {
        heading: "ราคาผ้าเบรกโดยประมาณ",
        body: "",
        type: "list",
        items: [
          "ผ้าเบรกแท้ Toyota: 1,500–2,500 บาท/ชุด",
          "ผ้าเบรกเทียบ แบรนด์ดี (Akebono, Brembo): 600–1,200 บาท/ชุด",
          "ค่าแรงเปลี่ยนที่อู่: 500–1,500 บาท",
        ],
      },
      {
        body: "เลือกผ้าเบรกเทียบแบรนด์ที่เชื่อถือได้เพื่อประหยัดค่าใช้จ่าย โดยไม่เสียประสิทธิภาพการเบรก",
        type: "tip",
      },
    ],
  },

  // ─── บทความ 2: โช้คอัพ ─────────────────────────────────────────────────────
  "shock-absorber-warning-signs": {
    title: "5 สัญญาณโช้คอัพเสื่อม ที่เจ้าของรถทุกคนควรรู้",
    excerpt: "โช้คอัพเสื่อมส่งผลต่อความปลอดภัยในการขับขี่โดยตรง รู้จักสัญญาณเตือนก่อนที่จะสายเกินไป",
    date: "12 มิถุนายน 2567",
    readTime: "5 นาที",
    category: "ความรู้",
    tags: ["โช้คอัพ", "ระบบกันสะเทือน", "ความปลอดภัย", "อาการเสีย"],
    image: "/images/articles/shock-absorber.jpg",
    sections: [
      {
        heading: "โช้คอัพคืออะไร และสำคัญแค่ไหน?",
        body: "โช้คอัพ (Shock Absorber) เป็นชิ้นส่วนสำคัญในระบบกันสะเทือน ทำหน้าที่ดูดซับแรงกระแทกจากผิวถนนขรุขระ ช่วยให้ล้อสัมผัสถนนตลอดเวลาแม้วิ่งผ่านหลุมหรือสิ่งกีดขวาง ส่งผลต่อการควบคุมรถ ความสะดวกสบาย และความปลอดภัยโดยตรง",
      },
      {
        heading: "5 สัญญาณที่บอกว่าโช้คอัพเสื่อม",
        body: "",
      },
      {
        subheading: "🚗 1. รถโยกมากขณะเลี้ยวหรือเบรกกะทันหัน",
        body: "รู้สึกว่ารถเซไปข้างใดข้างหนึ่งมากผิดปกติเมื่อเลี้ยว หรือหน้ารถทิ่มลงมากเมื่อเบรกกะทันหัน นั่นหมายความว่าโช้คอัพไม่สามารถรับน้ำหนักถ่ายเทได้ตามปกติแล้ว",
      },
      {
        subheading: "💧 2. มีคราบน้ำมันรั่วที่ตัวโช้คอัพ",
        body: "โช้คอัพทำงานด้วยน้ำมันไฮดรอลิก หากซีลยางเสื่อมสภาพจะมีน้ำมันรั่วออกมาเป็นคราบรอบๆ ตัวโช้ค สัญญาณนี้บ่งชี้ว่าต้องเปลี่ยนโดยด่วน",
      },
      {
        subheading: "🔊 3. เสียงดัง 'ตูม ตูม' ขณะขับผ่านหลุมบ่อ",
        body: "เสียงกระแทกดังผิดปกติเมื่อขับผ่านพื้นที่ขรุขระหรือสะพานลิง อาจเกิดจากโช้คอัพสึกหรอหรือตัวยึด (Bush) ชำรุด ทำให้รถโยกตัวมากกว่าปกติ",
      },
      {
        subheading: "🏁 4. ยางสึกไม่สม่ำเสมอแบบลายคลื่น",
        body: "หากโช้คอัพเสื่อม ล้อจะไม่กดถนนอย่างสม่ำเสมอ ทำให้ยางสึกแบบลายคลื่นหรือสึกเฉพาะบางจุด ซึ่งนอกจากเป็นอันตรายแล้วยังทำให้ต้องเปลี่ยนยางเร็วกว่าปกติ",
      },
      {
        subheading: "⏱️ 5. อายุการใช้งานเกิน 80,000 กม.",
        body: "โช้คอัพทั่วไปมีอายุการใช้งานประมาณ 60,000–100,000 กม. ขึ้นอยู่กับสภาพถนนและพฤติกรรมการขับขี่ ควรตรวจสอบสภาพเมื่อถึงระยะนี้แม้ยังไม่มีอาการชัดเจน",
      },
      {
        heading: "ผลกระทบถ้าปล่อยไว้ไม่เปลี่ยน",
        body: "โช้คอัพเสื่อมส่งผลต่อระยะเบรกสูงถึง 20% ซึ่งในกรณีฉุกเฉิน 20% นี้อาจหมายถึงความแตกต่างระหว่างเกิดอุบัติเหตุหรือไม่เกิด นอกจากนี้ยังทำให้ชิ้นส่วนอื่นในระบบกันสะเทือนเสื่อมเร็วขึ้น เช่น ลูกหมาก ยางบุช และจานเบรก",
      },
      {
        body: "หากพบสัญญาณใดสัญญาณหนึ่งข้างต้น ไม่ควรเสี่ยงขับต่อ ควรนำรถเข้าตรวจทันที",
        type: "warning",
      },
      {
        heading: "ราคาโช้คอัพโดยประมาณ",
        body: "",
        type: "list",
        items: [
          "อะไหล่แท้ (OEM): 2,500–6,000 บาท/คู่",
          "อะไหล่เทียบ คุณภาพดี (Monroe, KYB, Bilstein): 1,200–3,000 บาท/คู่",
          "ค่าแรงเปลี่ยน: 500–1,500 บาท/คู่",
        ],
      },
    ],
  },

  // ─── บทความ 3: แท้ vs เทียบ ────────────────────────────────────────────────
  "oem-vs-aftermarket-parts": {
    title: "อะไหล่แท้ vs อะไหล่เทียบ ซื้ออะไรดีกว่า?",
    excerpt: "เปรียบราคา คุณภาพ และอายุการใช้งานอย่างละเอียด พร้อมคำแนะนำว่าอะไหล่ตัวไหนควรใช้แท้ และตัวไหนใช้เทียบได้",
    date: "10 มิถุนายน 2567",
    readTime: "6 นาที",
    category: "เปรียบเทียบ",
    tags: ["อะไหล่แท้", "อะไหล่เทียบ", "OEM", "เปรียบเทียบ"],
    image: "/images/articles/oem-vs-aftermarket.jpg",
    sections: [
      {
        heading: "อะไหล่แท้ (OEM) คืออะไร?",
        body: "อะไหล่แท้ (Original Equipment Manufacturer) คืออะไหล่ที่ผลิตโดยผู้ผลิตรถยนต์โดยตรงหรือผู้ผลิตชิ้นส่วนที่ได้รับการรับรองอย่างเป็นทางการ มีมาตรฐานเดียวกับที่ใช้ในโรงงานประกอบรถ ทุกชิ้นผ่านการทดสอบเข้มงวดก่อนออกจำหน่าย",
      },
      {
        heading: "อะไหล่เทียบ (Aftermarket) คืออะไร?",
        body: "อะไหล่เทียบคืออะไหล่ที่ผลิตโดยบริษัทอื่นที่ไม่ใช่เจ้าของรถ โดยออกแบบให้สามารถใช้ทดแทนอะไหล่แท้ได้ มีคุณภาพหลายระดับตั้งแต่คุณภาพต่ำมากจนถึงเทียบเท่าหรือบางครั้งดีกว่าอะไหล่แท้",
      },
      {
        heading: "เปรียบเทียบโดยตรง",
        body: "",
      },
      {
        subheading: "💰 ราคา",
        body: "อะไหล่เทียบมีราคาถูกกว่าอะไหล่แท้โดยเฉลี่ย 30–70% เช่น ผ้าเบรกแท้ Toyota อาจอยู่ที่ 1,800 บาท ในขณะที่อะไหล่เทียบคุณภาพดีอยู่ที่ 600–900 บาท",
      },
      {
        subheading: "🔬 คุณภาพและความพอดี",
        body: "อะไหล่แท้รับประกันความพอดีและประสิทธิภาพตามมาตรฐานของผู้ผลิต อะไหล่เทียบมีความแตกต่างกันมาก ควรเลือกจากแบรนด์ที่มีชื่อเสียง เช่น Bosch, Denso, Brembo หรือ Monroe",
      },
      {
        subheading: "⏳ อายุการใช้งาน",
        body: "โดยทั่วไปอะไหล่แท้มีอายุการใช้งานยาวนานกว่า แต่อะไหล่เทียบคุณภาพดีสามารถใช้งานได้ใกล้เคียงกัน อะไหล่เทียบราคาถูกมักมีอายุสั้นกว่า 30–50%",
      },
      {
        subheading: "📋 การรับประกัน",
        body: "อะไหล่แท้มักมีการรับประกันตามศูนย์บริการ อะไหล่เทียบแบรนด์ดีก็มีการรับประกันเช่นกัน แต่การเคลมอาจซับซ้อนกว่า",
      },
      {
        heading: "อะไหล่ไหนควรใช้แท้ อะไหล่ไหนใช้เทียบได้?",
        body: "ไม่จำเป็นต้องใช้แท้ทุกชิ้น ขึ้นอยู่กับความสำคัญด้านความปลอดภัยและงบประมาณ",
      },
      {
        subheading: "✅ ควรใช้อะไหล่แท้เสมอ",
        body: "",
        type: "list",
        items: [
          "ชิ้นส่วนเกี่ยวกับระบบความปลอดภัย: ถุงลม, ABS, ระบบพวงมาลัย",
          "ชิ้นส่วนที่ต้องการความแม่นยำสูง: เซ็นเซอร์ต่างๆ",
          "รถที่ยังอยู่ในประกัน (ไม่งั้นอาจเสียสิทธิ์)",
        ],
      },
      {
        subheading: "✅ ใช้อะไหล่เทียบได้ (แบรนด์ดี)",
        body: "",
        type: "list",
        items: [
          "ผ้าเบรก (เลือก Bosch, Brembo, Akebono)",
          "กรองน้ำมัน กรองอากาศ (เลือก Denso, Mann)",
          "โช้คอัพ (เลือก Monroe, KYB, Bilstein)",
          "สายพาน ยางปัดน้ำฝน ไฟหน้าไฟท้าย",
        ],
      },
      {
        body: "หลีกเลี่ยงอะไหล่เทียบไร้แบรนด์ราคาถูกมากผิดปกติ เพราะอาจมีคุณภาพต่ำและเป็นอันตราย",
        type: "warning",
      },
      {
        heading: "สรุป: เลือกอย่างไรให้คุ้มค่าที่สุด?",
        body: "ชิ้นส่วนที่เกี่ยวกับความปลอดภัยโดยตรง — เลือกแท้เสมอ ชิ้นส่วนที่สึกหรอตามปกติ — เลือกเทียบแบรนด์ดีได้อย่างมั่นใจ ประหยัดเงินได้มากโดยไม่เสียคุณภาพ",
        type: "tip",
      },
    ],
  },
};

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "ไม่พบบทความ" };
  return {
    title: `${article.title} | AraiRod.com`,
    description: article.excerpt,
    alternates: { canonical: `https://arairod.com/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: `https://arairod.com${article.image}`,
    datePublished: article.date,
    author: { "@type": "Organization", name: "AraiRod.com" },
    publisher: { "@type": "Organization", name: "AraiRod.com", url: "https://arairod.com" },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Image ── */}
      <div className="w-full relative bg-[#F4F4F4] overflow-hidden mt-14" style={{ aspectRatio: "21/8" }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171A20]/55 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className="inline-block bg-[#3E6AE1] text-white text-[12px] font-medium px-3 py-1 rounded-[4px]">
            {article.category}
          </span>
        </div>
      </div>

      <div className="max-w-[780px] mx-auto px-6 py-12">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-[13px] text-[#8E8E8E] mb-8 flex-wrap">
          <Link href="/" className="tesla-text-link text-[#8E8E8E]">หน้าแรก</Link>
          <span className="text-[#D0D1D2]">/</span>
          <Link href="/blog" className="tesla-text-link text-[#8E8E8E]">บทความ</Link>
          <span className="text-[#D0D1D2]">/</span>
          <span className="text-[#393C41] line-clamp-1">{article.title}</span>
        </nav>

        {/* ── Article Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-[#3E6AE1] text-[13px] font-medium">{article.category}</span>
            <span className="text-[#8E8E8E] text-[13px]">⏱ {article.readTime}</span>
            <span className="text-[#8E8E8E] text-[13px]">📅 {article.date}</span>
          </div>
          <h1 className="text-[#171A20] text-[28px] md:text-[34px] font-medium leading-tight mb-5">
            {article.title}
          </h1>
          <p className="text-[#5C5E62] text-[15px] leading-relaxed mb-5">{article.excerpt}</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="text-[12px] bg-[#F4F4F4] text-[#5C5E62] px-3 py-1 rounded-[4px] border border-[#EEEEEE]">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="tesla-divider mb-10" />

        {/* ── Article Body ── */}
        <article className="space-y-5">
          {article.sections.map((section, i) => {
            if (section.type === "warning") {
              return (
                <div key={i} className="border-l-[3px] border-[#F59E0B] bg-[#FFFBEB] px-5 py-4 rounded-r-[8px]">
                  <p className="text-[#92400E] text-[14px] leading-relaxed">⚠️ {section.body}</p>
                </div>
              );
            }
            if (section.type === "tip") {
              return (
                <div key={i} className="border-l-[3px] border-[#3E6AE1] bg-[#EEF2FF] px-5 py-4 rounded-r-[8px]">
                  <p className="text-[#1E3A8A] text-[14px] leading-relaxed">💡 {section.body}</p>
                </div>
              );
            }
            return (
              <div key={i}>
                {section.heading && (
                  <h2 className="text-[#171A20] text-[20px] font-medium mt-10 mb-3 pb-2 border-b border-[#EEEEEE]">
                    {section.heading}
                  </h2>
                )}
                {section.subheading && (
                  <h3 className="text-[#171A20] text-[16px] font-medium mt-6 mb-2">
                    {section.subheading}
                  </h3>
                )}
                {section.body && (
                  <p className="text-[#393C41] text-[14px] leading-[1.8]">{section.body}</p>
                )}
                {section.type === "list" && section.items && (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-[#393C41] text-[14px]">
                        <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#3E6AE1] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </article>

        <div className="tesla-divider mt-12 mb-10" />

        {/* ── Related Parts CTA ── */}
        {article.brand && article.model && (
          <div className="border border-[#3E6AE1]/30 bg-[#F8FAFF] rounded-[12px] p-6 mb-10">
            <h3 className="text-[#171A20] text-[17px] font-medium mb-2">🛒 ดูอะไหล่สำหรับบทความนี้</h3>
            <p className="text-[#5C5E62] text-[14px] mb-4">เปรียบเทียบราคาจาก Shopee และ Lazada พร้อมกด order ได้เลย</p>
            <Link
              href={`/${article.brand}/${article.model}`}
              className="btn-tesla-primary !min-w-0 px-6"
            >
              ดูอะไหล่ {article.brand.toUpperCase()} {article.model.toUpperCase()} →
            </Link>
          </div>
        )}

        {/* ── Footer nav ── */}
        <div className="flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 tesla-text-link text-[#5C5E62] text-[14px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            กลับสู่รายการบทความ
          </Link>
          <Link href="/brands" className="btn-tesla-primary !min-w-0 px-4 !min-h-8 text-xs">
            ค้นหาอะไหล่
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
