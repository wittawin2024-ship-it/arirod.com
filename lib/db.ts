import fs from "fs";
import path from "path";
import { supabase } from "./supabase";

// Helper to check if Supabase is fully configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    !url.includes("your-project-id") &&
    url.startsWith("https://")
  );
};

// --- BRANDS ---

export async function getBrands() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*, models(*)")
        .order("name", { ascending: true });
      
      if (!error && data) {
        return data.map((brand) => ({
          id: brand.id,
          name: brand.name,
          nameTh: brand.name_th,
          logo: brand.logo,
          color: brand.color,
          description: brand.description,
          popularModels: brand.popular_models || [],
          models: (brand.models || []).map((m: any) => {
            const simpleId = m.id.replace(`${brand.id}-`, "");
            const yearStr = m.years && m.years.length > 0 
              ? `${Math.min(...m.years)}-${Math.max(...m.years)}` 
              : "";
            return {
              id: simpleId,
              name: m.name,
              nameTh: m.name_th,
              year: yearStr,
              type: m.type
            };
          })
        }));
      }
      console.warn("Supabase getBrands query failed, falling back to JSON:", error?.message);
    } catch (e) {
      console.warn("Supabase getBrands exception, falling back to JSON:", e);
    }
  }

  // Fallback to JSON
  try {
    const brandsPath = path.join(process.cwd(), "data/brands.json");
    const fileContent = fs.readFileSync(brandsPath, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Failed to read local brands.json:", e);
    return [];
  }
}

export async function getBrand(brandId: string) {
  const normalizedId = brandId.toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", normalizedId)
        .single();
      
      if (!error && data) {
        // Fetch models to match the JSON structure that components expect
        const { data: modelsData } = await supabase
          .from("models")
          .select("id, name, name_th, type, years")
          .eq("brand_id", normalizedId);

        const formattedModels = (modelsData || []).map((m) => {
          // Extract simple model slug (e.g., "camry" from "toyota-camry")
          const simpleId = m.id.replace(`${normalizedId}-`, "");
          // Extract year string representation (e.g. "2018-2024")
          const yearStr = m.years && m.years.length > 0 
            ? `${Math.min(...m.years)}-${Math.max(...m.years)}` 
            : "";

          return {
            id: simpleId,
            name: m.name,
            nameTh: m.name_th,
            year: yearStr,
            type: m.type
          };
        });

        return {
          id: data.id,
          name: data.name,
          nameTh: data.name_th,
          logo: data.logo,
          color: data.color,
          description: data.description,
          popularModels: data.popular_models || [],
          models: formattedModels
        };
      }
      console.warn(`Supabase getBrand(${normalizedId}) failed, falling back to JSON:`, error?.message);
    } catch (e) {
      console.warn(`Supabase getBrand(${normalizedId}) exception, falling back to JSON:`, e);
    }
  }

  // Fallback to JSON
  try {
    const brands = await getBrands();
    return brands.find((b: any) => b.id === normalizedId) || null;
  } catch (e) {
    console.error(`Failed to find local brand ${normalizedId}:`, e);
    return null;
  }
}

// --- MODELS ---

function getModelGenerations(brandId: string, modelId: string): string[] {
  try {
    const treePath = path.join(process.cwd(), "data/one2car_search_tree.json");
    if (fs.existsSync(treePath)) {
      const searchTree = JSON.parse(fs.readFileSync(treePath, "utf8"));
      const brandKey = Object.keys(searchTree).find(
        (b) => b.toLowerCase() === brandId.toLowerCase()
      );
      if (brandKey) {
        const brandTree = searchTree[brandKey];
        const modelKey = Object.keys(brandTree).find((m) => {
          const mData = brandTree[m];
          const modelSlug = mData.Model_Slug || m;
          const simpleSlug = modelSlug.split("/").pop() || "";
          return (
            m.toLowerCase() === modelId.toLowerCase() ||
            simpleSlug.toLowerCase() === modelId.toLowerCase()
          );
        });
        if (modelKey) {
          return searchTree[brandKey][modelKey].Generations || [];
        }
      }
    }
  } catch (e) {
    console.error("Error loading generations in getModelGenerations helper:", e);
  }
  return [];
}

