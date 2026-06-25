"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  id: string;
  brandId: string;
  modelId: string;
  title: string;
  subtitle: string;
  description: string;
  linkText: string;
  desktopImage: string;
  mobileImage: string;
}

const slides: Slide[] = [
  {
    id: "toyota-camry",
    brandId: "toyota",
    modelId: "camry",
    title: "Toyota Camry",
    subtitle: "บริการและดูแลโฉมปี 2018 - 2024 (ACV70)",
    description: "อะไหล่เครื่องยนต์ ช่วงล่าง เบรก และตัวถังคุณภาพสูงสำหรับคัมรี่ของคุณ",
    linkText: "เปรียบเทียบราคาอะไหล่ Camry แท้/เทียบ ➔",
    desktopImage: "/images/cars/desktop/camry.png",
    mobileImage: "/images/cars/camry-mobile.png",
  },
  {
    id: "honda-civic",
    brandId: "honda",
    modelId: "civic",
    title: "Honda Civic",
    subtitle: "บำรุงรักษาโฉมปี 2016 - 2024 (FC / FK / FE)",
    description: "สปอร์ตเซดานยอดนิยม ค้นหาชิ้นส่วนและเช็คราคาออนไลน์ได้ทันที",
    linkText: "ดูรายการอะไหล่ Civic ทั้งหมด ➔",
    desktopImage: "/images/cars/desktop/civic.png",
    mobileImage: "/images/cars/civic-mobile.png",
  },
  {
    id: "isuzu-d-max",
    brandId: "isuzu",
    modelId: "d-max",
    title: "Isuzu D-Max",
    subtitle: "งานซ่อมบำรุงโฉมปี 2012 - 2024 (ขวัญใจมหาชน)",
    description: "กระบะทนทาน ค้นหาไส้กรอง เบรก คลัตช์ และชิ้นส่วนซ่อมบำรุงครบวงจร",
    linkText: "เช็คอะไหล่และน้ำมันเครื่อง D-Max ➔",
    desktopImage: "/images/cars/desktop/dmax.png",
    mobileImage: "/images/cars/dmax-mobile.png",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        ),
      6000
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="relative w-full h-[60vh] min-h-[480px] max-h-[600px] overflow-hidden bg-[#171A20]">
      {/* Slides wrapper */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Desktop slide image (Hidden on mobile) */}
              <div className="absolute inset-0 w-full h-full hidden md:block opacity-65">
                <Image
                  src={slide.desktopImage}
                  alt={`${slide.title} desktop view`}
                  fill
                  priority={index === 0}
                  className="object-cover object-center transition-transform duration-[330ms]"
                />
              </div>

              {/* Mobile slide image (Hidden on desktop) */}
              <div className="absolute inset-0 w-full h-full block md:hidden opacity-60">
                <Image
                  src={slide.mobileImage}
                  alt={`${slide.title} mobile view`}
                  fill
                  priority={index === 0}
                  className="object-cover object-center transition-transform duration-[330ms]"
                />
              </div>

              {/* Gradient overlay to ensure text readability and dark premium look */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/75 pointer-events-none z-10" />

              {/* Slide Content (Tesla Style) */}
              <div className="relative h-full w-full max-w-[1383px] mx-auto px-6 flex flex-col justify-between pt-20 pb-12 z-20">
                {/* Header info (Centered Top) */}
                <div className="text-center animate-fade-in-up">
                  <h2 className="text-white text-[38px] md:text-[44px] font-medium tracking-wide leading-tight mb-2 drop-shadow-sm">
                    {slide.title}
                  </h2>
                  <p className="text-[#EAEAEA] text-[14px] md:text-[15px] font-normal mb-1">
                    {slide.subtitle}
                  </p>
                  <p className="text-[#D0D1D2] text-[12px] md:text-[13px] mb-3">
                    {slide.description}
                  </p>
                  <Link
                    href={`/${slide.brandId}/${slide.modelId}`}
                    className="text-white underline hover:text-[#3E6AE1] text-[13px] transition-colors duration-[330ms] font-medium"
                  >
                    {slide.linkText}
                  </Link>
                </div>

                {/* CTA Buttons (Centered Bottom, Side-by-side) */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto mb-4">
                  <Link
                    href={`/${slide.brandId}/${slide.modelId}`}
                    className="btn-tesla-primary w-full sm:w-[210px] text-center"
                  >
                    ค้นหาอะไหล่เลย
                  </Link>
                  <Link
                    href="/brands"
                    className="btn-tesla-secondary w-full sm:w-[210px] text-center border border-transparent hover:border-[#D0D1D2] shadow-sm"
                  >
                    เลือกยี่ห้อรถอื่น
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left/Right Arrow Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[rgba(23,26,32,0.3)] hover:bg-[rgba(23,26,32,0.6)] border border-[rgba(255,255,255,0.1)] text-white transition-all duration-[330ms] focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[rgba(23,26,32,0.3)] hover:bg-[rgba(23,26,32,0.6)] border border-[rgba(255,255,255,0.1)] text-white transition-all duration-[330ms] focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-[330ms] ${
              index === currentIndex ? "bg-white w-6" : "bg-[rgba(255,255,255,0.4)] hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
