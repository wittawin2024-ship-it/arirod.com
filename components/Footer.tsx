import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#171A20] text-[#8E8E8E] py-8 border-t border-[#EEEEEE]/5">
      <div className="max-w-[1383px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]">
        <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
          <Link href="/" className="text-white font-medium tracking-[0.2em] uppercase hover:opacity-75 transition-opacity duration-[330ms]">
            AraiRod
          </Link>
          <span>© 2024 AraiRod.com — อะไหล่รถยนต์ทุกยี่ห้อในไทย</span>
          <Link href="/blog" className="hover:text-white transition-colors duration-[330ms]">บทความ</Link>
          <Link href="/about" className="hover:text-white transition-colors duration-[330ms]">เกี่ยวกับเรา</Link>
          <Link href="/privacy" className="hover:text-white transition-colors duration-[330ms]">นโยบายความเป็นส่วนตัว</Link>
          <Link href="/terms" className="hover:text-white transition-colors duration-[330ms]">ข้อตกลงการใช้งาน</Link>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://shopee.co.th" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-[330ms]">
            Shopee →
          </a>
          <a href="https://lazada.co.th" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-[330ms]">
            Lazada →
          </a>
        </div>
      </div>
    </footer>
  );
}