export async function getModel(brandId: string, modelId: string) {
  const normalizedBrand = brandId.toLowerCase();
  const normalizedModel = modelId.toLowerCase();
  const compositeModelId = `${normalizedBrand}-${normalizedModel}`;
  const generations = getModelGenerations(normalizedBrand, normalizedModel);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("models")
        .select(`
          *,
          brands (
            name,
            name_th
          )
        `)
        .eq("id", compositeModelId)
        .single();
      
      if (!error && data) {
        // Fetch parts count for category mapping
        const { data: partsData } = await supabase
          .from("parts")
          .select("category");

        // Calculate counts per category
        const counts: Record<string, number> = {};
        if (partsData) {
          partsData.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });
        }

        const categoriesList = [
          { id: "engine", nameTh: "เครื่องยนต์", nameEn: "Engine", icon: "⚙️", color: "#ef4444" },
          { id: "brake", nameTh: "ระบบเบรก", nameEn: "Brake System", icon: "🛑", color: "#f97316" },
          { id: "suspension", nameTh: "ระบบกันสะเทือน", nameEn: "Suspension", icon: "🔧", color: "#eab308" },
          { id: "electrical", nameTh: "ระบบไฟฟ้า", nameEn: "Electrical", icon: "⚡", color: "#3b82f6" },
          { id: "exterior", nameTh: "ตัวถัง & กระจก", nameEn: "Exterior & Glass", icon: "🚗", color: "#8b5cf6" },
          { id: "filter", nameTh: "ฟิลเตอร์ & น้ำมัน", nameEn: "Filter & Fluid", icon: "🧴", color: "#10b981" },
          { id: "transmission", nameTh: "ระบบส่งกำลัง", nameEn: "Transmission", icon: "⚙️", color: "#6366f1" },
          { id: "cooling", nameTh: "ระบบระบายความร้อน", nameEn: "Cooling System", icon: "💧", color: "#0ea5e9" }
        ].map((c) => ({
          ...c,
          partsCount: counts[c.id] || 0
        }));

        const brandName = data.brands?.name || brandId;
        const brandNameTh = data.brands?.name_th || brandName;

        return {
          id: data.id,
          brand: normalizedBrand,
          brandName: brandName,
          model: normalizedModel,
          name: data.name,
          nameTh: data.name_th || `${brandNameTh} ${data.name}`,
          years: data.years || [],
          engine: data.engine || "N/A",
          transmission: data.transmission || "N/A",
          type: data.type || "N/A",
          image: data.image,
          description: data.description,
          specs: data.specs || {
            length: "N/A",
            width: "N/A",
            height: "N/A",
            wheelbase: "N/A",
            fuelType: data.engine || "N/A",
            fuelConsumption: "N/A",
            horsePower: "N/A",
            seats: 5
          },
          categories: categoriesList,
          seo: data.seo || {
            title: `อะไหล่ ${brandName} ${data.name} ทุกรุ่น ราคาถูก พร้อมส่ง | AraiRod.com`,
            description: `ค้นหาอะไหล่ ${brandName} ${data.name} แท้และเทียบ ราคาถูก ครบทุกชิ้น สั่งซื้อผ่าน Shopee Lazada ส่งฟรีทั่วไทย`,
            keywords: [`อะไหล่ ${brandName} ${data.name}`, `ราคาอะไหล่ ${data.name}`]
          },
          maintenanceTips: data.maintenance_tips || [
            "เปลี่ยนถ่ายน้ำมันเครื่องทุก 10,000 กม.",
            "ตรวจสอบผ้าเบรกทุก 20,000 กม.",
            "เปลี่ยนไส้กรองอากาศทุก 40,000 กม.",
            "ตรวจสอบยางทุก 6 เดือน"
          ],
          generations
        };
      }
      console.warn(`Supabase getModel(${compositeModelId}) failed, falling back to JSON:`, error?.message);
    } catch (e) {
      console.warn(`Supabase getModel(${compositeModelId}) exception, falling back to JSON:`, e);
    }
  }

  // Fallback to JSON File
  try {
    const detailedPath = path.join(process.cwd(), "data/models", `${normalizedBrand}-${normalizedModel}.json`);
    if (fs.existsSync(detailedPath)) {
      const fileContent = fs.readFileSync(detailedPath, "utf8");
      const detail = JSON.parse(fileContent);
      return {
        ...detail,
        generations
      };
    }

    // Fallback: load dynamically from search tree
    const treePath = path.join(process.cwd(), "data/one2car_search_tree.json");
    if (fs.existsSync(treePath)) {
      const treeContent = fs.readFileSync(treePath, "utf8");
      const searchTree = JSON.parse(treeContent);

      const brandKey = Object.keys(searchTree).find(
        (b) => b.toLowerCase() === normalizedBrand
      );
      if (brandKey) {
        const brandTree = searchTree[brandKey];
        const modelKey = Object.keys(brandTree).find((m) => {
          const mData = brandTree[m];
          const modelSlug = mData.Model_Slug || m;
          const simpleSlug = modelSlug.split("/").pop() || "";
          return (
            m.toLowerCase() === normalizedModel ||
            simpleSlug.toLowerCase() === normalizedModel
          );
        });

        if (modelKey) {
          const mData = brandTree[modelKey];
          return {
            id: compositeModelId,
            brand: normalizedBrand,
            brandName: brandKey,
            model: normalizedModel,
            name: modelKey,
            nameTh: `${brandKey} ${modelKey}`,
            years: mData.Years || [],
            engine: mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : "N/A",
            transmission: mData.Transmissions ? mData.Transmissions.join(" / ") : "N/A",
            type: mData.Body_Types ? mData.Body_Types.join(" / ") : "N/A",
            image: null,
            description: `${brandKey} ${modelKey} ค้นหาสเปกและชิ้นส่วนอะไหล่แท้/เทียบที่ต้องการอย่างถูกต้อง ผ่านตัวเลือกฟิลเตอร์ระบบค้นหาอัจฉริยะ`,
            specs: {
              length: "N/A",
              width: "N/A",
              height: "N/A",
              wheelbase: "N/A",
              fuelType: mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : "N/A",
              fuelConsumption: "N/A",
              horsePower: "N/A",
              seats: 5,
            },
            categories: [
              { id: "engine", nameTh: "เครื่องยนต์", nameEn: "Engine", icon: "⚙️", color: "#ef4444", partsCount: 0 },
              { id: "brake", nameTh: "ระบบเบรก", nameEn: "Brake System", icon: "🛑", color: "#f97316", partsCount: 0 },
              { id: "suspension", nameTh: "ระบบกันสะเทือน", nameEn: "Suspension", icon: "🔧", color: "#eab308", partsCount: 0 },
              { id: "electrical", nameTh: "ระบบไฟฟ้า", nameEn: "Electrical", icon: "⚡", color: "#3b82f6", partsCount: 0 },
              { id: "exterior", nameTh: "ตัวถัง & กระจก", nameEn: "Exterior & Glass", icon: "🚗", color: "#8b5cf6", partsCount: 0 },
              { id: "filter", nameTh: "ฟิลเตอร์ & น้ำมัน", nameEn: "Filter & Fluid", icon: "🧴", color: "#10b981", partsCount: 0 },
              { id: "transmission", nameTh: "ระบบส่งกำลัง", nameEn: "Transmission", icon: "⚙️", color: "#6366f1", partsCount: 0 },
              { id: "cooling", nameTh: "ระบบระบายความร้อน", nameEn: "Cooling System", icon: "💧", color: "#0ea5e9", partsCount: 0 }
            ],
            seo: {
              title: `อะไหล่ ${brandKey} ${modelKey} ทุกรุ่น ราคาถูก | AraiRod.com`,
              description: `ค้นหาอะไหล่ ${brandKey} ${modelKey} แท้และเทียบ ราคาถูก ครบทุกชิ้น สั่งซื้อผ่าน Shopee Lazada ส่งฟรีทั่วไทย`,
              keywords: [`อะไหล่ ${brandKey} ${modelKey}`, `ราคาอะไหล่ ${modelKey}`]
            },
            maintenanceTips: [
              "เปลี่ยนถ่ายน้ำมันเครื่องทุก 10,000 กม.",
              "ตรวจสอบผ้าเบรกทุก 20,000 กม.",
              "เปลี่ยนไส้กรองอากาศทุก 40,000 กม.",
              "ตรวจสอบยางทุก 6 เดือน"
            ],
            generations
          };
        }
      }
    }
  } catch (e) {
    console.error(`Failed to find local model details for ${compositeModelId}:`, e);
  }

  return null;
}

