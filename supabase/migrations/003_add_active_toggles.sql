-- Migration: Add active status columns to brands, models, and parts tables.
-- This allows administrators to temporarily toggle visibility of items on the public website.

-- 1. Add active column to brands
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 2. Add active column to models
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 3. Add active column to parts
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
