"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import brandsData from "@/data/brands.json";

interface Model {
  id: string;
  name: string;
  nameTh: string;
}

interface Brand {
  id: string;
  name: string;
  nameTh: string;
  models: Model[];
}

interface NavbarProps {
  initialBrands?: Brand[];
}

export default function Navbar({ initialBrands }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [onWhiteSection, setOnWhiteSection] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      // If not homepage, always show white nav
      if (!isHomePage) {
        setOnWhiteSection(true);
      } else {
        // On homepage, detect if scrolled past first section (60vh)
        const vh = window.innerHeight;
        const sliderHeight = Math.min(Math.max(vh * 0.6, 480), 600);
        setOnWhiteSection(y >= sliderHeight - 56);
      }
    };

    if (!isHomePage) {
      setOnWhiteSection(true);
    } else {
      handleScroll();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const brandsList = initialBrands || (brandsData as Brand[]);
  const popularBrands = brandsList.slice(0, 6);

  const isLight = true; // Always light background for perfect readability
  const textColor = "text-[#171A20]";
  const logoColor = "text-[#171A20]";
  const navBg = "bg-white border-b border-[#EEEEEE]";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] h-14 transition-all duration-[330ms] ${navBg}`}>
        <div className="max-w-[1383px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className={`font-medium text-[15px] tracking-[0.2em] uppercase ${logoColor} transition-colors duration-[330ms] hover:opacity-75`}>
            AraiRod
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {popularBrands.map((brand) => (
              <div key={brand.id} className="relative group py-2">
                <Link
                  href={`/${brand.id}`}
                  className={`btn-tesla-nav ${textColor} transition-colors duration-[330ms] flex items-center gap-1`}
                >
                  {brand.name}
                  <svg className="w-2.5 h-2.5 opacity-55 transition-transform group-hover:rotate-180 duration-[330ms]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[220px] bg-white border border-[#EEEEEE] rounded-[4px] py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-[200ms] ease-out z-[110] shadow-[0_4px_12px_rgba(0,0,0,0.06)] mt-0.5">
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {brand.models.slice(0, 8).map((model) => (
                      <Link
                        key={model.id}
                        href={`/${brand.id}/${model.id}`}
                        className="block px-4 py-2 text-[13px] text-[#393C41] hover:text-[#3E6AE1] hover:bg-[#F8F9FA] transition-colors duration-150 text-left"
                      >
                        {model.name} {model.nameTh ? `(${model.nameTh})` : ""}
                      </Link>
                    ))}
                  </div>
                  {brand.models.length > 8 && (
                    <div className="border-t border-[#EEEEEE] mt-1 pt-1.5 px-4 pb-0.5">
                      <Link
                        href={`/${brand.id}`}
                        className="block text-[12px] text-[#8E8E8E] hover:text-[#3E6AE1] transition-colors text-left"
                      >
                        ดูทั้งหมด {brand.models.length} รุ่น ➔
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Direct Link to Articles */}
            <Link
              href="/blog"
              className={`btn-tesla-nav ${textColor} transition-colors duration-[330ms]`}
            >
              บทความ
            </Link>
          </div>

          {/* Right icons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/search"
              className={`btn-tesla-nav ${textColor}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/brands"
              className="btn-tesla-primary !min-w-0 px-4 !min-h-8 text-xs"
            >
              ค้นหาอะไหล่
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded ${textColor} transition-colors duration-[330ms]`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#EEEEEE]">
            {popularBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${brand.id}`}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 tesla-nav-item text-[#171A20] hover:bg-[#F4F4F4] transition-colors duration-[330ms]"
              >
                {brand.name} ({brand.nameTh})
              </Link>
            ))}
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 tesla-nav-item text-[#171A20] hover:bg-[#F4F4F4] transition-colors duration-[330ms]"
            >
              บทความ
            </Link>
            <div className="px-6 py-4 border-t border-[#EEEEEE]">
              <Link
                href="/brands"
                onClick={() => setMenuOpen(false)}
                className="btn-tesla-primary w-full justify-center"
              >
                ค้นหาอะไหล่
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
