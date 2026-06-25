import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[#3E6AE1] text-[14px] font-medium mb-4">404</p>
      <h1 className="text-[#171A20] text-[40px] font-medium mb-3">ไม่พบหน้าที่ต้องการ</h1>
      <p className="text-[#5C5E62] text-[14px] max-w-md leading-relaxed mb-10">
        อาจเป็นเพราะ URL ผิด หรือหน้านี้ถูกย้ายไปแล้ว กลับสู่หน้าแรกเพื่อค้นหาอะไหล่
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link href="/" className="btn-tesla-primary">
          กลับหน้าแรก
        </Link>
        <Link href="/brands" className="btn-tesla-secondary-dark border border-[#D0D1D2]">
          ดูยี่ห้อรถทั้งหมด
        </Link>
      </div>
    </div>
  );
}
