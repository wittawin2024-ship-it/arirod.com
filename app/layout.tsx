import type { Metadata } from "next";
import { Inter, Mitr } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { getBrands } from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mitr = Mitr({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mitr",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arairod.com"),
  title: {
    default: "AraiRod.com | อะไหล่รถยนต์ทุกยี่ห้อ ราคาถูก ส่งฟรีทั่วไทย",
    template: "%s | AraiRod.com",
  },
  description:
    "ค้นหาอะไหล่รถยนต์ทุกยี่ห้อ Toyota, Honda, Isuzu ราคาถูกที่สุด สั่งซื้อผ่าน Shopee Lazada ส่งฟรีทั่วไทย พร้อมคำแนะนำการเปลี่ยนอะไหล่",
  keywords: [
    "อะไหล่รถยนต์",
    "อะไหล่ราคาถูก",
    "อะไหล่ Toyota",
    "อะไหล่ Honda",
    "อะไหล่ Isuzu",
    "ซื้ออะไหล่ออนไลน์",
    "อะไหล่แท้",
    "อะไหล่เทียบ",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://arairod.com",
    siteName: "AraiRod.com",
    title: "AraiRod.com | อะไหล่รถยนต์ทุกยี่ห้อ ราคาถูก",
    description: "ค้นหาอะไหล่รถยนต์ทุกยี่ห้อ ราคาถูกที่สุด สั่งซื้อได้เลย",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://arairod.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brands = await getBrands();

  return (
    <html lang="th">
      <body className={`${inter.variable} ${mitr.variable} font-mitr`}>
        <Navbar initialBrands={brands} />
        <main>{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