// --- PARTS ---

export async function getParts(brandId: string, modelId: string, category: string) {
  const normalizedBrand = brandId.toLowerCase();
  const normalizedModel = modelId.toLowerCase();
  const normalizedCategory = category.toLowerCase();
  const compositeModelId = `${normalizedBrand}-${normalizedModel}`;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("model_id", compositeModelId)
        .eq("category", normalizedCategory);

      if (!error && data) {
        return data.map((part) => ({
          id: part.id,
          nameTh: part.name_th,
          nameEn: part.name_en,
          brand: part.brand,
          aftermarketBrand: part.aftermarket_brand,
          partNumber: part.part_number,
          category: part.category,
          subcategory: part.subcategory,
          description: part.description,
          priceRange: { min: part.price_min, max: part.price_max },
          image: part.image,
          changeInterval: part.change_interval,
          difficulty: part.difficulty,
          affiliateLinks: part.affiliate_links,
          relatedArticle: part.related_article,
          tags: part.tags
        }));
      }
      console.warn(`Supabase getParts(${compositeModelId}, ${normalizedCategory}) failed, falling back to JSON:`, error?.message);
    } catch (e) {
      console.warn(`Supabase getParts(${compositeModelId}, ${normalizedCategory}) exception, falling back to JSON:`, e);
    }
  }

  // Fallback to JSON File
  const filename = `${normalizedBrand}-${normalizedModel}-${normalizedCategory}.json`;
  try {
    const filePath = path.join(process.cwd(), "data/parts", filename);

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Failed to read local parts for ${filename}:`, e);
  }

  return [];
}
