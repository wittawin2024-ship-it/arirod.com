interface Part {
  id: string;
  nameTh: string;
  nameEn: string;
  brand: string;
  aftermarketBrand: string;
  partNumber: string;
  description: string;
  priceRange: { min: number; max: number };
  image?: string;
  changeInterval: string;
  difficulty: string;
  affiliateLinks: { shopee: string; lazada: string };
  relatedArticle?: string | null;
  tags: string[];
}

interface PartCardProps {
  part: Part;
}

const difficultyLabel = {
  "ง่าย": { text: "ง่าย", color: "text-[#5C5E62]" },
  "ปานกลาง": { text: "ปานกลาง", color: "text-[#393C41]" },
  "ยาก": { text: "ยาก", color: "text-[#171A20]" },
};

export default function PartCard({ part }: PartCardProps) {
  const diff = difficultyLabel[part.difficulty as keyof typeof difficultyLabel] || difficultyLabel["ปานกลาง"];

  return (
    <div id={`part-${part.id}`} className="flex flex-col h-full border border-[#EEEEEE] hover:border-[#D0D1D2] transition-[border-color] duration-[330ms] rounded-[12px] overflow-hidden">
      {/* Image area */}
      <div className="w-full aspect-square bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-2 opacity-30">⬡</div>
          <span className="text-[#8E8E8E] text-xs">รูปอะไหล่</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Brand */}
        <p className="text-[#8E8E8E] text-[12px] mb-1">{part.brand}</p>

        {/* Name */}
        <h3 className="text-[#171A20] font-medium text-[15px] leading-snug mb-0.5">{part.nameTh}</h3>
        <p className="text-[#5C5E62] text-[13px] mb-3">{part.nameEn}</p>

        {/* Part number */}
        <p className="text-[#8E8E8E] text-[12px] mb-4 font-mono">{part.partNumber}</p>

        {/* Description */}
        <p className="text-[#5C5E62] text-[13px] leading-relaxed mb-4 line-clamp-2">{part.description}</p>

        {/* Change interval */}
        <div className="flex items-start gap-2 mb-4">
          <p className="text-[#5C5E62] text-[12px]">⏱ {part.changeInterval}</p>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-4 mb-5">
          <div>
            <p className="text-[#8E8E8E] text-[11px] mb-0.5">ความยาก</p>
            <p className={`text-[13px] font-medium ${diff.color}`}>{diff.text}</p>
          </div>
          {part.aftermarketBrand && (
            <div>
              <p className="text-[#8E8E8E] text-[11px] mb-0.5">ยี่ห้ออื่น</p>
              <p className="text-[#5C5E62] text-[12px]">{part.aftermarketBrand.split(" / ")[0]}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#EEEEEE] mb-5" />

        {/* Price */}
        <div className="mb-5">
          <p className="text-[#8E8E8E] text-[12px] mb-1">ช่วงราคาโดยประมาณ</p>
          <p className="text-[#171A20] font-medium text-[17px]">
            ฿{part.priceRange.min.toLocaleString()}
            <span className="text-[#5C5E62] font-normal text-[14px]"> – ฿{part.priceRange.max.toLocaleString()}</span>
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Affiliate Buttons */}
        <div className="flex flex-col gap-2">
          <a
            href={part.affiliateLinks.shopee}
            target="_blank"
            rel="noopener noreferrer sponsored"
            id={`shopee-${part.id}`}
            className="btn-tesla-primary justify-center w-full"
          >
            ซื้อใน Shopee
          </a>
          <a
            href={part.affiliateLinks.lazada}
            target="_blank"
            rel="noopener noreferrer sponsored"
            id={`lazada-${part.id}`}
            className="btn-tesla-secondary-dark justify-center w-full border border-[#D0D1D2]"
          >
            ซื้อใน Lazada
          </a>
        </div>

        {/* Related Article */}
        {part.relatedArticle && (
          <a
            href={part.relatedArticle}
            className="mt-4 tesla-text-link text-[13px]"
          >
            วิธีเปลี่ยนอะไหล่นี้เอง →
          </a>
        )}
      </div>
    </div>
  );
}
