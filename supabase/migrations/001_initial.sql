-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_th TEXT,
    logo TEXT,
    color TEXT,
    description TEXT,
    popular_models TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Create policy for public read on brands
CREATE POLICY "Allow public read access on brands" ON public.brands
    FOR SELECT USING (true);

-- Create policy for admin write on brands
CREATE POLICY "Allow admin write access on brands" ON public.brands
    FOR ALL TO authenticated USING (true);


-- Create models table
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY, -- e.g. "toyota-camry"
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_th TEXT,
    years INT[],
    engine TEXT,
    transmission TEXT,
    type TEXT,
    image TEXT,
    description TEXT,
    specs JSONB, -- { length, width, height, wheelbase, fuelType, fuelConsumption, horsePower, seats }
    maintenance_tips TEXT[],
    seo JSONB, -- { title, description, keywords }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for models
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Create policy for public read on models
CREATE POLICY "Allow public read access on models" ON public.models
    FOR SELECT USING (true);

-- Create policy for admin write on models
CREATE POLICY "Allow admin write access on models" ON public.models
    FOR ALL TO authenticated USING (true);


-- Create parts table
CREATE TABLE IF NOT EXISTS public.parts (
    id TEXT PRIMARY KEY, -- e.g. "tc-brk-001"
    model_id TEXT REFERENCES public.models(id) ON DELETE CASCADE,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    brand TEXT NOT NULL,
    aftermarket_brand TEXT,
    part_number TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    price_min INT,
    price_max INT,
    image TEXT,
    change_interval TEXT,
    difficulty TEXT,
    affiliate_links JSONB, -- { shopee, lazada }
    related_article TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for parts
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read on parts
CREATE POLICY "Allow public read access on parts" ON public.parts
    FOR SELECT USING (true);

-- Create policy for admin write on parts
CREATE POLICY "Allow admin write access on parts" ON public.parts
    FOR ALL TO authenticated USING (true);
