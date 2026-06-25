const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Read and parse .env.local
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local not found. Please create it first.");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
  process.exit(1);
}

if (supabaseUrl.includes("your-project-id")) {
  console.error("Error: Please replace the placeholder values in .env.local with your real Supabase credentials.");
  process.exit(1);
}

// 2. Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function runMigration() {
  console.log("Starting database migration to Supabase...");

  // Load datasets
  const brandsPath = path.join(__dirname, "../data/brands.json");
  const searchTreePath = path.join(__dirname, "../data/one2car_search_tree.json");

  if (!fs.existsSync(brandsPath)) {
    console.error("Error: brands.json not found.");
    return;
  }
  const brandsData = JSON.parse(fs.readFileSync(brandsPath, "utf8"));

  let searchTree = {};
  if (fs.existsSync(searchTreePath)) {
    console.log("Loading one2car search tree for fallback model details...");
    searchTree = JSON.parse(fs.readFileSync(searchTreePath, "utf8"));
  } else {
    console.warn("Warning: one2car_search_tree.json not found, falling back to basic model details.");
  }

  // --- MIGRATE BRANDS AND MODELS ---
  console.log("\nMigrating brands and models...");
  for (const brand of brandsData) {
    console.log(`Processing brand: ${brand.name} (${brand.id})...`);

    // Insert brand
    const { error: brandError } = await supabase
      .from("brands")
      .upsert({
        id: brand.id,
        name: brand.name,
        name_th: brand.nameTh || null,
        logo: brand.logo || null,
        color: brand.color || null,
        description: brand.description || null,
        popular_models: brand.popularModels || []
      });

    if (brandError) {
      console.error(`Failed to insert brand ${brand.name}:`, brandError.message);
      continue;
    }

    // Insert models for this brand
    for (const model of brand.models) {
      const modelId = `${brand.id}-${model.id}`;
      const detailedModelPath = path.join(__dirname, `../data/models/${modelId}.json`);

      let modelDataToInsert = {
        id: modelId,
        brand_id: brand.id,
        name: model.name,
        name_th: model.nameTh || null,
        years: [],
        engine: null,
        transmission: null,
        type: model.type || null,
        image: null,
        description: null,
        specs: null,
        maintenance_tips: null,
        seo: null
      };

      if (fs.existsSync(detailedModelPath)) {
        // Use detailed local json model file
        console.log(`  Found detailed file for model: ${modelId}`);
        const detail = JSON.parse(fs.readFileSync(detailedModelPath, "utf8"));
        modelDataToInsert = {
          ...modelDataToInsert,
          name: detail.name || modelDataToInsert.name,
          name_th: detail.nameTh || modelDataToInsert.name_th,
          years: detail.years || [],
          engine: detail.engine || null,
          transmission: detail.transmission || null,
          type: detail.type || modelDataToInsert.type,
          image: detail.image || null,
          description: detail.description || null,
          specs: detail.specs || null,
          maintenance_tips: detail.maintenanceTips || null,
          seo: detail.seo || null
        };
      } else {
        // Fallback to one2car search tree
        const brandKey = Object.keys(searchTree).find(
          (b) => b.toLowerCase() === brand.id.toLowerCase()
        );
        if (brandKey) {
          const brandTree = searchTree[brandKey];
          const modelKey = Object.keys(brandTree).find((m) => {
            const mData = brandTree[m];
            const modelSlug = mData.Model_Slug || m;
            const simpleSlug = modelSlug.split("/").pop() || "";
            return (
              m.toLowerCase() === model.id.toLowerCase() ||
              simpleSlug.toLowerCase() === model.id.toLowerCase()
            );
          });

          if (modelKey) {
            const mData = brandTree[modelKey];
            modelDataToInsert.years = mData.Years || [];
            modelDataToInsert.engine = mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : null;
            modelDataToInsert.transmission = mData.Transmissions ? mData.Transmissions.join(" / ") : null;
            modelDataToInsert.type = mData.Body_Types ? mData.Body_Types.join(" / ") : model.type;
            modelDataToInsert.description = `${brand.name} ${model.name} ค้นหาสเปกและชิ้นส่วนอะไหล่แท้/เทียบที่ต้องการอย่างถูกต้อง ผ่านตัวเลือกฟิลเตอร์ระบบค้นหาอัจฉริยะ`;
            modelDataToInsert.specs = {
              fuelType: mData.Fuel_Types ? mData.Fuel_Types.join(" / ") : null,
              seats: 5
            };
          }
        }

        // If years is still empty, parse from model.year (e.g. "2018-2024")
        if (modelDataToInsert.years.length === 0 && model.year) {
          const yearsRange = model.year.split("-");
          if (yearsRange.length === 2) {
            const start = parseInt(yearsRange[0]);
            const end = parseInt(yearsRange[1]);
            if (!isNaN(start) && !isNaN(end)) {
              for (let y = start; y <= end; y++) {
                modelDataToInsert.years.push(y);
              }
            }
          } else {
            const singleYear = parseInt(model.year);
            if (!isNaN(singleYear)) {
              modelDataToInsert.years.push(singleYear);
            }
          }
        }
      }

      const { error: modelError } = await supabase
        .from("models")
        .upsert(modelDataToInsert);

      if (modelError) {
        console.error(`  Failed to insert model ${modelId}:`, modelError.message);
      }
    }
  }

  // --- MIGRATE PARTS ---
  console.log("\nMigrating parts...");
  const partsDir = path.join(__dirname, "../data/parts");
  if (fs.existsSync(partsDir)) {
    const partFiles = fs.readdirSync(partsDir).filter((file) => file.endsWith(".json"));

    for (const file of partFiles) {
      console.log(`Processing parts file: ${file}`);
      // Filename structure: brand-model-category.json (e.g. toyota-camry-brake.json)
      const parts = JSON.parse(fs.readFileSync(path.join(partsDir, file), "utf8"));
      
      // Determine model_id from filename prefix
      const fileWithoutExt = file.replace(".json", "");
      const tokens = fileWithoutExt.split("-");
      // Join all tokens except the last one as model_id (handles model name with hyphens like hilux-revo)
      const category = tokens[tokens.length - 1];
      const modelSlug = tokens.slice(0, tokens.length - 1).join("-"); // toyota-camry

      for (const part of parts) {
        // Construct part database object
        const partToInsert = {
          id: part.id,
          model_id: modelSlug,
          name_th: part.nameTh,
          name_en: part.nameEn,
          brand: part.brand,
          aftermarket_brand: part.aftermarketBrand || null,
          part_number: part.partNumber || null,
          category: part.category || category,
          subcategory: part.subcategory || null,
          description: part.description || null,
          price_min: part.priceRange ? part.priceRange.min : null,
          price_max: part.priceRange ? part.priceRange.max : null,
          image: part.image || null,
          change_interval: part.changeInterval || null,
          difficulty: part.difficulty || null,
          affiliate_links: part.affiliateLinks || null,
          related_article: part.relatedArticle || null,
          tags: part.tags || []
        };

        const { error: partError } = await supabase
          .from("parts")
          .upsert(partToInsert);

        if (partError) {
          console.error(`  Failed to insert part ${part.id}:`, partError.message);
        }
      }
    }
  }

  console.log("\nMigration completed successfully!");
}

runMigration().catch((err) => {
  console.error("Migration failed with error:", err);
});
